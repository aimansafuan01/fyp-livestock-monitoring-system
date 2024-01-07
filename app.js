import express from 'express';
import mysql2 from 'mysql2';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import session from 'express-session';
import {
  login, submitCoopRecord, getAllCoop, getAllBrooder,
  submitBrooderRecord, minusBrooderNumChick, minusNumChickenCoop,
  getAllIncubator, submitTrayRecord, updateIncubatorEgg,
  getNumEggsInBasket, getIncubatorRecord, getHatchingDate,
  getTrayToBasketRecord, addChickToBrooder, updateIncubator,
  getTodayEgg, getTodayChickDead, getTodayChickenDead, getChickToSell,
  getWeeklyEggs, getWeeklyChickDead, getWeeklyChickenDead,
  getNumberOfChicken, getNumEggsMonthly, updateBrooderMR, getSurveillance,
  submitSurveillanceRecord, getRecordSurveillance, updateSurveillanceStatus,
  getAllRecordSurveillance, updateCoopMR, getCoopIDs, submitTransferRecord,
  addNumChickenCoop, getHealthSymptoms, getHealthStatus, submitChickenHealthRecord,
  getChickenHealthRecord, updateChickenHealthStatus, getAllChicken, getCurrMonthEggs,
  updateTotalEggs, getAsOfTotalEggs, getFirstDateCoopRecord, avgDailyEgg, getChickenDeadCurrMonth,
  getMonthlyChickenDead, submitHatchRecord, getIncubationData, getFirstIncubationDate,
  getTotalChickenDead, getTotalIncubationData, getDailyEggsInAMonth, getDailyChickDeathInAMonth,
  getTotalChickDeathCurrMonth, getCumTotalChickDeath, submitChickenArrival, getBatchData,
  register
} from './database.js';
import { sendAlert } from './mailer.js';

dotenv.config();
const app = express();
app.use('/assets', express.static('./assets/'));
app.use(express.urlencoded({ extended: true }));

// Set up MySQL connection
const connection = mysql2.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Middleware for parsing POST request data
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static assets
app.use(express.static('public'));

// Login
app.get(['/', '/login'], (req, res) => {
  const errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;

  res.render('sign-in', { errorMessage });
});

// Dashboard
app.get('/home', async (req, res) => {
  const eggData = await getTodayEgg();
  const chickDeadData = await getTodayChickDead();
  const chickenDeadData = await getTodayChickenDead();
  const chickToSellData = await getChickToSell();
  const weeklyEggsData = await getWeeklyEggs();
  const weeklyChickDead = await getWeeklyChickDead();
  const weeklyChickenDead = await getWeeklyChickenDead();
  const numOfChicken = await getNumberOfChicken();
  const monthlyEggs = await getNumEggsMonthly();
  const surveillance = await getRecordSurveillance();
  res.render('dashboard', {
    eggData,
    chickDeadData,
    chickenDeadData,
    chickToSellData,
    weeklyEggsData,
    weeklyChickDead,
    weeklyChickenDead,
    numOfChicken,
    monthlyEggs,
    surveillance
  });
});

// Register employee
app.get('/register', (req, res) => {
  res.render('register');
});

// Daily Record
app.get('/daily-record', (req, res) => {
  res.render('daily-record');
});

// Create Chicken Record
app.get('/chicken-record', (req, res) => {
  res.render('chicken-record');
});

// View Chicken Record
app.get('/chicken/view', async (req, res) => {
  const allCoop = await getAllCoop();
  res.render('chicken-transfer', { allCoop });
});

// View Coop
app.get('/coop/view', async (req, res) => {
  const allCoop = await getAllCoop();
  res.render('coop-record', { allCoop });
});

// View Brooder
app.get('/brooder/view', async (req, res) => {
  const allBrooder = await getAllBrooder();
  res.render('brooder-record', { allBrooder });
});

// View Incubator
app.get('/incubator/view', async (req, res) => {
  const allIncubator = await getAllIncubator();
  const hatchingDate = await getHatchingDate();
  res.render('incubator-record', { allIncubator, hatchingDate });
});

// Get Coop Record Page
app.get('/coop/create', (req, res) => {
  const coop = {
    id: req.query.id
  };
  res.render('create-coop-record', coop);
});

// Get Chicken Record Page
app.get('/chicken/create', async (req, res) => {
  const coopIDS = await getCoopIDs();
  const data = {
    id: req.query.id,
    coopIDS
  };
  res.render('create-chicken-transfer-record', { data });
});

// Get Brooder Record Page
app.get('/brooder/create', (req, res) => {
  const coop = {
    id: req.query.id
  };
  res.render('create-brooder-record', coop);
});

// Get Incubator Tray Record Page
app.get('/incubator/create-tray', async (req, res) => {
  const data = {
    id: req.query.id
  };
  const incubatorResult = await getIncubatorRecord(data);
  const numEggsInTray = await getTrayToBasketRecord(data);
  res.render('create-tray-record', { data, incubatorResult, numEggsInTray });
});

// Get Incubator Hatch Record Page
app.get('/incubator/create-hatch', async (req, res) => {
  const incubatorID = req.query.id;
  const numEgg = await getNumEggsInBasket(incubatorID);
  const data = {
    id: incubatorID,
    numEgg: numEgg[0].numEggs
  };

  res.render('create-hatch-record', data);
});

// Get surveillance Record Page
app.get('/surveillance-record', async (req, res) => {
  const recordSurveillanceData = await getAllRecordSurveillance();

  res.render('surveillance-record', { recordSurveillanceData });
});

// Get Chicken Health Record Page
app.get('/chicken-health-record', async (req, res) => {
  const healthRecord = await getChickenHealthRecord();
  const healthStatus = await getHealthStatus();
  res.render('chicken-health-record', { healthRecord, healthStatus });
});

// Get Arrival Chicken Page
app.get('/arrival-chicken-record', async (req, res) => {
  const batchData = await getBatchData();
  res.render('arrival-chicken-record', { batchData });
});

// Get Create Chicken Health Record Page
app.get('/create-chicken-health-record', async (req, res) => {
  try {
    const coopIDs = await getCoopIDs();
    const healthSymptoms = await getHealthSymptoms();
    const healthStatus = await getHealthStatus();
    res.render('create-chicken-health-record', { coopIDs, healthSymptoms, healthStatus });
  } catch (error) {
    res.status(500)
      .send('Internal Server Error');
  }
});

// Get Create Arrival Chicken Record Page
app.get('/create-arrival-chicken-record', async (req, res) => {
  try {
    const coopIDs = await getCoopIDs();
    const coopIDData = coopIDs.map((data) => data.coopID);

    res.render('create-arrival-chicken-record', { coopIDData });
  } catch (error) {
    res.status(500)
      .send('Internal Server Error');
  }
});

// Update Surveillance Status
app.get('/update-surveillance', async (req, res) => {
  try {
    const id = req.query.id;
    const result = await updateSurveillanceStatus(id);
    if (result) {
      res.status(200)
        .redirect('/home');
    }
  } catch (error) {
    console.error('Error during updating coop record', error);
    res.status(500)
      .send('Internal Server Error');
  }
});

app.post('/submit-arrival-chicken-record', async (req, res) => {
  const origin = req.body.origin;
  const numHens = req.body.numHens;
  const numRoosters = req.body.numRoosters;
  const placeTo = req.body.placeTo;
  const ageChicken = req.body.ageChicken;

  const batchData = {
    origin,
    numHens,
    numRoosters,
    placeTo,
    ageChicken
  };

  const coopData = {
    coopID: placeTo,
    numOfHens: numHens,
    numOfRoosters: numRoosters
  };

  try {
    const submitArrivalChickenRecord = await submitChickenArrival(batchData);
    const updateNumChicken = await addNumChickenCoop(coopData);
    if (submitArrivalChickenRecord && updateNumChicken) {
      res.status(200)
        .redirect('/arrival-chicken-record');
    }
  } catch (error) {
    console.error('Error during submitting coop record', error);
    res.status(500)
      .send('Internal Server Error');
  }
});

// Submit Coop Record
app.post('/submit-coop-record', async (req, res) => {
  try {
    const coopID = req.body.coopID;
    const numEggs = req.body.numOfEggs;
    const numNc = req.body.numOfNC;
    const numAccepted = req.body.acceptedEggs;

    const coopData = {
      coopID,
      numDeadHen: req.body.numOfDeadHensR1,
      numDeadRoosters: req.body.numOfDeadRoostersR1,
      numEggs,
      numNc,
      numAccepted
    };

    const coopSurveillance = {
      coopID,
      brooderID: null,
      incubatorID: null
    };

    const eggData = {
      numEggs,
      numNc,
      numAccepted
    };

    const resultSubmit = await submitCoopRecord(coopData);
    const resultUpdateCoopMR = await updateCoopMR(coopData);
    const resultUpdate = await minusNumChickenCoop(coopData);
    const resultUpdateEggs = await updateTotalEggs(eggData);
    const surveillanceThreshold = await getSurveillance();

    if (resultUpdateCoopMR[1] > surveillanceThreshold[0].chickenMRThreshold) {
      await submitSurveillanceRecord(coopSurveillance);
      sendAlert();
    }
    if (resultSubmit && resultUpdate && resultUpdateEggs) {
      res.status(200)
        .redirect('/coop/view');
    }
  } catch (error) {
    console.error('Error during submitting coop record', error);
    res.status(500)
      .send('Internal Server Error');
  }
});

// Submit Brooder Record
app.post('/submit-brooder-record', async (req, res) => {
  try {
    const brooderData = {
      brooderID: req.body.brooderID,
      numDeadChick: req.body.numDeadChick
    };

    const brooderSurveillance = {
      brooderID: req.body.brooderID,
      incubatorID: null,
      coopID: null
    };
    const resultSubmit = await submitBrooderRecord(brooderData);
    const resultUpdateMRChick = await updateBrooderMR(brooderData);
    const resultUpdateNumChick = await minusBrooderNumChick(brooderData);
    const surveillanceThreshold = await getSurveillance();

    if (resultUpdateMRChick[1] > surveillanceThreshold[0].chickMRThreshold) {
      await submitSurveillanceRecord(brooderSurveillance);
      sendAlert();
    }

    if (resultSubmit && resultUpdateNumChick && resultUpdateMRChick) {
      res.status(200)
        .redirect('/brooder/view');
    }
  } catch (error) {
    console.error('Error during submitting brooder record', error);
    res.status(500)
      .send('Internal Server Error');
  }
});

// Submit Incubator Tray Record
app.post('/submit-tray-record', async (req, res) => {
  const trayData = {
    incubatorID: req.body.incubatorID,
    dateIn: req.body.dateIn,
    trayID: req.body.trayID,
    numEggs: req.body.numEggs
  };
  const resultSubmitTray = await submitTrayRecord(trayData);
  const resultUpdateEgg = await updateIncubatorEgg(trayData);
  if (resultSubmitTray && resultUpdateEgg) {
    res.status(200)
      .redirect('/incubator/view');
  } else {
    console.log('Something went wrong');
  }
});

// Submit Incubator Hatch Record
app.post('/submit-hatch-record', async (req, res) => {
  const incubatorID = req.body.incubatorID;
  const dateHatch = req.body.dateOut;
  const eggInBasket = req.body.numEgg;
  const notHatch = req.body.notHatch;
  const brooderID = req.body.brooderID;
  const numChick = +eggInBasket - +notHatch;
  const hatchRate = Number((+numChick / +eggInBasket) * 100).toFixed(2);

  try {
    const brooderData = {
      brooderID,
      numChick
    };

    const incubatorData = {
      incubatorID,
      hatchRate,
      eggInBasket
    };

    const incubatorSurveillance = {
      coopID: null,
      brooderID: null,
      incubatorID
    };

    const hatchData = {
      dateHatch,
      numEgg: eggInBasket,
      numHatch: numChick,
      numNotHatch: notHatch,
      hatchRate,
      incubatorID,
      brooderID
    };

    const resultChickBrooder = await addChickToBrooder(brooderData);
    const resultUpdateIncubator = await updateIncubator(incubatorData);
    const resultSubmitHatchRecord = await submitHatchRecord(hatchData);
    const surveillanceThreshold = await getSurveillance();

    if (hatchRate < surveillanceThreshold[0].hatchingRateThreshold) {
      await submitSurveillanceRecord(incubatorSurveillance);
      sendAlert();
    }

    if (resultChickBrooder && resultUpdateIncubator && resultSubmitHatchRecord) {
      res.status(200)
        .redirect('/incubator/view');
    }
  } catch (error) {
    console.error('Error during submitting hatch record', error);
    res.status(500)
      .send('Internal Server Error');
  }
});

app.post('/submit-chicken-transfer-record', async (req, res) => {
  const origin = req.body.origin;
  const destination = req.body.destination;
  const numOfHens = req.body.numOfHens;
  const numOfRoosters = req.body.numOfRoosters;

  const transferData = {
    origin,
    destination,
    numOfHens,
    numOfRoosters
  };

  const coopData = {
    coopID: origin,
    numDeadHen: numOfHens,
    numDeadRoosters: numOfRoosters
  };

  const addData = {
    coopID: destination,
    numOfHens,
    numOfRoosters
  };

  try {
    const transferResult = await submitTransferRecord(transferData);
    const updateNumChickenResult = await minusNumChickenCoop(coopData);
    const addNumChickenResult = await addNumChickenCoop(addData);
    if (transferResult && updateNumChickenResult && addNumChickenResult) {
      res.status(200)
        .redirect('/chicken/view');
    }
  } catch (error) {
    console.error('Error during submitting transfer record', error);
    res.status(500)
      .send('Internal Server Error');
  }
});

app.post('/submit-chicken-health-record', async (req, res) => {
  const origin = req.body.origin;
  const symptom = req.body.symptom;
  const status = req.body.status;
  const numOfHens = req.body.numOfHens;
  const numOfRoosters = req.body.numOfRoosters;

  const healthData = {
    origin,
    symptom,
    status,
    numOfHens,
    numOfRoosters
  };

  const transferData = {
    origin,
    destination: 'SB',
    numOfHens,
    numOfRoosters
  };

  const minusChicken = {
    coopID: origin,
    numDeadHen: numOfHens,
    numDeadRoosters: numOfRoosters
  };

  const addData = {
    coopID: 'SB',
    numOfHens,
    numOfRoosters
  };

  try {
    const healthResult = await submitChickenHealthRecord(healthData);
    const transferResult = await submitTransferRecord(transferData);
    const updateNumChickenResult = await minusNumChickenCoop(minusChicken);
    const addNumChickenResult = await addNumChickenCoop(addData);

    if (healthResult && transferResult && updateNumChickenResult && addNumChickenResult) {
      res.status(200)
        .redirect('/chicken-health-record');
    }
  } catch (error) {
    console.error('Error during submitting transfer record', error);
    res.status(500)
      .send('Internal Server Error');
  }
});

app.get('/update-chicken-health-status', async (req, res) => {
  const recordID = req.query.recordID;
  const status = req.query.status;
  const numDeadHen = req.query.numHens;
  const numDeadRoosters = req.query.numRoosters;
  let resultMinusChicken = null;

  const minusData = {
    coopID: 'SB',
    numDeadHen,
    numDeadRoosters
  };

  try {
    const resultUpdate = await updateChickenHealthStatus(recordID, status);

    if (status !== 'Cured') {
      resultMinusChicken = await minusNumChickenCoop(minusData);
    }

    if (resultUpdate && resultMinusChicken) {
      res.status(200)
        .redirect('/chicken-health-record');
    }
  } catch (error) {
    console.error('Error during updating health record', error);
    res.status(500)
      .send('Internal Server Error');
  }
});

// Get Data for Report
app.get('/data', async (req, res) => {

});

// Get Data for Report
app.get('/report', async (req, res) => {
  const monthlyEggs = await getNumEggsMonthly();
  const numOfChicken = await getNumberOfChicken();
  const coopData = await getAllChicken();
  const eggData = await getCurrMonthEggs();
  const asOfEggData = await getAsOfTotalEggs();
  const firstDateCoopRecord = await getFirstDateCoopRecord();
  const avgEggDaily = await avgDailyEgg();
  const chickenDeadData = await getChickenDeadCurrMonth();
  const dailyEggsAMonth = await getDailyEggsInAMonth();
  const monthlyChickenDead = await getMonthlyChickenDead();
  const incubationRecord = await getIncubationData();
  const firstIncubationDate = await getFirstIncubationDate();
  const totalChickenDeadData = await getTotalChickenDead();
  const totalIncubationData = await getTotalIncubationData();
  const dailyChickDeathInAMonth = await getDailyChickDeathInAMonth();
  const totalChickDeathCurrMonth = await getTotalChickDeathCurrMonth();
  const cumTotalChickDeath = await getCumTotalChickDeath();
  const dailyEggsAMonthData = dailyEggsAMonth.map(data => data.numEggs);
  const monthlyEggsData = monthlyEggs.map((data) => data.numEggs);
  const monthlyHensDeadData = monthlyChickenDead.map((data) => data.numDeadHen);
  const monthlyRoosterDeadData = monthlyChickenDead.map((data) => data.numDeadRooster);
  const dailyChickDeathInAMonthData = dailyChickDeathInAMonth.map((data) => data.numDeadChick);

  res.render('report', {
    monthlyEggs,
    numOfChicken,
    coopData,
    eggData,
    asOfEggData,
    firstDateCoopRecord,
    avgEggDaily,
    chickenDeadData,
    monthlyEggsData,
    dailyEggsAMonthData,
    monthlyHensDeadData,
    monthlyRoosterDeadData,
    incubationRecord,
    firstIncubationDate,
    totalChickenDeadData,
    totalIncubationData,
    dailyChickDeathInAMonthData,
    totalChickDeathCurrMonth,
    cumTotalChickDeath
  });
});

// Login
app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const result = await login(username, password);
  if (result) {
    res.status(200)
      .redirect('/home');
  } else {
    req.session.errorMessage = 'Invalid Username Or Password';
    res.status(401).redirect('/login');
  }
});

// Register account
app.post('/submit-register-account', async (req, res) => {
  const { username, password } = req.body;
  const account = {
    username,
    password
  };

  try {
    const submitRegisterAccount = await register(account);

    if (submitRegisterAccount) {
      res.status(200)
        .redirect('/home');
    }
  } catch (error) {
    console.error('Error during account registration', error);
    res.status(500)
      .send('Internal Server Error');
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
