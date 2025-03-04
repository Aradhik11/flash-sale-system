import express from 'express';
import {
  createFlashSale,
  getFlashSales,
  getFlashSale,
  updateFlashSale,
  deleteFlashSale,
  getFlashSaleStatus,
  resetFlashSale
} from '../controllers/flash-sale.controller';
import { getLeaderboard } from '../controllers/purchase.controller';
import { protect, restrictToAdmin } from '../middleware/auth.middleware';
import { apiLimiter } from '../middleware/rate-limiter.middleware';

const router = express.Router();

// Rate limiting to all flash sale routes
router.use(apiLimiter);

/**
 * @swagger
 * /api/flash-sales:
 *   get:
 *     summary: Get all flash sales
 *     tags: [Flash Sales]
 *     responses:
 *       200:
 *         description: List of all flash sales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FlashSale'
 *   post:
 *     summary: Create a new flash sale
 *     tags: [Flash Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - price
 *               - startTime
 *             properties:
 *               productName:
 *                 type: string
 *               description:
 *                 type: string
 *               totalStock:
 *                 type: number
 *                 default: 200
 *               price:
 *                 type: number
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               maxPurchasePerUser:
 *                 type: number
 *                 default: 1
 *     responses:
 *       201:
 *         description: Flash sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FlashSale'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 */
router.route('/')
  .get(getFlashSales)
  .post(protect, restrictToAdmin, createFlashSale);

/**
 * @swagger
 * /api/flash-sales/{id}:
 *   get:
 *     summary: Get a specific flash sale
 *     tags: [Flash Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flash sale ID
 *     responses:
 *       200:
 *         description: Flash sale retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FlashSale'
 *       404:
 *         description: Flash sale not found
 *   put:
 *     summary: Update a flash sale
 *     tags: [Flash Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flash sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               description:
 *                 type: string
 *               totalStock:
 *                 type: number
 *               price:
 *                 type: number
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               maxPurchasePerUser:
 *                 type: number
 *     responses:
 *       200:
 *         description: Flash sale updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FlashSale'
 *       400:
 *         description: Cannot update active or completed flash sale
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Flash sale not found
 *   delete:
 *     summary: Delete a flash sale
 *     tags: [Flash Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flash sale ID
 *     responses:
 *       200:
 *         description: Flash sale deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Cannot delete an active flash sale
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Flash sale not found
 */
router.route('/:id')
  .get(getFlashSale)
  .put(protect, restrictToAdmin, updateFlashSale)
  .delete(protect, restrictToAdmin, deleteFlashSale);

/**
 * @swagger
 * /api/flash-sales/{id}/status:
 *   get:
 *     summary: Get real-time status of a flash sale
 *     tags: [Flash Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flash sale ID
 *     responses:
 *       200:
 *         description: Flash sale status retrieved successfully
 */  
router.get('/:id/status', getFlashSaleStatus);

/**
 * @swagger
 * /api/flash-sales/{id}/reset:
 *   post:
 *     summary: Reset a flash sale for a new event
 *     tags: [Flash Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flash sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startTime
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               totalStock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Flash sale reset successfully
 */
router.post('/:id/reset', protect, restrictToAdmin, resetFlashSale);

/**
 * @swagger
 * /api/flash-sales/{id}/leaderboard:
 *   get:
 *     summary: Get leaderboard for a flash sale
 *     tags: [Flash Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flash sale ID
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get('/:id/leaderboard', getLeaderboard);

export default router;