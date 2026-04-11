
import mongoose, { Document, Schema } from 'mongoose'

export interface IBid extends Document {
  _id: string
  auction: mongoose.Types.ObjectId
  bidder: mongoose.Types.ObjectId
  amount: number
  timestamp: Date
  isWinning: boolean
}

const BidSchema = new Schema<IBid>({
  auction: {
    type: Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  bidder: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isWinning: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Index for efficient queries
BidSchema.index({ auction: 1, amount: -1 })
BidSchema.index({ bidder: 1, timestamp: -1 })

export default mongoose.models.Bid || mongoose.model<IBid>('Bid', BidSchema)
