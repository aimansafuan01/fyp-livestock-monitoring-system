import pool from './database.js';

// Get All CoopID
export async function getCoopIDs () {
  try {
    const [result] = await pool.query(`
    SELECT coopID
    FROM coop
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching all coop ID data from the database');
  }
}

// Get All Coop
export async function getAllCoop () {
  try {
    const [result] = await pool.query(`
    SELECT coopID, numOfHens, numOfRoosters, mortalityRate, totalChickens
    FROM coop
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching all coop data from the database');
  }
}

// Get Coop Total Chicken
export async function getNumChickens (coopID) {
  try {
    const [result] = await pool.query(
      `SELECT totalChickens
      FROM coop
      WHERE coopID = ?`, [coopID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching total chicken data from the database');
  }
}

// Get Coop MR
export async function getCoopMR (coopID) {
  try {
    const result = await pool.query(`
    SELECT mortalityRate
    FROM coop
    WHERE coopID = '${coopID}'
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching coop mortality rate data from the database');
  }
}

// Get number of chicken in the farm
export async function getNumberOfChicken () {
  try {
    const [result] = await pool.query(`
    SELECT
      SUM(numOfHens) AS totalHens,
      SUM(numOfRoosters) AS totalRoosters
    FROM
      coop
  `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching total number of hens and roosters data from the database');
  }
}

// Get All Chicken Group By Coop ID
export async function getAllChicken () {
  try {
    const [result] = await pool.query(`
    SELECT coopID, numOfHens, numOfRoosters
    FROM coop
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching total number of hens and roosters data from the database');
  }
}

// Add Num Chicken in Coop
export async function addNumChickenCoop (coopData) {
  try {
    const coopID = coopData.coopID;
    const numOfHens = +coopData.numOfHens;
    const numOfRoosters = +coopData.numOfRoosters;
    const result = await pool.query(`UPDATE COOP
    SET coop.numOfHens = coop.numOfHens + ?,
    coop.numOfRoosters = coop.numOfRoosters + ?
    WHERE coopID = ?`, [+numOfHens, +numOfRoosters, coopID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error adding number of chicken data to the database');
  }
}

// Update Num Chicken in Coop after casualty
export async function minusNumChickenCoop (coopData) {
  try {
    const coopID = coopData.coopID;
    const numDeadHen = +coopData.numDeadHen ?? 0;
    const numDeadRoosters = +coopData.numDeadRoosters ?? 0;
    const result = await pool.query(`UPDATE COOP
    SET coop.numOfHens = coop.numOfHens - ?,
    coop.numOfRoosters = coop.numOfRoosters - ?
    WHERE coopID = ?`, [+numDeadHen, +numDeadRoosters, coopID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error minus number of chicken data from the database');
  }
}

// Update coop mortality rate
export async function updateCoopMR (coopData) {
  try {
    const { coopID, numDeadHen, numDeadRoosters } = coopData;
    const numChicken = await getNumChickens(coopID);
    const currCoopMR = await getCoopMR(coopID);

    const { totalChickens } = numChicken[0];
    const { mortalityRate } = currCoopMR[0][0];
    const totalDeadChicken = +numDeadHen + +numDeadRoosters;

    const updatedMR = ((+totalDeadChicken / +totalChickens) * 100) + +mortalityRate;
    const result = await pool.query(`
    UPDATE coop
    SET coop.mortalityRate = ?
    WHERE coop.coopID = ?`, [+updatedMR, coopID]);

    return [result, updatedMR];
  } catch (error) {
    console.error(error);
    throw new Error('Error updating coop mortality rate to database');
  }
}
