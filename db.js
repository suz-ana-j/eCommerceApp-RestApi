const { Pool } = require('pg'); // Use require instead of import

// Set up the database connection
const pool = new Pool({
  user: 'your_db_user', // replace with your PostgreSQL username
  host: 'localhost',
  database: 'your_db_name', // replace with your database name
  password: 'your_db_password', // replace with your PostgreSQL password
  port: 5432, // default PostgreSQL port
});

// Connect to the database
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch((err) => console.error('Database connection error:', err));

// Export pool for use in other files
module.exports = pool;

