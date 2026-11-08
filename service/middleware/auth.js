const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const { users } = require('../data/store');

const authCookieName = 'token';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 1000 * 60 * 60 * 24,
};

// Find a user by username, email, or token.
async function findUser(field, value) {
  if (!value) return null;

  return users.find(
    (user) => user[field] === value
  ) || null;
}

// Create a new user.
async function createUser(username, email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    username,
    email,
    password: passwordHash,
  };

  users.push(user);

  return user;
}

// Set authentication cookie.
function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, cookieOptions);
}

function startSession(res, user) {
  user.token = uuid.v4();
  setAuthCookie(res, user.token);
}

async function endSession(req, res) {
  const user = await findUser(
    'token',
    req.cookies?.[authCookieName]
  );

  if (user) {
    delete user.token;
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
    const user = await findUser(
      'token',
      req.cookies[authCookieName]
    );

    if (!user) {
      return res.status(401).send({
        msg: 'Unauthorized',
      });
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