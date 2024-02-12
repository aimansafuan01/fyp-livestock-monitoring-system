import pool from './database.js';
import * as CoopDB from './coopDB.js';
import * as BrooderDB from './brooderDB.js';
import * as IncubatorDB from './incubatorDB.js';

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

// Get All Unresolved Surveillance Record
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

// Get Surveillance Record
export async function getSurveillanceRecord (id) {
  try {
    const [result] = await pool.query(`
    SELECT * FROM \`record-surveillance\` WHERE surveillanceID = ?`,
    [id]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching surveillance record from the database');
  }
}

// Update Record Surveillance Status
export async function updateSurveillanceStatus (recordID, action) {
  try {
    const [record] = await getSurveillanceRecord(recordID);

    if (record.brooderID !== null) {
      await BrooderDB.setBrooderMortalityRate(record.brooderID);
    }

    if (record.incubatorID !== null) {
      await IncubatorDB.setIncubatorHR(record.incubatorID);
    }

    if (record.coopID !== null) {
      await CoopDB.setCoopMortalityRate(record.coopID);
    }

    const result = await pool.query(`
    UPDATE \`record-surveillance\`
    SET \`record-surveillance\`.status = 'Resolved', 
    \`record-surveillance\`.action = ?
    WHERE \`record-surveillance\`.surveillanceID = ?`, [action, recordID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating record surveillance data from the database');
  }
}
