const bcrypt = require('bcryptjs');


const users = [
  {
    id: 1,
    username: "admin",
    passwordHash: bcrypt.hashSync("admin123", 10)
  }
];

module.exports = users;