const fetch = require("node-fetch")

const HASURA_OPERATION = `
mutation insertUser($username:String, $password:String) {
  insert_user(objects: {username: $username, password: $password}) {
    affected_rows
  }
}
`;

// execute the parent mutation in Hasura
const execute = async (variables, reqHeaders) => {
  const fetchResponse = await fetch(
    "http://localhost:8080/v1/graphql",
    {
      method: 'POST',
      headers: reqHeaders || {},
      body: JSON.stringify({
        query: HASURA_OPERATION,
        variables
      })
    }
  );
  return await fetchResponse.json();
};
  

// Request Handler
const handler = async (req, res) => {

  // get request input
  const { username, password } = req.body.input;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ username, password }, req.headers);

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json({
      message: errors.message
    })
  }

  // success
  return res.json({
    ...data.insert_user
  })

}

module.exports = handler;