import pool from './database.js';

// Get Surveillance Criteria
export async function getSurveillance () {
  const [result] = await pool.query(`
  SELECT * FROM surveillance`);
  return result;
}

// Submit Surveillance Record
export async function submitSurveillanceRecord (surveillanceData) {
  const brooderID = surveillanceData.brooderID;
  const incubatorID = surveillanceData.incubatorID;
  const coopID = surveillanceData.coopID;
  const result = await pool.query(`
  INSERT INTO \`record-surveillance\` (incubatorID, brooderID, coopID, status)
  VALUES (?, ?, ?, ?)`,
  [incubatorID, brooderID, coopID, 'Unresolved']);
  return result;
}
