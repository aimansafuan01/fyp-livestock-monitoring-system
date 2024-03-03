import * as SalesDB from '../db/record-surveillance.js';

// Get Sales Record Page
export const getSalesRecordPage = async (req, res) => {
  res.status(200).render('sales');
};

// Get Sales Form Page
export const getSalesForm = async (req, res) => {
  res.status(200).render('create-sales-record');
};
