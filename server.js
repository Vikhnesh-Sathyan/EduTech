const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Parse application/json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

    // Validate password and confirm password
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        // Check if email already exists
        const emailCheckSql = 'SELECT * FROM user WHERE email = ?';
        db.query(emailCheckSql, [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Server error');
            }

            if (results.length > 0) {
                return res.status(409).send('Email is already registered');
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // SQL query to insert a new student
            const sql = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
            db.query(sql, [username, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Database error during student sign-up:', err);
                    return res.status(500).send('Server error');
                }
                res.status(201).send('Sign-up successful');
            });
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
            // Compare the password with the hashed password
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
                return res.status(401).send('Incorrect password');
            }
        } else {
            return res.status(404).send('Student not found');
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


  
  
app.post('/api/students', (req, res) => {
  const { student_name, dob, gender, email, phone, address, guardian_name, grade, parent_id } = req.body;

  // Insert the new student into the database
  const query = 'INSERT INTO students (student_name, dob, gender, email, phone, address, guardian_name, grade, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [student_name, dob, gender, email, phone, address, guardian_name, grade, parent_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error: ' + err });
    }
    res.status(201).json({ message: 'Student created', id: result.insertId });
  });
});

  


// Endpoint to handle music applications
app.post('/api/music', (req, res) => {
    const { name, email, course, experience, class: className, notes } = req.body;

    const sql = `INSERT INTO music (name, email, course, experience, class, notes) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [name, email, course, experience, className, notes], (err, result) => {
        if (err) {
            console.error('Error inserting application:', err);
            return res.status(500).json({ error: 'Error inserting application' }); // Return JSON on error
        }

        // Insert notification
        const notificationMessage = `New application submitted by ${name}`;
        const notificationSql = `INSERT INTO notifications (message, is_read) VALUES (?, ?)`;
        db.query(notificationSql, [notificationMessage, false], (err, notificationResult) => {
            if (err) {
                console.error('Error inserting notification:', err);
                return res.status(500).json({ error: 'Error inserting notification' }); // Return JSON on error
            }

            // Ensure the response is a JSON object
            res.status(200).json({ message: 'Application and notification created successfully' }); // Return JSON
        });
    });
});
// Endpoint to mark a notification as read
app.get('/api/notifications', (req, res) => {
    const sqlQuery = 'SELECT * FROM notifications'; // Adjust the table name
  
    db.query(sqlQuery, (err, results) => {
      if (err) {
        console.error('Error fetching notifications:', err);
        return res.status(500).json({ error: 'Failed to fetch notifications' });
      }
  
      res.status(200).json(results); // Send the notifications back to the client
    });
  });
  
  // Route to mark a notification as read
  app.put('/api/notifications/:id', (req, res) => {
    const notificationId = req.params.id;
    const sqlUpdateQuery = 'UPDATE notifications SET is_read = 1 WHERE id = ?';
  
    db.query(sqlUpdateQuery, [notificationId], (err, results) => {
      if (err) {
        console.error('Error updating notification:', err);
        return res.status(500).json({ error: 'Failed to update notification' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }
  
      res.status(200).json({ message: 'Notification marked as read' });
    });
  });
  


// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const grade = req.body.grade; // Get the grade from the request body
        const uploadPath = path.join(__dirname, 'uploads', `grade-${grade}`);

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath); // Store files in grade-specific folder
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`; // Generate a unique filename
        cb(null, filename);
    },
});

// Initialize multer with the defined storage
const upload = multer({ storage: storage });

// Route to handle file uploads
app.post('/api/upload-content', upload.single('file'), (req, res) => {
    const { grade, title, description, type } = req.body;

    // Ensure all required fields are provided
    if (!grade || !title || !description || !type || !req.file) {
        return res.status(400).json({ message: 'All fields are required, including file.' });
    }

    // Construct file URL for response
    const fileUrl = `/uploads/grade-${grade}/${req.file.filename}`;

    // Insert content details into the database
    const query = `
        INSERT INTO contents (grade, title, description, type, fileUrl)
        VALUES (?, ?, ?, ?, ?)`;
    
    db.query(query, [grade, title, description, type, fileUrl], (err, result) => {
        if (err) {
            console.error('Error inserting content into database:', err);
            return res.status(500).json({ error: 'Failed to upload content.' });
        }

        // Create new content object to return in the response
        const newContent = {
            id: result.insertId, // Get the ID of the inserted row
            grade,
            title,
            description,
            type,
            fileUrl,
        };

        res.json({
            message: 'File uploaded successfully!',
            content: newContent,
        });
    });
});

// API to get content by grade
app.get('/api/get-content/:grade', (req, res) => {
    const grade = req.params.grade;

    console.log(`Fetching content for grade: ${grade}`); // Log grade

    // Fetch content from the database for the given grade
    const query = `SELECT * FROM contents WHERE grade = ?`;
    db.query(query, [grade], (err, rows) => {
        if (err) {
            console.error('Error fetching content:', err);
            return res.status(500).json({ error: 'Failed to fetch content.' });
        }

        // If no content is found for the grade
        if (rows.length === 0) {
            return res.status(404).json({ message: `No content found for grade ${grade}.` });
        }

        console.log(`Content fetched for grade ${grade}:`, rows); // Log fetched data
        res.json(rows);
    });
});

// API to delete content by grade and filename
app.delete('/api/delete-content/:grade/:filename', (req, res) => {
    const { grade, filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', `grade-${grade}`, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(404).send('File not found');
        }
        res.status(200).send('File deleted successfully');
    });
});



app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO profiles (username, email, password) VALUES (?, ?, ?)';

    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'User already exists.' });
            }
            return res.status(500).json({ error: 'Error registering user.' });
        }
        res.status(201).json({ message: 'User registered successfully.' });
    });
});



const userProfiles = {
    1: { skills: 'JavaScript, Angular', interests: 'Coding, Reading', availability: 'Full-time' },
    // Other profiles...
  };
  
  app.get('/api/profile/:userId', (req, res) => {
    const userId = req.params.userId;
    const profile = userProfiles[userId];
  
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).send('User profile not found');
    }
  });



// Update User Profile
app.put('/api/profile/:id', (req, res) => {
    const { skills, interests, availability } = req.body;

    const sql = 'UPDATE profiles SET skills = ?, interests = ?, availability = ? WHERE id = ?';

    db.query(sql, [skills, interests, availability, req.params.id], (err, result) => {
        if (err) {
            return res.status(500).send('Error updating profile.');
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ message: 'Profile updated successfully.' });
    });
});







// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
