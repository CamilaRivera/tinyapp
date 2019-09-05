const { assert } = require('chai');
const { urlsForUser } = require('../helpers.js');
const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  c6UTx3: { longURL: "https://www.amazon.ca", userID: "camila" },
  c3BoG4: { longURL: "https://www.cnn.com", userID: "camila" }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedOutput = testUsers["userRandomID"];
    assert.deepEqual(user, expectedOutput);
  });
  it('should return undefined with an invalid email', function () {
    const user = getUserByEmail(testUsers, 'nocontent@example.com');
    assert.strictEqual(user, undefined);
  });
});

describe('urlsForUser', function () {
  it('should return the urls of the user', function () {
    const user = urlsForUser('userRandomID', urlDatabase);
    const expectedOutput = { b6UTxQ: "https://www.tsn.ca" };
    assert.deepEqual(user, expectedOutput);
  });
  it('should return {} if the user don\'t have urls', function () {
    const user = urlsForUser('testUsers', urlDatabase);
    assert.deepEqual(user, {});
  });
});
