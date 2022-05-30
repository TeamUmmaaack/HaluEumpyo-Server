const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { success, fail } = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers.js');

/**
 *  @route POST /auth/signup
 *  @desc 신규 회원 가입
 *  @access Public
 */

module.exports = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) return res.status(statusCode.BAD_REQUEST).send(fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const userFirebase = await admin
      .auth()
      .createUser({ email, password, username })
      .then((user) => user)
      .catch((e) => {
        console.log(e);
        return { err: true, error: e };
      });

    if (userFirebase.err) {
      if (userFirebase.error.code === 'auth/email-already-exists') {
        return res.status(statusCode.NOT_FOUND).send(fail(statusCode.NOT_FOUND, responseMessage.ALREADY_EMAIL));
      }
      if (userFirebase.error.code === 'auth/invalid-email') {
        return res.status(statusCode.NOT_FOUND).send(fail(statusCode.NOT_FOUND, responseMessage.INVALID_EMAIL));
      }
      if (userFirebase.error.code === 'auth/invalid-password') {
        return res.status(statusCode.NOT_FOUND).send(fail(statusCode.NOT_FOUND, responseMessage.INVALID_PASSWORD));
      }
      return res.status(statusCode.INTERNAL_SERVER_ERROR).send(fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    }

    const firebaseId = userFirebase.uid;
    const user = await userDB.addUser(client, email, username, firebaseId);
    const accessToken = jwtHandlers.sign({ id: user.id, email: user.email, idFirebase: user.idFirebase });
    const refreshToken = jwtHandlers.signRefresh();

    res.status(statusCode.CREATED).send(success(statusCode.CREATED, responseMessage.CREATED_USER, { email, username, accessToken, refreshToken }));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
