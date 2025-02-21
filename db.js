const { Pool } = require('pg'); // Use require instead of import

// Set up the database connection
const pool = new Pool({
  user: 'postgres', 
  host: 'localhost',
  database: 'your_db_nameeCommerceAppRest-Api', 
  password: 'postgres', 
  port: 5432, // default PostgreSQL port
});

// Connect to the database
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch((err) => console.error('Database connection error:', err));

// Export pool for use in other files
module.exports = pool;

