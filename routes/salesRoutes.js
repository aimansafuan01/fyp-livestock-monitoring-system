import express from 'express';
import * as SalesCtrl from '../controller/salesCtrl.js';

const router = express.Router();

// View Sales Record
router.get('/view', SalesCtrl.getSalesRecordPage);

// View Sales Form
router.get('/create', SalesCtrl.getSalesForm);

// Submit Sales Form
router.post('/submit', SalesCtrl.submitSalesForm);

export default router;
