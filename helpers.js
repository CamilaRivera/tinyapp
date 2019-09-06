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
      urlDatabasePerId[url] = { longURL: urlDatabase[url].longURL, date: urlDatabase[url].date };
    }
  }
  return urlDatabasePerId;
}


function generateRandomString() {
  return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
}

function createDate() {
  return new Date(new Date().getTime() - 7 * 3600 * 1000);
}

function sumVisits(shortUrl, visitedURL) {
  let count = 0;
  if (visitedURL[shortUrl] !== undefined) {
    for (const visitor in visitedURL[shortUrl]) {
      count += visitedURL[shortUrl][visitor];
    }
  }
  return count;
}

module.exports = { getUserByEmail, urlsForUser, generateRandomString, createDate, sumVisits }