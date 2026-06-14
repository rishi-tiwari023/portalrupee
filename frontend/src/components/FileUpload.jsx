import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axios';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Premium Reusable File Upload Component with Drag-and-Drop, Client Validation & Progress Bar
 */
const FileUpload = ({
  label = 'Upload Document',
  accept = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  maxSize = 5 * 1024 * 1024, // 5MB default
  onUploadSuccess,
  onUploadError,
  onUploadStart,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const cancelTokenRef = useRef(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Format bytes to human readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Pre-flight file validation
  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    // Validate type
    const fileType = selectedFile.type;
    const isAllowedType = accept.includes(fileType) ||
      // Handle extension-based checking fallback
      accept.some(ext => selectedFile.name.toLowerCase().endsWith(ext.toLowerCase()));

    if (!isAllowedType) {
      const formattedTypes = accept.map(t => t.split('/')[1] || t).join(', ').toUpperCase();
      const err = `Invalid file type. Only ${formattedTypes} files are allowed.`;
      setErrorMsg(err);
      toast.error(err);
      return false;
    }

    // Validate size
    if (selectedFile.size > maxSize) {
      const err = `File is too large. Maximum size is ${formatBytes(maxSize)}.`;
      setErrorMsg(err);
      toast.error(err);
      return false;
    }

    setErrorMsg('');
    return true;
  };

  // Initialize upload process
  const startUpload = async (fileToUpload) => {
    setFile(fileToUpload);
    setUploadProgress(0);
    setUploadState('uploading');

    if (onUploadStart) onUploadStart();

    // Create local preview if image
    if (fileToUpload.type.startsWith('image/')) {
      const localUrl = URL.createObjectURL(fileToUpload);
      setPreviewUrl(localUrl);
    } else {
      setPreviewUrl(null);
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);

    // Set up Cancel Token
    cancelTokenRef.current = axios.CancelToken.source();

    try {
      const response = await api.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        cancelToken: cancelTokenRef.current.token,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data && response.data.success) {
        setUploadState('success');
        setUploadProgress(100);

        const serverData = response.data.data;
        // Update to server-returned S3 pre-signed URL for final display
        if (serverData.url) {
          setPreviewUrl(serverData.url);
        }

        toast.success(`${fileToUpload.name} uploaded successfully!`);
        if (onUploadSuccess) onUploadSuccess(serverData);
      } else {
        throw new Error('Upload succeeded but server response structure is invalid.');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        setUploadState('idle');
        setFile(null);
        setPreviewUrl(null);
        toast.info('Upload cancelled.');
      } else {
        setUploadState('error');
        const errorText = error.response?.data?.message || 'Failed to upload document.';
        setErrorMsg(errorText);
        toast.error(errorText);
        if (onUploadError) onUploadError(errorText);
      }
    }
  };

  // Cancel file upload
  const cancelUpload = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Upload cancelled by the user.');
    }
  };

  // Drag Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (uploadState === 'uploading') {
      toast.warning('An upload is already in progress.');
      return;
    }

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      startUpload(droppedFile);
    }
  };

  // File Input Handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      startUpload(selectedFile);
    }
  };

  // Click Dropzone Handler
  const handleZoneClick = () => {
    if (uploadState === 'uploading') return;
    fileInputRef.current.click();
  };

  // Reset Component State
  const resetUpload = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setUploadState('idle');
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept.join(',')}
        className="hidden"
      />

      {/* Dropzone container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        className={`
          relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[220px] overflow-hidden
          ${isDragging
            ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-500/5 scale-[1.01]'
            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-400 hover:shadow-sm'
          }
          ${uploadState === 'uploading' ? 'cursor-not-allowed border-indigo-300 bg-white' : ''}
          ${uploadState === 'success' ? 'border-emerald-300 bg-emerald-50/20' : ''}
          ${uploadState === 'error' ? 'border-rose-300 bg-rose-50/20' : ''}
        `}
      >
        {/* State 1: Uploading progress overlay */}
        {uploadState === 'uploading' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <span className="text-slate-800 font-bold mb-1">Uploading your document...</span>
            <span className="text-xs font-semibold text-slate-400 mb-6">{file?.name}</span>

            {/* Custom linear progress bar */}
            <div className="w-full max-w-xs bg-slate-100 h-2.5 rounded-full overflow-hidden relative mb-4 border border-slate-200/50">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex justify-between w-full max-w-xs text-xs font-extrabold text-slate-500 px-1 mb-6">
              <span>{uploadProgress}% Completed</span>
              <span>{formatBytes(file?.size || 0)}</span>
            </div>

            <button
              type="button"
              onClick={cancelUpload}
              className="flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <X size={14} />
              <span>Cancel Upload</span>
            </button>
          </div>
        )}

        {/* State 2: Success state with image preview */}
        {uploadState === 'success' && (
          <div className="flex flex-col items-center justify-center text-center p-2 w-full">
            {previewUrl ? (
              <div className="relative mb-4 group rounded-2xl overflow-hidden shadow-md max-h-[160px] max-w-[240px] border border-emerald-100 bg-slate-100 p-1">
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  className="max-h-[150px] object-contain rounded-xl"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    setPreviewUrl(null);
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                <FileText size={32} />
              </div>
            )}

            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="text-emerald-500 w-5 h-5" />
              <span className="text-slate-800 font-extrabold text-sm">{file?.name}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">
              {formatBytes(file?.size || 0)} • Uploaded Successfully
            </span>

            <button
              type="button"
              onClick={resetUpload}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
            >
              <RefreshCw size={12} />
              <span>Replace File</span>
            </button>
          </div>
        )}

        {/* State 3: Error state */}
        {uploadState === 'error' && (
          <div className="flex flex-col items-center justify-center text-center p-2">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
              <AlertCircle size={32} />
            </div>
            <span className="text-slate-800 font-extrabold text-sm mb-1">Upload Failed</span>
            <p className="text-xs text-rose-500 font-semibold max-w-[280px] mb-6 leading-relaxed">
              {errorMsg || 'An unknown error occurred during upload.'}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetUpload}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
              >
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); startUpload(file); }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-200"
              >
                <RefreshCw size={12} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* State 4: Default Idle state */}
        {uploadState === 'idle' && (
          <div className="flex flex-col items-center justify-center text-center pointer-events-none">
            <div className={`w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 transition-all duration-300 ${isDragging ? 'scale-110 shadow-lg shadow-indigo-100 bg-indigo-100 text-indigo-700' : ''}`}>
              <UploadCloud size={32} className={isDragging ? 'animate-bounce' : ''} />
            </div>

            <p className="text-slate-800 font-extrabold text-sm mb-1 leading-snug">
              Drag & drop your document here, or <span className="text-indigo-600 font-black">browse</span>
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Supports JPEG, JPG, PNG, PDF (Max {formatBytes(maxSize)})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
