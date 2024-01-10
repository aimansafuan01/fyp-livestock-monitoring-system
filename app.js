import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import session from 'express-session';
import {
  login,
  getTodayEgg, getTodayChickDead, getTodayChickenDead,
  getNumEggCurrWeek, getNumChickDeadCurrWeek, getNumChickenDeadCurrWeek,
  getNumberOfChicken, getNumEggsMonthly,
  getRecordSurveillance, getAllChicken, getCurrMonthEggs,
  getAsOfTotalEggs, getFirstDateCoopRecord, avgDailyEgg, getChickenDeadCurrMonth,
  getMonthlyChickenDead, getIncubationData, getFirstIncubationDate,
  getTotalChickenDead, getTotalIncubationData, getDailyEggsInAMonth, getDailyChickDeathInAMonth,
  getTotalChickDeathCurrMonth, getCumTotalChickDeath,
  register
} from './database.js';
import * as Routes from './routes/routes.js';

dotenv.config();
const app = express();
app.use('/assets', express.static('./assets/'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Middleware for parsing POST request data
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static assets
app.use(express.static('public'));

// Coop Routes
app.use('/coop', Routes.CoopRoutes);

// Chicken Transfer Routes
app.use('/chicken-transfer', Routes.ChickenTransferRoutes);

// Brooder Routes
app.use('/brooder', Routes.BrooderRoutes);

// Incubator Routes
app.use('/incubator', Routes.IncubatorRoutes);

// Chicken Health Routes
app.use('/chicken-health', Routes.ChickenHealthRoutes);

// Chicken Batch Routes
app.use('/chicken-batch', Routes.ChickenBatchRoutes);

// Surveillance Routes
app.use('/surveillance', Routes.SurveillanceRoutes);

// Login
app.get(['/', '/login'], (req, res) => {
  const errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;

  res.render('sign-in', { errorMessage });
});

// Dashboard
app.get('/home', async (req, res) => {
  const numOfChicken = await getNumberOfChicken();
  const surveillance = await getRecordSurveillance();

  const todayEgg = await getTodayEgg();
  const todayEggData = todayEgg.map((data) => data.todayEggCollected);

  const todayChickDead = await getTodayChickDead();
  const todayChickDeadata = todayChickDead.map((data) => data.todayChickDead);

  const todayChickenDeadData = await getTodayChickenDead();
  const todayRoosterDeadData = todayChickenDeadData.map((data) => data.todayRoosterDead);
  const todayHenDeadData = todayChickenDeadData.map((data) => data.todayRoosterDead);

  const numEggCurrWeek = await getNumEggCurrWeek();
  const numEggsCurrWeekData = numEggCurrWeek.map((data) => data.numEggs);

  const numChickDeadCurrWeek = await getNumChickDeadCurrWeek();
  const numChickDeadCurrWeekData = numChickDeadCurrWeek.map((data) => data.totalDeadChick);

  const numChickenDeadCurrWeek = await getNumChickenDeadCurrWeek();
  const numChickenDeadCurrWeekData = numChickenDeadCurrWeek.map((data) => data.totalDeadChicken);

  const numEggsMonthly = await getNumEggsMonthly();
  const numEggsMonthlyData = numEggsMonthly.map(entry => entry.numEggs);

  res.render('dashboard', {
    todayEggData,
    todayChickDeadata,
    todayRoosterDeadData,
    todayHenDeadData,
    numEggsCurrWeekData,
    numChickDeadCurrWeekData,
    numChickenDeadCurrWeekData,
    numOfChicken,
    numEggsMonthlyData,
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
