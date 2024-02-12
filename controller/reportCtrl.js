import * as RecordCoopDB from '../db/record-coopDB.js';
import * as CoopDB from '../db/coopDB.js';
import * as BrooderDB from '../db/brooderDB.js';
import * as RecordHatchDB from '../db/record-hatchDB.js';
import * as RecordBroderDB from '../db/record-brooderDB.js';
import * as EggsDB from '../db/eggsDB.js';

// Get Data for Report
export const getReportPage = async (req, res) => {
  const monthlyEggs = await RecordCoopDB.getNumEggsMonthly();
  const numOfChicken = await CoopDB.getNumberOfChicken();
  const coopData = await CoopDB.getAllChicken();
  const eggData = await RecordCoopDB.getCurrMonthEggs();
  const asOfEggData = await EggsDB.getAsOfTotalEggs();
  const firstDateCoopRecord = await RecordCoopDB.getFirstDateCoopRecord();
  const avgEggDaily = await RecordCoopDB.avgDailyEgg();
  const chickenDeadData = await RecordCoopDB.getChickenDeadCurrMonth();
  const dailyEggsAMonth = await RecordCoopDB.getDailyEggsInAMonth();
  const monthlyChickenDead = await RecordCoopDB.getMonthlyChickenDead();
  const incubationRecord = await RecordHatchDB.getIncubationData();
  const firstIncubationDate = await RecordHatchDB.getFirstIncubationDate();
  const totalChickenDeadData = await RecordCoopDB.getTotalChickenDead();
  const totalIncubationData = await RecordHatchDB.getTotalIncubationData();
  const dailyChickDeathInAMonth = await RecordBroderDB.getDailyChickDeathInAMonth();
  const totalChickDeathCurrMonth = await RecordBroderDB.getTotalChickDeathCurrMonth();
  const cumTotalChickDeath = await RecordBroderDB.getCumTotalChickDeath();
  const brooderIDs = await BrooderDB.getBrooderIDs();
  const totalNumChick = await RecordHatchDB.getTotalChickInBrooder();
  const totalNumChickDeadAndSold = await RecordBroderDB.getTotalChickDeadAndSoldInBrooder();
  const brooderIDData = brooderIDs.map(data => data.brooderID);
  const dailyEggsAMonthData = dailyEggsAMonth.map(data => data.numEggs);
  const monthlyEggsData = monthlyEggs.map((data) => data.numEggs);
  const monthlyHensDeadData = monthlyChickenDead.map((data) => data.numDeadHen);
  const monthlyRoosterDeadData = monthlyChickenDead.map((data) => data.numDeadRooster);
  const dailyChickDeathInAMonthData = dailyChickDeathInAMonth.map((data) => data.numDeadChick);
  const totalNumHatchData = totalNumChick.map(data => data.totalNumHatch);
  const totalNumDeadData = totalNumChickDeadAndSold.map(data => data.totalNumDead);
  const totalNumSoldData = totalNumChickDeadAndSold.map(data => data.totalNumSold);

  res.status(200)
    .render('report', {
      monthlyEggs,
      numOfChicken,
      coopData,
      eggData,
      asOfEggData,
      firstDateCoopRecord,
      avgEggDaily,
      chickenDeadData,
      monthlyEggsData,
      dailyEggsAMonthData,
      monthlyHensDeadData,
      monthlyRoosterDeadData,
      incubationRecord,
      firstIncubationDate,
      totalChickenDeadData,
      totalIncubationData,
      dailyChickDeathInAMonthData,
      totalChickDeathCurrMonth,
      cumTotalChickDeath,
      brooderIDData,
      totalNumHatchData,
      totalNumDeadData,
      totalNumSoldData
    });
};
