const fetch = require('node-fetch');
const bcrypt = require('bcrypt');

module.exports = async function(context, req) {
  const HASURA_OPERATION = `
    mutation insertUser($username:String, $password:String) {
      insert_user(objects: {username: $username, password: $password}) {
        affected_rows
      }
    }
    `;

  const execute = async (variables, reqHeaders) => {
    const fetchResponse = await fetch('http://localhost:8080/v1/graphql', {
      method: 'POST',
      headers: reqHeaders || {},
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      })
    });
    return await fetchResponse.json();
  };

  const { username, password } = req.body.input;

  const hashedPassword = await hashPassword(password);

  const { data, errors } = await execute(
    { username, password: hashedPassword },
    req.headers
  );

  if (errors) {
    context.res = {
      status: 400,
      message: errors.message
    };
  } else {
    context.res = {
      body: { ...data.insert_user },
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};

async function hashPassword(password) {
  const saltRounds = 10;

  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function(err, hash) {
      if (err) reject(err);
      resolve(hash);
    });
  });

  return hashedPassword;
}