import * as BrooderDB from '../db/brooderDB.js';
import * as SurveillanceDB from '../db/surveillanceDB.js';
import * as RecordBroderDB from '../db/record-brooderDB.js';
import { sendAlert } from '../mailer.js';

export const getAllBrooderPage = async (req, res) => {
  try {
    const allBrooder = await BrooderDB.getAllBrooder();
    const filledRecordBrooder = await RecordBroderDB.getBrooderHasBeenRecorded();
    const numChick = allBrooder.map((data) => data.numChick);
    const brooderID = allBrooder.map((data) => data.brooderID);
    const blockedChick = allBrooder.map((data) => data.blockedChick);
    const availableChick = allBrooder.map((data) => data.availableChick);
    const mortalityRate = allBrooder.map((data) => data.mortalityRate);
    const filledRecordBrooderData = filledRecordBrooder.map((data) => data.brooderID);
    const avgMortalityRate = (mortalityRate.reduce((accumulator, currentValue) => +accumulator + +currentValue, 0) / mortalityRate.length).toFixed(2);
    const totalNumChick = numChick.reduce((accumulator, currentValue) => +accumulator + +currentValue, 0);
    const totalChickAvailable = availableChick.reduce((accumulator, currentValue) => +accumulator + +currentValue, 0);
    const totalBlockedChick = blockedChick.reduce((accumulator, currentValue) => +accumulator + +currentValue, 0);
    const ageChick = allBrooder.map((data) => {
      const timeDiff = new Date() - new Date(data.inserted_at);
      const age = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      return age;
    });
    res.status(200)
      .render('brooder-record', {
        allBrooder,
        filledRecordBrooderData,
        numChick,
        brooderID,
        blockedChick,
        availableChick,
        mortalityRate,
        avgMortalityRate,
        totalChickAvailable,
        totalNumChick,
        totalBlockedChick,
        ageChick
      });
  } catch (error) {
    console.error(error);
    res.status(500)
      .send('Internal Server Error');
  }
};

export const getBrooderRecordAll = async (req, res) => {
  try {
    const brooderRecordData = await RecordBroderDB.getBrooderRecordAll(req.query.id);
    const recordIDData = brooderRecordData.map((data) => data.recordID);
    const numDeadChickData = brooderRecordData.map((data) => data.numDeadChick);
    const brooderIDData = brooderRecordData.map((data) => data.brooderID);
    const createdAtData = brooderRecordData.map((data) => {
      return data.created_at.toLocaleDateString('en-MY');
    });

    res.status(200)
      .render('view-brooder-record', { recordIDData, numDeadChickData, createdAtData, brooderIDData });
  } catch (error) {
    console.error(error);
    res.status(500)
      .send('Internal Server Error');
  }
};

export const getBrooderForm = async (req, res) => {
  const coop = {
    id: req.query.id
  };
  res.status(200)
    .render('create-brooder-record', coop);
};

// Submit Brooder Record
export const submitBrooderForm = async (req, res) => {
  try {
    const brooderData = {
      brooderID: req.body.brooderID,
      numDeadChick: req.body.numDeadChick
    };

    const brooderSurveillance = {
      brooderID: req.body.brooderID,
      incubatorID: null,
      coopID: null
    };
    await RecordBroderDB.submitBrooderRecord(brooderData);
    const resultUpdateMRChick = await BrooderDB.updateBrooderMR(brooderData);
    await BrooderDB.minusBrooderNumChick(brooderData);
    const surveillanceThreshold = await SurveillanceDB.getSurveillance();

    if (resultUpdateMRChick[1] > surveillanceThreshold[0].chickMRThreshold) {
      await SurveillanceDB.submitSurveillanceRecord(brooderSurveillance);
      sendAlert();
    }
    res.status(200)
      .redirect('/brooder/view');
  } catch (error) {
    console.error('Error during submitting brooder record', error);
    res.status(500)
      .send('Internal Server Error');
  }
};
