const functions = require('firebase-functions');
const { signInWithEmailAndPassword } = require('firebase/auth');
const admin = require('firebase-admin');
const { success, fail } = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const { firebaseAuth } = require('../../../config/firebaseConfig');
const jwtHandlers = require('../../../lib/jwtHandlers');

/**
 *  @route POST /auth/signin
 *  @desc 기존 유저 로그인
 *  @access Public
 */

module.exports = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(statusCode.BAD_REQUEST).send(fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const userFirebase = await signInWithEmailAndPassword(firebaseAuth, email, password)
      .then((user) => user)
      .catch((e) => {
        console.log(e);
        return { err: true, error: e };
      });

    if (userFirebase.err) {
      if (userFirebase.error.code === 'auth/user-not-found') {
        return res.status(statusCode.NOT_FOUND).send(fail(statusCode.NOT_FOUND, responseMessage.NO_USER));
      }
      if (userFirebase.error.code === 'auth/invalid-email') {
        return res.status(statusCode.NOT_FOUND).send(fail(statusCode.NOT_FOUND, responseMessage.INVALID_EMAIL));
      }
      if (userFirebase.error.code === 'auth/wrong-password') {
        return res.status(statusCode.NOT_FOUND).send(fail(statusCode.NOT_FOUND, responseMessage.MISS_MATCH_PW));
      }
      return res.status(statusCode.INTERNAL_SERVER_ERROR).send(fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    }

    const firebaseId = userFirebase.user.uid;
    const existedUser = await userDB.getUserByFirebaseId(client, firebaseId);

    if (!existedUser || existedUser.isDeleted) {
      return res.status(statusCode.OK).send(success(statusCode.OK, responseMessage.NO_USER));
    }

    const refreshToken = jwtHandlers.signRefresh();
    const user = await userDB.updateRefreshToken(client, existedUser.id, refreshToken);
    const accessToken = jwtHandlers.sign({ id: existedUser.id, email: existedUser.email, idFirebase: existedUser.idFirebase });
    const username = existedUser.username;
    res.status(statusCode.OK).send(success(statusCode.OK, responseMessage.LOGIN_SUCCESS, { username, accessToken, refreshToken }));
  } catch (error) {
    functions.logger.error(`[LOGIN ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] email: ${email} ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
