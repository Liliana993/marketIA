import { Router } from 'express';
import * as exportController from '../controllers/exportController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/products', exportController.exportProducts);
router.get('/sales', exportController.exportSales);

export default router;
