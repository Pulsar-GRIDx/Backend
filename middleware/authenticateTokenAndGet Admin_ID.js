const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const connection = require("../config/db");
const dotenv = require('dotenv');

// Configure dotenv
dotenv.config();
const environment = process.env;

function authenticateTokenAndGetAdmin_ID(req, res, next) {
  // Get the token from the request header
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Verify the token
  jwt.verify(token, environment.SECRET_KEY, (err, tokenPayload) => {
      if (err) {
          if (err.name === 'TokenExpiredError') {
              return res.status(401).json({ error: 'Unauthorized: Token has expired' });
          }
          return res.status(403).json({ error: 'Forbidden: Invalid token' });
      }

      // Extract required fields from the token payload
      const { AccessLevel } = tokenPayload;

      // Check if the required fields are present
      if (AccessLevel === undefined) {
          return res.status(403).json({ error: 'Forbidden: Missing required field AccessLevel in token payload' });
      }

      // Check if the admin has the required AccessLevel (1) to proceed
      if (AccessLevel != 1) {
          return res.status(403).json({ error: 'Forbidden: Admin not authorized to perform this action' });
      }

      // Attach the extracted fields to the request object for later use
      req.tokenPayload = { AccessLevel };

      // Move to the next middleware or route handler
      next();
  });
}
  

module.exports = authenticateTokenAndGetAdmin_ID;
