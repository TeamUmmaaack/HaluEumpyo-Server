const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

/**
 * @캘린더 불러오기
 */

const getCalendar = async (client, userId, startDate, endDate) => {
  const { rows } = await client.query(
    `SELECT DISTINCT d.id, 
    d.content,
    d.emotion_id,
    m.title,
    m.singer,
    m.cover,
    m.url,
    d.created_at
    FROM diary AS d
    LEFT OUTER JOIN music as m ON d.music_id = m.id 
    WHERE d.user_id = $1
    AND d.created_at BETWEEN $2 AND $3
    ORDER BY d.created_at
  `,
    [userId, startDate, endDate],
  );
  return convertSnakeToCamel.keysToCamel(rows); //전체 리스트를 가져오고싶어서 rows
};

/**
 * @전체 일기 모두 가져오기
 */

const findDiaryByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `SELECT DISTINCT d.id, 
    d.content,
    d.emotion_id,
    m.title,
    m.singer,
    m.cover,
    m.url,
    d.created_at
    FROM diary AS d
    LEFT OUTER JOIN music as m ON d.music_id = m.id 
    WHERE d.user_id = $1
    ORDER BY d.created_at
  `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getCalendar, findDiaryByUserId };
