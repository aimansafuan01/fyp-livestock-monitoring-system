import express from 'express';
import * as IncubatorCtrl from '../controller/incubatorCtrl.js';

const router = express.Router();

// Get Incubator Page
router.get('/view', IncubatorCtrl.getIncubatorPage);

// Get Tray Form
router.get('/create-tray', IncubatorCtrl.getIncubatorTrayForm);

// Get Hatch Form
router.get('/create-hatch', IncubatorCtrl.getIncubatorHatchForm);

// Submit Tray Record
router.post('/submit-tray-record', IncubatorCtrl.submitIncubatorTrayForm);

// Submit Hatch Record
router.post('/submit-hatch-record', IncubatorCtrl.submitIncubatorHatchForm);

export default router;
