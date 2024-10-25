const http = require('http');
const express = require('express');
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

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } }); // Setup socket.io

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload()); // Correct placement
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL database connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'edutech',
    waitForConnections: true,
    connectionLimit: 10,  // Optional: limits the number of connections in the pool
    queueLimit: 0          // Optional: disables queue limit
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




// Create a transporter object using the default SMTP transport
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
app.post('/api/reset-password', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  console.log('Reset password request received:', req.body);

  // Simulate successful password reset
  return res.status(200).json({ message: 'Password has been reset successfully.' });
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
  



// Route for uploading notes along with a file
app.post('/api/notes', (req, res) => {
    const { noteContent, classId } = req.body;
    const file = req.files ? req.files.file : null; // Get uploaded file
  
    if (!noteContent || !classId) {
      return res.status(400).json({ message: 'Note content or classId is missing' });
    }
  
    let filePath = null;
  
    if (file) {
      const fileName = `${Date.now()}-${file.name}`; // Create unique filename
      filePath = path.join(UPLOAD_DIR, fileName);
  
      // Save the uploaded file
      file.mv(filePath, (err) => {
        if (err) {
          console.error('File upload failed:', err);
          return res.status(500).json({ message: 'File upload failed' });
        }
  
        // Insert note with file path into the database
        insertNoteIntoDB(noteContent, classId, filePath, res);
      });
    } else {
      // Insert note without file
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
  












  // Store call logs in SQL
  const saveCallLog = async (caller, receiver, status) => {
    try {
      const query = "INSERT INTO call_logs (caller, receiver, status) VALUES (?, ?, ?)";
      await db.query(query, [caller, receiver, status]);
      console.log(`Call log saved: ${caller} to ${receiver} - Status: ${status}`);
    } catch (error) {
      console.error('Error saving call log:', error);
    }
  };
  
  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
  
    socket.on('offer', (data) => {
      console.log('Received offer:', data);
      socket.broadcast.emit('offer', data);
    });
  
    socket.on('answer', (data) => {
      console.log('Received answer:', data);
      socket.broadcast.emit('answer', data);
    });
  
    socket.on('ice-candidate', (data) => {
      console.log('Received ICE candidate:', data);
      socket.broadcast.emit('ice-candidate', data);
    });
  
    socket.on('call-ended', async (data) => {
      console.log('Call ended:', data);
      await saveCallLog(data.caller, data.receiver, 'completed');
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
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
app.get('/submissions/:studentName', (req, res) => {
  const { studentName } = req.params;

  const sql = 'SELECT id, text, status FROM submissions WHERE studentName = ?';
  db.query(sql, [studentName], (error, results) => {
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
 



// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
