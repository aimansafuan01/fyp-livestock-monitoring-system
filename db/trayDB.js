import pool from './database.js';

// Get tray ID
export async function getAllTray () {
  try {
    const [result] = await pool.query(`
    SELECT trayID
    FROM  tray`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching hatching date from the database');
  }
}
