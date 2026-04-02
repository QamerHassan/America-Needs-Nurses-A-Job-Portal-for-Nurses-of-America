"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ImageUploadProps {
  value?: string;          // current URL
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  compact?: boolean;       // smaller variant for sidebar
}

export default function ImageUpload({ value, onChange, onRemove, label, compact = false }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const upload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large (max 10 MB).");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_URL}/uploads`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(`${API_URL}${data.url}`);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  if (compact) {
    return (
      <div className="compact-upload">
        {value ? (
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
            <img src={value} alt="Uploaded" style={{ width: "100%", height: 80, objectFit: "cover", display: "block" }} />
            <button
              type="button"
              onClick={() => { onChange(""); onRemove?.(); }}
              style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={12} color="white" />
            </button>
            <div style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(0,180,80,0.85)", borderRadius: 6, padding: "2px 6px", display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle size={10} color="white" />
              <span style={{ fontSize: 9, color: "white", fontWeight: 700 }}>Uploaded</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #e2e8f0", borderRadius: 12, padding: "14px 10px",
              textAlign: "center", cursor: "pointer", transition: "all 0.2s",
              background: uploading ? "#f0fdf4" : "#f8fafc",
            }}
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" style={{ margin: "0 auto", color: "#002868" }} />
            ) : (
              <>
                <Upload size={16} style={{ margin: "0 auto 4px", color: "#94a3b8" }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", margin: 0 }}>Click to upload</p>
              </>
            )}
          </div>
        )}
        {error && <p style={{ fontSize: 10, color: "#ef4444", marginTop: 4, fontWeight: 600 }}>{error}</p>}
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
      </div>
    );
  }

  // Full-size variant (used inside article content blocks)
  return (
    <div className="image-upload-full">
      {value ? (
        <div style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
          <img src={value} alt="Uploaded" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
          {/* Overlay on hover */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", opacity: 0,
              transition: "opacity 0.2s", cursor: "pointer", display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
          >
            <Upload size={28} color="white" />
            <p style={{ color: "white", fontWeight: 700, fontSize: 13, margin: 0 }}>Click to replace image</p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.65)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={14} color="white" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? "#002868" : "#e2e8f0"}`,
            borderRadius: 16, padding: "36px 24px", textAlign: "center",
            cursor: uploading ? "wait" : "pointer", transition: "all 0.2s",
            background: dragOver ? "#eff6ff" : uploading ? "#f0fdf4" : "#f8fafc",
          }}
        >
          {uploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "#002868" }} />
              <p style={{ fontWeight: 700, color: "#002868", margin: 0, fontSize: 13 }}>Uploading...</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ImageIcon size={24} style={{ color: "#002868" }} />
              </div>
              <div>
                <p style={{ fontWeight: 800, color: "#002868", margin: "0 0 4px", fontSize: 14 }}>
                  {label || "Click to browse or drag & drop"}
                </p>
                <p style={{ color: "#94a3b8", fontSize: 11, margin: 0 }}>PNG, JPG, WEBP, GIF up to 10MB</p>
              </div>
            </div>
          )}
        </div>
      )}
      {error && (
        <p style={{ fontSize: 12, color: "#ef4444", marginTop: 8, fontWeight: 600, padding: "6px 12px", background: "#fef2f2", borderRadius: 8 }}>
          {error}
        </p>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
    </div>
  );
}
