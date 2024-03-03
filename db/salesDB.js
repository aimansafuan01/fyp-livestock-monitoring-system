import pool from './database.js';

// Get tray ID
export async function submitSalesRecord (salesData) {
  const { brooderID, qty, price, totalPrice, soldTo, date } = salesData;
  try {
    const [result] = await pool.query(`
    INSERT INTO SALES (brooderID, qty, priceSold, totalPrice, soldTo, date)
    VALUES (?, ?, ?, ?, ?, ?)`, [brooderID, qty, price, totalPrice, soldTo, date]);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error('Error submitting sales data to the database');
  }
}
