# BidBlaze AI Features — Setup & Integration Guide

This guide explains how to add and run the three AI features in your existing BidBlaze MERN project.

## What Was Added

| Feature | Backend | Frontend | ML Service |
|---------|---------|----------|------------|
| AI Chatbot | `POST /api/chat` | Floating `ChatBot` on all pages | OpenAI or Gemini (optional) |
| Recommendations | `GET /api/recommendations/:userId` | `RecommendedForYou` on homepage | Node.js cosine similarity |
| Price Prediction | `POST /api/predictions/:auctionId` | `PricePrediction` on auction page | Python FastAPI + scikit-learn |

---

## Folder Structure (new files)

```
BidBlazee/
├── backend/
│   ├── models/
│   │   ├── ChatSession.js          # Chat history in MongoDB
│   │   └── UserActivity.js         # View tracking for recommendations
│   ├── routes/
│   │   ├── chat.js
│   │   ├── recommendations.js
│   │   └── predictions.js
│   └── services/
│       ├── ai/
│       │   ├── auctionContext.js
│       │   ├── chatService.js
│       │   └── llmProvider.js
│       ├── recommendation/
│       │   └── recommendationEngine.js
│       └── prediction/
│           └── predictionService.js
├── frontend/src/
│   ├── lib/api.ts                  # Shared Axios client (JWT)
│   └── components/ai/
│       ├── ChatBot.tsx
│       ├── RecommendedForYou.tsx
│       └── PricePrediction.tsx
└── ml-service/
    ├── app.py                      # FastAPI — POST /predict
    ├── train.py
    ├── data/training_data.csv
    └── requirements.txt
```

---

## Step 1 — Backend environment

Edit `backend/.env` (copy from `backend/.env.example` if needed):

```env
# Required (existing)
MONGODB_URI=mongodb://127.0.0.1:27017/bidblaze
JWT_SECRET=your-secret

# AI Chatbot — pick ONE provider (or leave empty for rule-based demo)
AI_PROVIDER=auto
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
# GEMINI_API_KEY=...
# GEMINI_MODEL=gemini-1.5-flash

# Recommendations: dummy | cosine
RECOMMENDATION_MODE=cosine

# ML price prediction service
ML_SERVICE_URL=http://127.0.0.1:5000
```

**Without API keys**, the chatbot still works using built-in rules + live auction data from MongoDB.

---

## Step 2 — Install dependencies

### Backend (no new npm packages required)

```bash
cd BidBlazee/backend
npm install
npm run dev
```

### Frontend

```bash
cd BidBlazee/frontend
npm install
npm run dev
```

`axios` was added to `package.json` for the shared API client.

### Python ML service

```bash
cd BidBlazee/ml-service
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
python train.py
uvicorn app:app --reload --port 5000
```

Keep this running alongside the Node backend.

---

## Step 3 — Verify APIs

| Endpoint | Auth | Test |
|----------|------|------|
| `POST /api/chat` | JWT | `{ "message": "How does bidding work?" }` |
| `GET /api/chat/history` | JWT | Returns past messages |
| `GET /api/recommendations/:userId` | JWT (own id) | Returns auction array |
| `POST /api/recommendations/track-view` | JWT | `{ "auctionId": "..." }` |
| `POST /api/predictions/:auctionId` | Public | Returns `predicted_final_price` |
| `POST http://localhost:5000/predict` | — | ML service direct |

Health checks:

- Node: `GET http://localhost:8080/api/health`
- ML: `GET http://localhost:5000/health`

---

## Step 4 — Frontend integration (already wired)

These files were updated for you:

| File | Change |
|------|--------|
| `frontend/src/App.tsx` | Global `<ChatBot />` |
| `frontend/src/pages/Index.tsx` | `<RecommendedForYou />` after live auctions |
| `frontend/src/pages/MakeBid.tsx` | `<PricePrediction />` + view tracking |

No breaking changes to existing routes or auth.

---

## How each feature works

### 1. AI Chatbot

- Floating button (bottom-right) on every page.
- Signed-in users: messages saved in `ChatSession` collection.
- Backend injects live auction data into the system prompt.
- Providers: OpenAI → Gemini → rule-based fallback.

### 2. Recommendation system

**Phase 1 (`RECOMMENDATION_MODE=dummy`):** Category match from bid history + popular auctions.

**Phase 2 (`cosine`, default):**

- Builds 8-dimensional category vectors per user.
- Cosine similarity between users (collaborative filtering).
- Scores active auctions by content match + similar-user bids + popularity.

View tracking: opening an auction page calls `POST /api/recommendations/track-view`.

### 3. Bid price prediction

- Node gathers: current bid, bidders, time left, category, bid history.
- Calls Python `POST /predict`.
- If ML service is down, uses a heuristic fallback (still shows a price).

Retrain with more data:

1. Add rows to `ml-service/data/training_data.csv`
2. Run `python train.py`
3. Restart uvicorn

---

## API examples (curl)

```bash
# Chat (replace TOKEN)
curl -X POST http://localhost:8080/api/chat \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Suggest best auctions"}'

# Recommendations
curl http://localhost:8080/api/recommendations/USER_ID \
  -H "Authorization: Bearer TOKEN"

# Prediction
curl -X POST http://localhost:8080/api/predictions/AUCTION_ID
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Chat returns generic answers | Add `OPENAI_API_KEY` or `GEMINI_API_KEY` to `.env` |
| Recommendations empty | Sign in, place bids, or browse auctions to build activity |
| Prediction shows “unavailable” | Start ML service on port 5000; run `python train.py` first |
| CORS errors | Ensure `FRONTEND_URL=http://localhost:3000` in backend `.env` |
| 401 on chat/recommendations | User must be logged in; token in `localStorage['auth-token']` |

---

## Production notes

1. Set strong `JWT_SECRET` and real MongoDB URI.
2. Use HTTPS and restrict CORS to your domain.
3. Deploy ML service (Railway, Render, etc.) and set `ML_SERVICE_URL`.
4. Rate-limit `/api/chat` separately if needed (OpenAI costs).
5. Never commit `.env` files with API keys.

---

## Optional enhancements

- Add OpenAI streaming for faster perceived chat responses.
- Log recommendation clicks to improve the model.
- Export ended auctions from MongoDB to retrain the regression model on real data.
- Add seller-only analytics using the same prediction API.
