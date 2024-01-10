import express from 'express';
import * as ChickenCtrl from '../controller/chickenCtrl.js';

const router = express.Router();

// View Chicken Record Page
router.get('/view', ChickenCtrl.getChickenRecordPage);

// View Chicken Transfer Form
router.get('/create', ChickenCtrl.getChickenTransferForm);

// Submit Chicken Transfer Form
router.post('/submit', ChickenCtrl.submitChickenTransferForm);

export default router;
