import pool from './database.js';

// Submit Brooder Record
export async function submitBrooderRecord (brooderData) {
  try {
    const brooderID = brooderData.brooderID;
    const numDeadChick = +brooderData.numDeadChick;
    const numChickSold = +brooderData.numChickSold;

    const result = await pool.query(`
    INSERT INTO \`record-brooder\` (brooderID, numDeadChick, numChickSold)
    VALUES (?, ?, ?)
    `, [brooderID, numDeadChick, numChickSold]);
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
