"""
FastAPI microservice for bid final price prediction.

Run:
  cd ml-service
  python train.py          # first time — creates models/price_predictor.joblib
  uvicorn app:app --reload --port 5000
"""

import os
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "price_predictor.joblib")

app = FastAPI(title="BidBlaze Price Predictor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model_bundle = None


def load_model():
    global _model_bundle
    if _model_bundle is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}. Run: python train.py"
            )
        _model_bundle = joblib.load(MODEL_PATH)
    return _model_bundle


class PredictRequest(BaseModel):
    current_highest_bid: float = Field(..., ge=0)
    num_bidders: int = Field(..., ge=0)
    time_remaining_hours: float = Field(..., ge=0)
    category_encoded: int = Field(..., ge=0, le=7)
    starting_price: float = Field(default=0, ge=0)
    bid_increment: float = Field(default=50, ge=1)
    total_bids: int = Field(default=0, ge=0)
    category: str | None = None
    auction_id: str | None = None


class PredictResponse(BaseModel):
    predicted_final_price: float
    confidence: str
    model: str


@app.get("/health")
def health():
    try:
        load_model()
        return {"status": "ok", "model_loaded": True}
    except FileNotFoundError:
        return {"status": "ok", "model_loaded": False, "hint": "Run python train.py"}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        bundle = load_model()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    model = bundle["model"]
    features = bundle["features"]

    row = np.array([[
        req.current_highest_bid,
        req.num_bidders,
        req.time_remaining_hours,
        req.category_encoded,
        req.starting_price or req.current_highest_bid,
        req.bid_increment,
        req.total_bids,
    ]])

    predicted = float(model.predict(row)[0])
    # Never predict below current bid
    predicted = max(predicted, req.current_highest_bid)

    # Simple confidence heuristic
    if req.num_bidders >= 10 and req.time_remaining_hours < 24:
        confidence = "high"
    elif req.num_bidders >= 3:
        confidence = "medium"
    else:
        confidence = "low"

    return PredictResponse(
        predicted_final_price=round(predicted, 2),
        confidence=confidence,
        model="linear-regression-v1",
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
