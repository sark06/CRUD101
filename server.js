const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Use bodyParser middleware to parse JSON requests
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Path to the JSON file where user data will be stored
const usersFilePath = path.join(__dirname, 'users.json');

// Helper function to read the JSON file
const readUsersFromFile = () => {
  const data = fs.readFileSync(usersFilePath);
  return JSON.parse(data);
};

// Helper function to write to the JSON file
const writeUsersToFile = (data) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
};

// Route for serving the signin page (signin.html)
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

// Route for serving the signup page (signup.html)
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Route for handling sign-in (User/Admin)
app.post('/signin', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required!');
  }

  const users = readUsersFromFile();
  const user = users.find(user => user.username === username && user.password === password);

  if (!user) {
    return res.status(401).send('Invalid username or password!');
  }

  // Return the user data including the role
  res.status(200).json({ role: user.role, username: user.username });
});

// Route for serving the user dashboard (user.html)
app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

// Route for serving the admin dashboard (admin.html)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Route for signing up (User/Admin)
app.post('/signup', (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).send('All fields are required!');
  }

  const users = readUsersFromFile();
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password,
    role
  };

  users.push(newUser);
  writeUsersToFile(users);

  res.status(201).send('User registered successfully!');
});

// Route for updating user details (User only)
app.put('/user/update/:id', (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  const users = readUsersFromFile();
  const userIndex = users.findIndex(user => user.id == id);

  if (userIndex === -1) {
    return res.status(404).send('User not found');
  }

  const updatedUser = {
    ...users[userIndex],
    username: username || users[userIndex].username,
    email: email || users[userIndex].email,
    password: password || users[userIndex].password
  };

  users[userIndex] = updatedUser;
  writeUsersToFile(users);

  res.status(200).send('User details updated successfully');
});

// Route for deleting a user (User only)
app.delete('/user/delete/:id', (req, res) => {
  const { id } = req.params;

  const users = readUsersFromFile();
  const userIndex = users.findIndex(user => user.id == id);

  if (userIndex === -1) {
    return res.status(404).send('User not found');
  }

  users.splice(userIndex, 1);
  writeUsersToFile(users);

  res.status(200).send('User deleted successfully');
});

// Route for admin to view all users
app.get('/admin/users', (req, res) => {
  const users = readUsersFromFile();
  const adminUser = users.find(user => user.role === 'Admin');

  if (!adminUser) {
    return res.status(403).send('No admin found');
  }

  res.status(200).json(users);
});

// Route for admin to update any user's details
app.put('/admin/update/:id', (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  const users = readUsersFromFile();
  const userIndex = users.findIndex(user => user.id == id);

  if (userIndex === -1) {
    return res.status(404).send('User not found');
  }

  const updatedUser = {
    ...users[userIndex],
    username: username || users[userIndex].username,
    email: email || users[userIndex].email,
    password: password || users[userIndex].password
  };

  users[userIndex] = updatedUser;
  writeUsersToFile(users);

  res.status(200).send('User details updated by admin');
});

// Route for admin to delete any user
app.delete('/admin/delete/:id', (req, res) => {
  const { id } = req.params;

  const users = readUsersFromFile();
  const userIndex = users.findIndex(user => user.id == id);

  if (userIndex === -1) {
    return res.status(404).send('User not found');
  }

  users.splice(userIndex, 1);
  writeUsersToFile(users);

  res.status(200).send('User deleted by admin');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
