const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const DB = require('../database');

const authCookieName = 'token';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 1000 * 60 * 60 * 24,
};

// Find a user by username, email, or token.
async function findUser(field, value) {
  return DB.getUserByField(field, value);
}

// Create a new user in MongoDB.
async function createUser(username, email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    username,
    email,
    password: passwordHash,
  };

  await DB.addUser(user);
  return user;
}

// Set authentication cookie.
function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, cookieOptions);
}

async function startSession(res, user) {
  const token = uuid.v4();
  user.token = token;
  await DB.updateUserToken(user.username, token);
  setAuthCookie(res, token);
}

async function endSession(req, res) {
  const user = await findUser('token', req.cookies?.[authCookieName]);

  if (user) {
    await DB.updateUserToken(user.username, null);
  }

  res.clearCookie(authCookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

// Protect endpoints.
async function verifyAuth(req, res, next) {
  try {
    const user = await findUser('token', req.cookies?.[authCookieName]);

    if (!user) {
      return res.status(401).send({ msg: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authCookieName,
  cookieOptions,
  findUser,
  createUser,
  setAuthCookie,
  startSession,
  endSession,
  verifyAuth,
};