const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('startup');

const userCollection = db.collection('user');
const entryCollection = db.collection('entry');
const favoriteCollection = db.collection('favorite');
const friendCollection = db.collection('friend');

// Verify connection on server startup
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log('Connected to database');
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

// --- User Functions ---
function getUserByField(field, value) {
  if (!value) return null;
  return userCollection.findOne({ [field]: value });
}

async function addUser(user) {
  await userCollection.insertOne(user);
  return user;
}

async function updateUserToken(username, token) {
  if (token) {
    await userCollection.updateOne({ username }, { $set: { token } });
  } else {
    await userCollection.updateOne({ username }, { $unset: { token: '' } });
  }
}

// --- Application Data Functions ---
async function getEntries(username) {
  return entryCollection.find({ username }).sort({ createdAt: -1 }).toArray();
}

async function addEntry(entry) {
  await entryCollection.insertOne(entry);
  return entry;
}

async function deleteEntry(id, username) {
  return entryCollection.deleteOne({ id, username });
}

async function getFavorites(username) {
  return favoriteCollection.find({ username }).toArray();
}

async function addFavorite(favorite) {
  await favoriteCollection.insertOne(favorite);
  return favorite;
}

async function removeFavorite(id, username) {
  return favoriteCollection.deleteOne({ id, username });
}

async function getFriends(username) {
  return friendCollection.find({ username }).toArray();
}

async function addFriend(friend) {
  await friendCollection.insertOne(friend);
  return friend;
}

async function removeFriend(friendUsername, username) {
  return friendCollection.deleteOne({ friendUsername, username });
}

module.exports = {
  getUserByField,
  addUser,
  updateUserToken,
  getEntries,
  addEntry,
  deleteEntry,
  getFavorites,
  addFavorite,
  removeFavorite,
  getFriends,
  addFriend,
  removeFriend,
};