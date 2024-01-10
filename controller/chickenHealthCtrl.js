import * as ChickenHealthDB from '../db/record-chicken-healthDB.js';
import * as ChickenTransferDB from '../db/record-transferDB.js';
import * as CoopDB from '../db/coopDB.js';
import { getHealthStatus } from '../db/health_statusDB.js';
import { getHealthSymptoms } from '../db/health_symptomsDB.js';

// Get Chicken Health Record Page
export const getChickenHealthRecordPage = async (req, res) => {
  const healthRecord = await ChickenHealthDB.getChickenHealthRecord();
  const healthStatus = await getHealthStatus();
  res.status(200)
    .render('chicken-health-record', { healthRecord, healthStatus });
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
