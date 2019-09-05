function getUserByEmail(users, email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
}

function urlsForUser(id, urlDatabase) {
  urlDatabasePerId = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      urlDatabasePerId[url] = urlDatabase[url].longURL;
    }
  }
  return urlDatabasePerId;
}


function generateRandomString() {
  return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
}


module.exports = { getUserByEmail, urlsForUser, generateRandomString }