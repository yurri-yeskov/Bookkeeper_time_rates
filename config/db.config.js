module.exports = {
    HOST: process.env.POSTGRESQL_DB_HOST,
    USER: process.env.POSTGRESQL_DB_USER,
    PASSWORD: process.env.POSTGRESQL_DB_PASSWORD,
    DB_NAME: process.env.POSTGRESQL_DB_NAME,
    dialect: "postgres"
};