# BidBlaze

BidBlaze is a real-time online auction platform with a React/Vite client, Express/MongoDB API, Socket.IO bid updates, server-side Gemini chat, and a Python price-prediction service.

## Architecture

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, JavaScript, Mongoose
- Database: MongoDB (Atlas-compatible)
- Real time: Socket.IO auction rooms
- AI: Gemini REST API, called only from the backend
- ML: FastAPI service using scikit-learn linear regression

The repository does not contain PostgreSQL, Prisma, or backend TypeScript.

## Features

- JWT login/registration, bcrypt password hashes, and user/seller authorization
- Seller-owned auction management, bid history, Cloudinary image routes, and Razorpay payment routes
- Server-side bid validation and broadcasts after successful persistence
- Auction-aware chat, recommendations, and final-price forecasts

## ML / Machine Learning Component

**Model:** `sklearn.linear_model.LinearRegression`.

**Purpose:** predict final auction price. `ml-service/train.py` trains on `ml-service/data/training_data.csv` using an 80/20 split (`random_state=42`) and saves `models/price_predictor.joblib`.

**Features:** current highest bid, bidder count, hours remaining, encoded category, starting price, bid increment, and total bids. **Target:** `final_price`. Training prints MAE and R²; no accuracy claim is stored in the repository.

Express derives features from MongoDB auction/bid records and calls the FastAPI `/predict` endpoint. `POST /api/predictions/:auctionId` returns the forecast, which the `PricePrediction` component displays. If the service is unavailable, the API labels its non-ML estimate `heuristic-fallback`.

## Gemini AI Integration

`POST /api/chat` is authenticated. It builds a prompt from active and ending-soon auctions plus bidding rules, then `backend/services/ai/llmProvider.js` calls Gemini `generateContent`. The default Gemini model is `gemini-1.5-flash`; configure `GEMINI_API_KEY`, `GEMINI_MODEL`, and `AI_PROVIDER=gemini` (or `auto`) on the backend only. Without a provider or after a provider error, a rule-based response is returned.

## Real-Time Architecture

Authenticated clients join `auction_<auctionId>` Socket.IO rooms. They submit bids via `POST /api/bids`; the API validates auction state, seller restriction, and minimum increment, saves the records, then emits `bidUpdate`. The server rejects `newBid` socket messages so a client cannot forge a displayed bid.

## Environment variables

Copy the safe examples and never commit real `.env` files.

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Backend requires `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL`; it also supports Razorpay, Cloudinary, `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_PROVIDER`, `ML_SERVICE_URL`, and `RECOMMENDATION_MODE`.

Frontend uses public `VITE_API_URL` and `VITE_WS_URL` backend origins (without `/api`), plus optional public `VITE_RAZORPAY_KEY_ID`. Do not put private credentials in `VITE_*` variables.

## Local setup

```powershell
cd backend; npm ci; Copy-Item .env.example .env; npm start
cd frontend; npm ci; Copy-Item .env.example .env; npm run dev
cd ml-service; python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt; python train.py; uvicorn app:app --port 5000
```

## Deployment

Deploy `frontend/` to Vercel as Vite with build command `npm run build`, output directory `dist`, and `VITE_API_URL`/`VITE_WS_URL` set to the public backend origin.

Deploy `backend/` to a persistent Node host (for example Render or Railway), not Vercel: Socket.IO requires a durable server process. Use root `backend`, build command `npm ci`, start command `npm start`, and set all backend variables. Deploy `ml-service/` as a separate Python service and set `ML_SERVICE_URL` accordingly.

## Verification

```powershell
cd frontend; npm ci; npm run build; npm run lint
cd ../backend; npm ci; npm test -- --runInBand
```

During this audit the frontend build passed; lint has warnings but no errors. The backend test command fails because no test files exist.

## Known limitations

- Bid writes are not wrapped in a MongoDB transaction; add transactional concurrency tests before high-volume use.
- The ML dataset/model need representative-data review before business-critical use.
- No production URLs are configured yet.

## GitHub description

Real-time auction platform with Socket.IO bidding, JWT-authenticated users and sellers, MongoDB/Mongoose, Gemini auction assistant, and linear-regression price forecasts.
