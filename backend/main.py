from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api_utils import get_leaderboard_data

app = FastAPI(title="NBA MVP Forecaster API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the NBA MVP Forecaster API"}

@app.get("/api/leaderboard/{year}")
def get_leaderboard(year: int):
    data = get_leaderboard_data(year)
    if isinstance(data, dict) and "error" in data:
        raise HTTPException(status_code=500, detail=data["error"])
    return data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
