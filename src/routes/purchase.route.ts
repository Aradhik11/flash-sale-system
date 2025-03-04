import express from 'express';
import {
  makePurchase,
  getUserPurchases
} from '../controllers/purchase.controller';
import { protect } from '../middleware/auth.middleware';
import { purchaseLimiter } from '../middleware/rate-limiter.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/purchases:
 *   post:
 *     summary: Make a purchase in a flash sale
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flashSaleId
 *             properties:
 *               flashSaleId:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 default: 1
 *     responses:
 *       201:
 *         description: Purchase completed successfully
 *       400:
 *         description: Purchase error (sold out, not started, etc.)
 *       401:
 *         description: Not authorized
 */
router.post('/', protect, purchaseLimiter, makePurchase);

/**
 * @swagger
 * /api/purchases/my-purchases:
 *   get:
 *     summary: Get user's purchase history
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's purchase history retrieved successfully
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
 *                     $ref: '#/components/schemas/Purchase'
 */
router.get('/my-purchases', protect, getUserPurchases);

export default router;