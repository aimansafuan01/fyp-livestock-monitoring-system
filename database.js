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

  const result = await pool.query(`
  INSERT INTO \`record-coop\` (coopID, numDeadHen, numDeadRooster, numEggs, numNc, numAccepted)
  VALUES (?, ?, ?, ?, ?, ?)
  `, [coopID, numDeadHen, numDeadRoosters, numEggs, numNc, numAccepted]);
  return result;
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

pool.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});
