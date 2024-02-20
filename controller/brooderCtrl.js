import * as BrooderDB from '../db/brooderDB.js';
import * as SurveillanceDB from '../db/surveillanceDB.js';
import * as RecordBrooderDB from '../db/record-brooderDB.js';
import { sendAlert } from '../mailer.js';

export const getAllBrooderPage = async (req, res) => {
  try {
    const allBrooder = await BrooderDB.getAllBrooder();
    const filledRecordBrooder = await RecordBrooderDB.getBrooderHasBeenRecorded();
    const numChick = allBrooder.map((data) => data.numChick);
    const brooderID = allBrooder.map((data) => data.brooderID);
    const mortalityRate = allBrooder.map((data) => data.mortalityRate);
    const filledRecordBrooderData = filledRecordBrooder.map((data) => data.brooderID);
    const avgMortalityRate = (mortalityRate.reduce((accumulator, currentValue) => +accumulator + +currentValue, 0) / mortalityRate.length).toFixed(2);
    const totalNumChick = numChick.reduce((accumulator, currentValue) => +accumulator + +currentValue, 0);
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
        mortalityRate,
        avgMortalityRate,
        totalNumChick,
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
    const brooderRecordData = await RecordBrooderDB.getBrooderRecordAll(req.query.id);
    const recordIDData = brooderRecordData.map((data) => data.recordID);
    const numDeadChickData = brooderRecordData.map((data) => data.numDeadChick);
    const brooderIDData = brooderRecordData.map((data) => data.brooderID);
    const numChickSoldData = brooderRecordData.map((data) => data.numChickSold);
    const createdAtData = brooderRecordData.map((data) => {
      return data.created_at.toLocaleDateString('en-MY');
    });
    const updatedAtData = brooderRecordData.map((data) => {
      return data.updated_at ? new Date(data.updated_at).toLocaleString('en-MY') : '';
    });

    res.status(200)
      .render('view-brooder-record', {
        recordIDData,
        numDeadChickData,
        createdAtData,
        brooderIDData,
        numChickSoldData,
        updatedAtData
      });
  } catch (error) {
    console.error(error);
    res.status(500)
      .send('Internal Server Error');
  }
};

export const getBrooderForm = async (req, res) => {
  const brooderID = req.query.id;
  const numChick = await BrooderDB.getNumChick(brooderID);
  const numChickData = numChick.map(data => data.numChick);
  const brooderData = {
    id: brooderID,
    numChick: numChickData[0]
  };
  res.status(200)
    .render('create-brooder-record', { brooderData });
};

// Submit Brooder Record
export const submitBrooderForm = async (req, res) => {
  const brooderID = req.body.brooderID;
  const numDeadChick = req.body.numDeadChick;
  const numChickSold = req.body.numChickSold;
  try {
    const numChickData = await BrooderDB.getNumChick(brooderID);
    const { numChick } = numChickData[0];
    const mortalityRate = +numDeadChick === 0 ? 0 : ((+numDeadChick / numChick) * 100);
    const brooderData = {
      brooderID,
      numDeadChick,
      numChickSold,
      mortalityRate
    };

    const brooderSurveillance = {
      brooderID,
      incubatorID: null,
      coopID: null
    };
    await RecordBrooderDB.submitBrooderRecord(brooderData);
    const resultUpdateMRChick = await BrooderDB.updateBrooderMR(brooderData);
    await BrooderDB.minusBrooderNumChick(brooderData);
    const surveillanceThreshold = await SurveillanceDB.getSurveillance();
    if (resultUpdateMRChick[1] > surveillanceThreshold[0].chickMRThreshold) {
      await SurveillanceDB.submitSurveillanceRecord(brooderSurveillance);
      sendAlert(brooderID);
    }
    const latestNumChick = await BrooderDB.getNumChick(brooderID);
    if (parseInt(latestNumChick[0].numChick) === 0) { BrooderDB.setBrooderMortalityRate(brooderID); }
    res.status(200)
      .redirect('/brooder/view');
  } catch (error) {
    console.error('Error during submitting brooder record', error);
    res.status(500)
      .send('Internal Server Error');
  }
};

export const getEditBrooderForm = async (req, res) => {
  try {
    const id = req.query.id;
    const recordData = await RecordBrooderDB.getBrooderRecord(id);
    const brooderID = recordData[0].brooderID;
    const numChick = await BrooderDB.getNumChick(brooderID);
    const numChickData = numChick.map(data => data.numChick);
    const brooderData = {
      id: brooderID,
      numChick: numChickData[0]
    };
    res.status(200)
      .render('edit-brooder-record', { recordData, brooderData });
  } catch (error) {
    console.error('Error during getting edit brooder record form', error);
    res.status(500)
      .send('Internal Server Error');
  }
};

export const editBrooderForm = async (req, res) => {
  const recordID = req.body.recordID;
  const brooderID = req.body.brooderID;
  const numDeadChick = req.body.numDeadChick;
  const numChickSold = req.body.numChickSold;

  try {
    const initialRecordData = await RecordBrooderDB.getBrooderRecord(recordID);
    const chickDeadDiff = +req.body.numDeadChick - +initialRecordData[0].numDeadChick;
    const chickSoldDiff = +req.body.numChickSold - +initialRecordData[0].numChickSold;
    const numChickData = await BrooderDB.getNumChick(brooderID);
    const { numChick } = numChickData[0];
    const updatedMR = Number((+numDeadChick / (+numChick + +initialRecordData[0].numDeadChick + +initialRecordData[0].numChickSold)) * 100).toFixed(2);
    let mortalityRate = 0;
    const prevRecordData = await RecordBrooderDB.getPreviousRecord(recordID, brooderID);

    if (prevRecordData.length !== 0) { mortalityRate = prevRecordData[0].mortalityRate; }
    const updatedCumMR = +updatedMR + +mortalityRate;

    const recordData = {
      recordID,
      brooderID,
      numDeadChick,
      numChickSold,
      mortalityRate: updatedMR
    };

    const brooderData = {
      recordID,
      brooderID,
      numDeadChick: chickDeadDiff,
      numChickSold: chickSoldDiff
    };

    const brooderMR = {
      brooderID,
      mortalityRate: updatedCumMR
    };

    const brooderSurveillance = {
      brooderID: req.body.brooderID,
      incubatorID: null,
      coopID: null
    };

    await RecordBrooderDB.editBrooderRecord(recordData);
    await BrooderDB.minusBrooderNumChick(brooderData);
    const surveillanceThreshold = await SurveillanceDB.getSurveillance();
    if (updatedCumMR > surveillanceThreshold[0].chickMRThreshold) {
      await SurveillanceDB.submitSurveillanceRecord(brooderSurveillance);
      sendAlert(brooderID);
    }
    const latestNumChick = await BrooderDB.getNumChick(brooderID);
    parseInt(latestNumChick[0].numChick) !== 0 ? await BrooderDB.setBrooderMR(brooderMR) : BrooderDB.setBrooderMortalityRate(brooderID);
    res.status(200)
      .redirect('/brooder/view');
  } catch (error) {
    console.error('Error submitting edit brooder record form', error);
    res.status(500)
      .send('Internal Server Error');
  }
};

export const deleteBrooderRecord = async (req, res) => {
  try {
    const recordID = req.query.id;
    const recordData = await RecordBrooderDB.getBrooderRecord(recordID);
    const { numDeadChick, numChickSold, brooderID } = recordData[0];
    const numChick = +numDeadChick + +numChickSold;
    const brooderData = {
      numChick,
      brooderID
    };
    await RecordBrooderDB.deleteBrooderRecord(recordID);
    await BrooderDB.addChickToBrooder(brooderData);
    res.status(200)
      .redirect(`/brooder/view/record?id=${brooderID}`);
  } catch (error) {
    console.error('Error deleting brooder record from database');
    res.status(500)
      .send('Internal Server Error');
  }
};
