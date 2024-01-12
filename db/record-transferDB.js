import pool from './database.js';

export async function submitTransferRecord (transferData) {
  try {
    const origin = transferData.origin;
    const destination = transferData.destination;
    const numOfHens = transferData.numOfHens;
    const numOfRoosters = transferData.numOfRoosters;
    const result = await pool.query(`
    INSERT INTO \`record-transfer\` (origin, destination, numOfHens, numOfRoosters)
    VALUES (?, ?, ?, ?)`,
    [origin, destination, +numOfHens, +numOfRoosters]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error submitting chicken transfer record to the database');
  }
}
