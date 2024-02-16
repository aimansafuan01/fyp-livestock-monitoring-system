import * as IncubatorDB from '../db/incubatorDB.js';
import * as BrooderDB from '../db/brooderDB.js';
import * as RecordIncubatorDB from '../db/record-incubatorDB.js';
import * as SurveillanceDB from '../db/surveillanceDB.js';
import * as trayDB from '../db/trayDB.js';
import { sendAlert } from '../mailer.js';

// View Incubator
export const getIncubatorPage = async (req, res) => {
  const allIncubator = await IncubatorDB.getAllIncubator();
  const hatchingDate = await IncubatorDB.getHatchingDate();

  res.status(200)
    .render('incubator-record', { allIncubator, hatchingDate });
};

// Get Incubator Tray Record Page
export const getIncubatorTrayForm = async (req, res) => {
  const data = {
    id: req.query.id
  };
  const incubatorResult = await IncubatorDB.getIncubatorRecord(data);
  const numEggsInTray = await RecordIncubatorDB.getTrayToBasketRecord(data);
  const trayList = await trayDB.getAllTray();
  const occupiedTray = incubatorResult.map((data) => data.trayID);
  const trayListArr = trayList.map((data) => data.trayID);
  const filteredTrayListArr = trayListArr.filter(element => !occupiedTray.includes(element));

  res.status(200)
    .render('create-tray-record', { data, incubatorResult, numEggsInTray, filteredTrayListArr });
};

// Get Incubator Hatch Record Page
export const getIncubatorHatchForm = async (req, res) => {
  const incubatorID = req.query.id;
  const numEgg = await RecordIncubatorDB.getNumEggsInBasket(incubatorID);
  const availableBrooder = await BrooderDB.getAvailableBrooder();
  const numEggData = numEgg.map((data) => data.numEggs);
  const availableBrooderID = availableBrooder.map((data) => data.brooderID);
  const data = {
    id: incubatorID,
    numEgg: numEggData.length > 0 ? numEggData : 0,
    currDate: new Date().toLocaleDateString('en-MY')
  };
  res.render('create-hatch-record', { data, availableBrooderID });
};

// Submit Incubator Tray Record
export const submitIncubatorTrayForm = async (req, res) => {
  const trayData = {
    incubatorID: req.body.incubatorID,
    dateIn: req.body.dateIn,
    trayID: req.body.trayID,
    numEggs: req.body.numEggs
  };
  await RecordIncubatorDB.submitTrayRecord(trayData);
  await IncubatorDB.updateIncubatorEgg(trayData);
  res.status(200)
    .redirect('/incubator/view');
};

// Submit Incubator Hatch Record
export const submitIncubatorHatchForm = async (req, res) => {
  const incubatorID = req.body.incubatorID;
  const dateHatch = req.body.dateOut;
  const eggInBasket = req.body.numEgg;
  const notHatch = req.body.notHatch;
  const brooderID = req.body.brooderID;
  const numChick = +eggInBasket - +notHatch;
  const hatchRate = +numChick !== 0 ? Number((+numChick / +eggInBasket) * 100).toFixed(2) : 0;
  console.log(numChick);
  console.log(eggInBasket);
  console.log(hatchRate);

  try {
    const brooderData = {
      brooderID,
      numChick
    };

    const incubatorData = {
      incubatorID,
      hatchRate,
      eggInBasket
    };

    const incubatorSurveillance = {
      coopID: null,
      brooderID: null,
      incubatorID
    };

    const hatchData = {
      dateHatch,
      numEgg: eggInBasket,
      numHatch: numChick,
      numNotHatch: notHatch,
      hatchRate,
      incubatorID,
      brooderID
    };

    await BrooderDB.insertChickToBrooder(brooderData);
    await IncubatorDB.updateIncubator(incubatorData);
    await RecordIncubatorDB.submitHatchRecord(hatchData);
    const surveillanceThreshold = await SurveillanceDB.getSurveillance();

    if (hatchRate < surveillanceThreshold[0].hatchingRateThreshold) {
      await SurveillanceDB.submitSurveillanceRecord(incubatorSurveillance);
      sendAlert(incubatorID);
    }

    res.status(200)
      .redirect('/incubator/view');
  } catch (error) {
    console.error('Error during submitting hatch record', error);
    res.status(500)
      .send('Internal Server Error');
  }
};
