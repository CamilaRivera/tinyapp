const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');

const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  keys: ['this-is-a-secret-key'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const urlDatabase = {
  b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'userRandomID' },
  i3BoGr: { longURL: 'https://www.google.ca', userID: 'user2RandomID' },
  c6UTx3: { longURL: 'https://www.amazon.ca', userID: 'camila' },
  c3BoG4: { longURL: 'https://www.cnn.com', userID: 'camila' }
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10)
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', 10)
  },
  'camila': {
    id: 'camila',
    email: 'camila@example.com',
    password: bcrypt.hashSync('1234', 10)
  }
};

app.get('/', (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  if (user !== undefined) {
    res.redirect('/urls');
  }
  else {
    let templateVars = { user };
    res.render('register', templateVars);
  }
});

app.get('/login', (req, res) => {
  if (users[req.session.user_id] !== undefined) {
    res.redirect('/urls');
  }
  else {
    let templateVars = { user: users[req.session.user_id], error: false };
    res.render('login', templateVars);
  }
});

app.post('/login', (req, res) => {
  const user = getUserByEmail(users, req.body.email);
  if (user !== undefined && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {
    let templateVars = { user: users[req.session.user_id], error: true };
    res.render('login', templateVars);
  }
});

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '' || getUserByEmail(users, req.body.email) !== undefined) {
    res.status(400);
    res.render('error_page', { errorCode: 400, user: users[req.session.user_id] });
  } else {
    let randomId = generateRandomString();
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = randomId;
    res.redirect('/urls');
  }
});

app.get('/urls/new', (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect('/login');
  }
  else {
    let templateVars = { user: users[req.session.user_id] };
    res.render('urls_new', templateVars);
  }
});

app.post('/urls', (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.status(403);
    res.render('error_page', { errorCode: 403, user: users[req.session.user_id] });
  }
  else {
    let randomString = generateRandomString();
    let longURL = req.body.longURL;
    if (!longURL.startsWith('http://') && !longURL.startsWith('https://')) {
      longURL = 'http://' + longURL;
    }
    urlDatabase[randomString] = { longURL: longURL, userID: req.session.user_id };
    res.redirect('/urls/' + randomString);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const urlObject = urlDatabase[req.params.shortURL];
  if (urlObject !== undefined && urlObject.userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls/');
  } else {
    res.status(403);
    res.render('error_page', { errorCode: 403, user: users[req.session.user_id] });
  }
});

app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404);
    res.render('error_page', { errorCode: 404, user: users[req.session.user_id] });
  }
  else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.status(403);
    res.render('error_page', { errorCode: 403, user: users[req.session.user_id] });
  }
  else {
    const urlObject = urlDatabase[req.params.shortURL];
    if (urlObject === undefined) {
      res.status(404);
      res.render('error_page', { errorCode: 404, user: users[req.session.user_id] });
    }
    else if (urlObject.userID === req.session.user_id) {
      let templateVars = { shortURL: req.params.shortURL, longURL: urlObject.longURL, user: users[req.session.user_id] };
      res.render('urls_show', templateVars);
    }
    else {
      res.status(403);
      res.render('error_page', { errorCode: 403, user: users[req.session.user_id] });
    }
  }
});

app.post('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] !== undefined && urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: req.session.user_id }
    res.redirect('/urls');
  } else {
    res.status(403);
    res.render('error_page', { errorCode: 403, user: users[req.session.user_id] });
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('*', (req, res) => {
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});