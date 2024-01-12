import * as UserDB from '../db/userDB.js';

// Login
export const getLoginPage = (req, res) => {
  const errorMessage = req.session.errorMessage;
  delete req.session.errorMessage;
  res.render('sign-in', { errorMessage });
};

// Register
export const getRegisterPage = (req, res) => {
  res.render('register');
};

// Post Login
export const submitLoginCredentials = async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const result = await UserDB.login(username, password);
  if (result) {
    res.status(200)
      .redirect('/dashboard/view');
  } else {
    req.session.errorMessage = 'Invalid Username Or Password';
    res.status(401).redirect('/login');
  }
};

// Register account
export const submitRegisterAccount = async (req, res) => {
  const { username, password } = req.body;
  const account = {
    username,
    password
  };

  try {
    const submitRegisterAccount = await UserDB.register(account);

    if (submitRegisterAccount) {
      res.status(200)
        .redirect('/dashboard/view');
    }
  } catch (error) {
    console.error('Error during account registration', error);
    res.status(500)
      .send('Internal Server Error');
  }
};
