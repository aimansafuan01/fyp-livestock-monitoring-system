import pool from '../db/database.js';

// Get tray record that is moved to hatching basket
export async function getTrayToBasketRecord (data) {
  try {
    const incubatorID = data.id;
    const [result] = await pool.query(`
      SELECT trayID, numEggs, dateOut
      FROM \`record-incubator\`
      WHERE dateMove = CURDATE()
      AND incubatorID = '${incubatorID}'
      `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching incubator basket data from the database');
  }
}

// Get Number Egg in Hatching Basket
export async function getNumEggsInBasket (incubatorID) {
  try {
    const [result] = await pool.query(`
    SELECT numEggs
    FROM \`record-incubator\`
    WHERE dateOut = CURDATE()
    AND incubatorID = '${incubatorID}'
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching number of eggs in incubator basket data from the database');
  }
}

// Submit Tray Record
export async function submitTrayRecord (trayData) {
  try {
    const incubatorID = trayData.incubatorID;
    const trayID = trayData.trayID;
    const dateEnter = trayData.dateIn;
    const numEggs = trayData.numEggs;
    const resultTray = await pool.query(`
    INSERT INTO \`record-incubator\` (incubatorID, trayID, numEggs, dateEnter, dateMove, dateOut)
    VALUES (?, ?, ?,
      STR_TO_DATE(?, '%d/%m/%Y'),
      DATE_ADD(STR_TO_DATE(?, '%d/%m/%Y'), INTERVAL 18 DAY),
      DATE_ADD(STR_TO_DATE(?, '%d/%m/%Y'), INTERVAL 21 DAY))
    `, [incubatorID, trayID, numEggs, dateEnter, dateEnter, dateEnter]);
    return resultTray;
  } catch (error) {
    console.error(error);
    throw new Error('Error submittting incubator tray data to the database');
  }
}

export async function submitHatchRecord (hatchData) {
  try {
    const dateHatch = hatchData.dateHatch;
    const numEgg = hatchData.numEgg;
    const numHatch = hatchData.numHatch;
    const numNotHatch = hatchData.numNotHatch;
    const hatchRate = hatchData.hatchRate;
    const incubatorID = hatchData.incubatorID;
    const brooderID = hatchData.brooderID;

    const [result] = await pool.query(`
    INSERT INTO \`record-hatch\` (dateHatch, numEgg, numHatch, numNotHatch, hatchRate, incubatorID, brooderID)
    VALUES (STR_TO_DATE(?, '%d/%m/%Y'), ?, ?, ?, ?, ?, ?)`,
    [dateHatch, numEgg, numHatch, numNotHatch, hatchRate, incubatorID, brooderID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error submittting incubator hatch data to the database');
  }
}
