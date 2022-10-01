const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { diaryDB, musicDB, calendarDB } = require('../../../db');
const axios = require('axios');
const dayjs = require('dayjs');
require('dayjs/locale/ko');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.locale('ko');

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 *  @route POST /diary
 *  @desc 일기 작성
 *  @access Private
 */

module.exports = async (req, res) => {
  const { userId } = req.user;
  const { content } = req.body;
  let emotionId,
    recommendedMusicId = -1;
  let similarMusicsIds = [];

  const startDate = dayjs().tz('Asia/Seoul').startOf('day').subtract(9, 'hour').format('YYYY-MM-DD HH:mm:ss');
  const endDate = dayjs().tz('Asia/Seoul').endOf('day').subtract(9, 'hour').format('YYYY-MM-DD HH:mm:ss');

  if (!content) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  const flaskResult = async (content) => {
    try {
      await axios
        .post('http://34.64.40.173:5000/emotion', { content: content })
        .then((response) => {
          console.log(response.data);
          emotionId = response.data.emotion;
          recommendedMusicId = response.data.recommended_music;
          similarMusicsIds = response.data.similar_musics;
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
    client = await db.connect(req);
    // 중복 일기 검사
    let flag = true;
    const userDiary = await calendarDB.getCalendar(client, userId, startDate, endDate);
    if (userDiary?.length) {
      console.log(userDiary);
      // 이미 작성된 일기가 있다면
      flag = false;
    }

    if (flag) {
      // 유저가 해당 날짜에 일기를 작성하지 않을 경우
      await flaskResult(content);
      const similarMusicData = [];

      await diaryDB.postDiary(client, userId, content, emotionId, recommendedMusicId);
      const recommendedMusicData = await musicDB.getMusicById(client, recommendedMusicId);
      for (const similarMusicId of similarMusicsIds) {
        const similarMusic = await musicDB.getMusicById(client, similarMusicId);
        similarMusicData.push(similarMusic[0]);
      }

      const responseData = {
        recommendedMusic: recommendedMusicData,
        similarMusics: similarMusicData,
      };

      return res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ADD_DIARY_SUCCESS, responseData));
    } else {
      res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.DUPLICATE_DIARY));
    }
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
