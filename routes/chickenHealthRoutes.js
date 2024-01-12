import express from 'express';
import * as ChickenHealthCtrl from '../controller/chickenHealthCtrl.js';

const router = express.Router();

// View Chicken Health Page
router.get('/view', ChickenHealthCtrl.getChickenHealthRecordPage);

// View chicken health record form
router.get('/create', ChickenHealthCtrl.getChickenHealthForm);

// Submit chicken health record form
router.post('/submit', ChickenHealthCtrl.submitChickenHealthForm);

// Update chicken health record
router.get('/update', ChickenHealthCtrl.updateChickenHealthRecord);

export default router;
