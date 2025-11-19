import os
import pandas as pd

from model import (
    build_panel_dataset,
    engineer_features,
    select_feature_matrix,
    load_model_bundle,
    MODEL_DIR,
)

# If you defined this in model.py, you can import it instead:
FORECAST_YEARS = [2026]  # 2025-26 season


def build_forecast_features(forecast_years, feature_cols):
    """
    Build the feature matrix for forecast seasons, using the SAME
    preprocessing and feature engineering as training.

    For forecasting, we do NOT require labels. We simply:
    - build the panel for the forecast years,
    - apply engineer_features,
    - select the same feature_cols the model was trained on.
    """
    # 1. Build panel for forecast seasons only
    panel = build_panel_dataset(forecast_years)
    panel = engineer_features(panel)

    # Ensure season info is present and non-NaN for forecast seasons.
    # In our case we are only forecasting for [2026], i.e., the 2025-26 season.
    if len(forecast_years) == 1:
        year = forecast_years[0]
        panel["season_end_year"] = year
        panel["season"] = f"{year-1}-{str(year)[-2:]}"

    # 2. Restrict to the same feature columns used during training
    missing = [c for c in feature_cols if c not in panel.columns]
    if missing:
        print("Warning: the following feature columns are missing in forecast panel:")
        for c in missing:
            print("   ", c)

    available_feature_cols = [c for c in feature_cols if c in panel.columns]

    X_forecast = panel[available_feature_cols].copy()

    # Optional: basic NaN handling for forecast features
    X_forecast = X_forecast.fillna(0.0)

    return panel, X_forecast


def make_mvp_leaderboard(panel, y_pred, top_k=10):
    """
    Attach predictions to the panel and produce a sorted MVP leaderboard
    for each forecast season.
    """
    df = panel.copy()
    df["pred_award_share"] = y_pred

    leaderboards = {}

    for year in sorted(df["season_end_year"].unique()):
        df_year = df[df["season_end_year"] == year].copy()

        # === NEW: filter out tiny-sample players for the leaderboard ===
        # You can tune these thresholds. Example: require at least 15 games.
        MIN_GAMES = 9
        if "G" in df_year.columns:
            df_year = df_year[df_year["G"] >= MIN_GAMES].copy()

        # If you want to be more strict, you could add a minutes filter too:
        # if "MP" in df_year.columns:
        #     df_year = df_year[df_year["MP"] >= 500].copy()

        # If after filtering there are still no players, skip this year
        if df_year.empty:
            print(f"Warning: no players passed the forecast filter for season_end_year={year}")
            leaderboards[year] = df_year
            continue
        # === END NEW FILTER ===

        df_year = df_year.sort_values("pred_award_share", ascending=False)

        cols_to_show = [
            "Player",
            "primary_team",
            "pred_award_share",
            "G",
            "PTS_per_g",
            "TRB_per_g",
            "AST_per_g",
            "PER",
            "WS",
            "BPM",
        ]
        cols_available = [c for c in cols_to_show if c in df_year.columns]
        top = df_year[cols_available].head(top_k)

        leaderboards[year] = top

    return leaderboards


def main():
    # ------------------------------------------------------------------
    # 1. Load the trained model bundle
    # ------------------------------------------------------------------
    model_path = os.path.join(
        MODEL_DIR,
        "mvp_random_forest_2016_2023_train_award_share.pkl",
    )
    model, feature_cols, metadata = load_model_bundle(model_path)

    print("Loaded model bundle:")
    print("  Trained on years:", metadata["train_years"])
    print("  Validation year:", metadata["val_year"])
    print("  Test year:", metadata["test_year"])
    print("  Number of features:", len(feature_cols))

    # ------------------------------------------------------------------
    # 2. Build forecast feature matrix for 2025-26 (season_end_year=2026)
    # ------------------------------------------------------------------
    print("\nBuilding forecast features for seasons:", FORECAST_YEARS)
    panel_forecast, X_forecast = build_forecast_features(FORECAST_YEARS, feature_cols)
    print("Forecast feature matrix shape:", X_forecast.shape)

    # ------------------------------------------------------------------
    # 3. Predict award shares
    # ------------------------------------------------------------------
    print("\nPredicting MVP award shares...")
    y_pred = model.predict(X_forecast)

    # ------------------------------------------------------------------
    # 4. Build MVP leaderboards and print/save them
    # ------------------------------------------------------------------
    leaderboards = make_mvp_leaderboard(panel_forecast, y_pred, top_k=10)

    output_dir = "results"
    os.makedirs(output_dir, exist_ok=True)

    for year, df_leader in leaderboards.items():
        # Try to find the season string from the forecast panel
        season_str = None
        if "season_end_year" in panel_forecast.columns:
            mask = panel_forecast["season_end_year"] == year
            df_year = panel_forecast[mask]
            if not df_year.empty and "season" in df_year.columns and df_year["season"].notna().any():
                season_str = df_year["season"].iloc[0]

        # Fallback if we couldn't find a season string
        if season_str is None:
            season_str = f"{year-1}-{str(year)[-2:]}"

        print(f"\nPredicted MVP leaderboard for {season_str} (season_end_year={year}):")
        print(df_leader.to_string(index=False))

        csv_path = os.path.join(
            output_dir,
            f"mvp_forecast_leaderboard_{season_str.replace('/', '-')}.csv",
        )
        df_leader.to_csv(csv_path, index=False)
        print(f"Saved leaderboard to {csv_path}")


if __name__ == "__main__":
    main()