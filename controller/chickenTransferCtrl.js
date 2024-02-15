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
    const updatedAtData = transferRecordData.map((data) => {
      return data.updated_at.toLocaleString('en-MY');
    });
    const numHensData = transferRecordData.map((data) => data.numOfHens);
    const numRoostersData = transferRecordData.map((data) => data.numOfRoosters);
    res.status(200)
      .render('view-chicken-transfer', { coopID, transferIDData, originData, destinationData, transferredDateData, numHensData, numRoostersData, updatedAtData });
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

export const getEditChickenTransferRecordForm = async (req, res) => {
  const transferID = req.query.id;
  try {
    const transferData = await ChickenTransferDB.getTransferRecord(transferID);
    const coopIDs = await CoopDB.getCoopIDs();
    const coopData = coopIDs.map(data => data.coopID);
    res.status(200)
      .render('edit-chicken-transfer-record', { transferData, coopData });
  } catch (error) {
    console.error(error.message);
    res.status(500)
      .send('Internal Server Error');
  }
};

export const editChickenTransferForm = async (req, res) => {
  const origin = req.body.origin;
  const destination = req.body.destination;
  const numOfHens = req.body.numOfHens;
  const numOfRoosters = req.body.numOfRoosters;
  const transferID = req.body.transferID;

  const transferData = {
    origin,
    destination,
    numOfHens,
    numOfRoosters,
    transferID
  };

  const coopData = {
    coopID: destination,
    numOfHens,
    numOfRoosters
  };
  try {
    const initialRecord = await ChickenTransferDB.getTransferRecord(transferID);
    const { destination, numOfHens, numOfRoosters } = initialRecord[0];
    const addData = {
      coopID: destination,
      numOfHens,
      numOfRoosters
    };

    await ChickenTransferDB.editTransferRecord(transferData);
    await CoopDB.addNumChickenCoop(addData);
    await CoopDB.addNumChickenCoop(coopData);
    res.status(200)
      .redirect(`/chicken-transfer/view/id?id=${origin}`);
  } catch (error) {
    console.error(error);
    throw new Error('Error submitting edited chicken transfer record to database');
  }
};

export const deleteChickenTransferRecord = async (req, res) => {
  const transferID = req.query.id;
  try {
    const recordData = await ChickenTransferDB.getTransferRecord(transferID);
    const { origin, destination, numOfHens, numOfRoosters } = recordData[0];
    const addData = {
      coopID: origin,
      numOfHens,
      numOfRoosters
    };

    const coopData = {
      coopID: destination,
      numDeadHen: numOfHens,
      numDeadRoosters: numOfRoosters
    };

    await CoopDB.addNumChickenCoop(addData);
    await CoopDB.minusNumChickenCoop(coopData);
    await ChickenTransferDB.deleteTransferRecord(transferID);
    res.status(200)
      .redirect(`/chicken-transfer/view/id?id=${origin}`);
  } catch (error) {
    console.error(error);
    throw new Error('Error deleting chicken transfer record from database');
  }
};
