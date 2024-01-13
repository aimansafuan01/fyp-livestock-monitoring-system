import * as CoopDB from '../db/coopDB.js';
import * as RecordCoopDB from '../db/record-coopDB.js';
import * as EggsDB from '../db/eggsDB.js';
import * as SurveillanceDB from '../db/surveillanceDB.js';
import { sendAlert } from '../mailer.js';

export const getAllCoop = async (req, res) => {
  try {
    const allCoop = await CoopDB.getAllCoop();
    res.status(200)
      .render('coop-record', { allCoop });
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
    res.status(200)
      .render('view-coop-record', {
        recordIDData,
        coopIDData,
        numDeadHenData,
        numDeadRoosterData,
        numEggsData,
        numNcData,
        numAcceptedData,
        recordedAtData
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
    console.log(req.query.id);
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

    const coopData = {
      coopID,
      numDeadHen: req.body.numOfDeadHensR1,
      numDeadRoosters: req.body.numOfDeadRoostersR1,
      numEggs,
      numNc,
      numAccepted
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
      sendAlert();
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
    const coopData = {
      recordID,
      coopID,
      numDeadHen,
      numDeadRoosters,
      numEggs,
      numNc,
      numAccepted
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

    const resultSubmit = await RecordCoopDB.submitEditCoopRecord(coopData);
    const resultUpdateCoopMR = await CoopDB.updateCoopMR(coopData);
    const resultUpdate = await CoopDB.minusNumChickenCoop(coopData);
    const resultUpdateEggs = await EggsDB.updateTotalEggs(eggData);
    const surveillanceThreshold = await SurveillanceDB.getSurveillance();

    if (resultUpdateCoopMR[1] > surveillanceThreshold[0].chickenMRThreshold) {
      await SurveillanceDB.submitSurveillanceRecord(coopSurveillance);
      sendAlert();
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
