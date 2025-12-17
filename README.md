# Calling the MVP: A Data-Driven Shot

This project builds an end-to-end machine learning pipeline to predict the NBA Most Valuable Player (MVP) race using player and team statistics from Basketball Reference. Instead of predicting only the single MVP winner, the model predicts MVP award share, a continuous value between 0 and 1 that represents the fraction of total voting points a player received. Framing the problem this way turns MVP prediction into a regression task and allows the model to produce full, ranked MVP leaderboards for each season.

---

## Motivation

The NBA MVP award is one of the most debated topics in sports analytics. Voters consider scoring volume, efficiency, advanced impact metrics, team success, and contextual factors that interact in complex ways. From a data science perspective, the MVP race is a challenging problem because it is multi-dimensional, highly non-linear, and temporally structured by season.

The goal of this project is to build a rigorous, reproducible machine learning system that:
- Explains historical MVP voting outcomes
- Compares linear and non-linear models
- Forecasts an ongoing MVP race using partial-season data
- Avoids data leakage by respecting the temporal structure of NBA seasons

---

## Data Sources

All data was collected from Basketball Reference (https://www.basketball-reference.com). For each season, the following CSV files were used:

- players_totals.csv: season totals (points, rebounds, assists, minutes, etc.)
- players_per_game.csv: per-game averages
- players_per_poss.csv: per-100 possession statistics
- players_advanced.csv: advanced metrics (PER, WS, WS/48, BPM, OBPM, DBPM, VORP, TS%, eFG%)
- standings.csv: team-level performance (wins, losses, win percentage, SRS, points scored and allowed)
- mvp_voting.csv: MVP voting results and award share

Each season’s data is merged into a single player-season dataset with one row per player per season.

---

## Target Variable: MVP Award Share

The model predicts MVP award share, a continuous value between 0 and 1 that represents how many voting points a player received relative to the maximum possible. Award share captures the full MVP voting distribution rather than only the winner, allowing the model to learn how strong each player’s MVP case was in a given season.

This framing provides richer supervision than binary classification and enables ranking-based evaluation.

---

## Data Cleaning and Feature Engineering

Key preprocessing steps include:
- Cleaning and normalizing player names across tables
- Collapsing multi-team players into a single season entry
- Recomputing per-game stats from totals for consistency
- Merging player statistics with team standings using a primary-team mapping
- Handling missing values in advanced metrics

Feature engineering includes:
- Standardizing numeric features using z-scores
- Combining player performance and team context features
- Including advanced efficiency and impact metrics
- Incorporating per-possession statistics to adjust for pace
- Creating interaction features (e.g., usage × efficiency)

---

## Eligibility Rules

For completed seasons, a 65-game minimum filter was applied to reflect the NBA’s official award eligibility rule. Players with fewer than 65 games were excluded from training, validation, and testing.

For forecasting the ongoing 2025–26 season, this rule was adapted proportionally. Since approximately 12 games had been played at the time of forecasting, a minimum of 9 games (about 79% of games played so far) was required. This removed extreme small-sample outliers while preserving legitimate early-season MVP candidates.

---

## Models Used

Three regression models were evaluated:

- Ridge Regression: a linear baseline with L2 regularization
- Random Forest Regressor: an ensemble of decision trees that captures non-linear relationships and feature interactions
- XGBoost Regressor: a gradient-boosted tree model that sequentially corrects prediction errors

Tree-based models are particularly well-suited for MVP prediction because MVP voting depends on interacting factors such as efficiency, usage, and team success, which are not well-captured by linear models.

---

## Training and Evaluation Strategy

A strict temporal split was used to avoid data leakage:
- Training set: seasons 2016–2023
- Validation set: season 2023–24 (Nikola Jokić MVP)
- Test set: season 2024–25 (Shai Gilgeous-Alexander MVP)

Models were evaluated using:
- Mean Absolute Error (MAE) on award share
- Top-1 and Top-3 hit rates for MVP identification
- Spearman rank correlation to assess ranking quality

Random Forest and XGBoost substantially outperformed the linear baseline and correctly ranked the true MVP as the top candidate in both validation and test seasons.

---

## Forecasting

After evaluation, the trained Random Forest model was used to forecast the 2025–26 MVP race using partial-season data. The forecasting pipeline reuses the exact same preprocessing and feature engineering steps as training, ensuring consistency. The resulting early-season leaderboard closely matched real-world media discussions of MVP candidates.

---

## Figures

The project includes the following visualizations:
- Model performance comparison (MAE across models)
- Actual vs predicted award share for the top 10 players in 2024–25
- Random Forest feature importance showing which statistics most influence predictions

---

## References

Basketball Reference. “NBA Player Stats and Team Standings.” Accessed 2025. https://www.basketball-reference.com  

Samford University, Center for Sports Analytics. “Using Machine Learning to Predict the NBA MVP.” 2023.  
https://www.samford.edu/sports-analytics/fans/2023/Using-Machine-Learning-to-Predict-the-NBA-MVP

---

## Team Members

Hisham, Hamza, Chibuzor, Adam, Ashmit.

Developed by Hisham Issa
