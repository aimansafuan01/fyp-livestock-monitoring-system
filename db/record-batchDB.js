import pool from './database.js';

// Get chicken batch data
export async function getBatchData () {
  try {
    const [result] = await pool.query(`
    SELECT * FROM \`record-batch\`
    ORDER BY arrival_date`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching chicken batch data from the database');
  }
}

export async function submitChickenArrival (batchData) {
  try {
    const { origin, numHens, numRoosters, placeTo, ageChicken } = batchData;
    const [result] = await pool.query(`
    INSERT INTO \`record-batch\` (origin, numHens, numRoosters, placeTo, ageChicken)
    VALUES (?, ?, ?, ?, ?)`,
    [origin, numHens, numRoosters, placeTo, ageChicken]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error submitting chicken batch data to the database');
  }
}
