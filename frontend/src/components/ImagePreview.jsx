import React from "react";
import { ArrowRight, RotateCcw, Sparkles, Image as ImageIcon, FileCheck2, Trash2 } from "lucide-react";

export default function ImagePreview({ previewUrl, file, onRetake, onAnalyze, isAnalyzing, strings }) {
  const sizeKb = file?.size ? Math.round(file.size / 1024) : 0;

  return (
    <div className="agro-card p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8E0]">
        <div>
          <h3 className="text-xl font-bold text-[#17251C] font-heading">
            {strings.previewTitle || "Confirm Your Crop Image"}
          </h3>
          <p className="text-xs text-[#647067] flex items-center gap-1.5 mt-0.5 font-medium">
            <FileCheck2 className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>{file?.name || "Selected Leaf"}</span>
            {sizeKb > 0 && <span>({sizeKb} KB)</span>}
          </p>
        </div>

        <button
          type="button"
          onClick={onRetake}
          disabled={isAnalyzing}
          className="text-xs font-bold text-[#647067] hover:text-[#EF4444] flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E2E8E0] hover:bg-[#FEF2F2] hover:border-[#FCA5A5] transition-all disabled:opacity-50 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{strings.retake || "Replace Image"}</span>
        </button>
      </div>

      {/* Preview container with AI scanning target corners */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0B1F17] flex items-center justify-center min-h-[300px] max-h-[420px] shadow-inner border border-[#14532D]">
        <img
          src={previewUrl}
          alt="Selected crop leaf preview"
          className="max-h-[420px] w-auto object-contain mx-auto"
        />

        {/* Viewfinder corner guides */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#BEF264] pointer-events-none" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#BEF264] pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#BEF264] pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#BEF264] pointer-events-none" />

        {/* Status Pill */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel-dark px-4 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-2 border border-[#22C55E]/40 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-[#BEF264]" />
          <span>Foliar Pathogen Target Locked</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onRetake}
          disabled={isAnalyzing}
          className="w-full sm:w-1/3 min-h-[48px] px-5 py-3 border border-[#E2E8E0] hover:bg-[#F7FAF5] text-[#17251C] font-bold rounded-2xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4 text-[#647067]" />
          <span>{strings.chooseAnother || "Remove"}</span>
        </button>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full sm:w-2/3 min-h-[48px] px-6 py-3 bg-[#14532D] hover:bg-[#0B1F17] active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-[#14532D]/20 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer border border-[#14532D]"
        >
          <Sparkles className="w-5 h-5 text-[#BEF264]" />
          <span>{strings.analyzeButton || "Analyze Image"}</span>
          <ArrowRight className="w-5 h-5 text-[#BEF264]" />
        </button>
      </div>
    </div>
  );
}
