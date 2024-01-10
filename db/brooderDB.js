import pool from './database.js';

// Get Number of Chick
export async function getNumChick (brooderID) {
  try {
    const result = await pool.query(`
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
    const result = await pool.query(`
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

// Get All Brooder
export async function getAllBrooder () {
  try {
    const [result] = await pool.query(`
    SELECT brooderID, numChick, blockedChick, availableChick, mortalityRate, inserted_at
    FROM brooder
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching all brooder data from database');
  }
}

// Submit Brooder Record
export async function submitBrooderRecord (brooderData) {
  try {
    const brooderID = brooderData.brooderID;
    const numDeadChick = +brooderData.numDeadChick;

    const result = await pool.query(`
    INSERT INTO \`record-brooder\` (brooderID, numDeadChick)
    VALUES (?, ?)
    `, [brooderID, numDeadChick]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error submitting brooder record to database');
  }
}

// Update broder mortality rate
export async function updateBrooderMR (brooderData) {
  try {
    const { numDeadChick, brooderID } = brooderData;
    const numChickQuery = await getNumChick(brooderID);
    const currMRQuery = await getBrooderMR(brooderID);

    const { numChick } = numChickQuery[0][0];
    const { mortalityRate } = currMRQuery[0][0];

    const updatedMR = ((+numDeadChick / +numChick) * 100) + +mortalityRate;

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

// Update Num Chick in Brooder after hatch
export async function addChickToBrooder (hatchData) {
  try {
    const brooderID = hatchData.brooderID;
    const numChick = hatchData.numChick;
    const result = await pool.query(`UPDATE BROODER
    SET brooder.numChick = brooder.numChick + ${numChick}, brooder.availableChick = brooder.availableChick + ${numChick}
    WHERE brooderID = '${brooderID}'`);
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
    const result = await pool.query(`UPDATE BROODER
    SET brooder.numChick = brooder.numChick - ${numDeadChick}, brooder.availableChick = brooder.availableChick - ${numDeadChick}
    WHERE brooderID = '${brooderID}'`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating number of chick in brooder to database');
  }
}
