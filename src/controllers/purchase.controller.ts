import { Request, Response } from 'express';
import mongoose from 'mongoose';
import FlashSale from '../models/flash-sale.model';
import Purchase, { PurchaseDocument } from '../models/purchase.model';
import errorHandler from '../utils/error-handler';
import logger from '../utils/logger';
import { LeaderboardEntry, SuccessResponse } from '../types/express';


export const makePurchase = async (req: Request, res: Response): Promise<void> => {
  // Starting a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { flashSaleId, quantity = 1 } = req.body;
    
    if (!req.user) {
      await session.abortTransaction();
      session.endSession();
      errorHandler(res, 401, 'User not authenticated');
      return;
    }
    
    const userId = req.user.id;

    // Finding the flash sale with session for transaction
    const flashSale = await FlashSale.findById(flashSaleId).session(session);

    if (!flashSale) {
      await session.abortTransaction();
      session.endSession();
      errorHandler(res, 404, 'Flash sale not found');
      return;
    }

    // Checking if flash sale is active
    if (!flashSale.isActive()) {
      await session.abortTransaction();
      session.endSession();
      
      if (flashSale.status === 'scheduled') {
        errorHandler(res, 400, 'Flash sale has not started yet');
        return;
      } else if (flashSale.status === 'completed') {
        errorHandler(res, 400, 'Flash sale has ended');
        return
      } else if (flashSale.remainingStock <= 0) {
        errorHandler(res, 400, 'No more stock available');
        return;
      }
    }

    // Checking if the quantity is valid
    if (quantity <= 0) {
      await session.abortTransaction();
      session.endSession();
      errorHandler(res, 400, 'Quantity must be greater than 0');
      return;   
    }

    // Checking if the quantity exceeds the maximum allowed per user
    if (quantity > flashSale.maxPurchasePerUser) {
      await session.abortTransaction();
      session.endSession();
      errorHandler(res, 400, `Cannot purchase more than ${flashSale.maxPurchasePerUser} items per user`);
      return;
    }

    // Checking if the user has already purchased the maximum allowed
    const userPurchases = await Purchase.find({
      userId,
      flashSaleId,
      status: 'completed'
    }).session(session);

    const totalPurchased = userPurchases.reduce((total, purchase) => total + purchase.quantity, 0);
    
    if (totalPurchased + quantity > flashSale.maxPurchasePerUser) {
      await session.abortTransaction();
      session.endSession();
      errorHandler(res, 400, `You can only purchase a maximum of ${flashSale.maxPurchasePerUser} items per flash sale`);
      return;
    }

    // To atomically update the stock with optimistic concurrency control
    const updatedFlashSale = await FlashSale.findOneAndUpdate(
      {
        _id: flashSaleId,
        remainingStock: { $gte: quantity },
        status: 'active'
      },
      {
        $inc: { remainingStock: -quantity }
      },
      {
        new: true,
        session
      }
    );

    if (!updatedFlashSale || updatedFlashSale.remainingStock < 0) {
      await session.abortTransaction();
      session.endSession();
      errorHandler(res, 400, 'Not enough stock available');
      return;
    }

    // To calculate the total price
    const totalPrice = flashSale.price * quantity;

    // Creating a purchase record
    const purchase = await Purchase.create([{
      userId,
      flashSaleId,
      quantity,
      totalPrice,
      status: 'completed'
    }], { session });

    // If remainingStock is now 0, it update the flash sale status to completed
    if (updatedFlashSale.remainingStock === 0) {
      updatedFlashSale.status = 'completed';
      await updatedFlashSale.save({ session });
    }

    // To commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: {
        purchase: purchase[0],
        remainingStock: updatedFlashSale.remainingStock
      }
    });
  } catch (error) {
    // Aborting the transaction on error
    await session.abortTransaction();
    session.endSession();
    
    logger.error(`Error making purchase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return;
  }
};


export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const flashSaleId = req.params.id;
    
    // To verify the flash sale exists
    const flashSale = await FlashSale.findById(flashSaleId);
    
    if (!flashSale) {
      errorHandler(res, 404, 'Flash sale not found');
      return;
    }
    
    // Finding all completed purchases for this flash sale, sorted by creation time
    const purchases = await Purchase.find({
      flashSaleId,
      status: 'completed'
    })
    .sort({ createdAt: 1 })
    .populate('userId', 'name email')
    .lean();
    
    // Formating the leaderboard data
    const leaderboard: LeaderboardEntry[] = purchases.map((purchase, index) => ({
      position: index + 1,
      user: (purchase.userId as any).name,
      purchaseTime: purchase.createdAt,
      quantity: purchase.quantity
    }));
    
    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    } as SuccessResponse<LeaderboardEntry[]>);
  } catch (error) {
    logger.error(`Error fetching leaderboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return;
  }
};

export const getUserPurchases = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorHandler(res, 401, 'User not authenticated');
      return;
    }
    
    const purchases = await Purchase.find({ userId: req.user.id })
      .populate('flashSaleId', 'productName price startTime')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases
    } as SuccessResponse<PurchaseDocument[]>);
  } catch (error) {
    logger.error(`Error fetching user purchases: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return
  }
};