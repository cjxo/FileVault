const get = (req, res) => {
  if (!req.user) {
    res.redirect('/sign-in');
    return;
  }

  res.render('dashboard', { user: req.user });
};

export default {
  get
};
