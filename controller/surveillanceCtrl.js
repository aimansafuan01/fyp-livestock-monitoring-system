import * as SurveillanceDB from '../db/record-surveillance.js';

// Get surveillance Record Page
export const getSurveillanceRecordPage = async (req, res) => {
  const recordSurveillanceData = await SurveillanceDB.getAllRecordSurveillance();

  res.status(200)
    .render('surveillance-record', { recordSurveillanceData });
};

// Update Surveillance Status
export const updateSurveillanceRecord = async (req, res) => {
  try {
    const id = req.query.id;
    const action = req.body.action;
    const result = await SurveillanceDB.updateSurveillanceStatus(id, action);
    if (result) {
      res.status(200)
        .redirect('/dashboard/view');
    }
  } catch (error) {
    console.error('Error during updating coop record', error);
    res.status(500)
      .send('Internal Server Error');
  }
};
