const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const secretKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJqb2huZG9lIiwiaWF0IjoxNjg0NDg4NjYzfQ.v2MNdqsxtYjwHnrcwno3tTc-g64u1piVdEpCsRNNz4w';

// sample user data
const users = [
  { id: 1, username: 'johndoe', password: 'samplePassword' },
];

// HTML for login page with styles
app.get('/', (req, res) => {
  res.send(`
  <html>
    <head>
      <title>JWTLogin</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f5f5f5;
        }

        .login-container {
          width: 400px;
          padding: 20px;
          border-radius: 4px;
          background-color: #CF9FFF;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        h1 {
          text-align: center;
        }

        label {
          display: block;
          margin-bottom: 8px;
        }

        input[type="text"],
        input[type="password"] {
          width: 100%;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ccc;
        }

        button[type="submit"] {
          width: 100%;
          padding: 8px;
          margin-top: 16px;
          border: none;
          border-radius: 4px;
          background-color: #5D3FD3;
          color: #ffffff;
          font-weight: bold;
          cursor: pointer;
        }

        button[type="submit"]:hover {
          background-color: #ac7fdc;
        }
        :root {
          --drop-height: 200px;
          --logo-size: 48px;
          --offset: 50px;
          --shadow-height: 8px;
        }
        
        html, body {
          height: 100%;
          width: 100%;
          margin: 0;
        }
        
        .container {
          width: 100%;
          height: 100%;
          background-color: lightgray;
          position: relative;
        }
        
        .logo {
          width: var(--logo-size);
          height: var(--logo-size);
          border-radius: 100%;
          background-color: salmon;
          
          position: absolute;
          top: var(--offset);
          left: calc(50% - var(--logo-size)/2);
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <h1>Login Page</h1>
        <form method="POST" action="/login">
          <div>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
  </html>
`);
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user by username and password
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Generate a JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, secretKey);

    // Set the token in the Authorization header and redirect to the protected endpoint
    res.set('Authorization', `Bearer ${token}`);
    res.redirect(`/protected?token=${encodeURIComponent(token)}`);
  } else {
    res.status(401).json({ alert: 'Invalid credentials' });
  }
});

app.get('/protected', authenticateToken, (req, res) => {
  // Accessible only to authenticated users
  res.json({ message: 'Protected resource accessed' });
});

// Middleware to authenticate the token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = req.query.token || (authHeader && authHeader.split(' ')[1]);

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
}

// Default route handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});