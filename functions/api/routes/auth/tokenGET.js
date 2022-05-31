const functions = require('firebase-functions');
const admin = require('firebase-admin');
const util = require('../../../lib/util');
const { success, fail } = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const { TOKEN_INVALID, TOKEN_EXPIRED } = require('../../../constants/jwt');
const db = require('../../../db/db');
const { userDB } = require('../../../db');
const jwtHandlers = require('../../../lib/jwtHandlers.js');

/**
 *  @route POST /auth/token
 *  @desc 토큰 재발급
 *  @access Public
 */

module.exports = async (req, res) => {
  const accessToken = req.header('x-access-token');
  const refreshToken = req.header('x-refresh-token');

  if (!accessToken || !refreshToken) return res.status(statusCode.BAD_REQUEST).send(fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const decoded = jwtHandlers.verify(accessToken);

    if (decoded === TOKEN_INVALID) return res.status(statusCode.UNAUTHORIZED).send(fail(statusCode.UNAUTHORIZED, responseMessage.INVALID_TOKEN));
    if (decoded === TOKEN_EXPIRED) {
      const decodedToken = jwtHandlers.verify(refreshToken);

      if (decodedToken === TOKEN_EXPIRED) {
        // 토큰 만료
        return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_EXPIRED));
      }
      if (decodedToken === TOKEN_INVALID) {
        // 유효하지 않은 토큰
        return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));
      }

      const user = await userDB.getUserByRefreshToken(client, refreshToken);
      // DB user 테이블의 RefreshToken과 유저에게 받아온 RefreshToken 비교
      if (refreshToken == user.refreshToken) {
        const newAccessToken = jwtHandlers.sign(user);
        const newRefreshToken = jwtHandlers.signRefresh();
        await userDB.updateRefreshToken(client, user.id, newRefreshToken);
        const reissuedTokens = {
          accessToken: newAccessToken,
          newRefreshToken: newRefreshToken,
        };
        res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.TOKEN_REISSUE_SUCCESS, reissuedTokens));
      } else {
        // refresh token 불일치. 강제 로그아웃시킵니다.
        return res.status(statusCode.UNAUTHORIZED).send(util.fail(statusCode.UNAUTHORIZED, responseMessage.TOKEN_INVALID));
      }
    } else {
      res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.TOKEN_STILL_VALID));
    }
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
