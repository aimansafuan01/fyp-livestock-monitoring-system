import * as CoopDB from '../db/coopDB.js';
import * as RecordCoopDB from '../db/record-coopDB.js';
import * as EggsDB from '../db/eggsDB.js';
import * as SurveillanceDB from '../db/surveillanceDB.js';
import { sendAlert } from '../mailer.js';

export const getAllCoop = async (req, res) => {
  try {
    const allCoop = await CoopDB.getAllCoop();
    const coopRecordFilledData = await RecordCoopDB.getCoopRecordExistToday();
    const coopRecordFilledArr = coopRecordFilledData.map((data) => data.COOPID);
    const coopID = allCoop.map((data) => data.coopID);
    const numOfHens = allCoop.map((data) => data.numOfHens);
    const numOfRoosters = allCoop.map((data) => data.numOfRoosters);
    const mortalityRate = allCoop.map((data) => data.mortalityRate);
    const totalChickensInEachCoop = allCoop.map((data) => data.totalChickens);
    const avgMortalityRate = mortalityRate.reduce((accumulator, currentVal) => +accumulator + +currentVal, 0) / mortalityRate.length;
    const totalChicken = totalChickensInEachCoop.reduce((accumulator, currentVal) => +accumulator + +currentVal, 0);
    const totalHens = numOfHens.reduce((accumulator, currentVal) => +accumulator + +currentVal, 0);
    const totalRoosters = numOfRoosters.reduce((accumulator, currentVal) => +accumulator + +currentVal, 0);

    res.status(200)
      .render('coop-record', {
        coopID,
        numOfHens,
        numOfRoosters,
        mortalityRate,
        totalChickensInEachCoop,
        avgMortalityRate,
        totalChicken,
        totalHens,
        totalRoosters,
        coopRecordFilledArr
      });
  } catch (error) {
    console.error(error.message);
    res.status(500)
      .send('Internal Server Error');
  }
};

export const getCoopRecordAll = async (req, res) => {
  try {
    const coopID = req.query.id;
    const coopRecord = await RecordCoopDB.getCoopRecordAll(coopID);
    const recordIDData = coopRecord.map((data) => data.recordID);
    const coopIDData = coopRecord.map((data) => data.coopID);
    const numDeadHenData = coopRecord.map((data) => data.numDeadHen);
    const numDeadRoosterData = coopRecord.map((data) => data.numDeadRooster);
    const numEggsData = coopRecord.map((data) => data.numEggs);
    const numNcData = coopRecord.map((data) => data.numNc);
    const numAcceptedData = coopRecord.map((data) => data.numAccepted);
    const recordedAtData = coopRecord.map((data) => data.recorded_at);
    const updatedAtData = coopRecord.map((data) => data.updated_at);
    res.status(200)
      .render('view-coop-record', {
        recordIDData,
        coopIDData,
        numDeadHenData,
        numDeadRoosterData,
        numEggsData,
        numNcData,
        numAcceptedData,
        recordedAtData,
        updatedAtData
      });
  } catch (error) {
    res.status(500)
      .send('Internal Server Error');
  }
};

export const getCoopForm = async (req, res) => {
  try {
    const coopID = {
      id: req.query.id
    };
    res.status(200)
      .render('create-coop-record', coopID);
  } catch (error) {
    res.status(500)
      .send('Internal Server Error');
  }
};

export const getEditCoopForm = async (req, res) => {
  try {
    const id = req.query.id;
    const initialCoopRecord = await RecordCoopDB.getCoopRecord(id);

    res.status(200)
      .render('edit-coop-record', { initialCoopRecord });
  } catch (error) {
    res.status(500)
      .send('Internal Server Error');
  }
};

export const deleteCoopRecord = async (req, res) => {
  try {
    const recordData = await RecordCoopDB.getCoopRecord(req.query.id);
    const { numDeadHen, numDeadRooster, coopID, numEggs, numNc, numAccepted } = recordData[0];
    const coopData = {
      coopID,
      numOfHens: +numDeadHen,
      numOfRoosters: +numDeadRooster
    };

    const eggData = {
      numEggs,
      numNc,
      numAccepted
    };

    await CoopDB.addNumChickenCoop(coopData);
    await EggsDB.minusTotalEggs(eggData);
    await RecordCoopDB.deleteCoopRecord(req.query.id);
    res.status(200)
      .redirect('/coop/view');
  } catch (error) {
    console.error('Error during deleting coop record', error);
    res.status(500)
      .send('Internal Server Error');
  }
};

export const submitCoopForm = async (req, res) => {
  try {
    const coopID = req.body.coopID;
    const numEggs = req.body.numOfEggs;
    const numNc = req.body.numOfNC;
    const numAccepted = req.body.acceptedEggs;
    const numDeadHen = req.body.numOfDeadHens;
    const numDeadRoosters = req.body.numOfDeadRoosters;
    const coop = await CoopDB.getCoop(coopID);
    const { totalChickens } = coop[0];
    const mortalityRate = ((+numDeadHen + +numDeadRoosters) / +totalChickens) * 100;

    const coopData = {
      coopID,
      numDeadHen,
      numDeadRoosters,
      numEggs,
      numNc,
      numAccepted,
      mortalityRate
    };

    const coopSurveillance = {
      coopID,
      brooderID: null,
      incubatorID: null
    };

    const eggData = {
      numEggs,
      numNc,
      numAccepted
    };

    const resultSubmit = await RecordCoopDB.submitCoopRecord(coopData);
    const resultUpdateCoopMR = await CoopDB.updateCoopMR(coopData);
    const resultUpdate = await CoopDB.minusNumChickenCoop(coopData);
    const resultUpdateEggs = await EggsDB.updateTotalEggs(eggData);
    const surveillanceThreshold = await SurveillanceDB.getSurveillance();

    if (resultUpdateCoopMR[1] > surveillanceThreshold[0].chickenMRThreshold) {
      await SurveillanceDB.submitSurveillanceRecord(coopSurveillance);
      sendAlert(coopID);
    }
    if (resultSubmit && resultUpdate && resultUpdateEggs) {
      res.status(200)
        .redirect('/coop/view');
    }
  } catch (error) {
    console.error('Error during submitting coop record', error);
    res.status(500)
      .send('Internal Server Error');
  }
};

export const editCoopRecord = async (req, res) => {
  try {
    const recordID = req.body.recordID;
    const coopID = req.body.coopID;
    const numDeadHen = req.body.numOfDeadHens;
    const numDeadRoosters = req.body.numOfDeadRoosters;
    const numEggs = req.body.numOfEggs;
    const numNc = req.body.numOfNC;
    const numAccepted = req.body.acceptedEggs;
    const totalNumDead = +numDeadHen + +numDeadRoosters;
    const initialRecord = await RecordCoopDB.getCoopRecord(recordID);
    const henDeadDiff = +numDeadHen - +initialRecord[0].numDeadHen;
    const roosterDeadDiff = +numDeadRoosters - +initialRecord[0].numDeadRooster;
    const numEggsDiff = +numEggs - +initialRecord[0].numEggs;
    const numNCDiff = +numNc - +initialRecord[0].numNc;
    const numAcceptedDiff = +numAccepted - +initialRecord[0].numAccepted;
    const coopRecord = await CoopDB.getNumChickens(coopID);
    const { totalChickens } = coopRecord[0];
    const updatedMR = Number((+totalNumDead / (+totalChickens + +initialRecord[0].numDeadHen + +initialRecord[0].numDeadRooster)) * 100).toFixed(2);
    let mortalityRate = 0;
    const prevRecord = await RecordCoopDB.getPreviousRecord(recordID, coopID);
    if (prevRecord.length !== 0) { mortalityRate = prevRecord[0].mortalityRate; }
    const updatedCumMR = +updatedMR + +mortalityRate;

    const recordData = {
      recordID,
      coopID,
      numDeadHen,
      numDeadRoosters,
      numEggs,
      numNc,
      numAccepted,
      mortalityRate: updatedMR
    };

    const coopData = {
      recordID,
      coopID,
      numDeadHen: henDeadDiff,
      numDeadRoosters: roosterDeadDiff
    };

    const coopMR = {
      coopID,
      mortalityRate: updatedCumMR
    };

    const coopSurveillance = {
      coopID,
      brooderID: null,
      incubatorID: null
    };

    const eggData = {
      numEggs: numEggsDiff,
      numNc: numNCDiff,
      numAccepted: numAcceptedDiff
    };

    await RecordCoopDB.submitEditCoopRecord(recordData);
    await CoopDB.minusNumChickenCoop(coopData);
    await EggsDB.updateTotalEggs(eggData);
    await CoopDB.setCoopMR(coopMR);
    const surveillanceThreshold = await SurveillanceDB.getSurveillance();

    if (+updatedCumMR > surveillanceThreshold[0].chickenMRThreshold) {
      await SurveillanceDB.submitSurveillanceRecord(coopSurveillance);
      sendAlert(coopID);
    }

    res.status(200)
      .redirect('/coop/view');
  } catch (error) {
    console.error('Error during submitting coop record', error);
    res.status(500)
      .send('Internal Server Error');
  }
};
