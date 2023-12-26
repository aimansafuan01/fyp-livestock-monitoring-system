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

// Update Brooder
export async function updateBrooderNumChick (brooderData) {
  const brooderID = brooderData.brooderID;
  const numDeadChick = +brooderData.numDeadChick;
  const result = await pool.query(`UPDATE BROODER
  SET brooder.numChick = brooder.numChick - ${numDeadChick}, brooder.availableChick = brooder.availableChick - ${numDeadChick}
  WHERE brooderID = '${brooderID}'`);
  return result;
}

// Update Coop
export async function updateCoop (coopData) {
  const coopID = coopData.coopID;
  const numDeadHen = +coopData.numDeadHen;
  const numDeadRoosters = +coopData.numDeadRoosters;
  const result = await pool.query(`UPDATE COOP
  SET coop.numOfHens = coop.numOfHens - ${numDeadHen}, coop.numOfRoosters = coop.numOfRoosters - ${numDeadRoosters}
  WHERE coopID = '${coopID}'`);
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

pool.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});
