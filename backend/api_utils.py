import sys
import os
import pandas as pd
import json

# Add parent directory to path to import forecast.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from forecast import run_forecast
except ImportError:
    # Fallback for when running from root
    from nba_mvp_model.forecast import run_forecast

def get_leaderboard_data(year: int):
    """
    Fetches the leaderboard for a specific year.
    Returns a list of dictionaries.
    """
    # Run forecast for the specific year (or all, then filter)
    # forecast.py's run_forecast takes a list of years
    try:
        leaderboards = run_forecast([year])
        if year in leaderboards:
            df = leaderboards[year]
            # Convert to dict
            # We want to keep specific columns and format them
            # Replace Infinity with large numbers or None, and NaN with None
            # Using numpy for robust infinity checking
            import numpy as np
            df = df.replace([np.inf, -np.inf], None)
            df = df.replace([pd.NA, pd.NaT], None)
            df = df.where(pd.notnull(df), None)
            
            return df.to_dict(orient="records")
        else:
            return []
    except Exception as e:
        print(f"Error generating forecast: {e}")
        return {"error": str(e)}
