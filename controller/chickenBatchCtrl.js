import * as ChickenBatchDB from '../db/record-batchDB.js';
import * as CoopDB from '../db/coopDB.js';

// Get Arrival Chicken Page
export const getChickenBatchPage = async (req, res) => {
  try {
    const batchData = await ChickenBatchDB.getBatchData();
    const batchIds = batchData.map((data) => data.batchID);
    const origins = batchData.map((data) => data.origin);
    const numHens = batchData.map((data) => data.numHens);
    const numRoosters = batchData.map((data) => data.numRoosters);
    const placeTo = batchData.map((data) => data.placeTo);
    const arrivalDate = batchData.map((data) => data.arrival_date);

    const ageChicken = batchData.map((data) => {
      const initialAge = data.ageChicken;
      const arrivalDateMonth = data.arrival_date.getMonth();
      const arrivalDateYear = data.arrival_date.getYear();
      const currMonth = new Date().getMonth();
      const currYear = new Date().getYear();

      // Month passed from arrival date
      const monthPassed = +currMonth - +arrivalDateMonth;

      // Year passed from arrival date
      const yearPassed = +currYear - +arrivalDateYear;

      // Calculate current age of chicken during request according to arrival date and age of chicken during arrival
      const ageToDate = yearPassed > 0 ? (+initialAge + +monthPassed) + (12 * +yearPassed) : (+initialAge + +monthPassed);

      return ageToDate;
    });

    res.status(200)
      .render('chicken-batch', { batchIds, origins, numHens, numRoosters, placeTo, ageChicken, arrivalDate });
  } catch (error) {
    res.status(500)
      .send('Internal Server Error');
  }
};

// Get Create Batch Chicken Record Page
export const getChickenBatchForm = async (req, res) => {
  try {
    const coopIDs = await CoopDB.getCoopIDs();
    const coopIDData = coopIDs.map((data) => data.coopID);
    res.status(200)
      .render('create-batch-chicken-record', { coopIDData });
  } catch (error) {
    res.status(500)
      .send('Internal Server Error');
  }
};

export const submitChickenBatchForm = async (req, res) => {
  const origin = req.body.origin;
  const numHens = req.body.numHens;
  const numRoosters = req.body.numRoosters;
  const placeTo = req.body.placeTo;
  const ageChicken = req.body.ageChicken;

  const batchData = {
    origin,
    numHens,
    numRoosters,
    placeTo,
    ageChicken
  };

  const coopData = {
    coopID: placeTo,
    numOfHens: numHens,
    numOfRoosters: numRoosters
  };

  try {
    await ChickenBatchDB.submitChickenArrival(batchData);
    await CoopDB.addNumChickenCoop(coopData);
    res.status(200)
      .redirect('/chicken-batch/view');
  } catch (error) {
    console.error('Error during submitting coop record', error);
    res.status(500)
      .send('Internal Server Error');
  }
};
