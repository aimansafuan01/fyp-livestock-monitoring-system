import express from 'express';
import * as BrooderCtrl from '../controller/brooderCtrl.js';

const router = express.Router();

// View Brooder
router.get('/view', BrooderCtrl.getAllBrooderPage);

// View Brooder Record
router.get('/view/record', BrooderCtrl.getBrooderRecordAll);

// Get Brooder Record Page
router.get('/create', BrooderCtrl.getBrooderForm);

// Get Edit Brooder Record Page
router.get('/view/record/edit', BrooderCtrl.getEditBrooderForm);

// Delete Brooder Record
router.get('/view/record/delete', BrooderCtrl.deleteBrooderRecord);

// Submit Brooder Record Form
router.post('/submit', BrooderCtrl.submitBrooderForm);

// Submit Brooder Edit Record Form
router.post('/edit/record', BrooderCtrl.editBrooderForm);

export default router;
