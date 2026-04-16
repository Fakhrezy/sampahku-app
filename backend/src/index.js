require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(morgan('combined'));
app.use(cors({ origin: '*' }));
app.use(express.json());

// Database
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload ke S3
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    key: (req, file, cb) => {
      cb(null, `laporan/${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png/.test(path.extname(file.originalname).toLowerCase());
    cb(null, ok);
  },
});

// JWT middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak ada' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

// Buat tabel otomatis
async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('masyarakat','admin') DEFAULT 'masyarakat',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS laporan (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      judul VARCHAR(200) NOT NULL,
      deskripsi TEXT NOT NULL,
      lokasi VARCHAR(255) NOT NULL,
      foto_url VARCHAR(500),
      status ENUM('menunggu','diproses','selesai','ditolak') DEFAULT 'menunggu',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS jadwal (
      id INT AUTO_INCREMENT PRIMARY KEY,
      wilayah VARCHAR(100) NOT NULL,
      kelurahan VARCHAR(100) NOT NULL,
      hari ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu') NOT NULL,
      jam_mulai TIME NOT NULL,
      jam_selesai TIME NOT NULL,
      keterangan TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Database tables ready');
}

// ROUTES

app.get('/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    if (!nama || !email || !password)
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (nama, email, password) VALUES (?, ?, ?)',
      [nama, email, hash]
    );
    const token = jwt.sign(
      { id: result.insertId, role: 'masyarakat' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      user: { id: result.insertId, nama, email, role: 'masyarakat' }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length)
      return res.status(401).json({ message: 'Email atau password salah' });
    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid)
      return res.status(401).json({ message: 'Email atau password salah' });
    const token = jwt.sign(
      { id: rows[0].id, role: rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { id: rows[0].id, nama: rows[0].nama, email: rows[0].email, role: rows[0].role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get laporan
app.get('/api/laporan', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const [rows] = isAdmin
      ? await db.execute('SELECT l.*, u.nama as pelapor FROM laporan l JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC')
      : await db.execute('SELECT * FROM laporan WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Buat laporan +