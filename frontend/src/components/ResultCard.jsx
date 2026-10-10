import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle, ShieldCheck, Bug, Leaf, AlertCircle } from "lucide-react";

export default function ResultCard({ result, previewUrl, strings }) {
  const { crop, disease, isHealthy, confidence, confidenceLevel, mockMode, warnings } = result;

  const pct = Math.round(confidence * 100);

  // Confidence styling based on guidelines
  let confColor = "text-[#14532D] bg-[#F0FDF4] border-[#BBF7D0]";
  let barGradient = "confidence-botanical-fill";
  let confMsg = strings.confHigh || "High confidence prediction";

  if (confidenceLevel === "medium" || (confidence >= 0.5 && confidence < 0.8)) {
    confColor = "text-[#92400E] bg-[#FFFBEB] border-[#FDE68A]";
    barGradient = "bg-gradient-to-r from-amber-500 to-amber-600";
    confMsg = strings.confMedium || "Medium confidence. Consider a closer, clearer photo.";
  } else if (confidenceLevel === "low" || confidence < 0.5) {
    confColor = "text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]";
    barGradient = "bg-gradient-to-r from-rose-500 to-rose-600";
    confMsg = strings.confLow || "Low confidence. Retake photo or verify with local extension officer.";
  }

  return (
    <div className="agro-card-sage p-6 sm:p-8 space-y-6">
      
      {/* Mock mode banner if active */}
      {mockMode && (
        <div className="px-4 py-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl flex items-center gap-2.5 text-xs font-bold text-[#92400E]">
          <HelpCircle className="w-4 h-4 text-[#D97706] shrink-0" />
          <span>Demo Simulation Mode: Server is generating offline baseline data.</span>
        </div>
      )}

      {/* Warnings if any */}
      {warnings && warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, idx) => (
            <div
              key={idx}
              className="px-4 py-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl flex items-start gap-2.5 text-xs text-[#92400E] font-medium"
            >
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Dashboard Grid: Image Preview & Diagnosis Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left: Uploaded Leaf Photo Thumbnail if available */}
        {previewUrl && (
          <div className="md:col-span-4">
            <div className="relative rounded-2xl overflow-hidden bg-[#0B2418] aspect-square max-h-[220px] mx-auto border border-[#D4E5D8] shadow-sm flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Analyzed crop foliage"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 glass-panel-dark px-2.5 py-1 rounded-lg text-[10px] text-white font-semibold flex items-center justify-between">
                <span>Specimen</span>
                <span className="text-[#BEF264] font-bold">{crop}</span>
              </div>
            </div>
          </div>
        )}

        {/* Right: Diagnosis Details */}
        <div className={previewUrl ? "md:col-span-8 space-y-4" : "md:col-span-12 space-y-4"}>
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#14532D] bg-[#EAF4EC] px-3 py-1 rounded-full border border-[#CDE2D1]">
              <Leaf className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Crop Category: {crop}</span>
            </span>

            {/* Health Status Badge */}
            {isHealthy ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0FDF4] text-[#14532D] border border-[#BBF7D0] font-bold text-xs shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                <span>{strings.looksHealthy || "Healthy Foliage"}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA] font-bold text-xs shadow-sm">
                <Bug className="w-4 h-4 text-[#DC2626]" />
                <span>{strings.diseaseDetected || "Disease Marker Detected"}</span>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17251C] font-heading tracking-tight">
              {isHealthy ? (strings.healthyStatus || "Healthy Leaf") : disease}
            </h2>
            <p className="text-sm text-[#58695C] mt-1 leading-relaxed">
              {isHealthy
                ? "No visual symptoms of fungal necrosis, blight, or infectious damage identified."
                : `Pathological markers matching ${disease} detected on specimen leaf.`}
            </p>
          </div>

          {/* Confidence Score Bar */}
          <div className="bg-[#F4F8F5] rounded-2xl p-4 border border-[#D8E6DB] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#17251C]">
                {strings.confidenceScore || "Diagnostic Confidence Score"}
              </span>
              <span className="font-black text-[#14532D] text-sm">{pct}%</span>
            </div>

            <div className="w-full bg-[#DCE7DF] rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barGradient}`}
                style={{ width: `${Math.max(pct, 5)}%` }}
              />
            </div>

            <div className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1.5 ${confColor}`}>
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{confMsg}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
