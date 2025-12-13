import os
from typing import List, Dict, Tuple, Optional

import numpy as np
import pandas as pd

from sklearn.model_selection import GroupKFold, GridSearchCV
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from scipy.stats import spearmanr

try:
    from xgboost import XGBRegressor
    HAS_XGB = True
except ImportError:
    HAS_XGB = False
    print("Warning: xgboost not installed; XGBRegressor will be skipped.")

try:
    import joblib
except ImportError:  # very old sklearn fallback
    from sklearn.externals import joblib

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

PROJECT_ROOT = os.path.dirname(__file__)   
RAW_DATA_DIR = os.path.join(PROJECT_ROOT, "data")    
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

TRAIN_YEARS = list(range(2016, 2024)) 
VAL_YEAR = 2024          
TEST_YEAR = 2025                

FORECAST_YEARS = [2026]               


TEAM_NAME_TO_ABBREV: Dict[str, str] = {
    # East
    "Atlanta Hawks": "ATL",
    "Boston Celtics": "BOS",
    "Brooklyn Nets": "BRK",
    "Brooklyn Nets*": "BRK",
    "Charlotte Hornets": "CHA",
    "Chicago Bulls": "CHI",
    "Cleveland Cavaliers": "CLE",
    "Detroit Pistons": "DET",
    "Indiana Pacers": "IND",
    "Miami Heat": "MIA",
    "Milwaukee Bucks": "MIL",
    "New York Knicks": "NYK",
    "Orlando Magic": "ORL",
    "Philadelphia 76ers": "PHI",
    "Toronto Raptors": "TOR",
    "Washington Wizards": "WAS",
    # West
    "Dallas Mavericks": "DAL",
    "Denver Nuggets": "DEN",
    "Golden State Warriors": "GSW",
    "Houston Rockets": "HOU",
    "Los Angeles Clippers": "LAC",
    "Los Angeles Lakers": "LAL",
    "Memphis Grizzlies": "MEM",
    "Minnesota Timberwolves": "MIN",
    "New Orleans Pelicans": "NOP",
    "Oklahoma City Thunder": "OKC",
    "Phoenix Suns": "PHO",
    "Portland Trail Blazers": "POR",
    "Sacramento Kings": "SAC",
    "San Antonio Spurs": "SAS",
    "Utah Jazz": "UTA",
    # In case the * suffix remains anywhere
    "Atlanta Hawks*": "ATL",
    "Golden State Warriors*": "GSW",
    "San Antonio Spurs*": "SAS",
    "Cleveland Cavaliers*": "CLE",
    "Toronto Raptors*": "TOR",
}

# ---------------------------------------------------------------------------
# Name + basic cleaning helpers
# ---------------------------------------------------------------------------

def clean_player_name(name: str) -> str:
    if pd.isna(name):
        return ""
    s = str(name).strip().lower()
    # Remove punctuation that often varies
    for ch in [".", ","]:
        s = s.replace(ch, "")
    # Normalize whitespace
    s = " ".join(s.split())
    return s


def clean_team_name(raw_team: str) -> str:
    if pd.isna(raw_team):
        return ""
    return str(raw_team).strip()


# ---------------------------------------------------------------------------
# Player-level helpers: collapse multi-team seasons, compute primary team
# ---------------------------------------------------------------------------

def collapse_multiteam_players(df: pd.DataFrame) -> pd.DataFrame:
    """
    Collapse to one row per (Player_clean, season).
    If a TOT row exists for a player-season, keep that only.
    Otherwise, sum numeric columns across team stints.
    """
    df = df.copy()
    df["Player_clean"] = df["Player"].apply(clean_player_name)
    key = df["Player_clean"] + "::" + df["season"].astype(str)
    df["key"] = key
    df["is_tot"] = df["Team"] == "TOT"

    tot_rows = df[df["is_tot"]].copy()
    non_tot = df[~df["is_tot"]].copy()

    tot_keys = set(tot_rows["key"].unique())
    non_tot_no_tot = non_tot[~non_tot["key"].isin(tot_keys)].copy()

    # Aggregate numeric columns for the no-TOT group
    numeric_cols = non_tot_no_tot.select_dtypes(include=[np.number]).columns.tolist()
    group_cols = ["Player_clean", "season"]
    agg_dict = {col: "sum" for col in numeric_cols}

    agg_no_tot = (
        non_tot_no_tot
        .groupby(group_cols, as_index=False)
        .agg(agg_dict)
    )

    # For non-numeric columns in aggregated rows, take "first" within each group
    non_numeric_cols = [c for c in non_tot_no_tot.columns
                        if c not in numeric_cols + ["key", "is_tot"]]
    meta = (
        non_tot_no_tot.groupby(group_cols, as_index=False)[non_numeric_cols]
        .first()
    )

    agg_no_tot = pd.merge(agg_no_tot, meta, on=group_cols, how="left")

    # For tot_rows, we already have one row per player-season (hopefully).
    # Just normalize columns to match.
    tot_rows = tot_rows.drop(columns=["key", "is_tot"], errors="ignore")
    agg_no_tot = agg_no_tot.drop(columns=["key", "is_tot"], errors="ignore")

    # Concat
    collapsed = pd.concat([tot_rows, agg_no_tot], ignore_index=True)

    # Drop duplicated keys just in case
    collapsed = collapsed.drop_duplicates(subset=["Player_clean", "season"])

    return collapsed


def compute_primary_team(players_totals_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Using the raw players_totals (before collapse), find for each
    (Player_clean, season) the team (excluding 'TOT') where the player
    logged the most minutes (MP). This version is robust to missing MP.
    """
    df = players_totals_raw.copy()
    df["Player_clean"] = df["Player"].apply(clean_player_name)

    # Exclude TOT rows; we want a real NBA team for primary team
    df = df[df["Team"] != "TOT"].copy()

    # Coerce MP to numeric and drop rows with missing MP
    df["MP"] = pd.to_numeric(df["MP"], errors="coerce")
    df = df[df["MP"].notna()].copy()

    # If still empty, return an empty frame with the right columns
    if df.empty:
        return pd.DataFrame(columns=["Player_clean", "season", "primary_team"])

    # Sort so that the highest-MP stint per (player, season) comes first
    df = df.sort_values(
        ["Player_clean", "season", "MP"],
        ascending=[True, True, False]
    )

    # Keep the first row per (player, season)
    primary = df.drop_duplicates(subset=["Player_clean", "season"], keep="first")

    primary = primary[["Player_clean", "season", "Team"]].copy()
    primary = primary.rename(columns={"Team": "primary_team"})

    return primary

# ---------------------------------------------------------------------------
# Standings loader
# ---------------------------------------------------------------------------

def load_standings_for_year(season_end_year: int) -> pd.DataFrame:
    """
    Load standings.csv for a given season_end_year and return a clean DataFrame
    with team_abbrev, W, L, Wpct, GB, PS_G, PA_G, SRS, Conference, season_end_year, season.

    Expects: data/raw/{season_end_year}/standings.csv
    """
    path = os.path.join(RAW_DATA_DIR, str(season_end_year), "standings.csv")
    df = pd.read_csv(path, encoding="latin-1")

    # Remove obvious division headers if they ever appear (defensive)
    def is_numeric_or_dash(x):
        x = str(x)
        if x == "—":
            return True
        try:
            float(x)
            return True
        except ValueError:
            return False

    # If W is non-numeric in a row, it's probably a header row (like "Atlantic Division")
    mask_valid = df["W"].apply(is_numeric_or_dash)
    df = df[mask_valid].copy()

    # Clean and convert
    df["Team"] = df["Team"].apply(clean_team_name)

    # Map to abbreviations where possible
    def map_team_abbrev(name: str) -> str:
        # strip trailing '*' if not already handled
        base = name.replace("*", "").strip()
        return TEAM_NAME_TO_ABBREV.get(base, base)  # fallback to original if missing

    df["team_abbrev"] = df["Team"].apply(map_team_abbrev)

    # Convert numeric columns
    for col in ["W", "L", "PS/G", "PA/G", "SRS"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # W/L% is like ".598" or "0.695"; both parse fine with float
    df["W/L%"] = pd.to_numeric(df["W/L%"], errors="coerce")

    # GB: replace dash with 0 and cast to float
    df["GB"] = df["GB"].replace("—", 0)
    df["GB"] = pd.to_numeric(df["GB"], errors="coerce")

    # Keep only columns we need
    keep_cols = [
        "team_abbrev", "W", "L", "W/L%", "GB",
        "PS/G", "PA/G", "SRS", "Conference",
        "season_end_year", "season"
    ]
    df = df[keep_cols]

    return df


# ---------------------------------------------------------------------------
# Per-season merge
# ---------------------------------------------------------------------------

def load_player_tables_for_year(season_end_year: int) -> Tuple[pd.DataFrame, pd.DataFrame,
                                                               pd.DataFrame, pd.DataFrame,
                                                               pd.DataFrame]:
    """
    Load the five main player CSVs for a given season_end_year.

    For forecast seasons (e.g., 2025-26 with no MVP voting yet),
    mvp_voting.csv may not exist. In that case we return an empty
    MVP voting DataFrame with the expected columns so downstream
    code can still run without errors.
    """
    base = os.path.join(RAW_DATA_DIR, str(season_end_year))

    players_totals = pd.read_csv(os.path.join(base, "players_totals.csv"), encoding="latin-1")
    players_per_game = pd.read_csv(os.path.join(base, "players_per_game.csv"), encoding="latin-1")
    players_per_poss = pd.read_csv(os.path.join(base, "players_per_poss.csv"), encoding="latin-1")
    players_advanced = pd.read_csv(os.path.join(base, "players_advanced.csv"), encoding="latin-1")

    mvp_path = os.path.join(base, "mvp_voting.csv")
    if os.path.exists(mvp_path):
        mvp_voting = pd.read_csv(mvp_path, encoding="latin-1")
    else:
        print(f"Warning: mvp_voting.csv not found for {season_end_year}; "
              f"using empty MVP voting table for this season.")
        # Columns based on your 2014-15 sample; include Voting_Share so
        # later code that renames it to award_share still works.
        mvp_cols = [
            "Rank",
            "Player",
            "Age",
            "Tm",
            "Voting_First",
            "Voting_Pts Won",
            "Voting_Pts Max",
            "Voting_Share",
            "G",
            "Per Game_MP",
            "Per Game_PTS",
            "Per Game_TRB",
            "Per Game_AST",
            "Per Game_STL",
            "Per Game_BLK",
            "Shooting_FG%",
            "Shooting_3P%",
            "Shooting_FT%",
            "Advanced_WS",
            "Advanced_WS/48",
            "season_end_year",
            "season",
        ]
        mvp_voting = pd.DataFrame(columns=mvp_cols)

    return players_totals, players_per_game, players_per_poss, players_advanced, mvp_voting


def build_season_dataset(season_end_year: int) -> pd.DataFrame:
    """
    Build a per-player-per-season DataFrame for one season_end_year,
    with merged stats, team context, and MVP award share.
    """
    (
        players_totals_raw,
        players_per_game_raw,
        players_per_poss_raw,
        players_advanced_raw,
        mvp_voting_raw,
    ) = load_player_tables_for_year(season_end_year)

    # --- Canonical players_totals with collapse ---
    players_totals = collapse_multiteam_players(players_totals_raw)
    # Recompute basic per-game from totals
    for stat in ["PTS", "TRB", "AST", "STL", "BLK", "ORB", "DRB"]:
        col_pg = f"{stat}_per_g"
        players_totals[col_pg] = players_totals[stat] / players_totals["G"].replace(0, np.nan)

    # Clean advanced
    players_adv = collapse_multiteam_players(players_advanced_raw)

    # Clean per-possession
    players_poss = collapse_multiteam_players(players_per_poss_raw)

    # Optionally, per-game table (you could also recompute everything from totals)
    players_pg = collapse_multiteam_players(players_per_game_raw)

    # --- Merge all player stats on (Player_clean, season) ---
    base_cols = [
        "Player", "Player_clean", "Age", "Pos", "Team",
        "G", "GS", "MP", "PTS", "TRB", "AST", "STL", "BLK",
        "ORB", "DRB", "TOV", "PF", "season_end_year", "season"
    ]
    base = players_totals[base_cols + [c for c in players_totals.columns
                                       if c.endswith("_per_g")]]

    # Advanced
    adv_use = ["Player_clean", "season",
               "PER", "TS%", "3PAr", "FTr",
               "OWS", "DWS", "WS", "WS/48",
               "OBPM", "DBPM", "BPM", "VORP"]
    adv_use = [c for c in adv_use if c in players_adv.columns]
    base = base.merge(players_adv[adv_use],
                      on=["Player_clean", "season"], how="left")

    # Per-possession
    poss_use = ["Player_clean", "season",
                "FG", "FGA", "FG%", "3P", "3PA", "3P%",
                "2P", "2PA", "2P%", "eFG%", "FT", "FTA", "FT%",
                "ORB", "DRB", "TRB", "AST", "STL", "BLK",
                "TOV", "PF", "PTS", "ORtg", "DRtg"]
    poss_use = [c for c in poss_use if c in players_poss.columns]
    players_poss_ren = players_poss[poss_use].copy()
    # rename per-possession columns to avoid confusion (suffix _per100)
    rename_map = {c: f"{c}_per100" for c in poss_use
                  if c not in ["Player_clean", "season", "ORtg", "DRtg"]}
    players_poss_ren = players_poss_ren.rename(columns=rename_map)
    base = base.merge(players_poss_ren, on=["Player_clean", "season"], how="left")

    # Per-game from official table (could be optional)
    pg_use = ["Player_clean", "season", "MP", "FG", "FGA", "FG%", "3P", "3PA",
              "3P%", "2P", "2PA", "2P%", "eFG%", "FT", "FTA", "FT%", "PTS"]
    pg_use = [c for c in pg_use if c in players_pg.columns]
    players_pg_ren = players_pg[pg_use].copy()
    rename_pg = {c: f"{c}_per_g_official" for c in pg_use
                 if c not in ["Player_clean", "season"]}
    players_pg_ren = players_pg_ren.rename(columns=rename_pg)
    base = base.merge(players_pg_ren, on=["Player_clean", "season"], how="left")

    # --- Add MVP voting (target) ---
    mvp = mvp_voting_raw.copy()
    mvp["Player_clean"] = mvp["Player"].apply(clean_player_name)
    keep_mvp = ["Player_clean", "season",
                "Voting_First", "Voting_Pts Won", "Voting_Pts Max", "Voting_Share"]
    keep_mvp = [c for c in keep_mvp if c in mvp.columns]
    mvp = mvp[keep_mvp]
    season_df = base.merge(mvp, on=["Player_clean", "season"], how="left")

    # Players without MVP votes: set award share to 0
    if "Voting_Share" in season_df.columns:
        season_df["Voting_Share"] = season_df["Voting_Share"].fillna(0.0)

    # --- Add team context from standings ---
    standings = load_standings_for_year(season_end_year)

    # Compute primary team per player using raw totals
    primary_team = compute_primary_team(players_totals_raw)
    season_df = season_df.merge(primary_team,
                                on=["Player_clean", "season"], how="left")

    # In many cases, collapsed Team will be 'TOT'; if primary_team is missing,
    # fall back to Team (if not TOT)
    def resolve_primary_team(row):
        if pd.notna(row.get("primary_team")):
            return row["primary_team"]
        t = row.get("Team", None)
        if t and t != "TOT":
            return t
        return np.nan

    season_df["primary_team"] = season_df.apply(resolve_primary_team, axis=1)

    # Merge with standings using team_abbrev == primary_team
    season_df = season_df.merge(
        standings.add_suffix("_team"),
        left_on=["primary_team", "season"],
        right_on=["team_abbrev_team", "season_team"],
        how="left"
    )

    # Clean up redundant season columns
    if "season_team" in season_df.columns:
        season_df = season_df.drop(columns=["season_team"])
    if "season_end_year_team" in season_df.columns:
        # Keep the players_totals version as canonical
        season_df = season_df.rename(columns={"season_end_year": "season_end_year_player"})
        season_df = season_df.rename(columns={"season_end_year_team": "season_end_year"})
        # If needed you can assert equality

    # >>> NEW: apply 65-game eligibility ONLY to completed seasons <<<
    if season_end_year <= 2025:
        if "G" in season_df.columns:
            season_df = season_df[season_df["G"] >= 65]

    return season_df

# ---------------------------------------------------------------------------
# Build panel dataset across many seasons
# ---------------------------------------------------------------------------

def build_panel_dataset(season_end_years: List[int], require_targets: bool = True) -> pd.DataFrame:
    dfs = []
    for year in season_end_years:
        print(f"Building dataset for season_end_year={year}...")
        df_year = build_season_dataset(year)
        dfs.append(df_year)

    panel = pd.concat(dfs, ignore_index=True)

    # For completed seasons (up through 2025), enforce the 65-game rule
    # and require a valid target. For future seasons (e.g. 2026), skip this
    # so we don't wipe out all players during forecasting.
    if "season_end_year" in panel.columns and panel["season_end_year"].max() <= 2025:
        # 65-game eligibility filter (only if require_targets is True, 
        # because for historical lookbacks we might want to see everyone)
        if require_targets and "G" in panel.columns:
            panel = panel[panel["G"] >= 65].copy()

        # Basic sanity: drop players with missing target (only if required)
        if require_targets and "Voting_Share" in panel.columns:
            panel = panel[panel["Voting_Share"].notna()].copy()

    return panel


# ---------------------------------------------------------------------------
# Feature engineering
# ---------------------------------------------------------------------------

def engineer_features(panel: pd.DataFrame) -> pd.DataFrame:
    df = panel.copy()

    # Per-75 possession stats from per-100 (if available)
    for stat in ["PTS", "TRB", "AST"]:
        col100 = f"{stat}_per100"
        if col100 in df.columns:
            df[f"{stat}_per75"] = df[col100] * 0.75

    # Team win% and interactions
    if "W/L%_team" in df.columns:
        df["team_win_pct"] = df["W/L%_team"]
    elif "W/L%" in df.columns:
        df["team_win_pct"] = df["W/L%"]

    for adv_col in ["WS", "PER", "VORP"]:
        if adv_col in df.columns and "team_win_pct" in df.columns:
            df[f"team_win_pct_x_{adv_col}"] = df["team_win_pct"] * df[adv_col]

    # Within-season z-scores for key metrics
    z_cols = {
        "PTS_per_g": "z_pts_pg",
        "TRB_per_g": "z_trb_pg",
        "AST_per_g": "z_ast_pg",
        "PER": "z_per",
        "WS": "z_ws",
        "BPM": "z_bpm",
        "VORP": "z_vorp"
    }
    for src, dest in z_cols.items():
        if src in df.columns:
            df[dest] = (
                df.groupby("season")[src]
                .transform(lambda x: (x - x.mean()) / (x.std(ddof=0) + 1e-8))
            )

    return df


def select_feature_matrix(
    df: pd.DataFrame,
    feature_cols: Optional[List[str]] = None,
    label_col: str = "award_share",
) -> Tuple[pd.DataFrame, np.ndarray, List[str]]:
    """
    Build the feature matrix X and label vector y from a panel DataFrame
    for TRAINING / VALIDATION / TEST (where labels exist).

    This function:
    - finds a label column (prefer 'award_share', fall back to 'Voting_Share'),
    - infers feature columns (numeric only) if feature_cols is None,
    - excludes known non-feature columns,
    - drops rows with missing labels,
    - fills NaNs in features with 0.0,
    - returns X, y, and the feature_cols list.
    """

    # First, find which column is actually present as the label
    label_candidates = []
    if label_col is not None:
        label_candidates.append(label_col)
    if "award_share" not in label_candidates:
        label_candidates.append("award_share")
    if "Voting_Share" not in label_candidates:
        label_candidates.append("Voting_Share")

    actual_label = None
    for c in label_candidates:
        if c in df.columns:
            actual_label = c
            break

    if actual_label is None:
        raise ValueError(
            f"No label column found. Expected one of {label_candidates}, "
            f"but DataFrame columns are: {list(df.columns)}"
        )

    # Columns that should NEVER be used as features
    non_feature_cols = [
        "Player",
        "Player_clean",
        "Team",
        "Team_primary",
        "Pos",
        "season",
        "season_end_year",
        "Rank",
        "award_share",
        "Voting_Share",
        "Voting_Pts Won",
        "Voting_Pts Max",
        "Voting_First",
    ]

    # 1) Drop rows with missing labels
    df_model = df.dropna(subset=[actual_label]).copy()

    # 2) Infer feature columns if not provided
    if feature_cols is None:
        numeric_cols = df_model.select_dtypes(include=[np.number]).columns.tolist()
        feature_cols = [c for c in numeric_cols if c not in non_feature_cols]

    # 3) Build X and fill NaNs in features
    X = df_model[feature_cols].copy()
    X = X.fillna(0.0)

    # 4) Build y
    y = df_model[actual_label].values

    return X, y, feature_cols


# ---------------------------------------------------------------------------
# Temporal split + modeling
# ---------------------------------------------------------------------------

def temporal_split(panel: pd.DataFrame):
    # Ensure we have a single season_end_year column
    if "season_end_year" not in panel.columns:
        # If we renamed earlier, adjust this
        raise ValueError("season_end_year column missing from panel.")

    train_df = panel[panel["season_end_year"].isin(TRAIN_YEARS)].copy()
    val_df = panel[panel["season_end_year"] == VAL_YEAR].copy()
    test_df = panel[panel["season_end_year"] == TEST_YEAR].copy()

    return train_df, val_df, test_df


def fit_ridge_with_loso_cv(X_train, y_train, groups):
    ridge = Ridge(random_state=42)
    param_grid = {"alpha": [0.01, 0.1, 1.0, 10.0, 100.0]}
    cv = GroupKFold(n_splits=len(np.unique(groups)))
    grid = GridSearchCV(
        ridge,
        param_grid,
        scoring="neg_mean_absolute_error",
        cv=cv,
        n_jobs=-1
    )
    grid.fit(X_train, y_train, groups=groups)
    print("Best Ridge params:", grid.best_params_)
    print("Best Ridge CV MAE:", -grid.best_score_)
    return grid.best_estimator_


def fit_random_forest_with_loso_cv(X_train, y_train, groups):
    from sklearn.ensemble import RandomForestRegressor
    rf = RandomForestRegressor(random_state=42, n_jobs=-1)
    param_grid = {
        "n_estimators": [200, 500],
        "max_depth": [None, 5, 10],
        "min_samples_leaf": [1, 5]
    }
    cv = GroupKFold(n_splits=len(np.unique(groups)))
    grid = GridSearchCV(
        rf,
        param_grid,
        scoring="neg_mean_absolute_error",
        cv=cv,
        n_jobs=-1
    )
    grid.fit(X_train, y_train, groups=groups)
    print("Best RF params:", grid.best_params_)
    print("Best RF CV MAE:", -grid.best_score_)
    return grid.best_estimator_


def fit_xgb_with_loso_cv(X_train, y_train, groups):
    if not HAS_XGB:
        return None

    xgb = XGBRegressor(
        objective="reg:squarederror",
        tree_method="hist",
        random_state=42,
        n_jobs=-1
    )
    param_grid = {
        "n_estimators": [300, 600],
        "max_depth": [3, 5, 7],
        "learning_rate": [0.05, 0.1]
    }
    cv = GroupKFold(n_splits=len(np.unique(groups)))
    grid = GridSearchCV(
        xgb,
        param_grid,
        scoring="neg_mean_absolute_error",
        cv=cv,
        n_jobs=-1
    )
    grid.fit(X_train, y_train, groups=groups)
    print("Best XGB params:", grid.best_params_)
    print("Best XGB CV MAE:", -grid.best_score_)
    return grid.best_estimator_


# ---------------------------------------------------------------------------
# Evaluation: MAE + hit rates + Spearman
# ---------------------------------------------------------------------------

def evaluate_leaderboards(test_df: pd.DataFrame, y_true, y_pred):
    df = test_df.copy()
    df["y_true"] = y_true
    df["y_pred"] = y_pred

    mae = mean_absolute_error(df["y_true"], df["y_pred"])
    print(f"Test MAE on award share: {mae:.4f}")

    seasons = df["season"].unique()
    top1_hits = []
    top3_hits = []
    spearmans = []

    for s in seasons:
        sub = df[df["season"] == s].copy()
        if sub.empty:
            continue

        sub = sub.sort_values("y_pred", ascending=False)
        top1_preds = sub.head(1)["Player"].tolist()
        top3_preds = sub.head(3)["Player"].tolist()

        # Actual MVP = player with max true Voting_Share
        true_mvp_row = sub.loc[sub["y_true"].idxmax()]
        true_mvp = true_mvp_row["Player"]

        hit1 = int(true_mvp in top1_preds)
        hit3 = int(true_mvp in top3_preds)
        top1_hits.append(hit1)
        top3_hits.append(hit3)

        # Spearman rank corr (handle constant predictions edge case)
        try:
            rho, _ = spearmanr(sub["y_true"], sub["y_pred"])
        except Exception:
            rho = np.nan
        spearmans.append(rho)

        print(f"Season {s}: MVP={true_mvp}, Top1Hit={hit1}, Top3Hit={hit3}, Spearman={rho:.3f}")

    print(f"Overall Top-1 hit rate: {np.mean(top1_hits):.3f}")
    print(f"Overall Top-3 hit rate: {np.mean(top3_hits):.3f}")
    print(f"Average Spearman over test seasons: {np.nanmean(spearmans):.3f}")

def save_model_bundle(model, feature_cols, filepath):
    """
    Save a trained model together with its feature column list.

    Parameters
    ----------
    model : fitted sklearn/xgboost model
        The trained model object.
    feature_cols : list of str
        The exact feature column names used for training.
    filepath : str
        Path to the .pkl file to save.
    """
    bundle = {
        "model": model,
        "feature_cols": feature_cols,
        "train_years": TRAIN_YEARS,
        "val_year": VAL_YEAR,
        "test_year": TEST_YEAR,
    }
    joblib.dump(bundle, filepath)
    print(f"Saved model bundle to {filepath}")


def load_model_bundle(filepath):
    """
    Load a saved model + feature column list.

    Returns
    -------
    model : fitted model
    feature_cols : list of str
    metadata : dict
        Other stored metadata (train/val/test years).
    """
    bundle = joblib.load(filepath)
    model = bundle["model"]
    feature_cols = bundle["feature_cols"]
    metadata = {
        "train_years": bundle.get("train_years"),
        "val_year": bundle.get("val_year"),
        "test_year": bundle.get("test_year"),
    }
    return model, feature_cols, metadata


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    completed_years = TRAIN_YEARS + [VAL_YEAR, TEST_YEAR]
    panel = build_panel_dataset(completed_years)
    panel = engineer_features(panel)

    train_df, val_df, test_df = temporal_split(panel)

    # Decide feature set on TRAIN, then reuse it for VAL/TEST
    X_train, y_train, feature_cols = select_feature_matrix(train_df)
    X_val, y_val, _ = select_feature_matrix(val_df, feature_cols=feature_cols)
    X_test, y_test, _ = select_feature_matrix(test_df, feature_cols=feature_cols)

    # Group labels (season_end_year) for LOSO CV
    groups_train = train_df["season_end_year"].values

    print("\n=== Fitting Ridge with LOSO CV ===")
    ridge_model = fit_ridge_with_loso_cv(X_train, y_train, groups_train)

    print("\n=== Fitting Random Forest with LOSO CV ===")
    rf_model = fit_random_forest_with_loso_cv(X_train, y_train, groups_train)

    if HAS_XGB:
        print("\n=== Fitting XGBoost with LOSO CV ===")
        xgb_model = fit_xgb_with_loso_cv(X_train, y_train, groups_train)
    else:
        xgb_model = None

    # ------------------------------------------------------------------
    # Evaluate ALL models on validation + test
    # ------------------------------------------------------------------
    models = {
        "Ridge": ridge_model,
        "RandomForest": rf_model,
    }
    if HAS_XGB and xgb_model is not None:
        models["XGBoost"] = xgb_model

    for name, model in models.items():
        print(f"\n=== Evaluating {name} on validation and test sets ===")

        # Validation
        y_val_pred = model.predict(X_val)
        val_mae = mean_absolute_error(y_val, y_val_pred)
        print(f"Validation MAE ({name}): {val_mae:.4f}")

        # Test (2023–24 season)
        y_test_pred = model.predict(X_test)
        print(f"\nLeaderboard evaluation for {name} on TEST:")
        evaluate_leaderboards(test_df, y_test, y_test_pred)

    # ------------------------------------------------------------------
    # Save the primary model (Random Forest) for future use
    # ------------------------------------------------------------------
    primary_model = rf_model  # choose RF as our main model

    model_path = os.path.join(
        MODEL_DIR,
        "mvp_random_forest_2016_2023_train_award_share.pkl",
    )
    save_model_bundle(primary_model, feature_cols, model_path)


if __name__ == "__main__":
    main()