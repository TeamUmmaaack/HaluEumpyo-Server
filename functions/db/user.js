const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getUserByFirebaseId = async (client, firebaseId) => {
  const { rows } = await client.query(
    `
    SELECT id, email, username, id_firebase FROM "user" u
    WHERE id_firebase = $1
    AND is_deleted = FALSE
    `,
    [firebaseId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const addUser = async (client, email, name, firebaseId) => {
  const { rows } = await client.query(
    `
    INSERT INTO "user" 
    (email, username, id_firebase)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `,
    [email, name, firebaseId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getUserByFirebaseId, addUser };
