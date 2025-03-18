const http = require('http');
const axios = require('axios');
const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2'); // Using mysql2 without promises
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const fileUpload = require('express-fileupload');
const { Server } = require('socket.io');
require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const { exec } = require("child_process");
const { spawn } = require('child_process');



const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } }); // Setup socket.io

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(fileUpload()); // Correct placement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// MySQL database connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'edutech',
});

// Test MySQL connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1); // Exit process if database connection fails
    }
    console.log('Database connected!');
    connection.release(); // Release connection back to the pool
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
                  redirectUrl: '/teacher-register' // Add redirect URL
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
  const query = 'INSERT INTO students (student_name, dob, gender, email, phone, address, guardian_name, grade, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
  db.query(query, [student_name, dob, gender, email, phone, address, guardian_name, grade, parent_id], (err, result) => {
      if (err) {
          return res.status(500).json({ error: 'Database error: ' + err });
      }
      res.status(201).json({ message: 'Student created', id: result.insertId });
  });
});

app.get('/api/students', (req, res) => {
  console.log('GET request received at /api/students'); // Debug log
  const query = 'SELECT * FROM students';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error: ' + err });
    }
    res.status(200).json(results);
  });
});

  

app.get('/api/notifications', (req, res) => {
  const sqlQuery = 'SELECT * FROM notifications';

  db.query(sqlQuery, (err, results) => {
      if (err) {
          console.error('Error fetching notifications:', err);
          return res.status(500).json({ error: 'Failed to fetch notifications' });
      }
      res.status(200).json(results);
  });
});

// Route to Mark Notification as Read
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

    console.log('Deleting file at:', filePath); // Debugging output

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ message: 'File not found' });
        }

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return res.status(500).json({ message: 'Error deleting file' });
            }

            console.log('File deleted successfully'); // Log success
            res.status(200).json({ message: 'File deleted successfully' }); // Send JSON response
        });
    });
});




//FORGOT PASSWORD

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS,   // Your App Password
  },
});

// Forgot password endpoint
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
      return res.status(400).send({ error: 'Email is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      return res.status(400).send({ error: 'Invalid email format' });
  }

  // Setup email data
  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Link',
      text: `Click the following link to reset your password: http://localhost:4200/reset-password?email=${encodeURIComponent(email)}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
          return res.status(500).send({ error: 'Error sending email' });
      }
      console.log('Email sent:', info.response);
      return res.status(200).send({ message: 'Password reset link sent to your email.' });
  });
});

// Reset password endpoint
app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Email and passwords are required' });
  }

  if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
      // Check if parent exists by email
      const sqlSelect = 'SELECT * FROM parents WHERE email = ?';
      db.query(sqlSelect, [email], async (err, results) => {
          if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Database error' });
          }

          if (results.length === 0) {
              return res.status(404).json({ error: 'Parent not found' });
          }

          // Hash the new password
          const hashedPassword = await bcrypt.hash(newPassword, 10);

          // SQL query to update the password
          const sqlUpdate = 'UPDATE parents SET password = ? WHERE email = ?';
          db.query(sqlUpdate, [hashedPassword, email], (err, result) => {
              if (err) {
                  console.error('Error updating password:', err);
                  return res.status(500).json({ error: 'Failed to update password' });
              }
              res.status(200).json({ message: 'Password reset successful' });
          });
      });
  } catch (error) {
      console.error('Error during password reset:', error);
      res.status(500).json({ error: 'Server error' });
  }
});



  
  



// Get all To-Do Items
app.get('/api/todos', (req, res) => {
  db.query('SELECT * FROM ToDoList ORDER BY dueDate ASC', (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.json(results);
  });
});

  
  // Create a new To-Do Item
app.post('/api/todos', (req, res) => {
    const { title, description, dueDate } = req.body;
    
    // Insert the new to-do item into the database
    db.query(
      'INSERT INTO ToDoList (title, description, dueDate) VALUES (?, ?, ?)',
      [title, description, dueDate],
      (err, result) => {
        if (err) {
          console.error('Error inserting new todo:', err);
          return res.status(500).json({ message: 'Failed to add to-do' });
        }
        
        // Send back the newly created to-do item
        const newTodo = { id: result.insertId, title, description, dueDate, completed: false };
        res.status(201).json(newTodo);
      }
    );
  });
  
  
  // Update a To-Do Item (mark as completed)
  app.put('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
  
    // Check if 'completed' is passed and is a boolean
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Invalid value for completed' });
    }
  
    // SQL query to update the `completed` field
    db.query(
      'UPDATE ToDoList SET completed = ? WHERE id = ?',
      [completed, id],
      (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ message: 'Server error' });
        }
  
        // Check if any rows were updated
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'To-Do item not found' });
        }
  
        res.json({ message: 'To-Do item updated successfully' });
      }
    );
  });
  
  
  // Delete a To-Do Item
  app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM ToDoList WHERE id = ?', [id], (err) => {
      if (err) throw err;
      res.status(204).send();
    });
  });






// Get all flashcards
app.get('/api/flashcards', (req, res) => {
    db.query('SELECT * FROM flashcards', (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  
  // Create a new flashcard
  app.post('/api/flashcards', (req, res) => {
    const { question, answer, tags, deck } = req.body;
    db.query('INSERT INTO flashcards (question, answer, tags, deck) VALUES (?, ?, ?, ?)', 
      [question, answer, tags, deck], 
      (err, result) => {
        if (err) throw err;
        res.status(201).json({ id: result.insertId, question, answer, tags, deck });
      }
    );
  });
  



// Endpoint to handle note posting
app.post('/api/notes', (req, res) => {
  console.log('Request body:', req.body);
  console.log('Uploaded file:', req.files ? req.files.file : null);

  const { noteContent, classId } = req.body;
  const file = req.files ? req.files.file : null;

  // Check for required fields
  if (!noteContent || !classId) {
    return res.status(400).json({ message: 'Note content or classId is missing' });
  }

  let filePath = null;
  
  // If a file is included, save it
  if (file) {
    const fileName = `${Date.now()}-${file.name}`;
    filePath = path.join(UPLOAD_DIR, fileName);
    file.mv(filePath, (err) => {
      if (err) {
        console.error('File upload failed:', err);
        return res.status(500).json({ message: 'File upload failed' });
      }
      insertNoteIntoDB(noteContent, classId, filePath, res);
    });
  } else {
    insertNoteIntoDB(noteContent, classId, null, res);
  }
});


// Helper function to insert a note into the database
function insertNoteIntoDB(noteContent, classId, filePath, res) {
  const query = 'INSERT INTO notes (content, class_id, file_path) VALUES (?, ?, ?)';
  db.query(query, [noteContent, classId, filePath], (err, result) => {
    if (err) {
      console.error('Failed to insert note:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({
      message: 'Note saved successfully',
      id: result.insertId,
      classId,
      filePath,
    });
  });
}

 // Fetch notes for a specific class
app.get('/api/notes/class/:classId', (req, res) => {
    const classId = req.params.classId;
  
    const query = 'SELECT * FROM notes WHERE class_id = ?'; // SQL query to fetch notes for the specific class
    db.query(query, [classId], (err, results) => {
      if (err) {
        console.error('Failed to fetch notes:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(results); // Send back the fetched notes
    });
  });

  app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const note = notes.find(note => note.id === parseInt(id));
  if (!note) return res.status(404).send('Note not found');
  notes = notes.filter(note => note.id !== parseInt(id));
  res.status(204).send(); // 204 for successful delete with no content
});

  
  
// Get Tips by Class
app.get('/tips/:classId', (req, res) => {
    const classId = req.params.classId;
    const query = 'SELECT * FROM tips WHERE classId = ?';
    db.query(query, [classId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add a New Tip
app.post('/tips', (req, res) => {
    const { classId, subject, topic, tip } = req.body;
    const query = 'INSERT INTO tips (classId, subject, topic, tip) VALUES (?, ?, ?, ?)';
    db.query(query, [classId, subject, topic, tip], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId });
    });
});


// Delete a Tip
app.delete('/tips/:id', (req, res) => {
    const tipId = req.params.id;
    const query = 'DELETE FROM tips WHERE id = ?';
    db.query(query, [tipId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(204).send();
    });
});


// Get Tips by Class (for both teacher and student)
app.get('/tips/:classId', (req, res) => {
    const classId = req.params.classId;
    const query = 'SELECT * FROM tips WHERE classId = ?';

    db.query(query, [classId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);  // Send tips as JSON response
    });
});


  

  // Node.js route to send a message
app.post('/api/messages', (req, res) => {
    const { sender, recipient, content } = req.body;
  
    const query = 'INSERT INTO messages (sender, recipient, content) VALUES (?, ?, ?)';
    db.query(query, [sender, recipient, content], (error, results) => {
      if (error) {
        console.error('Error inserting message:', error);
        return res.status(500).json({ error: 'Failed to send message.' });
      }
      res.status(201).json({ id: results.insertId, sender, recipient, content });
    });
  });
  
  // Backend route to fetch messages by recipient (student ID)
app.get('/api/messages/:recipient', (req, res) => {
    const recipient = req.params.recipient;
    
    // Log the recipient value to make sure it's correctly captured
    console.log(`Fetching messages for recipient: ${recipient}`);
  
    const query = 'SELECT * FROM messages WHERE recipient = ?';
    
    // Execute the query and log potential errors
    db.query(query, [recipient], (err, results) => {
      if (err) {
        console.error('Database query failed:', err);  // Log any SQL errors
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }
  
      console.log('Messages fetched:', results);  // Log the fetched results
      res.json(results);  // Send the results back to the frontend
    });
  });
  
  

  app.post('/api/profiles', (req, res) => {
    console.log('Received Data:', req.body);
  
    const {
      name, skillsOffered, skillsWanted, availability,
      startTime, endTime, interests, experienceLevel, location
    } = req.body;
  
    console.log('Name:', name);
    console.log('Skills Offered:', skillsOffered);
    console.log('Skills Wanted:', skillsWanted);
  
    const convertTo24Hour = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
  
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
  
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    };
  
    const formattedStartTime = convertTo24Hour(startTime);
    const formattedEndTime = convertTo24Hour(endTime);
  
    const sql = `
      INSERT INTO profiles 
      (name, skills_offered, skills_wanted, availability, start_time, end_time, interests, experience_level, location) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      name, skillsOffered ?? null, skillsWanted ?? null, availability ?? null,
      formattedStartTime, formattedEndTime, interests ?? null,
      experienceLevel ?? null, location ?? null
    ];
  
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('SQL Error:', err.message);
        return res.status(500).json({ error: 'Failed to insert profile data.' });
      }
      res.status(201).json({ id: result.insertId, ...req.body });
    });
  });
  
  // Fetch all profiles
  app.get('/api/profiles', (req, res) => {
    const sql = 'SELECT * FROM profiles';
  
    db.query(sql, (err, rows) => {
      if (err) {
        console.error('SQL Error:', err.message);
        return res.status(500).json({ error: 'Failed to fetch profiles.' });
      }
      res.json(rows);
    });
  });
  

  app.post('/api/questions', (req, res) => {
    const questions = req.body;
    console.log('Received questions:', questions);  // Debugging log

    const sql = 'INSERT INTO questions (question_text, answer, difficulty_level) VALUES ?';
    const values = questions.map(q => [q.question_text, q.answer, q.difficulty_level]);

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error('Error inserting questions:', err);
            return res.status(500).json({ error: 'Error inserting questions.' });
        }
        console.log('Questions inserted:', result);  // Confirm insertion
        res.json({ message: 'Questions submitted successfully!' });
    });
});


  // Route to fetch questions by difficulty level
  app.get('/api/questions', (req, res) => {
    const level = req.query.level;
    
    // Log the incoming query parameter
    console.log('Difficulty level:', level);

    let sql = 'SELECT * FROM questions';
    const params = [];

    if (level) {
        sql += ' WHERE difficulty_level = ?';
        params.push(level);
    }

    console.log('Executing SQL:', sql, 'with params:', params);  // Debugging log

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching questions:', err);  // Log error if any
            return res.status(500).send('Error fetching questions.');
        }
        
        console.log('Fetched questions from DB:', results);  // Log DB results
        res.json(results);  // Send results to frontend
    });
});






// Route to submit a new submission
app.post('/submissions', (req, res) => {
  console.log('Received submission:', req.body);

  const { text, studentName, className } = req.body;

  if (!text || !studentName || !className) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'INSERT INTO submissions (text, studentName, className, status) VALUES (?, ?, ?, "pending")';
  db.query(sql, [text, studentName, className], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ id: results.insertId, message: 'Submission created successfully' });
  });
});

// Route to get submissions for a specific student
app.get('/submissions', (req, res) => {
  const sql = 'SELECT id, text, status, studentName, className FROM submissions';
  db.query(sql, (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(results);
  });
});

// Route: Approve or reject a submission
app.patch('/submissions/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const sql = 'UPDATE submissions SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.status(200).json({ message: 'Submission status updated successfully' });
  });
});
 





// Teacher Registration Route
app.post('/api/teacher/register', upload.fields([{ name: 'resume' }, { name: 'certification' }]), (req, res) => {
  const { name, email, qualification } = req.body;
  const resume = req.files['resume'] ? req.files['resume'][0].path : null;
  const certification = req.files['certification'] ? req.files['certification'][0].path : null;

  if (!name || !email || !qualification) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  const query = 'INSERT INTO teacher (name, email, qualification, resume, certification, status) VALUES (?, ?, ?, ?, ?, "pending")';

  db.query(query, [name, email, qualification, resume, certification], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Error registering teacher' });
    }
    res.json({ message: 'Teacher registered successfully' });
  });
});

// Define the route to get all teachers with "pending" status
app.get('/api/admin/all-teachers', (req, res) => {
  const query = 'SELECT id, name, email, qualification, resume, certification, status FROM teacher WHERE status = "pending"';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching teacher details:', err);
      return res.status(500).json({ message: 'Error fetching teacher details' });
    }
    res.json(results);
  });
});





// Backend API to update teacher status (approve/reject)
app.put('/api/admin/teacher/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = 'UPDATE teacher SET status = ? WHERE id = ?';
  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error('Error updating teacher status:', err);
      return res.status(500).send('Error updating teacher status');
    }
    res.send(`Teacher status updated to ${status}`);
  });
});







// app.post('/login', (req, res) => {
//   const { username, password } = req.body;
//   if (username === 'placementteam' && password === 'team123') {
//     res.status(200).send({ message: 'Login successful' });
//   } else {
//     res.status(404).send({ message: 'User not found.' });
//   }
// });

// Register a user
app.post('/register', (req, res) => {
  const {
    name, email, password, role,
    studentId, classYear, department,
    parentName, contactNumber, employeeId,
    designation, experience, linkedinProfile
  } = req.body;

  // Ensure required fields are provided
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  // Hash the password before saving
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error hashing password.', error: err });
    }

    // SQL query to insert user data
    const query = `
      INSERT INTO users (name, email, password, role, student_id, class_year, department, parent_name, contact_number, employee_id, designation, experience, linkedin_profile, is_approved) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)
    `;

    const values = [
      name, email, hashedPassword, role,
      studentId || null, classYear || null, department || null,
      parentName || null, contactNumber || null, employeeId || null,
      designation || null, experience || null, linkedinProfile || null
    ];

    // Execute the query to insert the user
    db.query(query, values, (dbError, result) => {
      if (dbError) {
        console.error(dbError);
        return res.status(500).json({ message: 'Error registering user.', error: dbError });
      }

      // Success message
      res.status(201).json({
        message: 'Registration successful. Awaiting admin approval.',
        userId: result.insertId
      });
    });
  });
});

// Fetch pending approvals for admin
app.get('/pending-approvals', (req, res) => {
  const query = 'SELECT * FROM users WHERE is_approved = FALSE';

  db.query(query, (dbError, users) => {
    if (dbError) {
      console.error(dbError);
      return res.status(500).json({ message: 'Error fetching pending approvals.', error: dbError });
    }

    res.status(200).json(users);
  });
});

// Approve or reject a user
app.post('/approve-user', (req, res) => {
  const { userId, isApproved } = req.body;

  if (typeof isApproved !== 'boolean' || !userId) {
    return res.status(400).json({ message: 'Invalid input.' });
  }

  // Update the approval status in the database
  const query = 'UPDATE users SET is_approved = ? WHERE id = ?';
  const values = [isApproved, userId];

  db.query(query, values, (dbError) => {
    if (dbError) {
      console.error(dbError);
      return res.status(500).json({ message: 'Error approving/rejecting user.', error: dbError });
    }

    res.status(200).json({
      message: `User ${isApproved ? 'approved' : 'rejected'} successfully.`
    });
  });
});


// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Query the database to find the user by email
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Error logging in.' });
    }

    // Check if no user was found
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = result[0];

    // Check if user is approved
    if (!user.is_approved) {
      return res.status(403).json({ message: 'Your account is awaiting admin approval.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  });
});

// Middleware to verify token
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Access token is required.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
}

// Protected route example
app.get('/dashboard', authenticateToken, (req, res) => {
  res.status(200).json({ message: `Welcome, user ${req.user.id}!`, user: req.user });
});



// POST endpoint to insert data into resumes table
app.post('/api/resume', (req, res) => {
  const { student_id, name, email, phone, education, experience, skills, summary } = req.body;

  // Insert query
  const query = `
      INSERT INTO resumes (student_id, name, email, phone, education, experience, skills, summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Execute query
  db.query(query, [student_id, name, email, phone, education, experience, skills, summary], (err, result) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).send({
              message: 'Error saving resume',
              error: err.sqlMessage || err.message
          });
      }
      res.status(200).send({
          message: 'Resume saved successfully',
          resumeId: result.insertId
      });
  });
});



app.post('/api/resume/ai-suggestions', (req, res) => {
  const { section, input } = req.body;

  if (!section || !input) {
    return res.status(400).json({ error: 'Input text is required' });
  }

  const aiResponse = {
    suggestion: `Suggested text for ${section} based on input: ${input}`
  };
  res.json(aiResponse);
});


app.post('/api/coverletter', (req, res) => {
  const { name, role, experience, skills, company } = req.body;
  res.json({ suggestion: `This is a sample suggestion for ${role} at ${company}.` });
});



app.post('/upload-aptitude', upload.single('pdf'), (req, res) => {
  const companyName = req.body.company_name;
  const filePath = req.file.path;  // Path to the uploaded PDF

  const query = 'INSERT INTO aptitude_questions (company_name, file_path) VALUES (?, ?)';
  db.query(query, [companyName, filePath], (err, result) => {
      if (err) {
          return res.status(500).send('Error uploading file');
      }
      res.status(200).send('File uploaded successfully');
  });
});


// API to get aptitude questions for a specific company
app.get('/get-aptitude/:company_name', (req, res) => {
  const companyName = req.params.company_name;

  const query = 'SELECT file_path FROM aptitude_questions WHERE company_name = ?';
  db.query(query, [companyName], (err, result) => {
      if (err) {
          return res.status(500).send('Error fetching questions');
      }
      if (result.length === 0) {
          return res.status(404).send('No aptitude questions found for this company');
      }
      res.status(200).json(result[0]);  // Sending file path
  });
});




// Share a template with students
app.post('/api/share-template', async (req, res) => {
  const { studentIds, templateId } = req.body;

  if (!studentIds || studentIds.length === 0 || !templateId) {
    return res.status(400).json({ error: 'Student IDs and template ID are required' });
  }

  try {
    // Loop through the selected students and associate them with the template
    for (const studentId of studentIds) {
      await db.query(
        'INSERT INTO shared_templates (student_id, template_id) VALUES (?, ?)',
        [studentId, templateId]
      );
    }

    res.status(201).json({ message: 'Template shared successfully with selected students' });
  } catch (error) {
    console.error('Error sharing template:', error);
    res.status(500).json({ error: 'Failed to share template' });
  }
});


// Fetch all students for the placement officer
app.get('/api/students', async (req, res) => {
  try {
    // Query to get all students
    const [students] = await db.query('SELECT id, name, email FROM students');
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});



app.post('/upload-insights', (req, res) => {
  const { company_name, common_questions, aptitude_test_types, mock_feedback } = req.body;

  const query = `
      INSERT INTO interview_insights (company_name, common_questions, aptitude_test_types, mock_feedback)
      VALUES (?, ?, ?, ?)
  `;
  db.query(query, [company_name, common_questions, aptitude_test_types, mock_feedback], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Error saving interview insights');
      }
      res.status(200).send('Interview insights uploaded successfully');
  });
});


// API to fetch interview insights by company
app.get('/get-insights/:company_name', (req, res) => {
  const companyName = req.params.company_name;

  const query = `
      SELECT common_questions, aptitude_test_types, mock_feedback 
      FROM interview_insights WHERE company_name = ?
  `;
  db.query(query, [companyName], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Error fetching interview insights');
      }
      if (result.length === 0) {
          return res.status(404).send('No interview insights found for this company');
      }
      res.status(200).json(result[0]);
  });
});




// POST endpoint to add a new mock interview question
app.post('/api/mock-interview/questions', async (req, res) => {
  const { interviewType, question } = req.body;

  // Validate request body
  if (!interviewType || !question) {
    return res.status(400).json({ message: 'Both interview type and question are required.' });
  }

  try {
    // Insert question into the database
    const [result] = await db.execute(
      'INSERT INTO mock_interview_questions (interview_type, question) VALUES (?, ?)',
      [interviewType, question]
    );

    // Check if the insertion was successful
    if (result.affectedRows > 0) {
      return res.status(201).json({ success: true, questionId: result.insertId });
    } else {
      return res.status(500).json({ message: 'Failed to add the question.' });
    }
  } catch (error) {
    console.error('Database error during insertion:', error.message);
    return res.status(500).json({ message: 'Database error. Please try again later.' });
  }
});

// GET endpoint to fetch mock interview questions by type
app.get('/api/mock-interview/questions/:type', (req, res) => {
  const interviewType = req.params.type; // Extract the parameter from the URL path

  // SQL query to fetch questions
  const query = `
    SELECT question 
    FROM mock_interview_questions 
    WHERE interview_type = ?
  `;

  // Execute the query
  db.query(query, [interviewType], (err, result) => {
    if (err) {
      console.error('Database query failed:', err.message);
      return res.status(500).send('Failed to fetch questions. Please try again later.');
    }

    if (result.length === 0) {
      return res.status(404).send('No questions found for the specified type.');
    }

    // Respond with the questions
    res.status(200).json({ questions: result.map(row => row.question) });
  });
});


app.get('/api/problems', (req, res) => {
  const query = 'SELECT * FROM problems ORDER BY company';
  pool.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error retrieving problems.');
    }
    res.json(results);
  });
});

// Endpoint to add a new problem
app.post('/api/problems', (req, res) => {
  const { title, description, company, difficulty } = req.body;
  const query = 'INSERT INTO problems (title, description, company, difficulty) VALUES (?, ?, ?, ?)';
  pool.query(query, [title, description, company, difficulty], (err, result) => {
    if (err) {
      return res.status(500).send('Error adding problem.');
    }
    res.status(201).json({ message: 'Problem added successfully' });
  });
});






// POST route for adding jobs
app.post('/api/jobs', (req, res) => {
  const { jobTitle, companyName, timeLimit, salaryRange, jobLocation, jobType, qualifications, experienceLevel, contactInfo, jobDescription } = req.body;

  const query = `
    INSERT INTO Jobs (jobTitle, companyName, timeLimit, salaryRange, jobLocation, jobType, qualifications, experienceLevel, contactInfo, jobDescription) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [jobTitle, companyName, timeLimit, salaryRange, jobLocation, jobType, qualifications, experienceLevel, contactInfo, jobDescription],
    (err, result) => {
      if (err) {
        console.error('Error adding job:', err);
        return res.status(500).send('Error adding job');
      }
      res.status(201).send('Job added successfully');
    }
  );
});



// API endpoint to fetch all jobs
app.get('/api/jobs', (req, res) => {
  const query = `
    SELECT jobTitle, companyName, timeLimit, salaryRange, jobLocation, jobType, qualifications, experienceLevel, contactInfo, jobDescription
    FROM jobs
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query failed:', err.message);
      return res.status(500).send('Failed to fetch jobs. Please try again later.');
    }

    if (results.length === 0) {
      return res.status(404).send('No jobs found.');
    }

    // Respond with the jobs
    res.status(200).json(results);
  });
});



app.post('/api/alerts', (req, res) => {
  const { title, message, sender } = req.body;

  if (!title || !message || !sender) {
      return res.status(400).send({ error: 'All fields are required.' });
  }

  const query = 'INSERT INTO alerts (title, message, sender) VALUES (?, ?, ?)';
  db.query(query, [title, message, sender], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).send({ error: 'Failed to send alert.' });
      }
      res.status(201).send({ message: 'Alert sent successfully!' });
  });
});

// API to fetch all alerts
app.get('/api/alerts', (req, res) => {
  const query = 'SELECT * FROM alerts ORDER BY created_at DESC';
  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).send({ error: 'Failed to fetch alerts.' });
      }
      res.send(results);
  });
});


app.post('/summarize', async (req, res) => {
  try {
      const { text } = req.body;
      const response = await axios.post('http://localhost:5000/summarize', { text });
      res.json(response.data);
  } catch (error) {
      console.error('Error in summarization:', error);
      res.status(500).send('Error in summarization');
  }
});



app.post('/api/shortlisted-students', (req, res) => {
  const { student_id, student_name, branch, company_name, job_title, next_round_name, next_round_date } = req.body;

  // Log received data for debugging
  console.log('Received data:', req.body);

  // Validate required fields
  if (!student_id || !student_name || !branch || !company_name || !job_title || !next_round_name || !next_round_date) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const query = `
    INSERT INTO shortlisted_students 
    (student_id, student_name, branch, company_name, job_title, next_round_name, next_round_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // Execute the database query
  db.query(
    query,
    [student_id, student_name, branch, company_name, job_title, next_round_name, next_round_date],
    (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ error: 'Failed to add shortlisted details.' });
      }

      // Send success response
      res.status(201).json({ message: 'Shortlisted student details added successfully!' });
    }
  );
});






// API route to get shortlisted students
app.get('/api/shortlisted-students', (req, res) => {
  const query = `
    SELECT student_id, student_name, branch, company_name, job_title, next_round_name, next_round_date
    FROM shortlisted_students
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching shortlisted details:', err);
      return res.status(500).json({ error: 'Failed to fetch shortlisted details.' });
    }
    res.status(200).json(results); // Return all shortlisted student details
  });
});

// Endpoint to upload quiz questions
app.post('/api/upload-questions', (req, res) => {
  const { questions } = req.body;

  // Validate input data
  if (!questions || !Array.isArray(questions)) {
    console.error('Invalid input: Questions should be an array.');
    return res.status(400).send({ error: 'Questions should be an array.' });
  }

  const query = `
    INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_option)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  let hasError = false; // Track if there are errors during insertion

  questions.forEach((q) => {
    const { question, optionA, optionB, optionC, optionD, correctOption } = q;

    // Validate fields for each question
    if (!question || !optionA || !optionB || !optionC || !optionD || !correctOption) {
      console.error('Missing required fields for question:', q);
      hasError = true;
      return;
    }

    // Execute the query
    db.query(
      query,
      [question, optionA, optionB, optionC, optionD, correctOption],
      (err, result) => {
        if (err) {
          console.error('Database error:', err.message);
          hasError = true;
        } else {
          console.log('Inserted question ID:', result.insertId);
        }
      }
    );
  });

  // Send appropriate response
  if (hasError) {
    return res.status(500).send({ error: 'Some questions could not be inserted.' });
  }

  res.status(201).send({ message: 'Questions uploaded successfully!' });
});



app.get('/api/get-questions', (req, res) => {
  const query = 'SELECT id, question, option_a AS optionA, option_b AS optionB, option_c AS optionC, option_d AS optionD FROM quiz_questions';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching questions:', err);
      return res.status(500).send({ error: 'Failed to fetch questions.' });
    }
    res.status(200).send({ questions: results });
  });
});


require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
