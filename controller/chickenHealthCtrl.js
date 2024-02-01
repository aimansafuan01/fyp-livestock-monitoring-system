import * as ChickenHealthDB from '../db/record-chicken-healthDB.js';
import * as ChickenTransferDB from '../db/record-transferDB.js';
import * as CoopDB from '../db/coopDB.js';
import { getHealthStatus } from '../db/health_statusDB.js';
import { getHealthSymptoms } from '../db/health_symptomsDB.js';

// Get Chicken Health Record Page
export const getChickenHealthRecordPage = async (req, res) => {
  const healthRecord = await ChickenHealthDB.getChickenHealthRecord();
  res.status(200)
    .render('chicken-health-record', { healthRecord });
};

// Get Create Chicken Health Record Page
export const getChickenHealthForm = async (req, res) => {
  try {
    const coopIDs = await CoopDB.getCoopIDs();
    const healthSymptoms = await getHealthSymptoms();
    const healthStatus = await getHealthStatus();
    res.status(200)
      .render('create-chicken-health-record', { coopIDs, healthSymptoms, healthStatus });
  } catch (error) {
    res.status(500)
      .send('Internal Server Error');
  }
};

export const submitChickenHealthForm = async (req, res) => {
  const origin = req.body.origin;
  const symptom = req.body.symptom;
  const status = req.body.status;
  const numOfHens = req.body.numOfHens;
  const numOfRoosters = req.body.numOfRoosters;

  const healthData = {
    origin,
    symptom,
    status,
    numOfHens,
    numOfRoosters
  };

  const transferData = {
    origin,
    destination: 'SB',
    numOfHens,
    numOfRoosters
  };

  const minusChicken = {
    coopID: origin,
    numDeadHen: numOfHens,
    numDeadRoosters: numOfRoosters
  };

  const addData = {
    coopID: 'SB',
    numOfHens,
    numOfRoosters
  };

  try {
    await ChickenHealthDB.submitChickenHealthRecord(healthData);
    await ChickenTransferDB.submitTransferRecord(transferData);
    await CoopDB.minusNumChickenCoop(minusChicken);
    await CoopDB.addNumChickenCoop(addData);
    res.status(200)
      .redirect('/chicken-health/view');
  } catch (error) {
    console.error('Error during submitting transfer record', error);
    res.status(500)
      .send('Internal Server Error');
  }
};

export const getChickenHealthRecord = async (req, res) => {
  const recordID = req.query.id;
  try {
    const recordData = await ChickenHealthDB.getSingleChickenHealthRecord(recordID);
    const healthStatus = await getHealthStatus();
    const coopIDs = await CoopDB.getCoopIDs();
    res.status(200)
      .render('edit-chicken-health-record', { recordData, healthStatus, coopIDs });
  } catch (error) {
    console.error('Error during fetching update chicken health record form', error);
    res.status(500)
      .send('Internal Server Error');
  }
};

export const submitUpdateChickenHealthForm = async (req, res) => {
  const recordID = req.body.recordID;
  const referenceID = recordID;
  const origin = req.body.origin;
  const numOfHens = req.body.numOfHens;
  const numOfRoosters = req.body.numOfRoosters;
  const status = req.body.status;
  const symptom = req.body.symptom;
  const coopID = req.body.transferTo;

  const healthRecord = {
    recordID,
    origin,
    numOfHens,
    numOfRoosters,
    status,
    referenceID,
    symptom
  };

  const addCoopData = {
    coopID,
    numOfHens,
    numOfRoosters
  };

  const minusCoopData = {
    coopID,
    numDeadHen: numOfHens,
    numDeadRoosters: numOfRoosters
  };

  try {
    await ChickenHealthDB.submitChickenHealthRecord(healthRecord);
    await ChickenHealthDB.updateChickenHealthRecord(healthRecord);
    if (coopID !== null) {
      status !== 'Cured'
        ? await CoopDB.minusNumChickenCoop(minusCoopData)
        : await CoopDB.addNumChickenCoop(addCoopData);
    }
    res.status(200)
      .redirect('/chicken-health/view');
  } catch (error) {
    console.error('Error during updating chicken health record form', error);
    res.status(500)
      .send('Internal Server Error');
  }
};

// const recordID = req.query.recordID;
// const status = req.query.status;
// const numDeadHen = req.query.numHens;
// const numDeadRoosters = req.query.numRoosters;
// let resultMinusChicken = null;

// const minusData = {
//   coopID: 'SB',
//   numDeadHen,
//   numDeadRoosters
// };

// try {
//   const resultUpdate = await ChickenHealthDB.updateChickenHealthStatus(recordID, status);

//   if (status !== 'Cured') {
//     resultMinusChicken = await CoopDB.minusNumChickenCoop(minusData);
//   }

//   if (resultUpdate && resultMinusChicken) {
//     res.status(200)
//       .redirect('/chicken-health/view');
//   }
// } catch (error) {
//   console.error('Error during updating health record', error);
//   res.status(500)
//     .send('Internal Server Error');
// }
