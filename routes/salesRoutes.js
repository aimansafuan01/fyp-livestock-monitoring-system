import express from 'express';
import * as SalesCtrl from '../controller/salesCtrl.js';

const router = express.Router();

// View Sales
router.get('/view', SalesCtrl.getSalesRecordPage);

export default router;
