import pool from './database.js';

// Get chicken health status
export async function getHealthStatus () {
  const [result] = await pool.query(`
  SELECT * FROM health_status`);
  return result;
}
