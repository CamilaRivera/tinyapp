const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  c6UTx3: { longURL: "https://www.amazon.ca", userID: "camila" },
  c3BoG4: { longURL: "https://www.cnn.com", userID: "camila" }
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "camila": {
    id: "camila",
    email: "camila@example.com",
    password: "1234"
  }
}

function checkEmailRepetition(users, email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
}

function urlsForUser(id) {
  urlDatabasePerId = {};
  for(const url in urlDatabase){
    if(id === urlDatabase[url].userID){
      urlDatabasePerId[url] = urlDatabase[url].longURL;
    }
  }
  return urlDatabasePerId;
}


function generateRandomString() {
  return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
}

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.cookies.user_id), user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars); 
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("registration", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const user = checkEmailRepetition(users, req.body.email);
  if (user !== null && req.body.password === user.password) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.status(403);
    res.redirect('https://http.cat/403');
  } 
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "" || checkEmailRepetition(users, req.body.email) !== null) {
    res.status(400);
    res.redirect('https://http.cat/400');
  } else {
    let randomId = generateRandomString();
    users[randomId] = {
      id: randomId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', randomId);
    res.redirect("urls_index");
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  if(req.cookies.user_id === undefined){
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  if (!req.body.longURL.startsWith('http://') && !req.body.longURL.startsWith('https://')) {
    urlDatabase[randomString] = 'http://' + req.body.longURL;
  }
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect('/urls/' + randomString);
});

// function isCreatedByUser(erulObj, userId) {

// }

app.post("/urls/:shortURL/delete", (req, res) => {
  if(urlDatabase[req.params.shortURL].userID === req.cookies.user_id){
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
  } else {
    console
    res.redirect('https://http.cat/403');
  } 
  console.log(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  console.log(req.cookies.user_id);
  if(urlDatabase[req.params.shortURL].userID === req.cookies.user_id){
    urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id }
    res.redirect('/urls/');
  } else {
    res.status(403);
    res.redirect('https://http.cat/403');
  } 
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("*", (req, res) => {
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});