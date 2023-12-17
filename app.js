import express from 'express';
import mysql2 from 'mysql2';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { login, submitCoopRecord, getAllCoop } from './database.js';

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
app.get('/login', (req, res) => {
  res.render('sign-in');
});

// Dashboard
app.get('/home', (req, res) => {
  res.render('dashboard');
});

// Daily Record
app.get('/daily-record', (req, res) => {
  res.render('daily-record');
});

// Create Chicken Record
app.get('/chicken-record', (req, res) => {
  res.render('chicken-record');
});

// View Coop
app.get('/coop/view', async (req, res) => {
  const allCoop = await getAllCoop();
  res.render('coop-record', { allCoop });
});

// Create Coop Record
app.get('/coop/create', (req, res) => {
  const coop = {
    id: req.query.id
  };
  console.log(req.query.id);

  res.render('create-coop-record', coop);
});

// Submit Coop Record
app.post('/submit-coop-record', async (req, res) => {
  try {
    const data = {
      coopID: req.body.coopID,
      numDeadHen: req.body.numOfDeadHensR1,
      numDeadRoosters: req.body.numOfDeadRoostersR1,
      numEggs: req.body.numOfEggs,
      numNc: req.body.numOfNC,
      numAccepted: req.body.acceptedEggs
    };
    const result = await submitCoopRecord(data);
    if (result) {
      res.status(200)
        .redirect('/coop/view');
    }
  } catch (error) {
    console.error('Error during submitted coop record', error);
    res.status(500)
      .send('Interbal Server Error');
  }
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
    res.status(401).send('Invalid credentials');
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
