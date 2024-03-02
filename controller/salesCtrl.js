import * as SalesDB from '../db/record-surveillance.js';

// Get surveillance Record Page
export const getSalesRecordPage = async (req, res) => {
  res.status(200).render('sales');
};
