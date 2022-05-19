const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

/**
 * @캘린더 불러오기
 */

const getCalendar = async (client, userId, startDate, endDate) => {
  const { rows } = await client.query(
    `
      SELECT *
      FROM diary
      WHERE user_id = $1 
      AND created_at BETWEEN $2 AND $3
      ORDER BY created_at
    `,
    [userId, startDate, endDate],
  );
  return convertSnakeToCamel.keysToCamel(rows); //전체 리스트를 가져오고싶어서 rows
};

module.exports = { getCalendar };
