// Import express
const express = require('express');
const app = express();

// Set the port
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Simple route for testing
app.get('/', (req, res) => {
  res.send('E-Commerce API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
