import * as CoopDB from '../db/coopDB.js';
import * as ChickenTransferDB from '../db/record-transferDB.js';

export const getChickenRecordPage = async (req, res) => {
  try {
    const allCoop = await CoopDB.getAllCoop();
    res.status(200)
      .render('chicken-transfer', { allCoop });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

export const getChickenTransferRecord = async (req, res) => {
  const coopID = req.query.id;
  try {
    const transferRecordData = await ChickenTransferDB.getAllChickenTransferRecord(coopID);
    const transferIDData = transferRecordData.map((data) => data.transferID);
    const originData = transferRecordData.map((data) => data.origin);
    const destinationData = transferRecordData.map((data) => data.destination);
    const transferredDateData = transferRecordData.map((data) => {
      return data.transfered_at.toLocaleDateString('en-MY');
    });
    const numHensData = transferRecordData.map((data) => data.numOfHens);
    const numRoostersData = transferRecordData.map((data) => data.numOfRoosters);
    res.status(200)
      .render('view-chicken-transfer', { coopID, transferIDData, originData, destinationData, transferredDateData, numHensData, numRoostersData });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

// Get Chicken Record Page
export const getChickenTransferForm = async (req, res) => {
  try {
    const coopIDS = await CoopDB.getCoopIDs();
    const data = {
      id: req.query.id,
      coopIDS
    };
    res.status(200)
      .render('create-chicken-transfer-record', { data });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

export const submitChickenTransferForm = async (req, res) => {
  const origin = req.body.origin;
  const destination = req.body.destination;
  const numOfHens = req.body.numOfHens;
  const numOfRoosters = req.body.numOfRoosters;

  const transferData = {
    origin,
    destination,
    numOfHens,
    numOfRoosters
  };

  const coopData = {
    coopID: origin,
    numDeadHen: numOfHens,
    numDeadRoosters: numOfRoosters
  };

  const addData = {
    coopID: destination,
    numOfHens,
    numOfRoosters
  };

  try {
    await ChickenTransferDB.submitTransferRecord(transferData);
    await CoopDB.minusNumChickenCoop(coopData);
    await CoopDB.addNumChickenCoop(addData);
    res.status(200)
      .redirect('/chicken-transfer/view');
  } catch (error) {
    console.error(error.message);
    res.status(500)
      .send('Internal Server Error');
  }
};
