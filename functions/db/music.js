const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

/**
 * @ id로 음악 찾기
 */

const getMusicById = async (client, musicId) => {
  const { rows } = await client.query(
    `
      SELECT DISTINCT m.title, m.singer, m.cover, m.url, m.emotion_id 
      FROM music m
      WHERE m.id = $1
    `,
    [musicId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getMusicById };
