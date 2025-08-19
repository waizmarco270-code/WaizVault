const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Multer for file uploads (upload PDF to /public/pdfs)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/pdfs');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Admin upload API (for PDF/lecture/notice, add frontend HTML as well)
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ status: 'ok', filename: req.file.filename });
});

// Simple notices API (read/write from data/db.json)
app.post('/notice', (req, res) => {
  let db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));
  db.push({ type: 'notice', message: req.body.message, ts: Date.now() });
  fs.writeFileSync('data/db.json', JSON.stringify(db, null, 2));
  res.json({ status: 'ok' });
});
app.get('/notices', (req, res) => {
  let db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));
  const notices = db.filter(x => x.type === 'notice');
  res.json(notices);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('WaizVault is LIVE on port', PORT);
});
        
        
