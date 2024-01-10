import pool from './database.js';

// Add Accumulate Num Eggs for Farm
export async function updateTotalEggs (eggData) {
  try {
    const numAccepted = eggData.numAccepted;
    const numEggs = eggData.numEggs;
    const numNc = eggData.numNc;

    const result = await pool.query(`UPDATE eggs
    SET totalEggAccepted = totalEggAccepted + ?,
    totalEggNC = totalEggNC + ?,
    totalEggCollected = totalEggCollected + ?
    `, [+numAccepted, +numNc, +numEggs]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error adding total eggs data to database');
  }
}
