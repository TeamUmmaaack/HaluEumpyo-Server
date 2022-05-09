const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { diaryDB } = require('../../../db');
const { default: axios } = require('axios');
const { response } = require('express');

/**
 *  @route POST /diary
 *  @desc 일기 작성
 *  @access Private
 */

module.exports = async (req, res) => {
  const { userId, content } = req.body;
  let emotionId = 8;

  if (!content) return res.status(statusCode.BAD_REQUEST).send(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE);

  let client;

  const flaskResult = (content) => {
    try {
      axios
        .post('http://127.0.0.1:5000/test', { content: content })
        .then((response) => {
          console.log(response.data.emotion_id);
          emotionId = response.data.emotion_id ?? response.data.emotion_id ?? 0;
        })
        .catch((e) => {
          console.log('에러가 발생했습니다.');
          throw e;
        });
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  try {
    flaskResult(content);
    client = await db.connect(req);

    const diaryData = await diaryDB.postDiary(client, userId, content, emotionId);

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ADD_DIARY_SUCCESS, diaryData));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
