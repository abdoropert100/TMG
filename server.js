const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;

// إعداد مجلد الحفظ
const FILES_BASE = path.join(__dirname, 'src', 'Files');
if (!fs.existsSync(FILES_BASE)) {
  fs.mkdirSync(FILES_BASE, { recursive: true });
}

// إعداد التخزين حسب نوع القسم
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'attachments';
    const folder = path.join(FILES_BASE, type);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// رفع ملف
app.post('/upload', upload.single('file'), (req, res) => {
  // نسخ الملف إلى فولدر xampp أيضًا
  try {
    const type = req.body.type || 'attachments';
    const srcPath = req.file.path;
    const xamppBase = 'D:/xampp/htdocs/uploads';
    const xamppFolder = path.join(xamppBase, type);
    if (!fs.existsSync(xamppFolder)) {
      fs.mkdirSync(xamppFolder, { recursive: true });
    }
    const destPath = path.join(xamppFolder, req.file.originalname);
    fs.copyFileSync(srcPath, destPath);
  } catch (err) {
    console.error('خطأ نسخ الملف إلى xampp:', err);
  }
  res.json({ success: true, filename: req.file.originalname });
});

// تحميل ملف
app.get('/files/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const filePath = path.join(FILES_BASE, type, filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// عرض قائمة الملفات في قسم معين
app.get('/files/:type', (req, res) => {
  const { type } = req.params;
  const folder = path.join(FILES_BASE, type);
  if (fs.existsSync(folder)) {
    const files = fs.readdirSync(folder);
    res.json({ files });
  } else {
    res.json({ files: [] });
  }
});

// حذف ملف
app.delete('/files/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const filePath = path.join(FILES_BASE, type, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(PORT, () => {
  console.log(`File server running on http://localhost:${PORT}`);
});
