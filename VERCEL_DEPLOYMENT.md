# 🚀 Vercel Deployment Guide for BidBlaze

This guide will walk you through deploying your BidBlaze auction platform on Vercel. We'll deploy both the frontend and backend separately for optimal performance.

## 📋 Prerequisites

Before you start, make sure you have:
- A [Vercel account](https://vercel.com)
- A [MongoDB Atlas account](https://mongodb.com/atlas) (for database)
- A [Cloudinary account](https://cloudinary.com) (for image storage)
- Git repository with your BidBlaze project

## 🎯 Deployment Overview

We'll deploy:
1. **Frontend** - React app on Vercel
2. **Backend** - Node.js API on Vercel
3. **Database** - MongoDB Atlas (cloud)
4. **Image Storage** - Cloudinary (cloud)

## 🔧 Step 1: Prepare Your Environment Variables

### Frontend Environment Variables (Vercel Dashboard)

Go to your Vercel project dashboard → Settings → Environment Variables and add:

```env
VITE_API_URL=https://your-backend-domain.vercel.app
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id (optional for now)
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_WEBSOCKET=true
```

### Backend Environment Variables (Vercel Dashboard)

```env
JWT_SECRET=your-super-secure-jwt-secret-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bidblaze
FRONTEND_URL=https://your-frontend-domain.vercel.app
RAZORPAY_KEY_ID=rzp_test_your_key_id (optional)
RAZORPAY_KEY_SECRET=your_razorpay_secret (optional)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret (optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 🎨 Step 2: Deploy Frontend

### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project? → No
   - Project name → bidblaze-frontend
   - Directory → ./
   - Override settings? → No

### Option B: Deploy via GitHub Integration

1. **Push your code to GitHub**
2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Configure settings:**
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: `npm run build`
   - Output Directory: dist
   - Install Command: `npm install`

## ⚙️ Step 3: Deploy Backend

### Option A: Deploy via Vercel CLI

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project? → No
   - Project name → bidblaze-backend
   - Directory → ./
   - Override settings? → No

### Option B: Deploy via GitHub Integration

1. **Create a new Vercel project for backend**
2. **Configure settings:**
   - Framework Preset: Node.js
   - Root Directory: backend
   - Build Command: `npm install`
   - Output Directory: ./
   - Install Command: `npm install`

## 🔗 Step 4: Update Frontend API URL

After deploying the backend, update your frontend environment variable:

1. **Go to Vercel Dashboard → Your Frontend Project**
2. **Settings → Environment Variables**
3. **Update `VITE_API_URL` to your backend URL:**
   ```
   VITE_API_URL=https://your-backend-domain.vercel.app
   ```
4. **Redeploy the frontend**

## 🗄️ Step 5: Set Up MongoDB Atlas

1. **Create a MongoDB Atlas cluster**
2. **Get your connection string**
3. **Add it to backend environment variables:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bidblaze
   ```

## ☁️ Step 6: Set Up Cloudinary

1. **Create a Cloudinary account**
2. **Get your credentials from Dashboard**
3. **Add to backend environment variables:**
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## 🔐 Step 7: Configure Razorpay (Optional)

Since you mentioned Razorpay can't be implemented until hosted:

1. **For now, leave Razorpay variables empty**
2. **The app will work in demo mode**
3. **Later, add your Razorpay credentials:**
   ```
   RAZORPAY_KEY_ID=rzp_live_your_key_id
   RAZORPAY_KEY_SECRET=your_live_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

## 🧪 Step 8: Test Your Deployment

1. **Visit your frontend URL**
2. **Test user registration/login**
3. **Create an auction**
4. **Test bidding functionality**
5. **Check WebSocket connections**

## 🔧 Troubleshooting

### Common Issues:

**1. CORS Errors**
- Check that `FRONTEND_URL` in backend matches your frontend domain
- Ensure CORS is properly configured

**2. Database Connection Issues**
- Verify MongoDB Atlas connection string
- Check network access settings in Atlas

**3. Environment Variables Not Working**
- Make sure variables are set in Vercel dashboard
- Redeploy after adding variables

**4. Build Failures**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json

### Debug Commands:

```bash
# Check frontend build locally
cd frontend
npm run build

# Check backend locally
cd backend
npm start

# Test API endpoints
curl https://your-backend.vercel.app/api/health
```

## 🚀 Step 9: Custom Domain (Optional)

1. **Go to Vercel Dashboard → Your Project**
2. **Settings → Domains**
3. **Add your custom domain**
4. **Update DNS records as instructed**

## 📊 Monitoring & Analytics

1. **Vercel Analytics** - Built-in performance monitoring
2. **MongoDB Atlas** - Database performance
3. **Cloudinary** - Image delivery analytics

## 🔄 Continuous Deployment

Your app will automatically redeploy when you push to your main branch. To set up:

1. **Connect your GitHub repository to Vercel**
2. **Configure branch protection rules**
3. **Set up preview deployments for pull requests**

## 🎉 You're Live!

Congratulations! Your BidBlaze auction platform is now deployed and accessible worldwide. 

### Your URLs:
- **Frontend:** https://your-frontend.vercel.app
- **Backend:** https://your-backend.vercel.app
- **API Health:** https://your-backend.vercel.app/api/health

### Next Steps:
1. **Test all features thoroughly**
2. **Set up monitoring and alerts**
3. **Configure Razorpay when ready**
4. **Add SSL certificates (automatic with Vercel)**
5. **Set up backup strategies**

Happy bidding! 🚀
