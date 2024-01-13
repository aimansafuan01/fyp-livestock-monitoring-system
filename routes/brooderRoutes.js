import express from 'express';
import * as BrooderCtrl from '../controller/brooderCtrl.js';

const router = express.Router();

// View Brooder
router.get('/view', BrooderCtrl.getAllBrooderPage);

// View Brooder Record
router.get('/view/record', BrooderCtrl.getBrooderRecordAll);

// Get Brooder Record Page
router.get('/create', BrooderCtrl.getBrooderForm);

router.post('/submit', BrooderCtrl.submitBrooderForm);

export default router;
