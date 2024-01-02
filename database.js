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

// Update Brooder after casualty
export async function updateBrooderNumChick (brooderData) {
  const brooderID = brooderData.brooderID;
  const numDeadChick = +brooderData.numDeadChick;
  const result = await pool.query(`UPDATE BROODER
  SET brooder.numChick = brooder.numChick - ${numDeadChick}, brooder.availableChick = brooder.availableChick - ${numDeadChick}
  WHERE brooderID = '${brooderID}'`);
  return result;
}

// Update Brooder after hatch
export async function addChickToBrooder (hatchData) {
  const brooderID = hatchData.brooderID;
  const numChick = hatchData.numChick;
  const result = await pool.query(`UPDATE BROODER
  SET brooder.numChick = brooder.numChick + ${numChick}, brooder.availableChick = brooder.availableChick + ${numChick}
  WHERE brooderID = '${brooderID}'`);
  return result;
}

// Update Coop
export async function updateNumChickenCoop (coopData) {
  const coopID = coopData.coopID;
  const numDeadHen = +coopData.numDeadHen;
  const numDeadRoosters = +coopData.numDeadRoosters;
  const result = await pool.query(`UPDATE COOP
  SET coop.numOfHens = coop.numOfHens - ${numDeadHen}, coop.numOfRoosters = coop.numOfRoosters - ${numDeadRoosters}
  WHERE coopID = '${coopID}'`);
  return result;
}

// Update Incubator
export async function updateIncubator (incubatorData) {
  const incubatorID = incubatorData.incubatorID;
  const hatchingRate = +incubatorData.latestHatchRate;
  const eggOut = incubatorData.eggInBasket;

  const result = await pool.query(`UPDATE INCUBATOR
  SET incubator.totalEggInside = incubator.totalEggInside - ${eggOut},
  incubator.hatchingRate = (incubator.hatchingRate + ${hatchingRate}) / 2
  WHERE incubatorID = '${incubatorID}'`);
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
  const numChicken = await getChickens(coopID);
  const currCoopMR = await getCoopMR(coopID);

  const { numOfHens, numOfRoosters } = numChicken[0];
  const { mortalityRate } = currCoopMR[0][0];
  const totalChicken = +numOfHens + +numOfRoosters;
  const totalDeadChicken = +numDeadHen + +numDeadRoosters;

  const updatedMR = ((+totalDeadChicken / +totalChicken) * 100) + +mortalityRate;
  const result = await pool.query(`
  UPDATE coop
  SET coop.mortalityRate = ?
  WHERE coop.coopID = ?`, [+updatedMR, coopID]);

  return [result, updatedMR];
}

// Update Record Surveillance Status
export async function updateSurveillanceStatus (recordID) {
  const result = await pool.query(`
  UPDATE \`record-surveillance\`
  SET \`record-surveillance\`.status = 'Resolved'
  WHERE \`record-surveillance\`.surveillanceID = ?`, [recordID]);

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

// Get today's chick dead
export async function getTodayChickenDead () {
  const [result] = await pool.query(`
  SELECT numDeadHen, numDeadRooster
  FROM \`record-coop\`
  WHERE DATE(recorded_at) = CURDATE()
  ORDER BY coopID`);
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
  SELECT
    DAYNAME(DATE(recorded_at)) AS dayOfTheWeek,
    SUM(numEggs) AS totalNumEggs
  FROM
    \`record-coop\`
  WHERE
    YEARWEEK(DATE(recorded_at)) = YEARWEEK(CURDATE())
  GROUP BY
    DAYOFWEEK(DATE(recorded_at)),
    DAYNAME(DATE(recorded_at))
  ORDER BY
    DAYOFWEEK(DATE(recorded_at))`);
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

// Get dead chick for the week
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
  SELECT * FROM \`record-surveillance\` ORDER BY status DESC`);
  return result;
}

// Get Unresolved Surveillance Record
export async function getRecordSurveillance () {
  const [result] = await pool.query(`
  SELECT * FROM \`record-surveillance\` WHERE status = 'Unresolved'`);
  return result;
}

// Get Number of Chicken
export async function getChickens (coopID) {
  const [result] = await pool.query(
    `SELECT numOfHens, numOfRoosters
    FROM coop
    WHERE coopID = ?`, [coopID]);
  return result;
}

pool.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});
