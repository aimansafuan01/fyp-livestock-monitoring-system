import express from 'express';
import * as UserCtrl from '../controller/userCtrl.js';

const router = express.Router();

router.get(['/', '/login'], UserCtrl.getLoginPage);

router.get('/register', UserCtrl.getRegisterPage);

router.post('/login', UserCtrl.submitLoginCredentials);

router.post('/submit-register-account', UserCtrl.submitRegisterAccount);

export default router;
