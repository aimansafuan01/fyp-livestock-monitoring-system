import mysql2 from 'mysql2';

// Set up MySQL connection
const pool = mysql2.createConnection({
  host: 'localhost',
  user: 'root',
  password: '#Safilaisyani64',
  database: 'tiroifarmdb'
  // host: process.env.HOST,
  // user: process.env.USER,
  // password: process.env.PASSWORD,
  // database: process.env.DATABASE
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

// Submit Daily Coop Record
export async function submitCoopRecord (data) {
  const coopID = data.coopID;
  const numDeadHen = +data.numDeadHen;
  const numDeadRoosters = +data.numDeadRoosters;
  const numEggs = +data.numEggs;
  const numNc = +data.numNc;
  const numAccepted = +data.numAccepted;

  const result = await pool.query(`
  INSERT INTO \`record-coop\` (coopID, numDeadHen, numDeadRooster, numEggs, numNc, numAccepted)
  VALUES (?, ?, ?, ?, ?, ?)
  `, [coopID, numDeadHen, numDeadRoosters, numEggs, numNc, numAccepted]);
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

pool.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});
