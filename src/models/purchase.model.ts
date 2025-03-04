import mongoose, { Document, Schema, Model } from 'mongoose';

// Purchase Status Type
export type PurchaseStatus = 'pending' | 'completed' | 'failed';

// Purchase interface
export interface IPurchase {
  userId: mongoose.Types.ObjectId;
  flashSaleId: mongoose.Types.ObjectId;
  quantity: number;
  totalPrice: number;
  status: PurchaseStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Purchase document interface
export interface PurchaseDocument extends IPurchase, Document {}

// Purchase model interface
export interface PurchaseModel extends Model<PurchaseDocument> {}

const PurchaseSchema = new Schema<PurchaseDocument, PurchaseModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    flashSaleId: {
      type: Schema.Types.ObjectId,
      ref: 'FlashSale',
      required: [true, 'Flash sale ID is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Index for quick leaderboard queries
PurchaseSchema.index({ flashSaleId: 1, createdAt: 1 });
PurchaseSchema.index({ userId: 1 });

const Purchase = mongoose.model<PurchaseDocument, PurchaseModel>('Purchase', PurchaseSchema);

export default Purchase;