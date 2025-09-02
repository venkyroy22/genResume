const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

function fileFilter(req, file, cb) {
  const allowed = ['.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) return cb(new Error('Only .doc, .docx, .txt, .zip and image files are allowed'));
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_UPLOAD_SIZE || (10 * 1024 * 1024), 10) }
});

module.exports = upload;
