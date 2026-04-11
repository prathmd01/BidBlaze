
import mongoose, { Document, Schema } from 'mongoose'

export interface IAuction extends Document {
  _id: string
  title: string
  description: string
  category: string
  images: string[]
  startPrice: number
  reservePrice?: number
  currentBid: number
  bidCount: number
  seller: mongoose.Types.ObjectId
  winner?: mongoose.Types.ObjectId
  startTime: Date
  endTime: Date
  status: 'draft' | 'pending' | 'active' | 'ended' | 'cancelled'
  approved: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

const AuctionSchema = new Schema<IAuction>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['watches', 'art', 'jewelry', 'cars', 'books', 'electronics', 'collectibles', 'fashion', 'other']
  },
  images: [{
    type: String,
    required: true
  }],
  startPrice: {
    type: Number,
    required: true,
    min: 1
  },
  reservePrice: {
    type: Number,
    min: 1
  },
  currentBid: {
    type: Number,
    default: 0
  },
  bidCount: {
    type: Number,
    default: 0
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  winner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'ended', 'cancelled'],
    default: 'draft'
  },
  approved: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Index for efficient queries
AuctionSchema.index({ status: 1, endTime: 1 })
AuctionSchema.index({ category: 1, status: 1 })
AuctionSchema.index({ seller: 1 })

export default mongoose.models.Auction || mongoose.model<IAuction>('Auction', AuctionSchema)
