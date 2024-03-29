import pool from './database.js';

// Get Number of Chick
export async function getNumChick (brooderID) {
  try {
    const [result] = await pool.query(`
    SELECT numChick
    FROM brooder
    WHERE brooderID = '${brooderID}'
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching number of chick data from database');
  }
}

// Get Brooder MR
export async function getBrooderMR (brooderID) {
  try {
    const [result] = await pool.query(`
    SELECT mortalityRate
    FROM brooder
    WHERE brooderID = '${brooderID}'
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching brooder mortality rate data from database');
  }
}

// Get Brooder ID
export async function getBrooderIDs () {
  try {
    const [result] = await pool.query(`
    SELECT brooderID from brooder
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching brooder ID from database');
  }
}

// Get All Brooder
export async function getAllBrooder () {
  try {
    const [result] = await pool.query(`
    SELECT brooderID, numChick, mortalityRate, inserted_at
    FROM brooder
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching all brooder data from database');
  }
}

// Get Available Brooder
export async function getAvailableBrooder () {
  try {
    const [result] = await pool.query(`
    SELECT brooderID
    FROM brooder
    WHERE numChick=0
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching available brooder data from database');
  }
}

// Update broder mortality rate
export async function updateBrooderMR (brooderData) {
  try {
    const { brooderID, mortalityRate } = brooderData;
    const currMRQuery = await getBrooderMR(brooderID);
    const numChickQuery = await getNumChick(brooderID);

    const { numChick } = numChickQuery[0];

    const updatedMR = numChick !== 0 ? +mortalityRate + (+currMRQuery[0].mortalityRate) : 0;

    const result = await pool.query(`
    UPDATE brooder
    SET brooder.mortalityRate = ${+updatedMR}
    WHERE brooderID = '${brooderID}'`);

    return [result, updatedMR];
  } catch (error) {
    console.error(error);
    throw new Error('Error updating brooder mortality rate to database');
  }
}

// Set Brooder MR
export async function setBrooderMR (brooderData) {
  const brooderID = brooderData.brooderID;
  const mortalityRate = brooderData.mortalityRate;

  try {
    const [result] = await pool.query(`
    UPDATE brooder
    SET brooder.mortalityRate = ?
    WHERE brooderID = ?
    `, [mortalityRate, brooderID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error setting brooder mortality rate to database');
  }
}

// Update Num Chick in Brooder
export async function addChickToBrooder (hatchData) {
  try {
    const brooderID = hatchData.brooderID;
    const numChick = hatchData.numChick;
    const result = await pool.query(`UPDATE brooder
    SET brooder.numChick = brooder.numChick + ${numChick}
    WHERE brooderID = '${brooderID}'`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating number of chick in brooder to database');
  }
}

// Insert Chick in Brooder after hatch
export async function insertChickToBrooder (hatchData) {
  try {
    const brooderID = hatchData.brooderID;
    const numChick = hatchData.numChick;
    const result = await pool.query(`UPDATE brooder
    SET brooder.numChick = ?,
    brooder.mortalityRate = 0.00,
    brooder.inserted_at = CURRENT_TIMESTAMP()
    WHERE brooder.brooderID = ?`,
    [numChick, brooderID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating number of chick in brooder to database');
  }
}

// Update Brooder after casualty
export async function minusBrooderNumChick (brooderData) {
  try {
    const brooderID = brooderData.brooderID;
    const numDeadChick = +brooderData.numDeadChick;
    const numChickSold = +brooderData.numChickSold;
    const totalMinusChick = +numDeadChick + +numChickSold;
    const result = await pool.query(`UPDATE brooder
    SET brooder.numChick = brooder.numChick - ${totalMinusChick}
    WHERE brooderID = '${brooderID}'`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating number of chick in brooder to database');
  }
}

// Get Number of Chick in Each Brooder
export async function getNumChickInEachBrooder () {
  try {
    const [result] = await pool.query(`
    SELECT brooderID, numChick
    FROM brooder`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching brooder data from database');
  }
}

// Update Brooder MR to default value
export async function setBrooderMortalityRate (id) {
  try {
    const [result] = await pool.query(`
    UPDATE brooder
    SET brooder.mortalityRate = ?
    WHERE brooderID = ?`,
    [0.00, id]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating brooder MR to database');
  }
}
