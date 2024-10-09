import db from '../db/query.js';
import bcrypt from 'bcryptjs';

const get = (req, res) => {
  res.render('index');
};

const getSignUp = (req, res) => {
  if (req.query.invalidpword === 'true') {
    console.log('p', { invalidPword: true });
  } else {
    res.render('signup', { invalidPword: false });
  }
};

const getSignIn = (req, res) => {
  res.render('signin');
};

const postSignUp = async (req, res) => {
  console.log(req.body);
  if (req.body.password !== req.body.confirm_password) {
    res.redirect("/sign-up?passwordsMatched=false");
  } else {
    res.redirect("/");
  }
};

export default {
  get,
  getSignUp,
  getSignIn,
  postSignUp,
};
