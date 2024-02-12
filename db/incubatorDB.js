import pool from './database.js';

// Get All Incubator
export async function getAllIncubator () {
  try {
    const [result] = await pool.query(`
    SELECT *
    FROM incubator
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching all incubator data from the database');
  }
}

// Get hatching date
export async function getHatchingDate () {
  try {
    const [result] = await pool.query(`
    SELECT incubatorID, dateOut
    FROM  \`record-incubator\`
    WHERE dateOut = CURDATE()
    ORDER BY incubatorID`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching hatching date from the database');
  }
}

// Get record-incubator for occupied tray
export async function getIncubatorRecord (data) {
  try {
    const incubatorID = data.id;
    const [result] = await pool.query(`
    SELECT trayID, dateEnter, dateMove
    FROM \`record-incubator\`
    WHERE incubatorID = ?
    AND dateMove > CURDATE()
    ORDER BY trayID ASC;
    `, [incubatorID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching incubator tray data from the database');
  }
}

// Update Incubator Egg
export async function updateIncubatorEgg (trayData) {
  try {
    const incubatorID = trayData.incubatorID;
    const numEggs = trayData.numEggs;

    const result = await pool.query(`UPDATE incubator
    SET incubator.totalEggInside = incubator.totalEggInside + ${numEggs}
    WHERE incubatorID = '${incubatorID}'`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating incubator egg data to the database');
  }
}

// Update Incubator
export async function updateIncubator (incubatorData) {
  try {
    const incubatorID = incubatorData.incubatorID;
    const hatchingRate = +incubatorData.hatchRate;
    const eggOut = incubatorData.eggInBasket;
    const result = await pool.query(`UPDATE INCUBATOR
    SET incubator.totalEggInside = incubator.totalEggInside - ?,
    incubator.hatchingRate = ?
    WHERE incubatorID = ?`,
    [+eggOut, +hatchingRate, incubatorID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating incubator data to the database');
  }
}

// Set Incubator Hatching Rate
export async function setIncubatorHR (id) {
  try {
    const [result] = await pool.query(`
    UPDATE INCUBATOR
    SET INCUBATOR.hatchingRate = ?
    WHERE incubatorID = ?`,
    [100, id]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating incubator hatching rate');
  }
}
