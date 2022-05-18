const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { calendarDB } = require('../../../db');
const { default: axios } = require('axios');
const { response } = require('express');



module.exports = async (req, res) => {
  const { userId } = req.params;
  //유저 아이디가 없는 경우임
if (!userId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const calendar = await calendarDB.getCalendar(client, userId);  //userId를 통해 캘린더 디비에서 가져옴
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_CALENDER_SUCCESS, calendar));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
