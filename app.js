import express from 'express'
import mysql2 from 'mysql2'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { login } from './database.js'

dotenv.config()
const app = express()
app.use('/assets', express.static('./assets/'))

// Set up MySQL connection
const connection = mysql2.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
})

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err)
  } else {
    console.log('Connected to MySQL database')
  }
})

// Middleware for parsing POST request data
app.use(bodyParser.urlencoded({ extended: true }))

// Set EJS as the view engine
app.set('view engine', 'ejs')

// Serve static assets
app.use(express.static('public'))

// Login
app.get('/login', (req, res) => {
  res.render('sign-in')
})

// Dashboard
app.get('/home', (req, res) => {
  res.render('dashboard')
})

// Daily Record
app.get('/daily-record', (req, res) => {
  res.render('daily-record')
})

// Login
app.post('/login', async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  console.log(username, password)
  const result = await login(username, password)
  console.log(result)
  if (result) {
    res.redirect('/home')
  } else {
    console.log('Invalid Username or Password')
  }
})

// Start the server
const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
