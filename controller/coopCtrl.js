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

export const getCoopForm = (req, res) => {
  const coopID = {
    id: req.query.id
  };
  res.status(200)
    .render('create-coop-record', coopID);
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
