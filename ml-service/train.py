"""
Train a simple linear regression model to predict final auction price.

Usage:
  cd ml-service
  python -m venv venv
  venv\\Scripts\\activate   # Windows
  pip install -r requirements.txt
  python train.py
"""

import os
import joblib
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "training_data.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "price_predictor.joblib")

FEATURE_COLUMNS = [
    "current_highest_bid",
    "num_bidders",
    "time_remaining_hours",
    "category_encoded",
    "starting_price",
    "bid_increment",
    "total_bids",
]


def train():
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURE_COLUMNS]
    y = df["final_price"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = LinearRegression()
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump({"model": model, "features": FEATURE_COLUMNS}, MODEL_PATH)

    print(f"Model saved to {MODEL_PATH}")
    print(f"Test MAE: INR {mae:.2f}")
    print(f"Test R²: {r2:.3f}")


if __name__ == "__main__":
    train()
