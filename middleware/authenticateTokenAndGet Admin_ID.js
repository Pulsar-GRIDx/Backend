const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const connection = require("../db");
const dotenv = require('dotenv');

// Configure dotenv
dotenv.config();
const environment = process.env;

// Middleware to verify the token and extract MeterDRN
function authenticateTokenAndGetAdmin_ID(req, res, next) {
    // Get the token from the request header
    const token = req.header('Authorization');
  
    // Check if the token is present
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }
  
    // Verify the token
jwt.verify(token, environment.SECRET_KEY, (err, tokenPayload) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
  
    // Extract required fields from the token payload
    // Extract required fields from the token payload
const { AccessLevel } = tokenPayload;

  
//     // Log the AccessLevel for debugging
//     console.log('AccessLevel:', AccessLevel);
  
    // // // Check if the required fields are present
    if (!AccessLevel) {
      return res.status(403).json({ error: 'Forbidden: Missing required field AccessLevel in token payload' });
    }
  
    // // Check if the admin has the required AccessLevel (1) to proceed
    if (AccessLevel != 1) {
        console.log('Admin AccessLevel not authorized:', AccessLevel);
        return res.status(403).json({ error: 'Forbidden: Admin not authorized to perform this action' });
      }
      
  
    // Attach the extracted fields to the request object for later use
    req.tokenPayload = { AccessLevel };
  
    // Move to the next middleware or route handler
    next();
  });
  
  }
  

module.exports = authenticateTokenAndGetAdmin_ID;
