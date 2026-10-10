import React, { useRef, useState } from "react";
import { Camera, Image as ImageIcon, UploadCloud, Leaf, Sparkles, AlertCircle, FileCheck2 } from "lucide-react";
import { validateImage } from "../api/client";

export default function UploadCard({ onPickFile, onSelectSample, onError, strings }) {
  const [isDragging, setIsDragging] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const validationError = validateImage(file);
    if (validationError) {
      onError(validationError);
      return;
    }
    onPickFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div id="detect-disease" className="space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14532D]/10 text-[#14532D] text-xs font-bold uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>Interactive Diagnostic Engine</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17251C] font-heading tracking-tight">
          Detect Crop Diseases
        </h2>
        <p className="text-base text-[#647067] leading-relaxed">
          Upload a clear photo of an affected or healthy crop leaf to run neural disease screening and receive instant agronomic care steps.
        </p>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Main Drag-and-Drop Card */}
      <div className="agro-card p-6 sm:p-10 text-center relative overflow-hidden">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => galleryInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 transition-all duration-200 cursor-pointer ${
            isDragging
              ? "border-[#22C55E] bg-[#F0FDF4] scale-[1.01]"
              : "border-[#E2E8E0] hover:border-[#22C55E] bg-[#F7FAF5]/50 hover:bg-[#F0FDF4]/30"
          }`}
        >
          {/* Centered Upload Icon Badge */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#14532D] text-[#BEF264] flex items-center justify-center mb-5 shadow-md shadow-[#14532D]/15">
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-[#17251C] font-heading mb-2">
            {strings.dragPrompt || "Drop your leaf photo here, or browse"}
          </h3>
          <p className="text-sm text-[#647067] max-w-md mx-auto mb-8 leading-relaxed">
            {strings.tip || "Use a clear, well-lit photo of a single crop leaf for highest accuracy."}
          </p>

          {/* Action Buttons with 48px+ Touch Target */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="w-full sm:w-auto min-h-[48px] px-7 py-3 bg-[#14532D] hover:bg-[#0B1F17] active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-[#14532D]/20 transition-all cursor-pointer border border-[#14532D]"
            >
              <ImageIcon className="w-5 h-5 text-[#BEF264]" />
              <span>Browse Image</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-white hover:bg-[#F7FAF5] active:scale-95 text-[#17251C] border border-[#E2E8E0] font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5 text-[#14532D]" />
              <span>{strings.takePhoto || "Take Photo"}</span>
            </button>
          </div>

          {/* Format & Size Requirements */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-[#647067]">
            <span className="flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5 text-[#22C55E]" />
              JPG, PNG, or WebP
            </span>
            <span>•</span>
            <span>Maximum file size: 5 MB</span>
          </div>
        </div>

        {/* 1-Click Test Samples */}
        <div className="mt-8 pt-8 border-t border-[#E2E8E0] text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#17251C] uppercase tracking-wider font-heading">
              <Sparkles className="w-4 h-4 text-[#22C55E]" />
              <span>{strings.quickTest || "Instant 1-Click Test Samples"}</span>
            </div>
            <span className="text-xs text-[#647067] font-medium hidden sm:inline">
              Pre-calibrated test leaves
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <button
              type="button"
              onClick={() => onSelectSample("tomato_late_blight")}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-[#E2E8E0] hover:border-[#EF4444] hover:bg-[#FEF2F2]/60 bg-white text-left transition-all group cursor-pointer shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#17251C] group-hover:text-[#DC2626] transition-colors">
                  Tomato Leaf
                </p>
                <p className="text-[11px] text-[#647067]">Late Blight Symptoms</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSelectSample("tomato_healthy")}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-[#E2E8E0] hover:border-[#22C55E] hover:bg-[#F0FDF4]/60 bg-white text-left transition-all group cursor-pointer shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#17251C] group-hover:text-[#15803D] transition-colors">
                  Healthy Leaf
                </p>
                <p className="text-[11px] text-[#647067]">Vibrant Green Foliage</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSelectSample("apple_scab")}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-[#E2E8E0] hover:border-[#F59E0B] hover:bg-[#FFFBEB]/60 bg-white text-left transition-all group cursor-pointer shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#17251C] group-hover:text-[#B45309] transition-colors">
                  Apple Leaf
                </p>
                <p className="text-[11px] text-[#647067]">Apple Scab Lesions</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
