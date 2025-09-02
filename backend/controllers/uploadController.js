const extractText = require('../utils/extractText');
const { scoreResume, generateSuggestions } = require('../utils/ats');
const Resume = require('../models/Resume');
const Role = require('../models/Role');

exports.upload = async (req, res) => {
  try {
    // Support both single-file (req.file) and any-field uploads (req.files)
    const file = req.file || (Array.isArray(req.files) && req.files[0]);
    if (!file) return res.status(400).json({ error: 'No file uploaded. Send multipart/form-data with a file field.' });

    const filePath = file.path; // Cloudinary URL
    let text = '';
    // const ext = file.originalname.split('.').pop().toLowerCase();
    // if (['docx', 'txt'].includes(ext)) {
    //   text = await extractText(filePath);
    // } // For images, no text extraction

    let roleKeywords = [];
    if (req.body.roleId) {
      const role = await Role.findById(req.body.roleId);
      if (role) roleKeywords = role.keywords;
    }

    const atsScore = text ? scoreResume(text, roleKeywords) : 0;
    const suggestions = text ? generateSuggestions(text, roleKeywords) : [];

    const resume = new Resume({
      title: req.body.title || file.originalname,
      roleId: req.body.roleId || null,
      companyName: req.body.companyName || '',
      data: { text },
      pdfUrl: filePath, // Cloudinary URL
      atsScore,
      suggestions
    });

    await resume.save();
    res.json({
      ok: true,
      resumeId: resume._id,
      pdfUrl: resume.pdfUrl,
      text,
      data: resume.data,
      atsScore,
      suggestions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
