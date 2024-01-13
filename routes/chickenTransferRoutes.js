import express from 'express';
import * as ChickenTransferCtrl from '../controller/chickenTransferCtrl.js';

const router = express.Router();

// View Chicken Record Page
router.get('/view', ChickenTransferCtrl.getChickenRecordPage);

// View Chicken Record Page
router.get('/view/id', ChickenTransferCtrl.getChickenTransferRecord);

// View Chicken Transfer Form
router.get('/create', ChickenTransferCtrl.getChickenTransferForm);

// Submit Chicken Transfer Form
router.post('/submit', ChickenTransferCtrl.submitChickenTransferForm);

export default router;
