import pool from './database.js';

// Get incubation data for current month (num egg, hatch, not hatch, hatch rate)
export async function getIncubationData () {
  try {
    const [result] = await pool.query(`
    SELECT SUM(numEgg) AS numEgg, SUM(numHatch) AS numHatch,
    sum(numNotHatch) AS numNotHatch, sum(hatchRate) / COUNT(recordHatchID) AS hatchRate,
    MIN(hatchRate) AS minHatchRate, MAX(hatchRate) AS maxHatchRate
    FROM \`record-hatch\`
    WHERE
    MONTH(created_at) = MONTH(CURDATE())
    AND YEAR(created_at) = YEAR(CURDATE())`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching incubation data from the database');
  }
}

// Get first incubation date
export async function getFirstIncubationDate () {
  try {
    const [result] = await pool.query(`
    SELECT DATE(created_at) AS firstIncubationDate 
    FROM \`record-hatch\`
    ORDER BY DATE(created_at)
    LIMIT 1`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching first date of incubation from the database');
  }
}

// Get total incubation data from first date
export async function getTotalIncubationData () {
  try {
    const [result] = await pool.query(`
    SELECT SUM(numEgg) AS totalEggIncubated, SUM(numHatch) AS totalEggHatch
    FROM \`record-hatch\`
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching total incubation data from the database');
  }
}
