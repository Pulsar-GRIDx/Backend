// // Generate a random temporary password
// function generateTemporaryPassword() {
//     const tempPassword = Math.random().toString(36).slice(-8); // Generate an 8-character alphanumeric password
//     return tempPassword;
//   }
  
//   // Send a password reset email 
//   function sendResetEmail(Email, tempPassword) {
   
//     // Send an email to the user's email address with the temporary password
//   }
  
//   // Temporary storage for reset tokens (you should use a more persistent storage in production)
//   const resetTokens = {};
  
//   // Forgot Password route
//   router.post('/forgot-password', limiter, (req, res) => {
//     const { Email } = req.body;
  
//     // Generate a unique temporary password
//     const temporaryPassword = generateTemporaryPassword();
  
//     // Generate a token with user's email and temporary password
//     const tokenPayload = { Email, temporaryPassword };
//     const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, { expiresIn: '1h' });
  
//     // Store the token and email in the temporary storage
//     resetTokens[token] = Email;
  
//     // Include the token in the reset link
//     const resetLink = `http://localhost:5173/reset-password?token=${token}`;
  
//     // Send the reset link to the user's email
//     sendResetEmail(Email, resetLink, temporaryPassword);
  
//     res.status(200).json({ message: 'Password reset link sent' });
//   });
  
//   // Reset Password route
//   router.post('/reset-password', async (req, res) => {
//     const { token, newPassword, confirm_password } = req.body;
  
//     // Check if the reset token exists and retrieve the associated email
//     const Email = resetTokens[token];
  
//     if (!Email) {
//       return res.status(401).json({ error: 'Invalid or expired token' });
//     }
  
//     // Verify the token and get the payload (including temporary password)
//     try {
//       const decoded = jwt.verify(token, process.env.SECRET_KEY);
//       const { Email: decodedEmail, temporaryPassword } = decoded;
  
//       if (decodedEmail !== Email) {
//         return res.status(401).json({ error: 'Invalid token for this email' });
//       }
  
//       // Check if newPassword and confirm_password match
//       if (newPassword !== confirm_password) {
//         return res.status(400).json({ error: 'Both New Password and Confirm Password Should Match' });
//       }
  
//       // Update the user's password with the new password
//       const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
//       // Update the user's password in the database using the email
//       const updateUserQuery = 'UPDATE users SET password = ? WHERE email = ?';
//       connection.query(updateUserQuery, [hashedNewPassword, Email], (err) => {
//         if (err) {
//           return res.status(500).json({ error: 'Password reset failed', err });
//         }
  
//         // Remove the used reset token from temporary storage
//         delete resetTokens[token];
  
//         res.status(200).json({ message: 'Password reset successful' });
//       });
//     } catch (err) {
//       return res.status(401).json({ error: 'Token verification failed' });
//     }
//   });