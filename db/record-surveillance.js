import pool from './database.js';

// Get All Surveillance Record
export async function getAllRecordSurveillance () {
  try {
    const [result] = await pool.query(`
    SELECT * FROM \`record-surveillance\` ORDER BY status DESC, created_at DESC`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching surveillance record data from the database');
  }
}

// Get Unresolved Surveillance Record
export async function getRecordSurveillance () {
  try {
    const [result] = await pool.query(`
    SELECT * FROM \`record-surveillance\` WHERE status = 'Unresolved'`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching unresolved surveillance record data from the database');
  }
}

// Update Record Surveillance Status
export async function updateSurveillanceStatus (recordID) {
  try {
    const result = await pool.query(`
    UPDATE \`record-surveillance\`
    SET \`record-surveillance\`.status = 'Resolved'
    WHERE \`record-surveillance\`.surveillanceID = ?`, [recordID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating record surveillance data from the database');
  }
}
