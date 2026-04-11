
import mongoose, { Document, Schema } from 'mongoose'

export interface ITransaction extends Document {
  _id: string
  auction: mongoose.Types.ObjectId
  buyer: mongoose.Types.ObjectId
  seller: mongoose.Types.ObjectId
  amount: number
  platformFee: number
  sellerAmount: number
  razorpayOrderId: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>({
  auction: {
    type: Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    required: true
  },
  sellerAmount: {
    type: Number,
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paidAt: Date
}, {
  timestamps: true
})

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema)
