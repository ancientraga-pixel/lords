import React, { useState, useRef } from 'react';

function ImageUpload({ onImageSelected, accept = "image/*" }) {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      onImageSelected(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="image-upload-input"
      />

      {!preview ? (
        <label htmlFor="image-upload-input" className="upload-area">
          <div className="upload-content">
            <div className="upload-icon">📷</div>
            <div className="upload-text">
              <strong>Click to upload image</strong>
              <br />
              <small>PNG, JPG up to 5MB</small>
            </div>
          </div>
        </label>
      ) : (
        <div className="preview-area">
          <img src={preview} alt="Preview" className="preview-image" />
          <div className="preview-actions">
            <button
              type="button"
              onClick={handleRemove}
              className="button danger"
            >
              Remove
            </button>
            <label htmlFor="image-upload-input" className="button secondary">
              Change Image
            </label>
          </div>
          {selectedFile && (
            <div className="file-info">
              <small>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </small>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .image-upload {
          width: 100%;
        }

        .upload-area {
          display: block;
          width: 100%;
          min-height: 150px;
          border: 2px dashed #ced4da;
          border-radius: 8px;
          background: rgba(248, 249, 250, 0.8);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-area:hover {
          border-color: #4CAF50;
          background: rgba(76, 175, 80, 0.05);
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          height: 100%;
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 15px;
          opacity: 0.6;
        }

        .upload-text {
          text-align: center;
          color: #495057;
        }

        .preview-area {
          text-align: center;
        }

        .preview-image {
          max-width: 100%;
          max-height: 200px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 15px;
        }

        .preview-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 10px;
        }

        .file-info {
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .preview-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default ImageUpload;