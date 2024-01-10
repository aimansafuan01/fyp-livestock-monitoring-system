import pool from './database.js';

// Get chicken health record
export async function getChickenHealthRecord () {
  try {
    const [result] = await pool.query(`
    SELECT * FROM \`record-chicken-health\``);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching chicken health record data from the database');
  }
}

// Submit Chicken Health Record
export async function submitChickenHealthRecord (healthRecord) {
  try {
    const origin = healthRecord.origin;
    const symptom = healthRecord.symptom;
    const status = healthRecord.status;
    const numOfHens = healthRecord.numOfHens;
    const numOfRoosters = healthRecord.numOfRoosters;

    const result = await pool.query(`
    INSERT INTO \`record-chicken-health\` (origin, status, symptom, numOfHens, numOfRoosters)
    VALUES (?, ?, ?, ?, ?)`,
    [origin, status, symptom, numOfHens, numOfRoosters]);

    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error submitting chicken health record data to the database');
  }
}

// Update Chicken Health Record Status
export async function updateChickenHealthStatus (recordID, status) {
  try {
    const result = await pool.query(`
    UPDATE \`record-chicken-health\`
    SET \`record-chicken-health\`.status = ?
    WHERE \`record-chicken-health\`.recordHealthID = ?`, [status, recordID]);

    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating chicken health status data to the database');
  }
}
