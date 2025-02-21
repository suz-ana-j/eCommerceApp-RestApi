// Import express and JSON middleware
import express from 'express';
import pool from './db'; 
const app = express();

// Set the port
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json()); 

// Simple route for testing
app.get('/', (req, res) => {
  res.send('E-Commerce API is running!');
});

// Test the database connection by querying a table (like products)
app.get('/test-db', (req, res) => { 
  pool.query('SELECT * FROM products LIMIT 1', (err, result) => {
    if (err) {
      return res.status(500).send('Database query error');
    }
    res.json(result.rows);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
