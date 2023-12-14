import mysql2 from 'mysql2'

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
}).promise()

export async function login (username, password) {
  const [rows] = await pool.query(`
  SELECT * 
  FROM user
  WHERE username = ?
  `, [username])
  return rows[0]
}

const users = await login('test')
console.log(users)

pool.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err)
  } else {
    console.log('Connected to MySQL database')
  }
})
