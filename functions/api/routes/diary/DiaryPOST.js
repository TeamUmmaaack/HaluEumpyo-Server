const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { diaryDB, musicDB } = require('../../../db');
const axios = require('axios');
const { response } = require('express');

/**
 *  @route POST /diary
 *  @desc 일기 작성
 *  @access Private
 */

module.exports = async (req, res) => {
  const { userId, content } = req.body;
  let emotionId,
    musicId = -1;

  if (!content) return res.status(statusCode.BAD_REQUEST).send(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE);

  let client;

  const flaskResult = async (content) => {
    try {
      await axios
        .post('http://34.64.56.193:5000/emotion', { content: content })
        .then((response) => {
          console.log(response.data);
          emotionId = response.data.emotion;
          musicId = response.data.musicId;
          return;
        })
        .catch((e) => {
          console.log('에러가 발생했습니다.');
          console.log(e.response);
        });
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  try {
    await flaskResult(content);
    client = await db.connect(req);

    const diaryData = await diaryDB.postDiary(client, userId, content, emotionId, musicId);
    const musicData = await musicDB.getMusicById(client, musicId);

    return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ADD_DIARY_SUCCESS, musicData));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
