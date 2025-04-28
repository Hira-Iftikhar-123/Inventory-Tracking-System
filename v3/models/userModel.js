const {pool} = require('../db/db');

async function createUser(userName, userPassword) 
{
  const result = await pool.query('insert into users (username, userpassword) values ($1, $2) returning *', [userName, userPassword]);
  return result.rows[0];
}

async function getUserById(userId) 
{
  const result = await pool.query('select * from users where userid = $1', [userId]);
  return result.rows[0];
}

async function getUserByUserName(userName) 
{
  const result = await pool.query('select * from users where username = $1', [userName]);
  return result.rows[0];
}

module.exports = {createUser, getUserById, getUserByUserName};