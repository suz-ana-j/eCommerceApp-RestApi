// Import express and JSON middleware
const express = require('express');
const pool = require('./db'); 
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
app.get('/test-db', (req, res) => { // Changed the route to avoid duplicate '/'
  pool.query('SELECT * FROM products LIMIT 1', (err, result) => {
    if (err) {
      return res.status(500).send('Database query error');
    }
    res.json(result.rows);
  });
});

// Get all products 
app.get('/products', (req, res) => {
  const { category } = req.query;
  
  let query = 'SELECT * FROM products';
  let queryParams = [];

  if (category) {
    query += ' WHERE category_id = $1';
    queryParams = [category];
  }

  pool.query(query, queryParams, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(result.rows);
  });
});

// Get a single product by its ID
app.get('/products/:id', (req, res) => {
  const { id } = req.params;

  pool.query('SELECT * FROM products WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  });
});

// Create a new product (admin only)
app.post('/products', (req, res) => {
  const { name, description, price, category_id } = req.body;

  // Check if required fields are present
  if (!name || !description || !price || !category_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  pool.query(
    'INSERT INTO products (name, description, price, category_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, description, price, category_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database query error' });
      }
      res.status(201).json(result.rows[0]);
    }
  );
});

// Update an existing product (admin only)
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id } = req.body;

  // Check if at least one field is provided for update
  if (!name && !description && !price && !category_id) {
    return res.status(400).json({ error: 'At least one field must be provided' });
  }

  const updateFields = [];
  const updateValues = [];
  
  if (name) {
    updateFields.push('name = $' + (updateValues.length + 1));
    updateValues.push(name);
  }
  if (description) {
    updateFields.push('description = $' + (updateValues.length + 1));
    updateValues.push(description);
  }
  if (price) {
    updateFields.push('price = $' + (updateValues.length + 1));
    updateValues.push(price);
  }
  if (category_id) {
    updateFields.push('category_id = $' + (updateValues.length + 1));
    updateValues.push(category_id);
  }

  const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${updateValues.length + 1} RETURNING *`;

  updateValues.push(id);

  pool.query(query, updateValues, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  });
});

// Delete a product (admin only)
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;

  pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).send();
  });
});




// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

