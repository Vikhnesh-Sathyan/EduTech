const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Parse application/json

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'edutech'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        throw err;
    }
    console.log('Database connected!');
});

// Teacher Sign-Up
app.post('/api/teacher-signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validate passwords
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL query to insert a new teacher
        const sql = 'INSERT INTO teachers (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Database error during teacher sign-up:', err);
                return res.status(500).send('Server error');
            }
            res.send('Sign-up successful');
        });
    } catch (error) {
        console.error('Error during teacher sign-up:', error);
        res.status(500).send('Server error');
    }
});

// Teacher Sign-In
app.post('/api/teacher-signin', async (req, res) => {
    const { email, password } = req.body;

    // SQL query to fetch teacher by email
    const sql = 'SELECT * FROM teachers WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Database error during teacher sign-in:', err);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            const teacher = results[0];
            const match = await bcrypt.compare(password, teacher.password);
            if (match) {
                // Send a success response with user data
                res.json({
                    user: {
                        id: teacher.id,
                        username: teacher.username,
                        email: teacher.email
                    },
                    redirectUrl: '/t-dashboard' // Add redirect URL
                });
            } else {
                res.status(401).send('Incorrect password');
            }
        } else {
            res.status(404).send('Teacher not found');
        }
    });
});

// Handle Student Sign-Up
app.post('/api/student-signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validate passwords
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL query to insert a new student
        const sql = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Database error during student sign-up:', err);
                return res.status(500).send('Server error');
            }
            res.send('Sign-up successful');
        });
    } catch (error) {
        console.error('Error during student sign-up:', error);
        res.status(500).send('Server error');
    }
});

// Handle Student Sign-In
app.post('/api/student-signin', async (req, res) => {
    const { email, password } = req.body;

    // SQL query to fetch student by email
    const sql = 'SELECT * FROM user WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Database error during student sign-in:', err);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            const student = results[0];
            const match = await bcrypt.compare(password, student.password);
            if (match) {
                res.json({
                    user: {
                        id: student.id,
                        username: student.username,
                        email: student.email
                    }
                });
            } else {
                res.status(401).send('Incorrect password');
            }
        } else {
            res.status(404).send('Student not found');
        }
    });
});

// Parent Sign-Up
app.post('/api/parent-signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validate passwords
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // SQL query to insert a new parent
        const sql = 'INSERT INTO parents (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Database error during parent sign-up:', err);
                return res.status(500).send('Server error');
            }
            res.send('Sign-up successful');
        });
    } catch (error) {
        console.error('Error during parent sign-up:', error);
        res.status(500).send('Server error');
    }
});

// Parent Sign-In
app.post('/api/parent-signin', async (req, res) => {
    const { email, password } = req.body;

    // SQL query to fetch parent by email
    const sql = 'SELECT * FROM parents WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Database error during parent sign-in:', err);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            const parent = results[0];
            const match = await bcrypt.compare(password, parent.password);
            if (match) {
                // Send a success response with user data
                res.json({
                    user: {
                        id: parent.id,
                        username: parent.username,
                        email: parent.email
                    },
                    redirectUrl: '/parent-dashboard' // Add redirect URL
                });
            } else {
                res.status(401).send('Incorrect password');
            }
        } else {
            res.status(404).send('Parent not found');
        }
    });
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    // Check if email exists
    const sql = 'SELECT * FROM user WHERE email = ?';
    db.query(sql, [email], (err, results) => {
      if (err) {
        console.error('Database error during forgot password:', err);
        return res.status(500).send('Server error');
      }
  
      if (results.length > 0) {
        // Logic to send email to reset password
        const resetToken = "SomeRandomToken";
        console.log(`Sending reset token: ${resetToken} to ${email}`);
        return res.status(200).send('Password reset link sent');
      }
  
      res.status(404).send('Email not found');
    });
  });
  

  
  app.post('/api/students', (req, res) => {
    console.log('Received data:', req.body); // Log the incoming request body
    const { student_name, dob, gender, email, phone, address, guardian_name, grade } = req.body;
  
    // Simple validation
    if (!student_name || !dob || !gender || !email || !phone || !address || !guardian_name || !grade) {
        return res.status(400).send('All fields are required');
    }
  
    const sql = 'INSERT INTO students (student_name, dob, gender, email, phone, address, guardian_name, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.query(sql, [student_name, dob, gender, email, phone, address, guardian_name, grade], (err, result) => {
      if (err) {
        console.error('Error inserting student data:', err);
        return res.status(500).send('Error inserting student data');
      }
      res.status(201).send({ id: result.insertId, student_name, dob, gender, email, phone, address, guardian_name, grade });
    });
});

  







// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
