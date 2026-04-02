"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, FileText, Upload, Download } from "lucide-react";
import { useDashboard } from "../layout";
import { updateNurseProfile, uploadResume } from "../../../utils/api";

export default function NurseResumesPage() {
  const { data, loading } = useDashboard();
  const user = data?.user;

  const [resumes, setResumes] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.NurseProfile) {
      setResumes(user.NurseProfile.documents || []);
      setEducation(user.NurseProfile.education || []);
      setExperience(user.NurseProfile.experience || []);
      setAwards(user.NurseProfile.awards || []);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      await updateNurseProfile(user.id, {
        documents: resumes,
        education,
        experience,
        awards,
      });
      alert("Resume details saved successfully!");
    } catch (err) {
      console.error("Failed to save resume:", err);
      alert("Error saving resume details. Please ensure the backend is running.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only PDF and Word documents are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be smaller than 5 MB.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");
      const updatedProfile = await uploadResume(user.id, file);
      // updatedProfile.documents is the new array from Prisma
      const newDocs = updatedProfile.documents || [];
      setResumes(newDocs);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input so same file can be re-uploaded if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveDocument = async (fileId: number) => {
    if (!user) return;
    const updated = resumes.filter(r => r.id !== fileId);
    setResumes(updated);
    try {
      await updateNurseProfile(user.id, { documents: updated });
    } catch (err) {
      console.error('Failed to remove document:', err);
    }
  };

  const removeItem = (setter: any, list: any[], id: number) => {
    setter(list.filter(item => item.id !== id));
  };

  const updateItem = (setter: any, list: any[], id: number, newTitle: string) => {
    setter(list.map(item => item.id === id ? { ...item, title: newTitle } : item));
  };

  const addItem = (setter: any, list: any[], defaultTitle: string) => {
    setter([...list, { id: Date.now(), title: defaultTitle }]);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading Resumes...</div>;
  }

  return (
    <div className="resume-page-content">
      <div className="content-header">
        <h1 className="page-title">My Resume</h1>
        <div className="breadcrumbs">
          <span>Candidate</span> / <span>Dashboard</span> / <span className="active">My Resume</span>
        </div>
      </div>

      <div className="resume-sections">
        
        {/* My Resume Files Section */}
        <div className="card-panel">
          <h3 className="section-title">My Resume</h3>
          <div className="resume-files-grid">
            {resumes.length === 0 && (
              <p style={{ color: '#718096', fontSize: '14px', margin: '8px 0 16px' }}>
                No resumes uploaded yet.
              </p>
            )}
            {resumes.map(file => (
              <div key={file.id} className="file-card">
                <button 
                  className="btn-remove" 
                  title="Remove file"
                  onClick={() => handleRemoveDocument(file.id)}
                >
                  <X size={14} />
                </button>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-type">{file.type}</span>
                  {file.url && (
                    <a
                      href={`http://localhost:3001${file.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-download-link"
                      title="Download file"
                    >
                      <Download size={12} /> Download
                    </a>
                  )}
                </div>
                <div className="file-icon-wrap" style={{ 
                  backgroundColor: file.type === 'PDF' ? '#C8102E' : '#002868' 
                }}>
                  <FileText size={24} className="text-white" />
                  <span className="icon-badge">{file.type}</span>
                </div>
              </div>
            ))}
          </div>

          {uploadError && (
            <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '8px' }}>{uploadError}</p>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          <button 
            className="btn-secondary-light mt-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <><span className="upload-spinner"></span> Uploading...</>
            ) : (
              <><Upload size={16} style={{ marginRight: 8 }} /> Upload a file</>
            )}
          </button>
          <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '8px' }}>PDF or Word (.doc, .docx) — max 5 MB</p>
        </div>

        {/* Education Section */}
        <div className="card-panel">
          <h3 className="section-title">Education</h3>
          <div className="list-items">
            {education.map(item => (
              <div key={item.id} className="list-row">
                <button className="btn-remove-row" onClick={() => removeItem(setEducation, education, item.id)}><X size={14} /></button>
                <input 
                  type="text" 
                  className="row-title-input" 
                  value={item.title} 
                  onChange={(e) => updateItem(setEducation, education, item.id, e.target.value)} 
                />
              </div>
            ))}
          </div>
          <button className="btn-secondary-light mt-4" onClick={() => addItem(setEducation, education, "New Education")}>Add More Education</button>
        </div>

        {/* Experience Section */}
        <div className="card-panel">
          <h3 className="section-title">Experience</h3>
          <div className="list-items">
            {experience.map(item => (
              <div key={item.id} className="list-row">
                <button className="btn-remove-row" onClick={() => removeItem(setExperience, experience, item.id)}><X size={14} /></button>
                <input 
                  type="text" 
                  className="row-title-input" 
                  value={item.title} 
                  onChange={(e) => updateItem(setExperience, experience, item.id, e.target.value)} 
                />
              </div>
            ))}
          </div>
          <button className="btn-secondary-light mt-4" onClick={() => addItem(setExperience, experience, "New Experience")}>Add More Experience</button>
        </div>

        {/* Awards Section */}
        <div className="card-panel">
          <h3 className="section-title">Award</h3>
          <div className="list-items">
            {awards.map(item => (
              <div key={item.id} className="list-row">
                <button className="btn-remove-row" onClick={() => removeItem(setAwards, awards, item.id)}><X size={14} /></button>
                <input 
                  type="text" 
                  className="row-title-input" 
                  value={item.title} 
                  onChange={(e) => updateItem(setAwards, awards, item.id, e.target.value)} 
                />
              </div>
            ))}
          </div>
          <button className="btn-secondary-light mt-4" onClick={() => addItem(setAwards, awards, "New Award")}>Add More Award</button>
        </div>

        <button 
          className="btn-primary mt-2" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Resume"}
        </button>
      </div>

      <style jsx>{`
        .resume-page-content {
          max-width: 1000px;
        }
        .content-header {
          margin-bottom: 32px;
        }
        .page-title {
          font-size: 28px;
          margin-bottom: 8px;
          color: #002868;
        }
        .breadcrumbs {
          font-size: 14px;
          color: #718096;
        }
        .breadcrumbs span.active {
          color: #002868;
          font-weight: 600;
        }

        .resume-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card-panel {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #edf2f7;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          padding: 30px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #002868;
          margin: 0 0 24px 0;
          padding-bottom: 16px;
          border-bottom: 1px solid #edf2f7;
        }

        /* Resume Files Grid */
        .resume-files-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .file-card {
          position: relative;
          background: #f0f7ff;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 300px;
          border: 1px solid #e2efff;
        }
        .file-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .file-name {
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
        }
        .file-type {
          font-size: 13px;
          color: #002868;
          font-weight: 700;
        }
        .file-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .icon-badge {
          font-size: 9px;
          font-weight: 800;
          color: #fff;
          margin-top: 2px;
        }

        .btn-remove {
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          background: #fee2e2;
          color: #ef4444;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-remove:hover, .btn-remove-row:hover {
          background: #ef4444;
          color: #fff;
        }

        /* List Rows for Education/Experience */
        .list-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .list-row {
          display: flex;
          align-items: center;
          background: #f8fafc;
          padding: 16px 20px;
          border-radius: 8px;
          position: relative;
          border: 1px solid #edf2f7;
        }
        .row-title-input {
          flex: 1;
          font-size: 14px;
          color: #4a5568;
          font-weight: 500;
          margin-left: 20px;
          background: transparent;
          border: none;
          outline: none;
        }
        .row-title-input:focus {
          border-bottom: 2px solid #002868;
        }
        .btn-remove-row {
          position: absolute;
          left: -8px;
          width: 20px;
          height: 20px;
          background: #fee2e2;
          color: #ef4444;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        /* Buttons */
        .btn-secondary-light {
          background: #f0f7ff;
          color: #002868;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-secondary-light:hover {
          background: #e2efff;
        }

        .btn-primary {
          background: #C8102E;
          color: #fff;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
          align-self: flex-start;
        }
        .btn-primary:hover {
          background: #a00d25;
        }

        .btn-secondary-light:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .file-download-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #002868;
          font-weight: 600;
          margin-top: 4px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .file-download-link:hover {
          color: #C8102E;
        }

        .upload-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid #002868;
          border-top-color: transparent;
          border-radius: 50%;
          display: inline-block;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .file-card {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
