import * as SalesDB from '../db/salesDB.js';

// Get Sales Record Page
export const getSalesRecordPage = async (req, res) => {
  res.status(200).render('sales');
};

// Get Sales Form Page
export const getSalesForm = async (req, res) => {
  res.status(200).render('create-sales-record');
};

// Submit Sales Form
export const submitSalesForm = async (req, res) => {
  try {
    SalesDB.submitSalesRecord(req.body);
    res.status(200).redirect('/sales/view');
  } catch (error) {
    console.error(error);
    res.status(500)
      .send('Internal Server Error');
  }
};
