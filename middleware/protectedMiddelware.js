// Protected router
// router.get('/protected', authenticateToken, (req, res) => {
//     res.json({ message: 'Protected resource accessed' });
//   });
  
//   function authenticateToken(req, res, next) {
//     // Get the token from the request headers
//     const token = req.headers['authorization'];
  
//     if (!token) {
//       return res.status(401).json({ error: 'Unauthorized: Token missing' });
//     }
  
//     // Remove 'Bearer ' prefix from token
//     const tokenString = token.split(' ')[1];
  
//     jwt.verify(tokenString, environment.SECRET_KEY, (err, user) => {
//       if (err) {
//         return res.status(403).json({ error: 'Forbidden: Invalid token' });
//       }
  
//       req.user = user;
//       next();
//     });
//   }
  