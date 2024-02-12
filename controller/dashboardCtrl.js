import * as CoopDB from '../db/coopDB.js';
import * as RecordSurveillanceDB from '../db/record-surveillance.js';
import * as RecordCoopDB from '../db/record-coopDB.js';
import * as RecordBrooderDB from '../db/record-brooderDB.js';
import * as BrooderDB from '../db/brooderDB.js';

export const getDashboardPage = async (req, res) => {
  const numOfChicken = await CoopDB.getNumberOfChicken();
  const surveillance = await RecordSurveillanceDB.getRecordSurveillance();

  const todayEgg = await RecordCoopDB.getTodayEgg();
  const todayEggData = todayEgg.map((data) => data.todayEggCollected);

  const todayChickDead = await RecordBrooderDB.getTodayChickDead();
  const todayChickDeadata = todayChickDead.map((data) => data.todayChickDead);

  const todayChickenDeadData = await RecordCoopDB.getTodayChickenDead();
  const todayRoosterDeadData = todayChickenDeadData.map((data) => data.todayRoosterDead);
  const todayHenDeadData = todayChickenDeadData.map((data) => data.todayRoosterDead);

  const numEggCurrWeek = await RecordCoopDB.getNumEggCurrWeek();
  const numEggsCurrWeekData = numEggCurrWeek.map((data) => data.numEggs);

  const numChickDeadCurrWeek = await RecordBrooderDB.getNumChickDeadCurrWeek();
  const numChickDeadCurrWeekData = numChickDeadCurrWeek.map((data) => data.totalDeadChick);

  const numChickenDeadCurrWeek = await RecordCoopDB.getNumChickenDeadCurrWeek();
  const numChickenDeadCurrWeekData = numChickenDeadCurrWeek.map((data) => data.totalDeadChicken);

  const numEggsMonthly = await RecordCoopDB.getNumEggsMonthly();
  const numEggsMonthlyData = numEggsMonthly.map(entry => entry.numEggs);

  const numOfChickenInEachCoop = await CoopDB.getAllChicken();
  const coopIDData = numOfChickenInEachCoop.map((data) => data.coopID);
  const numOfHenData = numOfChickenInEachCoop.map((data) => data.numOfHens);
  const numOfRoosterData = numOfChickenInEachCoop.map((data) => data.numOfRoosters);

  const numOfChickInEachBrooder = await BrooderDB.getNumChickInEachBrooder();
  const brooderIDData = numOfChickInEachBrooder.map(data => data.brooderID);
  const numChickData = numOfChickInEachBrooder.map(data => data.numChick);

  res.status(200)
    .render('dashboard', {
      todayEggData,
      todayChickDeadata,
      todayRoosterDeadData,
      todayHenDeadData,
      numEggsCurrWeekData,
      numChickDeadCurrWeekData,
      numChickenDeadCurrWeekData,
      numOfChicken,
      numEggsMonthlyData,
      surveillance,
      numOfChickenInEachCoop,
      coopIDData,
      numOfHenData,
      numOfRoosterData,
      brooderIDData,
      numChickData
    });
};
