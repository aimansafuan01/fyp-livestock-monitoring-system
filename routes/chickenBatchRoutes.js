import express from 'express';
import * as ChickenBatchCtrl from '../controller/chickenBatchCtrl.js';

const router = express.Router();

router.get('/view', ChickenBatchCtrl.getChickenBatchPage);

router.get('/create', ChickenBatchCtrl.getChickenBatchForm);

router.post('/submit', ChickenBatchCtrl.submitChickenBatchForm);

export default router;
