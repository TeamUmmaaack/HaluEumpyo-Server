const { refreshToken } = require('firebase-admin/app');
const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getUserById = async (client, userId) => {
  const { rows } = await client.query(
    `
      SELECT * FROM "user"
      WHERE id = $1
      `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserByRefreshToken = async (client, refreshToken) => {
  const { rows } = await client.query(
    `
    SELECT * from "user" u
    WHERE refresh_token = $1
    AND is_deleted = FALSE
    `,
    [refreshToken],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

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

const addUser = async (client, email, name, firebaseId, refreshToken) => {
  const { rows } = await client.query(
    `
    INSERT INTO "user" 
    (email, username, id_firebase, refresh_token)
    VALUES
    ($1, $2, $3, $4)
    RETURNING *
    `,
    [email, name, firebaseId, refreshToken],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateRefreshToken = async (client, userId, newRefreshToken) => {
  const { rows } = await client.query(
    `
      UPDATE "user"
      SET refresh_token = $2 
      WHERE id = $1
      AND is_deleted = FALSE
      RETURNING *
      `,
    [userId, newRefreshToken],
  );
};

module.exports = { getUserById, getUserByFirebaseId, getUserByRefreshToken, addUser, updateRefreshToken };
