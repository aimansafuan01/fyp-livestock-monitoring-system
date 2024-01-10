import mysql2 from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

// Set up MySQL connection
const pool = mysql2.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise();

// Update All Egg QTY
export async function updateEggs (eggData) {
  const numEggs = eggData.numEggs;
  const numNc = eggData.numNc;
  const numAccepted = eggData.numAccepted;

  const result = await pool.query(`UPDATE eggs
  SET eggs.totalEggAvailable = eggs.totalEggAvailable + ${numAccepted},
  eggs.totalEggNC = eggs.totalEggNC + ${numNc},
  eggs.totalEggCollected = eggs.totalEggCollected + ${numEggs},`);

  return result;
}

// Get chick dead for current month
export async function getChickDeadCurrMonth () {
  const [result] = await pool.query(`
  SELECT sum(numDeadRooster) AS numDeadRooster, sum(numDeadHen) AS numDeadHen, sum(numDeadHen) + sum(numDeadRooster) AS totalDead FROM \`RECORD-COOP\`
  WHERE MONTH(current_date()) = MONTH(recorded_at)
  AND
  YEAR(current_date()) = YEAR(recorded_at) `);
  return result;
}

// Get Incubator
export async function getIncubator (incubatorID) {
  const [result] = await pool.query(`
  SELECT *
  FROM incubator
  WHERE incubatorID = '${incubatorID}'
  `);
  return result;
}

// Get Daily Egg Collected for current month
export async function getDailyCurrMonthEggs () {
  const [result] = await pool.query(`
    SELECT
        SUM(numEggs) AS totalNumEggs
    FROM
        \`record-coop\`
    WHERE
        MONTH(DATE(recorded_at)) = MONTH(CURDATE())
        AND YEAR(DATE(recorded_at)) = YEAR(CURDATE())
    `);
  return result;
}

pool.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

export default pool;
