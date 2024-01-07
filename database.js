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

// Submit Coop Record
export async function submitCoopRecord (coopData) {
  const coopID = coopData.coopID;
  const numDeadHen = +coopData.numDeadHen;
  const numDeadRoosters = +coopData.numDeadRoosters;
  const numEggs = +coopData.numEggs;
  const numNc = +coopData.numNc;
  const numAccepted = +coopData.numAccepted;

  const resultSubmitCoop = await pool.query(`
  INSERT INTO \`record-coop\` (coopID, numDeadHen, numDeadRooster, numEggs, numNc, numAccepted)
  VALUES (?, ?, ?, ?, ?, ?)
  `, [coopID, numDeadHen, numDeadRoosters, numEggs, numNc, numAccepted]);

  return resultSubmitCoop;
}

// Submit Brooder Record
export async function submitBrooderRecord (brooderData) {
  const brooderID = brooderData.brooderID;
  const numDeadChick = +brooderData.numDeadChick;

  const result = await pool.query(`
  INSERT INTO \`record-brooder\` (brooderID, numDeadChick)
  VALUES (?, ?)
  `, [brooderID, numDeadChick]);
  return result;
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

// Submit Surveillance Record
export async function submitSurveillanceRecord (surveillanceData) {
  const brooderID = surveillanceData.brooderID;
  const incubatorID = surveillanceData.incubatorID;
  const coopID = surveillanceData.coopID;
  const result = await pool.query(`
  INSERT INTO \`record-surveillance\` (incubatorID, brooderID, coopID, status)
  VALUES (?, ?, ?, ?)`,
  [incubatorID, brooderID, coopID, 'Unresolved']);
  return result;
}

export async function submitTransferRecord (transferData) {
  const origin = transferData.origin;
  const destination = transferData.destination;
  const numOfHens = transferData.numOfHens;
  const numOfRoosters = transferData.numOfRoosters;
  const result = await pool.query(`
  INSERT INTO \`record-transfer\` (origin, destination, numOfHens, numOfRoosters)
  VALUES (?, ?, ?, ?)`,
  [origin, destination, +numOfHens, +numOfRoosters]);
  return result;
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

// Update Brooder after casualty
export async function minusBrooderNumChick (brooderData) {
  const brooderID = brooderData.brooderID;
  const numDeadChick = +brooderData.numDeadChick;
  const result = await pool.query(`UPDATE BROODER
  SET brooder.numChick = brooder.numChick - ${numDeadChick}, brooder.availableChick = brooder.availableChick - ${numDeadChick}
  WHERE brooderID = '${brooderID}'`);
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

// Update Num Chicken in Coop after casualty
export async function minusNumChickenCoop (coopData) {
  const coopID = coopData.coopID;
  const numDeadHen = +coopData.numDeadHen ?? 0;
  const numDeadRoosters = +coopData.numDeadRoosters ?? 0;
  const result = await pool.query(`UPDATE COOP
  SET coop.numOfHens = coop.numOfHens - ?,
  coop.numOfRoosters = coop.numOfRoosters - ?
  WHERE coopID = ?`, [+numDeadHen, +numDeadRoosters, coopID]);
  return result;
}

// Add Num Chicken in Coop
export async function addNumChickenCoop (coopData) {
  const coopID = coopData.coopID;
  const numOfHens = +coopData.numOfHens;
  const numOfRoosters = +coopData.numOfRoosters;
  const result = await pool.query(`UPDATE COOP
  SET coop.numOfHens = coop.numOfHens + ?,
  coop.numOfRoosters = coop.numOfRoosters + ?
  WHERE coopID = ?`, [+numOfHens, +numOfRoosters, coopID]);
  return result;
}

// Add Num Eggs for Farm
export async function updateTotalEggs (eggData) {
  const numAccepted = eggData.numAccepted;
  const numEggs = eggData.numEggs;
  const numNc = eggData.numNc;
  console.log('in DataaseJS');
  console.log(numEggs, numNc, numAccepted);

  const result = await pool.query(`UPDATE eggs
  SET totalEggAccepted = totalEggAccepted + ?,
  totalEggNC = totalEggNC + ?,
  totalEggCollected = totalEggCollected + ?
  `, [+numAccepted, +numNc, +numEggs]);
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

// Update broder mortality rate
export async function updateBrooderMR (brooderData) {
  const { numDeadChick, brooderID } = brooderData;
  const numChickQuery = await getNumChick(brooderID);
  const currMRQuery = await getBrooderMR(brooderID);

  const { numChick } = numChickQuery[0][0];
  const { mortalityRate } = currMRQuery[0][0];

  const updatedMR = ((+numDeadChick / +numChick) * 100) + +mortalityRate;

  const result = await pool.query(`
  UPDATE brooder
  SET brooder.mortalityRate = ${+updatedMR}
  WHERE brooderID = '${brooderID}'`);

  return [result, updatedMR];
}

// Update coop mortality rate
export async function updateCoopMR (coopData) {
  const { coopID, numDeadHen, numDeadRoosters } = coopData;
  const numChicken = await getNumChickens(coopID);
  const currCoopMR = await getCoopMR(coopID);

  const { totalChickens } = numChicken[0];
  const { mortalityRate } = currCoopMR[0][0];
  const totalDeadChicken = +numDeadHen + +numDeadRoosters;

  const updatedMR = ((+totalDeadChicken / +totalChickens) * 100) + +mortalityRate;
  const result = await pool.query(`
  UPDATE coop
  SET coop.mortalityRate = ?
  WHERE coop.coopID = ?`, [+updatedMR, coopID]);

  return [result, updatedMR];
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

// Get All CoopID
export async function getCoopIDs () {
  const [result] = await pool.query(`
  SELECT coopID
  FROM coop
  `);
  return result;
}

// Get All Coop
export async function getAllCoop () {
  const [result] = await pool.query(`
  SELECT coopID, numOfHens, numOfRoosters, mortalityRate, totalChickens
  FROM coop
  `);
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

// Get All Brooder
export async function getAllBrooder () {
  const [result] = await pool.query(`
  SELECT brooderID, numChick, blockedChick, availableChick, mortalityRate, inserted_at
  FROM brooder
  `);
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

// Get Number of Chick
export async function getNumChick (brooderID) {
  const result = await pool.query(`
  SELECT numChick
  FROM brooder
  WHERE brooderID = '${brooderID}'
  `);
  return result;
}

// Get Brooder MR
export async function getBrooderMR (brooderID) {
  const result = await pool.query(`
  SELECT mortalityRate
  FROM brooder
  WHERE brooderID = '${brooderID}'
  `);
  return result;
}

// Get Coop MR
export async function getCoopMR (coopID) {
  const result = await pool.query(`
  SELECT mortalityRate
  FROM coop
  WHERE coopID = '${coopID}'
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
  SELECT numEggs
  FROM \`record-coop\`
  WHERE DATE(recorded_at) = CURDATE()
  ORDER BY coopID`);
  return result;
}

// Get today's chick dead
export async function getTodayChickDead () {
  const [result] = await pool.query(`
  SELECT numDeadChick
  FROM \`record-brooder\`
  WHERE DATE(created_at) = CURDATE()
  ORDER BY brooderID`);
  return result;
}

// Get today's chicken dead
export async function getTodayChickenDead () {
  const [result] = await pool.query(`
  SELECT numDeadHen, numDeadRooster
  FROM \`record-coop\`
  WHERE DATE(recorded_at) = CURDATE()
  ORDER BY coopID`);
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
export async function getWeeklyEggs () {
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
export async function getWeeklyChickDead () {
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
export async function getWeeklyChickenDead () {
  const [result] = await pool.query(`
  SELECT
    DAYNAME(DATE(recorded_at)) AS dayOfTheWeek,
    SUM(numDeadHen) AS totalDeadHen,
    SUM(numDeadRooster) AS totalDeadRooster
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

// Get Surveillance Criteria
export async function getSurveillance () {
  const [result] = await pool.query(`
  SELECT * FROM surveillance`);
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

// Get Number of Chicken
export async function getNumChickens (coopID) {
  const [result] = await pool.query(
    `SELECT totalChickens
    FROM coop
    WHERE coopID = ?`, [coopID]);
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
