import { Request, Response } from 'express';
import FlashSale, { FlashSaleDocument } from '../models/flash-sale.model';
import errorHandler from '../utils/error-handler';
import logger from '../utils/logger';
import { SuccessResponse } from '../types/express';


export const createFlashSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, description, totalStock, startTime, price, maxPurchasePerUser } = req.body;

    // Validating that startTime is in the future
    const startTimeDate = new Date(startTime);
    if (startTimeDate <= new Date()) {
      errorHandler(res, 400, 'Start time must be in the future');
      return;
    }

    const flashSale = await FlashSale.create({
      productName,
      description,
      totalStock: totalStock || 200,
      remainingStock: totalStock || 200,
      startTime: startTimeDate,
      price,
      maxPurchasePerUser: maxPurchasePerUser || 1,
      status: 'scheduled'
    });

    res.status(201).json({
      success: true,
      data: flashSale
    } as SuccessResponse<FlashSaleDocument>);
  } catch (error) {
    logger.error(`Error creating flash sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return;
  }
};


export const getFlashSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const flashSales = await FlashSale.find();

    res.status(200).json({
      success: true,
      count: flashSales.length,
      data: flashSales
    } as SuccessResponse<FlashSaleDocument[]>);
  } catch (error) {
    logger.error(`Error fetching flash sales: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return;
  }
};


export const getFlashSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      errorHandler(res, 404, 'Flash sale not found');
      return;
    }

    // Checking if the flash sale should be activated
    if (flashSale.status === 'scheduled' && new Date(flashSale.startTime) <= new Date()) {
      flashSale.status = 'active';
      await flashSale.save();
    }

    res.status(200).json({
      success: true,
      data: flashSale
    } as SuccessResponse<FlashSaleDocument>);
  } catch (error) {
    logger.error(`Error fetching flash sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return;
  }
};


export const updateFlashSale = async (req: Request, res: Response): Promise<void> => {
  try {
    let flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      errorHandler(res, 404, 'Flash sale not found');
      return;
    }

    // To prevent updating active or completed flash sales
    if (flashSale.status !== 'scheduled') {
      errorHandler(res, 400, 'Cannot update an active or completed flash sale');
      return;
    }

    // If startTime is provided, it validate that it's in the future
    if (req.body.startTime) {
      const startTimeDate = new Date(req.body.startTime);
      if (startTimeDate <= new Date()) {
        errorHandler(res, 400, 'Start time must be in the future');
        return;
      }
      req.body.startTime = startTimeDate;
    }

    // If totalStock is updated, it also update remainingStock
    if (req.body.totalStock) {
      req.body.remainingStock = req.body.totalStock;
    }

    flashSale = await FlashSale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: flashSale
    } as SuccessResponse<FlashSaleDocument | null>);
  } catch (error) {
    logger.error(`Error updating flash sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return;
  }
};


export const deleteFlashSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      errorHandler(res, 404, 'Flash sale not found');
      return;
    }

    // To prevent deleting active flash sales
    if (flashSale.status === 'active') {
      errorHandler(res, 400, 'Cannot delete an active flash sale');
      return;
    }

    await flashSale.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    } as SuccessResponse<{}>);
  } catch (error) {
    logger.error(`Error deleting flash sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return;
  }
};


export const getFlashSaleStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      errorHandler(res, 404, 'Flash sale not found');
      return;
    }

    // Checking if the flash sale should be activated or completed
    const now = new Date();
    
    if (flashSale.status === 'scheduled' && new Date(flashSale.startTime) <= now) {
      flashSale.status = 'active';
      await flashSale.save();
    } else if (flashSale.status === 'active' && flashSale.remainingStock <= 0) {
      flashSale.status = 'completed';
      await flashSale.save();
    }

    res.status(200).json({
      success: true,
      data: {
        status: flashSale.status,
        productName: flashSale.productName,
        totalStock: flashSale.totalStock,
        remainingStock: flashSale.remainingStock,
        startTime: flashSale.startTime,
        isActive: flashSale.isActive()
      }
    });
  } catch (error) {
    logger.error(`Error fetching flash sale status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return;
  }
};


export const resetFlashSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startTime, totalStock } = req.body;
    
    const flashSale = await FlashSale.findById(req.params.id);

    if (!flashSale) {
      errorHandler(res, 404, 'Flash sale not found');
      return;
    }

    // Validating that startTime is in the future
    const startTimeDate = new Date(startTime);
    if (startTimeDate <= new Date()) {
      errorHandler(res, 400, 'Start time must be in the future');
      return;
    }

    // To reset the flash sale
    flashSale.status = 'scheduled';
    flashSale.startTime = startTimeDate;
    flashSale.totalStock = totalStock || flashSale.totalStock;
    flashSale.remainingStock = totalStock || flashSale.totalStock;

    await flashSale.save();

    res.status(200).json({
      success: true,
      data: flashSale
    } as SuccessResponse<FlashSaleDocument>);
  } catch (error) {
    logger.error(`Error resetting flash sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return;
  }
};