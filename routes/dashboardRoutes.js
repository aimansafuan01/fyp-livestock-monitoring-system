import express from 'express';
import * as DashboardCtrl from '../controller/dashboardCtrl.js';

const router = express.Router();

router.get('/view', DashboardCtrl.getDashboardPage);

export default router;
