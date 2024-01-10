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

// Login
export async function login (username, password) {
  const [rows] = await pool.query(`
  SELECT * 
  FROM user
  WHERE username = ? && password = ?
  `, [username, password]);
  return rows[0];
}

// Submit Tray Record
export async function submitTrayRecord (trayData) {
  const incubatorID = trayData.incubatorID;
  const trayID = trayData.trayID;
  const dateEnter = trayData.dateIn;
  const numEggs = trayData.numEggs;
  const resultTray = await pool.query(`
  INSERT INTO \`record-incubator\` (incubatorID, trayID, numEggs, dateEnter, dateMove, dateOut)
  VALUES (?, ?, ?,
    STR_TO_DATE(?, '%d/%m/%Y'),
    DATE_ADD(STR_TO_DATE(?, '%d/%m/%Y'), INTERVAL 18 DAY),
    DATE_ADD(STR_TO_DATE(?, '%d/%m/%Y'), INTERVAL 21 DAY))
  `, [incubatorID, trayID, numEggs, dateEnter, dateEnter, dateEnter]);

  return resultTray;
}

export async function submitChickenHealthRecord (healthRecord) {
  const origin = healthRecord.origin;
  const symptom = healthRecord.symptom;
  const status = healthRecord.status;
  const numOfHens = healthRecord.numOfHens;
  const numOfRoosters = healthRecord.numOfRoosters;

  const result = await pool.query(`
  INSERT INTO \`record-chicken-health\` (origin, status, symptom, numOfHens, numOfRoosters)
  VALUES (?, ?, ?, ?, ?)`,
  [origin, status, symptom, numOfHens, numOfRoosters]);

  return result;
}

export async function submitHatchRecord (hatchData) {
  const dateHatch = hatchData.dateHatch;
  const numEgg = hatchData.numEgg;
  const numHatch = hatchData.numHatch;
  const numNotHatch = hatchData.numNotHatch;
  const hatchRate = hatchData.hatchRate;
  const incubatorID = hatchData.incubatorID;
  const brooderID = hatchData.brooderID;

  const [result] = await pool.query(`
  INSERT INTO \`record-hatch\` (dateHatch, numEgg, numHatch, numNotHatch, hatchRate, incubatorID, brooderID)
  VALUES (STR_TO_DATE(?, '%d/%m/%Y'), ?, ?, ?, ?, ?, ?)`,
  [dateHatch, numEgg, numHatch, numNotHatch, hatchRate, incubatorID, brooderID]);
  return result;
}

export async function submitChickenArrival (batchData) {
  const { origin, numHens, numRoosters, placeTo, ageChicken } = batchData;

  const [result] = await pool.query(`
  INSERT INTO \`record-batch\` (origin, numHens, numRoosters, placeTo, ageChicken)
  VALUES (?, ?, ?, ?, ?)`,
  [origin, numHens, numRoosters, placeTo, ageChicken]);

  return result;
}



// Update Num Chick in Brooder after hatch
export async function addChickToBrooder (hatchData) {
  const brooderID = hatchData.brooderID;
  const numChick = hatchData.numChick;
  const result = await pool.query(`UPDATE BROODER
  SET brooder.numChick = brooder.numChick + ${numChick}, brooder.availableChick = brooder.availableChick + ${numChick}
  WHERE brooderID = '${brooderID}'`);
  return result;
}



// Update Incubator
export async function updateIncubator (incubatorData) {
  const incubatorID = incubatorData.incubatorID;
  const hatchingRate = +incubatorData.hatchRate;
  const eggOut = incubatorData.eggInBasket;
  const result = await pool.query(`UPDATE INCUBATOR
  SET incubator.totalEggInside = incubator.totalEggInside - ?,
  incubator.hatchingRate = ?
  WHERE incubatorID = ?`,
  [+eggOut, +hatchingRate, incubatorID]);
  return result;
}

// Update Incubator Egg
export async function updateIncubatorEgg (trayData) {
  const incubatorID = trayData.incubatorID;
  const numEggs = trayData.numEggs;

  const result = await pool.query(`UPDATE incubator
  SET incubator.totalEggInside = incubator.totalEggInside + ${numEggs}
  WHERE incubatorID = '${incubatorID}'`);
  return result;
}

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



// Update Record Surveillance Status
export async function updateChickenHealthStatus (recordID, status) {
  const result = await pool.query(`
  UPDATE \`record-chicken-health\`
  SET \`record-chicken-health\`.status = ?
  WHERE \`record-chicken-health\`.recordHealthID = ?`, [status, recordID]);

  return result;
}

// Update Record Chicken Health Status
export async function updateSurveillanceStatus (recordID) {
  const result = await pool.query(`
  UPDATE \`record-surveillance\`
  SET \`record-surveillance\`.status = 'Resolved'
  WHERE \`record-surveillance\`.surveillanceID = ?`, [recordID]);

  return result;
}

// Get All Chicken Group By Coop ID
export async function getAllChicken () {
  const [result] = await pool.query(`
  SELECT coopID, numOfHens, numOfRoosters
  FROM coop
  GROUP BY coopID
  `);
  return result;
}

// Get as of total eggs data
export async function getAsOfTotalEggs () {
  const [result] = await pool.query(`
  SELECT *
  FROM eggs
  `);
  return result;
}

// Get first date of coop record
export async function getFirstDateCoopRecord () {
  const [result] = await pool.query(`
  SELECT day(recorded_at) AS DAY, MONTHNAME(recorded_at) AS MONTH, year(recorded_at) AS YEAR
  FROM \`record-cooP\`
  ORDER BY recorded_at
  LIMIT 1
  `);
  return result;
}

// Get average eggs daily in a month
export async function avgDailyEgg () {
  const [result] = await pool.query(`
  SELECT sum(numEggs) / count(recordID) AS avgDailyEgg
  FROM \`record-coop\`
  WHERE MONTH(current_date()) = MONTH(recorded_at)
  AND
  YEAR(current_date()) = YEAR(recorded_at)
  `);
  return result;
}

// Get chicken dead for current month
export async function getChickenDeadCurrMonth () {
  const [result] = await pool.query(`
  SELECT sum(numDeadRooster) AS numDeadRooster, sum(numDeadHen) AS numDeadHen, sum(numDeadHen) + sum(numDeadRooster) AS totalDead FROM \`RECORD-COOP\`
  WHERE MONTH(current_date()) = MONTH(recorded_at)
  AND
  YEAR(current_date()) = YEAR(recorded_at) `);
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


// Get All Incubator
export async function getAllIncubator () {
  const [result] = await pool.query(`
  SELECT *
  FROM incubator
  `);
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

// Get Incubator Hatching Rate
export async function getIncubatorHR (incubatorID) {
  const [result] = await pool.query(`
  SELECT hatchingRate
  FROM incubator
  WHERE incubatorID = '${incubatorID}'
  `);
  return result;
}





// Get Number Egg in Hatching Basket
export async function getNumEggsInBasket (incubatorID) {
  const [result] = await pool.query(`
  SELECT numEggs
  FROM \`record-incubator\`
  WHERE dateOut = CURDATE()
  AND incubatorID = '${incubatorID}'
  `);
  return result;
}

// Get tray record that is moved to hatching basket
export async function getTrayToBasketRecord (data) {
  const incubatorID = data.id;
  const [result] = await pool.query(`
    SELECT trayID, numEggs, dateOut
    FROM \`record-incubator\`
    WHERE dateMove = CURDATE()
    AND incubatorID = '${incubatorID}'
    `);
  return result;
}

// Get record-incubator for occupied tray
export async function getIncubatorRecord (data) {
  const incubatorID = data.id;
  const [result] = await pool.query(`
  SELECT trayID, dateEnter, dateMove
  FROM \`record-incubator\`
  WHERE incubatorID = ?
  AND dateMove > CURDATE()
  ORDER BY trayID ASC;
  `, [incubatorID]);
  return result;
}

// Get hatching date
export async function getHatchingDate () {
  const [result] = await pool.query(`
  SELECT incubatorID, dateOut
  FROM  \`record-incubator\`
  WHERE dateOut = CURDATE()
  ORDER BY incubatorID`);
  return result;
}

// Get incubation data for current month (num egg, hatch, not hatch, hatch rate)
export async function getIncubationData () {
  const [result] = await pool.query(`
  SELECT SUM(numEgg) AS numEgg, SUM(numHatch) AS numHatch,
  sum(numNotHatch) AS numNotHatch, sum(hatchRate) / COUNT(recordHatchID) AS hatchRate,
  MIN(hatchRate) AS minHatchRate, MAX(hatchRate) AS maxHatchRate
  FROM \`record-hatch\`
  WHERE
  MONTH(created_at) = MONTH(CURDATE())
  AND YEAR(created_at) = YEAR(CURDATE())`);
  return result;
}

// Get chicken batch data
export async function getBatchData () {
  const [result] = await pool.query(`
  SELECT * FROM \`record-batch\`
  ORDER BY arrival_date`);
  return [result];
}

// Get today's egg
export async function getTodayEgg () {
  const [result] = await pool.query(`
  SELECT SUM(numEggs) AS todayEggCollected
  FROM \`record-coop\`
  WHERE DATE(recorded_at) = CURDATE()
  `);
  return result;
}

// Get today's chick dead
export async function getTodayChickDead () {
  const [result] = await pool.query(`
  SELECT SUM(numDeadChick) AS todayChickDead
  FROM \`record-brooder\`
  WHERE DATE(created_at) = CURDATE()
  `);
  return result;
}

// Get today's chicken dead
export async function getTodayChickenDead () {
  const [result] = await pool.query(`
  SELECT SUM(numDeadHen) AS todayHenDead, SUM(numDeadRooster) AS todayRoosterDead
  FROM \`record-coop\`
  WHERE DATE(recorded_at) = CURDATE()
  `);
  return result;
}

// Get monthly chicken dead count
export async function getMonthlyChickenDead () {
  const [result] = await pool.query(`
  SELECT  MONTHNAME(recorded_at) AS monthName, sum(numDeadHen) AS numDeadHen, sum(numDeadRooster) AS numDeadRooster
  FROM \`record-coop\`
  WHERE YEAR(current_date()) = YEAR(recorded_at)
  GROUP BY MONTHNAME(recorded_at)
  ORDER BY MONTHNAME(recorded_at)`);
  return result;
}

// Get total chicken Dead
export async function getTotalChickenDead () {
  const [result] = await pool.query(`
  SELECT SUM(numDeadHen) AS totalDeadHen, SUM(numDeadRooster) AS totalDeadRooster, SUM(numDeadHen)+SUM(numDeadRooster) AS totalChickenDead
  FROM \`record-coop\`
  `);
  return result;
}

// Get available chick to be sold
export async function getChickToSell () {
  const [result] = await pool.query(`
  SELECT availableChick
  FROM BROODER
  WHERE DATEDIFF(CURDATE(), DATE(inserted_at)) >= 5
  ORDER BY brooderID`);
  return result;
}

// Get Egg Collected for the week
export async function getNumEggCurrWeek () {
  const [result] = await pool.query(`
  SELECT DATE(recorded_at) AS dayOfTheWeek, numEggs
  FROM \`record-coop\`
  WHERE WEEK(recorded_at) = WEEK(CURDATE())
  AND MONTH(recorded_at) = MONTH(CURDATE())
  AND YEAR(recorded_at) = YEAR(CURDATE())
  ORDER BY recorded_at`);
  return result;
}

// Get daily Egg Collected for the month
export async function getDailyEggsInAMonth () {
  const [result] = await pool.query(`
  SELECT DATE(recorded_at) AS dayOfTheWeek, numEggs
  FROM \`record-coop\`
  WHERE MONTH(recorded_at) = MONTH(CURDATE())
  AND YEAR(recorded_at) = YEAR(CURDATE())
  ORDER BY recorded_at`);
  return result;
}

// Get daily Chick Death for the month
export async function getDailyChickDeathInAMonth () {
  const [result] = await pool.query(`
  SELECT numDeadChick
  FROM \`record-brooder\`
  WHERE MONTH(created_at) = MONTH(CURDATE())
  AND YEAR(created_at) = YEAR(CURDATE())
  `);
  return result;
}

// Get total Chick Death for current Month
export async function getTotalChickDeathCurrMonth () {
  const [result] = await pool.query(`
  SELECT SUM(numDeadChick) AS totalDeadChick
  FROM \`record-brooder\`
  WHERE MONTH(created_at) = MONTH(CURDATE())`);
  return result;
}

// Get cummulative total Chick Death
export async function getCumTotalChickDeath () {
  const [result] = await pool.query(`
  SELECT SUM(numDeadChick) AS totalDeadChick
  FROM \`record-brooder\`
  `);
  return result;
}

// Get Egg Collected for current month
export async function getCurrMonthEggs () {
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

// Get dead chick for the week
export async function getNumChickDeadCurrWeek () {
  const [result] = await pool.query(`
  SELECT
    DAYNAME(DATE(created_at)) AS dayOfTheWeek,
    SUM(numDeadChick) AS totalDeadChick
  FROM
    \`record-brooder\`
  WHERE
    YEARWEEK(DATE(created_at)) = YEARWEEK(CURDATE())
  GROUP BY
    DAYOFWEEK(DATE(created_at)),
    DAYNAME(DATE(created_at))
  ORDER BY
    DAYOFWEEK(DATE(created_at));
`);
  return result;
}

// Get dead chicken for the week
export async function getNumChickenDeadCurrWeek () {
  const [result] = await pool.query(`
  SELECT
    DAYNAME(DATE(recorded_at)) AS dayOfTheWeek,
    SUM(numDeadHen) + SUM(numDeadRooster) AS totalDeadChicken
  FROM
    \`record-coop\`
  WHERE
    YEARWEEK(DATE(recorded_at)) = YEARWEEK(CURDATE())
  GROUP BY
    DAYOFWEEK(DATE(recorded_at)),
    DAYNAME(DATE(recorded_at))
  ORDER BY
    DAYOFWEEK(DATE(recorded_at));
`);
  return result;
}

// Get number of chicken in the farm
export async function getNumberOfChicken () {
  const [result] = await pool.query(`
  SELECT
    SUM(numOfHens) AS totalHens,
    SUM(numOfRoosters) AS totalRoosters
  FROM
    coop
`);
  return result;
}
// Get number of eggs monthly
export async function getNumEggsMonthly () {
  const [result] = await pool.query(`
    SELECT
      MONTH(recorded_at) AS month,
      YEAR(recorded_at) AS year,
      SUM(numEggs) AS numEggs
    FROM
      \`record-coop\`
    WHERE
      YEAR(current_date()) = YEAR(recorded_at)
    GROUP BY
      YEAR(recorded_at), MONTH(recorded_at)
    ORDER BY
      month
`);
  return result;
}

// Get All Surveillance Record
export async function getAllRecordSurveillance () {
  const [result] = await pool.query(`
  SELECT * FROM \`record-surveillance\` ORDER BY status DESC, created_at DESC`);
  return result;
}

// Get Unresolved Surveillance Record
export async function getRecordSurveillance () {
  const [result] = await pool.query(`
  SELECT * FROM \`record-surveillance\` WHERE status = 'Unresolved'`);
  return result;
}

// Get chicken health symptoms
export async function getHealthSymptoms () {
  const [result] = await pool.query(`
  SELECT * FROM health_symptoms`);
  return result;
}

// Get chicken health status
export async function getHealthStatus () {
  const [result] = await pool.query(`
  SELECT * FROM health_status`);
  return result;
}

// Get chicken health record
export async function getChickenHealthRecord () {
  const [result] = await pool.query(`
  SELECT * FROM \`record-chicken-health\``);
  return result;
}

// Get first incubation date
export async function getFirstIncubationDate () {
  const [result] = await pool.query(`
  SELECT DATE(created_at) AS firstIncubationDate FROM \`record-hatch\`
  ORDER BY DATE(created_at)
  LIMIT 1`);
  return result;
}

// Get total incubation data from first date
export async function getTotalIncubationData () {
  const [result] = await pool.query(`
  SELECT SUM(numEgg) AS totalEggIncubated, SUM(numHatch) AS totalEggHatch
  FROM \`record-hatch\`
  `);
  return result;
}

// Register account
export async function register (accountData) {
  const { username, password } = accountData;
  const [result] = await pool.query(`
  INSERT INTO USER (username, password) VALUES (?, ?)`,
  [username, password]);
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
