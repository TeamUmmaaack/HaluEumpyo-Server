const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { calendarDB } = require('../../../db');
const dayjs = require('dayjs');

module.exports = async (req, res) => {
  const { userId } = req.params;
  const { date } = req.query;

  //유저 아이디와 오늘 날짜 없는 경우임
  if (!userId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  if (!date) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  // 오늘 날짜를 기준으로 월 시작과 마지막 검색
  const startDate = dayjs(date).startOf('month').format('YYYY-MM-DD');
  const endDate = dayjs(date).endOf('month').format('YYYY-MM-DD');

  try {
    client = await db.connect(req);

    const calendar = await calendarDB.getCalendar(client, userId, startDate, endDate); //userId, startDate, endDate를 통해 기간 내에 속한 캘린더 디비에서 가져옴
    calendar.map((obj) => {
      /**
       * createdAt format 수정
       */
      obj.createdAt = dayjs(`${obj.createdAt}`).format('YYYY-MM-DD ddd HH:mm');
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
