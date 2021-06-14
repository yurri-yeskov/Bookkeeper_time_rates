const dbConfig = require("../config/db.config");
const {Client} = require('pg');

// const client = new Client ({
//     user: dbConfig.USER,
//     host: dbConfig.HOST,
//     database: dbConfig.DB_NAME,
//     password: dbConfig.PASSWORD,
//     port: 5732,
// });

const client = new Client ({
    user: "postgres",
    host: "localhost",
    database: "dvdrental",
    password: "~!@`12",
    port: 5732,
});

client.connect();

module.exports = client;

