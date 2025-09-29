import React, { useState } from 'react';
import { Upload, FileText, Download, Loader2, CheckCircle2, X } from 'lucide-react';

const TimetableUploader: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setDownloadUrls([]);
      setError('');
      setStep(2);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(Array.from(e.dataTransfer.files));
      setDownloadUrls([]);
      setError('');
      setStep(2);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      
      const contentType = res.headers.get('content-type');
      const blob = await res.blob();
      let urls: string[] = [];
      
      if (contentType && contentType.includes('application/zip')) {
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/zip' }));
        urls = [url];
      } else {
        const url = window.URL.createObjectURL(blob);
        urls = [url];
      }
      
      setDownloadUrls(urls);
      setStep(3);
    } catch (err) {
      setError('Failed to resolve timetables.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Timetable Resolver</h1>
          <p className="text-gray-600">Upload your timetable files and resolve conflicts instantly</p>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden">
          <div className="p-8">
            {/* Step 1: Upload */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Files</h2>
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 ${
                    dragActive
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-600 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".docx"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                  />
                  <div className="text-center">
                    <Upload className={`mx-auto h-12 w-12 mb-4 transition-colors ${dragActive ? 'text-purple-600' : 'text-gray-400'}`} />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-lg font-semibold text-purple-600 hover:text-purple-500">
                        Choose files
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-2">DOCX only (multiple files supported)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Preview */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Files</h2>
                <div className="space-y-2 mb-6">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 rounded-xl p-4 group hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setFiles([]);
                      setError('');
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={files.length === 0 || loading}
                    className="flex-1 bg-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Resolving...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Resolve Timetables</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Results */}
            {step === 3 && downloadUrls.length > 0 && (
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-full mb-4">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Timetables Resolved!</h2>
                  <p className="text-gray-600">Your files have been processed successfully</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Processed Files</h3>
                  <div className="space-y-2 mb-6">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center space-x-3 bg-white rounded-lg p-3">
                        <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>

                  {downloadUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      download={files.length > 1 ? 'resolved_timetables.zip' : 'resolved_timetable.docx'}
                      className="flex items-center justify-center space-x-2 w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 text-center"
                    >
                      <span>Download {files.length > 1 ? 'All Resolved Timetables' : 'Resolved Timetable'}</span>
                    </a>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFiles([]);
                    setDownloadUrls([]);
                    setError('');
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Process More Files
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Your files are processed securely and never stored on our servers
        </p>
      </div>
    </div>
  );
};

export default TimetableUploader;