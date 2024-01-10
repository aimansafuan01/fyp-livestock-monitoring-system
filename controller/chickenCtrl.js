import * as CoopDB from '../db/coopDB.js';
import * as ChickenDB from '../db/chickenDB.js';

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
    await ChickenDB.submitTransferRecord(transferData);
    await CoopDB.minusNumChickenCoop(coopData);
    await CoopDB.addNumChickenCoop(addData);
    res.status(200)
      .redirect('/chicken/view');
  } catch (error) {
    console.error(error.message);
    res.status(500)
      .send('Internal Server Error');
  }
};
