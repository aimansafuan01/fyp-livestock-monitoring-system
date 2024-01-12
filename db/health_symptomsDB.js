import pool from './database.js';

// Get chicken health symptoms
export async function getHealthSymptoms () {
  try {
    const [result] = await pool.query(`
    SELECT * FROM health_symptoms`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching health symptoms data from the database');
  }
}
