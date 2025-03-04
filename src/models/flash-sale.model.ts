import mongoose, { Document, Schema, Model } from 'mongoose';

// Flash Sale Status Type
export type FlashSaleStatus = 'scheduled' | 'active' | 'completed';

// Flash Sale interface
export interface IFlashSale {
  productName: string;
  description?: string;
  totalStock: number;
  remainingStock: number;
  startTime: Date;
  status: FlashSaleStatus;
  price: number;
  maxPurchasePerUser: number;
  createdAt: Date;
  updatedAt: Date;
  version?: number;
}

// Method interface
export interface IFlashSaleMethods {
  isActive(): boolean;
  canPurchase(quantity?: number): boolean;
}

// Static methods interface
export interface IFlashSaleModel extends Model<FlashSaleDocument> {
  updateStock(saleId: mongoose.Types.ObjectId, quantity: number): Promise<FlashSaleDocument | null>;
}

// Document interface combining document and methods
export interface FlashSaleDocument extends IFlashSale, IFlashSaleMethods, Document {}

const FlashSaleSchema = new Schema<FlashSaleDocument, IFlashSaleModel>(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    totalStock: {
      type: Number,
      required: [true, 'Total stock is required'],
      default: 200
    },
    remainingStock: {
      type: Number,
      required: true
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed'],
      default: 'scheduled'
    },
    price: {
      type: Number,
      required: [true, 'Price is required']
    },
    maxPurchasePerUser: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: 'version'
  }
);

// Method to check if the sale is active
FlashSaleSchema.methods.isActive = function(this: FlashSaleDocument): boolean {
  return this.status === 'active' && this.remainingStock > 0;
};

// Method to check if a user can purchase
FlashSaleSchema.methods.canPurchase = function(this: FlashSaleDocument, quantity: number = 1): boolean {
  return this.isActive() && this.remainingStock >= quantity;
};

// Static method to update stock atomically
FlashSaleSchema.statics.updateStock = async function(
  this: IFlashSaleModel,
  saleId: mongoose.Types.ObjectId,
  quantity: number
): Promise<FlashSaleDocument | null> {
  // Using findOneAndUpdate with optimistic concurrency control
  const result = await this.findOneAndUpdate(
    {
      _id: saleId,
      remainingStock: { $gte: quantity } // Checking if enough stock is available
    },
    {
      $inc: { remainingStock: -quantity } // Atomic decrement operation
    },
    {
      new: true, // Return the updated document
      runValidators: true // Run validators on update
    }
  );

  return result;
};

// Create indexes for optimized read/write operations
FlashSaleSchema.index({ startTime: 1 });
FlashSaleSchema.index({ status: 1 });

const FlashSale = mongoose.model<FlashSaleDocument, IFlashSaleModel>('FlashSale', FlashSaleSchema);

export default FlashSale;