import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import session from 'express-session';
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

// User Routes
app.use(['/', '/user'], Routes.UserRoutes);

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

// Surveillance Routes
app.use('/report', Routes.ReportRoutes);

// Dashboard Routes
app.use('/dashboard', Routes.DashboardRoutes);

// Daily Record
app.get('/daily-record', (req, res) => {
  res.render('daily-record');
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
