import pool from './database.js';

// Login
export async function login (username, password) {
  try {
    const [rows] = await pool.query(`
    SELECT * 
    FROM user
    WHERE username = ? && password = ?
    `, [username, password]);
    return rows[0];
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching user credentials data from the database');
  }
}

// Register account
export async function register (accountData) {
  try {
    const { username, password } = accountData;
    const [result] = await pool.query(`
    INSERT INTO user (username, password) VALUES (?, ?)`,
    [username, password]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error submitting user credentials data to the database');
  }
}
