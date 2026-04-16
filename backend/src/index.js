require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mysql = require('mysql2/promise');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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

// S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload pakai memoryStorage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png/.test(path.extname(file.originalname).toLowerCase());
    cb(null, ok);
  },
});

// Helper upload ke S3
async function uploadToS3(file) {
  const key = `laporan/${Date.now()}-${file.originalname}`;
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  }));
  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// Init tabel
async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS laporan (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_pelapor VARCHAR(100) NOT NULL,
      judul VARCHAR(200) NOT NULL,
      deskripsi TEXT NOT NULL,
      lokasi VARCHAR(255) NOT NULL,
      foto_url VARCHAR(500),
      status ENUM('menunggu','diproses','selesai','ditolak') DEFAULT 'menunggu',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// GET semua laporan (publik)
app.get('/api/laporan', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM laporan ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST buat laporan + upload foto ke S3 (publik)
app.post('/api/laporan', upload.single('foto'), async (req, res) => {
  try {
    const { nama_pelapor, judul, deskripsi, lokasi } = req.body;
    if (!nama_pelapor || !judul || !deskripsi || !lokasi)
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    let foto_url = null;
    if (req.file) {
      foto_url = await uploadToS3(req.file);
    }
    const [result] = await db.execute(
      'INSERT INTO laporan (nama_pelapor, judul, deskripsi, lokasi, foto_url) VALUES (?, ?, ?, ?, ?)',
      [nama_pelapor, judul, deskripsi, lokasi, foto_url]
    );
    res.status(201).json({ message: 'Laporan berhasil dibuat', id: result.insertId, foto_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update status laporan (admin)
app.patch('/api/laporan/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE laporan SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status diperbarui' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET jadwal (publik)
app.get('/api/jadwal', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM jadwal ORDER BY hari, jam_mulai');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST tambah jadwal (admin)
app.post('/api/jadwal', async (req, res) => {
  try {
    const { wilayah, kelurahan, hari, jam_mulai, jam_selesai, keterangan } = req.body;
    if (!wilayah || !kelurahan || !hari || !jam_mulai || !jam_selesai)
      return res.status(400).json({ message: 'Data lengkap wajib diisi' });
    await db.execute(
      'INSERT INTO jadwal (wilayah, kelurahan, hari, jam_mulai, jam_selesai, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
      [wilayah, kelurahan, hari, jam_mulai, jam_selesai, keterangan]
    );
    res.status(201).json({ message: 'Jadwal ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
async function start() {
  try {
    await db.getConnection();
    console.log('✅ Database connected');
    await initDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
}

start();