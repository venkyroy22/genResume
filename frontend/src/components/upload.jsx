import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Upload, FileText, Image, X, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

export default function RefineResumePage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const fileInputRef = useRef(null);

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleSuggestionPage = () => {
    navigate("/refine");
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      generatePreview(file);
    }
  };

  const generatePreview = (file) => {
    const fileType = file.type;
    if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview({ type: 'image', url: e.target.result, name: file.name });
      };
      reader.readAsDataURL(file);
    } else {
      // For documents, show file icon and name
      setPreview({
        type: 'document',
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (role) formData.append('roleId', role);
      if (company) formData.append('companyName', company);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult({ success: true, data: result });
      } else {
        setUploadResult({ success: false, error: result.error });
      }
    } catch (error) {
      setUploadResult({ success: false, error: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      generatePreview(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-[#f5f3ff] flex items-center justify-center px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start max-w-6xl w-full">
        {/* Left Section - Upload Your Resume */}
        <Card className="shadow-xl rounded-2xl bg-white border border-white">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <h3 className="text-xl font-semibold text-gray-900 text-center">
              Upload Your Resume
            </h3>
            <p className="text-gray-600 text-center text-sm">

              Choose your resume file (DOC, DOCX, TXT, or image format)
            </p>

            {!selectedFile ? (
              <div
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <p className="text-gray-500">Click to upload or drag and drop</p>
                <p className="text-gray-400 text-sm">DOC, DOCX, TXT, JPG, PNG, GIF up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  className="hidden"
                  id="resumeUpload"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="resumeUpload"
                  className="mt-4 inline-block w-full bg-purple-700 text-white py-3 rounded-xl cursor-pointer hover:bg-purple-800 transition-colors"
                >
                  Choose File
                </label>
              </div>
            ) : (
              <div className="w-full">
                {preview && (
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {preview.type === 'image' ? (
                          <Image className="w-5 h-5 text-purple-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-purple-600" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {preview.name}
                        </span>
                      </div>
                      <button
                        onClick={removeFile}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {preview.type === 'image' && preview.url && (
                      <img
                        src={preview.url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}

                    {preview.type === 'document' && (
                      <div className="text-sm text-gray-600">
                        Size: {preview.size}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                >
                  {uploading ? 'Uploading...' : 'Upload Resume'}
                </Button>
              </div>
            )}

            {uploadResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  uploadResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle
                    className={`w-5 h-5 ${
                      uploadResult.success ? 'text-green-600' : 'text-red-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      uploadResult.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {uploadResult.success ? 'Upload successful!' : uploadResult.error}
                  </span>
                </div>
                {uploadResult.success && uploadResult.data && (
                  <div className="mt-2 text-xs text-green-700">
                    Resume ID: {uploadResult.data.resumeId}
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Right Section - Additional Information */}
        <Card className="shadow-xl rounded-2xl bg-white border border-white">
          <CardContent className="p-8 space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Additional Information (Optional)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Applying for role:
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a role (optional)</option>
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Company name (optional):
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Company name (optional)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons Container */}
        <div className="flex justify-end gap-4 mt-4 col-span-2">
          <Button
            variant="outline"
            className="border border-gray-300 text-gray-900 hover:bg-gray-100"
            onClick={handleBackToHome}
          >
            ← Back to Home
          </Button>
          <Button
            className="bg-purple-700 hover:bg-purple-800 text-white"
            onClick={handleSuggestionPage}
          >
            Refine Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
