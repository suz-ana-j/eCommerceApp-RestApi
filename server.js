const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcryptjs'); 
const expressSession = require('express-session');
const app = express();
app.use(express.json());
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Set the port
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json()); 


// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce App API',
      version: '1.0.0',
      description: 'API documentation for the E-Commerce App',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./server.js'], // Path to your API docs (routes are in this file for this example)
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// PostgreSQL client setup
const pool = new Pool({
  user: 'your-username', // Replace with your database username
  host: 'localhost',
  database: 'ecommerce',
  password: 'your-password', // Replace with your database password
  port: 5432,
});



// Session middleware setup
app.use(expressSession({
  secret: process.env.SESSION_SECRET || 'fallbackSecret',  // Use the environment variable
  resave: false, 
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Authentication check middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Simple route for testing
app.get('/', (req, res) => {
  res.send('E-Commerce API is running!');
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 */


// Test the database connection by querying a table (like products)
app.get('/test-db', (req, res) => { // Changed the route to avoid duplicate '/'
  pool.query('SELECT * FROM products LIMIT 1', (err, result) => {
    if (err) {
      return res.status(500).send('Database query error');
    }
    res.json(result.rows);
  });
});


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 */


// Define Passport.js local strategy for login
passport.use(new LocalStrategy(
  function(username, password, done) {
    // Query database to verify username and password
    pool.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
      if (err) return done(err);

      if (result.rows.length === 0) {
        return done(null, false, { message: 'Incorrect username' });
      }

      const user = result.rows[0];

      // Assuming you have a hashed password comparison function
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return done(err);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }
        return done(null, user);
      });
    });
  }
));

// Serialize user to save their information in the session
passport.serializeUser((user, done) => {
  done(null, user.id); // Storing the user ID in the session
});

// Deserialize user to retrieve user information from the session
passport.deserializeUser((id, done) => {
  pool.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
    if (err) return done(err);
    done(null, result.rows[0]);
  });
});

// POST /login route for login functionality
app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard', // Redirect to a dashboard after successful login
  failureRedirect: '/login', // Redirect back to login if authentication fails
}));

// POST /register - User registration endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  // Check if the user already exists in the database
  const query = 'SELECT * FROM users WHERE username = $1';
  const values = [username];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      return res.status(400).send('User already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const insertQuery = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
    const insertValues = [username, hashedPassword];
    
    const insertResult = await pool.query(insertQuery, insertValues);
    const newUser = insertResult.rows[0];

    // Respond with the new user (excluding the password)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
    
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get all users (Authenticated users only)
app.get('/users', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows); // Send user data
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 */

// Get user details by user ID (Authenticated users only)
app.get('/users/:id', (req, res) => {
  const { id } = req.params;

  // Ensure the user is logged in and is accessing their own account
  if (!req.user || req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  pool.query('SELECT id, username FROM users WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 */

// Update user details (Authenticated users only)
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  // Ensure the user is logged in and is updating their own account
  if (!req.user || req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  const updateFields = [];
  const updateValues = [];

  if (username) {
    updateFields.push('username = $' + (updateValues.length + 1));
    updateValues.push(username);
  }
  if (password) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: 'Password hashing error' });
      updateFields.push('password = $' + (updateValues.length + 1));
      updateValues.push(hashedPassword);

      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${updateValues.length + 1} RETURNING id, username`;
      updateValues.push(id);

      pool.query(query, updateValues, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database query error' });
        }
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
      });
    });
    return;
  }

  // If no password is provided, update the username
  const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${updateValues.length + 1} RETURNING id, username`;
  updateValues.push(id);

  pool.query(query, updateValues, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  });
});



// Product Endpoints

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


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 */


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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 */


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



// Cart Endpoints

// Create a new cart
app.post('/cart', async (req, res) => {
  try {
      const { user_id } = req.body;
      const newCart = await pool.query(
          'INSERT INTO cart (user_id) VALUES ($1) RETURNING *',
          [user_id]
      );
      res.json(newCart.rows[0]);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// Add a product to an existing cart
app.post('/cart/:cartId', async (req, res) => {
  try {
      const { cartId } = req.params;
      const { product_id, quantity } = req.body;
      
      // Check if cart exists
      const cartExists = await pool.query('SELECT * FROM cart WHERE cart_id = $1', [cartId]);
      if (cartExists.rows.length === 0) {
          return res.status(404).json({ error: 'Cart not found' });
      }

      const addProduct = await pool.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
          [cartId, product_id, quantity]
      );
      res.json(addProduct.rows[0]);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// Get cart details
app.get('/cart/:cartId', async (req, res) => {
  try {
      const { cartId } = req.params;
      
      const cartItems = await pool.query(
          `SELECT ci.cart_id, ci.product_id, ci.quantity, p.name, p.price 
           FROM cart_items ci 
           JOIN products p ON ci.product_id = p.product_id 
           WHERE ci.cart_id = $1`,
          [cartId]
      );
      
      if (cartItems.rows.length === 0) {
          return res.status(404).json({ error: 'Cart not found or empty' });
      }
      
      res.json(cartItems.rows);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 */



// Checkout Endpoint

app.post('/cart/:cartId/checkout', async (req, res) => {
  const { cartId } = req.params;

  try {
      // Validate the cart
      const cart = await pool.query(
          'SELECT * FROM carts WHERE id = $1',
          [cartId]
      );

      if (cart.rows.length === 0) {
          return res.status(404).json({ error: 'Cart not found' });
      }

      // Check if the cart has any items
      const cartItems = await pool.query(
          'SELECT * FROM cart_items WHERE cart_id = $1',
          [cartId]
      );

      if (cartItems.rows.length === 0) {
          return res.status(400).json({ error: 'Cart is empty' });
      }

      // Simulate payment processing (assuming success)
      const paymentSuccessful = true; // Placeholder logic
      if (!paymentSuccessful) {
          return res.status(400).json({ error: 'Payment failed' });
      }

      // Create a new order
      const order = await pool.query(
          'INSERT INTO orders (cart_id, status) VALUES ($1, $2) RETURNING *',
          [cartId, 'completed']
      );

      // Clear the cart after successful checkout
      await pool.query(
          'DELETE FROM cart_items WHERE cart_id = $1',
          [cartId]
      );

      return res.status(200).json({ message: 'Checkout successful', order: order.rows[0] });

  } catch (error) {
      console.error('Error during checkout:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});




// Order Endpoints

// Get all orders
app.get('/orders', async (req, res) => {
  try {
      const orders = await pool.query('SELECT * FROM orders');
      res.status(200).json(orders.rows);
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 */

// Get a specific order by ID
app.get('/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
      const order = await pool.query(
          'SELECT * FROM orders WHERE id = $1',
          [orderId]
      );

      if (order.rows.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
      }

      res.status(200).json(order.rows[0]);
  } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 */




// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});