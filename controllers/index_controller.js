import db from '../db/query.js';
import bcrypt from 'bcryptjs';

const get = (req, res) => {
  res.render('index', { user: req.user });
};

const getSignUp = (req, res) => {
  if (req.user) {
    res.redirect("/");
    return;
  }
  const matched = !(req.query.passwordsMatched === 'false');
  const usernameExists = (req.query.usernameExists === 'true');
  const emailExists = (req.query.emailExists === 'true');

  res.render('signup', {
    passwordsMatched: matched,
    usernameExists: usernameExists,
    emailExists: emailExists,
  });
};

const getSignIn = (req, res) => {
  if (req.user) {
    res.redirect("/");
    return;
  }

  const invalidCreds = req.query.invalidCredentials === 'true';
  res.render('signin', { invalidCreds: invalidCreds });
};

const postSignUp = async (req, res, next) => {
  if (req.body.password !== req.body.confirm_password) {
    res.redirect("/sign-up?passwordsMatched=false");
  } else {
    try {
      const existingUname = await db.getUserFromUsername(req.body.username);
      if (existingUname.length > 0) {
        res.redirect("/sign-up?usernameExists=true");
        return;
      }

      const existingEmail = await db.getUserFromEmail(req.body.email);
      if (existingEmail.length > 0) {
        res.redirect("/sign-up?emailExists=true");
        return;
      }

      const saltAndHash = await bcrypt.hash(req.body.password, 10);
      await db.createNewUser(req.body.email, req.body.username, saltAndHash);
      res.redirect("/sign-in");
    } catch (err) {
      next(err);
    }
  }
};

const postSignOut = (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }

    res.redirect("/");
  });
};

export default {
  get,
  getSignUp,
  getSignIn,
  postSignUp,
  postSignOut,
};