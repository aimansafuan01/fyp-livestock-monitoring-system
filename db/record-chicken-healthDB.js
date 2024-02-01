import pool from './database.js';

// Get chicken health record
export async function getChickenHealthRecord () {
  try {
    const [result] = await pool.query(`
    SELECT * FROM \`record-chicken-health\`
    ORDER BY created_at DESC, referenceID
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching chicken health record data from the database');
  }
}

// Get one chicken health record
export async function getSingleChickenHealthRecord (id) {
  try {
    const [result] = await pool.query(`
    SELECT * FROM \`record-chicken-health\`
    WHERE recordHealthID = ?
    `, [id]);
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
    const referenceID = healthRecord.referenceID === undefined ? null : healthRecord.referenceID;

    const result = await pool.query(`
    INSERT INTO \`record-chicken-health\` (origin, status, symptom, numOfHens, numOfRoosters, referenceID)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [origin, status, symptom, numOfHens, numOfRoosters, referenceID]);

    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error submitting chicken health record data to the database');
  }
}

// Update Chicken Health Record Status
export async function updateChickenHealthRecord (healthRecord) {
  const recordID = healthRecord.recordID;
  const numOfHens = healthRecord.numOfHens;
  const numOfRoosters = healthRecord.numOfRoosters;
  try {
    const result = await pool.query(`
    UPDATE \`record-chicken-health\`
    SET \`record-chicken-health\`.numOfHens = \`record-chicken-health\`.numOfHens - ?,
    \`record-chicken-health\`.numOfRoosters = \`record-chicken-health\`.numOfRoosters - ?
    WHERE \`record-chicken-health\`.recordHealthID = ?`, [+numOfHens, +numOfRoosters, recordID]);

    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating chicken health status data to the database');
  }
}
