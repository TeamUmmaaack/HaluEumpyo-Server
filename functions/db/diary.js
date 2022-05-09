const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

/**
 * @일기 작성
 */

const postDiary = async (client, userId, content, emotionId) => {
  const { rows } = await client.query(
    `INSERT INTO diary (content, user_id, emotion_id, music_id)
        VALUES ($1, $2, $3, $4)
        RETURNING content, user_id, emotion_id, music_id
        `,
    [content, userId, emotionId, 1],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  postDiary,
};
