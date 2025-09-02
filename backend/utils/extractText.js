const fs = require('fs');
const path = require('path');
const https = require('https');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let buffer;
  if (filePath.startsWith('http')) {
    // It's a URL, download it
    buffer = await downloadFile(filePath);
  } else {
    // Local file
    buffer = fs.readFileSync(filePath);
  }

  if (ext === '.docx') {
    const { value } = await mammoth.extractRawText({ buffer });
    return value || '';
  }
  if (ext === '.doc') {
    // Skip text extraction for .doc files as mammoth doesn't support old .doc format
    return '';
  }
  return buffer.toString('utf8');
}
module.exports = extractText;
