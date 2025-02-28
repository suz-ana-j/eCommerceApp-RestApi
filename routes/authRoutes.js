// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("../models"); // Assuming you have a Sequelize User model
const jwt = require("jsonwebtoken"); // For JWT authentication
const passport = require("passport");
const router = express.Router();

// POST /api/auth/register - User Registration
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user to the database
    const newUser = await User.create({
      username,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering user" });
  }
});

// POST /api/auth/login - User Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    // Find user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Google login route
router.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));

// Google callback route
router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
  res.redirect("/home"); // Redirect to the home page after successful login
});

// Facebook login route
router.get("/auth/facebook", passport.authenticate("facebook"));

// Facebook callback route
router.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
  res.redirect("/home"); // Redirect to the home page after successful login
});

module.exports = router;

