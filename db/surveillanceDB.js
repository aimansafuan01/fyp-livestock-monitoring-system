import pool from './database.js';

// Get Surveillance Criteria
export async function getSurveillance () {
  try {
    const [result] = await pool.query(`
    SELECT * FROM surveillance`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching surveillance criteria data from the database');
  }
}

// Submit Surveillance Record
export async function submitSurveillanceRecord (surveillanceData) {
  try {
    const brooderID = surveillanceData.brooderID;
    const incubatorID = surveillanceData.incubatorID;
    const coopID = surveillanceData.coopID;
    const result = await pool.query(`
    INSERT INTO \`record-surveillance\` (incubatorID, brooderID, coopID, status)
    VALUES (?, ?, ?, ?)`,
    [incubatorID, brooderID, coopID, 'Unresolved']);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error submitting surveillance record data to the database');
  }
}
