import pool from './database.js';

// Submit Coop Record
export async function submitCoopRecord (coopData) {
  try {
    const coopID = coopData.coopID;
    const numDeadHen = +coopData.numDeadHen;
    const numDeadRoosters = +coopData.numDeadRoosters;
    const numEggs = +coopData.numEggs;
    const numNc = +coopData.numNc;
    const numAccepted = +coopData.numAccepted;
    const mortalityRate = +coopData.mortalityRate;

    const resultSubmitCoop = await pool.query(`
    INSERT INTO \`record-coop\` (coopID, numDeadHen, numDeadRooster, numEggs, numNc, numAccepted, mortalityRate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [coopID, numDeadHen, numDeadRoosters, numEggs, numNc, numAccepted, mortalityRate]);

    return resultSubmitCoop;
  } catch (error) {
    console.error(error);
    throw new Error('Error submitting coop record to database');
  }
}

// Submit Edit Coop Record Form
export async function submitEditCoopRecord (coopData) {
  try {
    const recordID = coopData.recordID;
    const coopID = coopData.coopID;
    const numDeadHen = +coopData.numDeadHen;
    const numDeadRoosters = +coopData.numDeadRoosters;
    const numEggs = +coopData.numEggs;
    const numNc = +coopData.numNc;
    const numAccepted = +coopData.numAccepted;

    const resultSubmitCoop = await pool.query(`
    UPDATE \`record-coop\` 
    SET coopID=?, numDeadHen=?, numDeadRooster=?, numEggs=?, numNc=?, numAccepted=?
    WHERE recordID=?
    `, [coopID, numDeadHen, numDeadRoosters, numEggs, numNc, numAccepted, recordID]);

    return resultSubmitCoop;
  } catch (error) {
    console.error(error);
    throw new Error('Error submitting coop record to database');
  }
}

// Get Coop Record
export async function getCoopRecordAll (coopID) {
  try {
    const [resultCoopRecord] = await pool.query(`
    SELECT *  FROM \`record-coop\`
    WHERE coopID = ?
    ORDER BY recorded_at DESC`,
    [coopID]);
    return resultCoopRecord;
  } catch (error) {
    console.error(error);
    throw new Error(`Error getting coop record for ${coopID}`);
  }
}

// Get Coop Record
export async function getCoopRecord (recordID) {
  try {
    const [resultCoopRecord] = await pool.query(`
    SELECT *  FROM \`record-coop\`
    WHERE recordID = ?`,
    [recordID]);
    return resultCoopRecord;
  } catch (error) {
    console.error(error);
    throw new Error(`Error getting coop record for ${recordID}`);
  }
}

// Get number of eggs monthly
export async function getNumEggsMonthly () {
  try {
    const [result] = await pool.query(`
      SELECT
        MONTH(recorded_at) AS month,
        YEAR(recorded_at) AS year,
        SUM(numEggs) AS numEggs
      FROM
        \`record-coop\`
      WHERE
        YEAR(current_date()) = YEAR(recorded_at)
      GROUP BY
        YEAR(recorded_at), MONTH(recorded_at)
      ORDER BY
        month
  `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching monthly egg data from the database');
  }
}

// Get Egg Collected for current month
export async function getCurrMonthEggs () {
  try {
    const [result] = await pool.query(`
      SELECT
          SUM(numEggs) AS totalNumEggs
      FROM
          \`record-coop\`
      WHERE
          MONTH(DATE(recorded_at)) = MONTH(CURDATE())
          AND YEAR(DATE(recorded_at)) = YEAR(CURDATE())
      `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching egg data for the current month from the database');
  }
}

// Get first date of coop record
export async function getFirstDateCoopRecord () {
  try {
    const [result] = await pool.query(`
    SELECT day(recorded_at) AS DAY, MONTHNAME(recorded_at) AS MONTH, year(recorded_at) AS YEAR
    FROM \`record-coop\`
    ORDER BY recorded_at
    LIMIT 1
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching first record coop date from the database');
  }
}

// Get average eggs daily in a month
export async function avgDailyEgg () {
  try {
    const [result] = await pool.query(`
    SELECT sum(numEggs) / count(recordID) AS avgDailyEgg
    FROM \`record-coop\`
    WHERE MONTH(current_date()) = MONTH(recorded_at)
    AND
    YEAR(current_date()) = YEAR(recorded_at)
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching average daily eggs collected monthly data from the database');
  }
}

// Get chicken dead for current month
export async function getChickenDeadCurrMonth () {
  try {
    const [result] = await pool.query(`
    SELECT sum(numDeadRooster) AS numDeadRooster, 
    sum(numDeadHen) AS numDeadHen, 
    sum(numDeadHen) + sum(numDeadRooster) AS totalDead 
    FROM \`record-coop\`
    WHERE MONTH(current_date()) = MONTH(recorded_at)
    AND
    YEAR(current_date()) = YEAR(recorded_at) `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching chicken dead current month data from the database');
  }
}

// Get daily Egg Collected for current month
export async function getDailyEggsInAMonth () {
  try {
    const [result] = await pool.query(`
    SELECT DATE(recorded_at) AS dayOfTheWeek, numEggs
    FROM \`record-coop\`
    WHERE MONTH(recorded_at) = MONTH(CURDATE())
    AND YEAR(recorded_at) = YEAR(CURDATE())
    ORDER BY recorded_at`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching daily eggs for current month data from the database');
  }
}

// Get monthly chicken dead count
export async function getMonthlyChickenDead () {
  try {
    const [result] = await pool.query(`
    SELECT  MONTHNAME(recorded_at) AS monthName, sum(numDeadHen) AS numDeadHen, sum(numDeadRooster) AS numDeadRooster
    FROM \`record-coop\`
    WHERE YEAR(current_date()) = YEAR(recorded_at)
    GROUP BY MONTHNAME(recorded_at)
    ORDER BY MONTHNAME(recorded_at)`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching chicken dead monthly data from the database');
  }
}

// Get cummulative total chicken Dead
export async function getTotalChickenDead () {
  try {
    const [result] = await pool.query(`
    SELECT SUM(numDeadHen) AS totalDeadHen,
    SUM(numDeadRooster) AS totalDeadRooster,
    SUM(numDeadHen)+SUM(numDeadRooster) AS totalChickenDead
    FROM \`record-coop\`
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching cummulative total number of chicken dead data from the database');
  }
}

// Get today's egg
export async function getTodayEgg () {
  try {
    const [result] = await pool.query(`
    SELECT SUM(numEggs) AS todayEggCollected
    FROM \`record-coop\`
    WHERE DATE(recorded_at) = CURDATE()
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching eggs collected today data from the database');
  }
}

// Get today's chicken dead
export async function getTodayChickenDead () {
  try {
    const [result] = await pool.query(`
    SELECT SUM(numDeadHen) AS todayHenDead, SUM(numDeadRooster) AS todayRoosterDead
    FROM \`record-coop\`
    WHERE DATE(recorded_at) = CURDATE()
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching number chicken dead today data from the database');
  }
}

// Get Egg Collected for the week
export async function getNumEggCurrWeek () {
  try {
    const [result] = await pool.query(`
    SELECT DATE(recorded_at) AS dayOfTheWeek, numEggs
    FROM \`record-coop\`
    WHERE WEEK(recorded_at) = WEEK(CURDATE())
    AND MONTH(recorded_at) = MONTH(CURDATE())
    AND YEAR(recorded_at) = YEAR(CURDATE())
    ORDER BY recorded_at`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching number egg collected for the current week data from the database');
  }
}

// Get dead chicken for the week
export async function getNumChickenDeadCurrWeek () {
  try {
    const [result] = await pool.query(`
    SELECT
      DAYNAME(DATE(recorded_at)) AS dayOfTheWeek,
      SUM(numDeadHen) + SUM(numDeadRooster) AS totalDeadChicken
    FROM
      \`record-coop\`
    WHERE
      YEARWEEK(DATE(recorded_at)) = YEARWEEK(CURDATE())
    GROUP BY
      DAYOFWEEK(DATE(recorded_at)),
      DAYNAME(DATE(recorded_at))
    ORDER BY
      DAYOFWEEK(DATE(recorded_at));
  `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching number chicken dead for the current week data from the database');
  }
}

// Delete coop record
export async function deleteCoopRecord (id) {
  try {
    const [result] = await pool.query(`
    DELETE FROM \`record-coop\`
    WHERE recordID = ?`,
    [id]);

    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error deleting record from the database');
  }
}

// Get Coop that has been recorded for the day of the
export async function getCoopRecordExistToday () {
  try {
    const [result] = await pool.query(`
    SELECT COOPID FROM \`record-coop\`
    WHERE YEAR(RECORDED_AT) = YEAR(curdate())
    AND MONTH(RECORDED_AT) = MONTH(curdate())
    AND WEEK(RECORDED_AT) = WEEK(curdate())
    AND DATE(recorded_at) = CURDATE()
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching filled coop record data from the database');
  }
}

// Get previous record based on record ID
export async function getPreviousRecord (recordID, coopID) {
  try {
    const [result] = await pool.query(`
    SELECT * FROM \`record-coop\`
    WHERE recordID < ?
    AND coopID = ?
    ORDER BY recordID DESC
    LIMIT 1`, [recordID, coopID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching previous coop record details from database');
  }
}
