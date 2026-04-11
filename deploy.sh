#!/bin/bash

# BidBlaze Vercel Deployment Script
# This script helps deploy both frontend and backend to Vercel

echo "🚀 BidBlaze Vercel Deployment Script"
echo "====================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Function to deploy backend
deploy_backend() {
    echo "📦 Deploying Backend..."
    cd backend
    
    if [ -f "vercel.json" ]; then
        echo "✅ Backend vercel.json found"
    else
        echo "❌ Backend vercel.json not found. Please create it first."
        return 1
    fi
    
    echo "🚀 Deploying backend to Vercel..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "✅ Backend deployed successfully!"
        echo "📝 Note: Don't forget to set environment variables in Vercel dashboard"
    else
        echo "❌ Backend deployment failed!"
        return 1
    fi
    
    cd ..
}

# Function to deploy frontend
deploy_frontend() {
    echo "🎨 Deploying Frontend..."
    cd frontend
    
    if [ -f "vercel.json" ]; then
        echo "✅ Frontend vercel.json found"
    else
        echo "❌ Frontend vercel.json not found. Please create it first."
        return 1
    fi
    
    echo "🚀 Deploying frontend to Vercel..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend deployed successfully!"
        echo "📝 Note: Don't forget to set environment variables in Vercel dashboard"
    else
        echo "❌ Frontend deployment failed!"
        return 1
    fi
    
    cd ..
}

# Main deployment logic
echo "Choose deployment option:"
echo "1) Deploy Backend only"
echo "2) Deploy Frontend only"
echo "3) Deploy Both (Backend first, then Frontend)"
echo "4) Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        deploy_backend
        ;;
    2)
        deploy_frontend
        ;;
    3)
        echo "🔄 Deploying both backend and frontend..."
        deploy_backend
        if [ $? -eq 0 ]; then
            echo "⏳ Waiting 10 seconds before deploying frontend..."
            sleep 10
            deploy_frontend
        else
            echo "❌ Backend deployment failed. Skipping frontend deployment."
        fi
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Configure MongoDB Atlas connection"
echo "3. Set up Cloudinary credentials"
echo "4. Test your deployed application"
echo ""
echo "📖 For detailed instructions, see: VERCEL_DEPLOYMENT.md"
