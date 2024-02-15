import pool from './database.js';

// Submit Brooder Record
export async function submitBrooderRecord (brooderData) {
  try {
    const brooderID = brooderData.brooderID;
    const numDeadChick = +brooderData.numDeadChick;
    const numChickSold = +brooderData.numChickSold;
    const mortalityRate = +brooderData.mortalityRate;

    const result = await pool.query(`
    INSERT INTO \`record-brooder\` (brooderID, numDeadChick, numChickSold, mortalityRate)
    VALUES (?, ?, ?, ?)
    `, [brooderID, numDeadChick, numChickSold, mortalityRate]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error submitting brooder record to database');
  }
}

// Get daily Chick Death for the month
export async function getDailyChickDeathInAMonth () {
  try {
    const [result] = await pool.query(`
    SELECT numDeadChick
    FROM \`record-brooder\`
    WHERE MONTH(created_at) = MONTH(CURDATE())
    AND YEAR(created_at) = YEAR(CURDATE())
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching daily dead chick for the current month data from the database');
  }
}

// Get total Chick Death for current Month
export async function getTotalChickDeathCurrMonth () {
  try {
    const [result] = await pool.query(`
    SELECT SUM(numDeadChick) AS totalDeadChick
    FROM \`record-brooder\`
    WHERE MONTH(created_at) = MONTH(CURDATE())`);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching total chick dead for the current month data from the database');
  }
}

// Get cummulative total Chick Death
export async function getCumTotalChickDeath () {
  try {
    const [result] = await pool.query(`
    SELECT SUM(numDeadChick) AS totalDeadChick
    FROM \`record-brooder\`
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching cummulative total dead chick data from the database');
  }
}

// Get today's chick dead
export async function getTodayChickDead () {
  try {
    const [result] = await pool.query(`
    SELECT SUM(numDeadChick) AS todayChickDead
    FROM \`record-brooder\`
    WHERE DATE(created_at) = CURDATE()
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching number chick dead today data from the database');
  }
}

// Get dead chick for the week
export async function getNumChickDeadCurrWeek () {
  try {
    const [result] = await pool.query(`
    SELECT
      DAYNAME(DATE(created_at)) AS dayOfTheWeek,
      SUM(numDeadChick) AS totalDeadChick
    FROM
      \`record-brooder\`
    WHERE
      YEARWEEK(DATE(created_at)) = YEARWEEK(CURDATE())
    GROUP BY
      DAYOFWEEK(DATE(created_at)),
      DAYNAME(DATE(created_at))
    ORDER BY
      DAYOFWEEK(DATE(created_at));
  `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching number chick dead current week data from the database');
  }
}

// Get brooder record
export async function getBrooderRecordAll (brooderID) {
  try {
    const [result] = await pool.query(`
    SELECT *
    FROM \`record-brooder\`
    WHERE brooderID=?
    ORDER BY created_at`,
    [brooderID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching record brooder data from the database');
  }
}

// Get Brooder that record exist for the day
export async function getBrooderHasBeenRecorded () {
  try {
    const [result] = await pool.query(`
    SELECT brooderID from \`record-brooder\`
    WHERE YEAR(created_at) = YEAR(CURDATE())
    AND MONTH(created_at) = MONTH(CURDATE())
    AND WEEK(created_at) = WEEK(CURDATE())
    AND DATE(created_at) = CURDATE()
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching filled brooder record data from the database');
  }
}

// Get total number of chick placed in each brooder for current month
export async function getTotalChickDeadAndSoldInBrooder () {
  try {
    const [result] = await pool.query(`
    SELECT b.brooderID, COALESCE(SUM(rb.numDeadChick), 0) AS totalNumDead, COALESCE(SUM(rb.numChickSold), 0) AS totalNumSold
    FROM (
      SELECT brooderID
      FROM brooder
    ) b
    LEFT JOIN \`record-brooder\` rb ON b.brooderID = rb.brooderID
    AND YEAR(rb.created_at) = YEAR(current_date())
    AND MONTH(rb.created_at) = MONTH(current_date())
    GROUP BY b.brooderID;
    `);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching total number of chick dead from the database');
  }
}

export async function getBrooderRecord (id) {
  try {
    const [result] = await pool.query(`
    SELECT * FROM \`record-brooder\` WHERE recordID = ?`,
    [id]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching brooder record from the database');
  }
}

export async function editBrooderRecord (brooderData) {
  const { numDeadChick, numChickSold, recordID, mortalityRate } = brooderData;
  try {
    const [result] = await pool.query(`
    UPDATE \`record-brooder\`
    SET \`record-brooder\`.numDeadChick = ?,
    \`record-brooder\`.numChickSold = ?,
    \`record-brooder\`.mortalityRate = ?
    WHERE \`record-brooder\`.recordID = ?
    `, [numDeadChick, numChickSold, mortalityRate, recordID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error updating brooder record in database');
  }
}

export async function getPreviousRecord (recordID, brooderID) {
  try {
    const [result] = await pool.query(`
    SELECT * FROM \`record-brooder\`
    WHERE recordID < ?
    AND brooderID = ?
    ORDER BY recordID DESC
    LIMIT 1`, [recordID, brooderID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching previous brooder record details from database');
  }
}

export async function deleteBrooderRecord (recordID) {
  try {
    const [result] = await pool.query(`
    DELETE FROM \`record-brooder\`
    WHERE recordID = ?
    `, [recordID]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('DB QUERY: Error deleting brooder record details from database');
  }
}
