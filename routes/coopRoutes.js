import express from 'express';
import * as CoopCtrl from '../controller/coopCtrl.js';

const router = express.Router();
// View all coop page
router.get('/view', CoopCtrl.getAllCoop);

// View coop record form
router.get('/create', CoopCtrl.getCoopForm);

// Submit coop record form
router.post('/submit', CoopCtrl.submitCoopForm);

export default router;
