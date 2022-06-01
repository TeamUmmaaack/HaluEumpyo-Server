const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { calendarDB } = require('../../../db');
const dayjs = require('dayjs');
const locale = require('dayjs/locale/ko');
/**
 *  @route GET /calendar
 *  @desc 캘린더 전체 조회
 *  @access Private
 */

module.exports = async (req, res) => {
  const { userId } = req.user;

  //유저 아이디와 오늘 날짜 없는 경우임
  if (!userId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const calendar = await calendarDB.findDiaryByUserId(client, userId); //userId가 작성한 다이어리 모두 가져오기
    calendar.map((obj) => {
      /**
       * createdAt format 수정
       * KST = UTC + 9이므로
       * UTC 시간으로 저장된 CreatedAt에 9시간 더하기
       */
      obj.createdAt = dayjs(`${obj.createdAt}`).locale('ko').add(9, 'hour').format('YYYY-MM-DD ddd HH:mm');
    });
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_CALENDER_SUCCESS, calendar));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
