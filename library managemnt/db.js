const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: "postgresql://akshatc:Pass123@localhost:5432/sis"
});

module.exports = pool;