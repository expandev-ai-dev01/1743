import { Router } from 'express';
import * as stockMovementController from '@/api/v1/internal/stock-movement/controller';
import * as stockMovementDetailController from '@/api/v1/internal/stock-movement/detail/controller';
import * as stockMovementReverseController from '@/api/v1/internal/stock-movement/detail/reverse/controller';

const router = Router();

// Stock Movement routes - /api/v1/internal/stock-movement
router.get('/stock-movement', stockMovementController.getHandler);
router.post('/stock-movement', stockMovementController.postHandler);
router.get('/stock-movement/:id', stockMovementDetailController.getHandler);
router.post('/stock-movement/:id/reverse', stockMovementReverseController.postHandler);

export default router;
