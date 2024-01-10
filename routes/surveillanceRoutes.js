import express from 'express';
import * as SurveillanceCtrl from '../controller/surveillanceCtrl.js';

const router = express.Router();

// Get surveillance record page
router.get('/view', SurveillanceCtrl.getSurveillanceRecordPage);

// Update surveillance record page
router.get('/update', SurveillanceCtrl.updateSurveillanceRecord);

export default router;
