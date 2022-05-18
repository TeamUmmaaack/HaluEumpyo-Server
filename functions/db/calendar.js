const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

/**
 * @캘린더 불러오기
 */


  const getCalendar = async (client, userId) => {
    const { rows } = await client.query(
      `
      SELECT * FROM "diary" 
      WHERE user_id = $1
      `,
      [userId], 
    );
    return convertSnakeToCamel.keysToCamel(rows);  //전체 리스트를 가져오고싶어서 rows
  };

  module.exports = { getCalendar};