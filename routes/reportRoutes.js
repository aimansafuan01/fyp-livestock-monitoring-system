import express from 'express';
import * as ReportCtrl from '../controller/reportCtrl.js';

const router = express.Router();

// View Report
router.get('/view', ReportCtrl.getReportPage);

export default router;
