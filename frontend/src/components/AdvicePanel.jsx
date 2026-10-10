import React from "react";
import { BookOpen, CheckCircle, AlertCircle, UserCheck, Sparkles, Stethoscope, ShieldCheck } from "lucide-react";

export default function AdvicePanel({ guidance, isHealthy, strings }) {
  if (!guidance) return null;

  const { summary, visibleSymptoms, safeNextSteps, whenToSeekExpert, source } = guidance;

  return (
    <div className="agro-card p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8E0]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#14532D] text-[#BEF264] flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#17251C] font-heading">
              {strings.agriGuidance || "Agricultural Remediation & Care Plan"}
            </h3>
            <p className="text-xs text-[#647067]">Agronomic guidance, cultural sanitation & prevention</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F0FDF4] text-[#14532D] border border-[#BBF7D0]">
          <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>{source === "gemini" ? "AI Agronomist" : "Standard Guidance"}</span>
        </span>
      </div>

      {/* Summary Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F7FAF5] border border-[#E2E8E0] text-sm text-[#17251C] leading-relaxed font-medium">
        {summary}
      </div>

      {/* Visible Symptoms (hide if healthy or empty) */}
      {!isHealthy && visibleSymptoms && visibleSymptoms.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#92400E] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
            <span>{strings.typicalSymptoms || "Typical Visible Symptoms"}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {visibleSymptoms.map((symptom, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-[#17251C] bg-[#FFFBEB] p-3 rounded-xl border border-[#FDE68A]"
              >
                <span className="w-2 h-2 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                <span className="leading-snug">{symptom}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Next Steps (Treatment & Cultural Sanitation) */}
      {safeNextSteps && safeNextSteps.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#14532D] flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-[#22C55E]" />
            <span>{strings.safeSteps || "Safe Next Steps & Cultural Sanitation"}</span>
          </h4>
          <div className="grid grid-cols-1 gap-2.5">
            {safeNextSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-sm text-[#17251C]"
              >
                <span className="w-6 h-6 rounded-xl bg-[#14532D] text-[#BEF264] font-bold flex items-center justify-center shrink-0 text-xs shadow-sm">
                  {idx + 1}
                </span>
                <span className="pt-0.5 leading-snug">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* When to Seek Local Expert */}
      {whenToSeekExpert && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#14532D] flex items-start gap-3">
          <UserCheck className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-[#14532D] mb-1">
              {strings.whenToSeek || "When to Seek Certified Agricultural Assistance"}
            </p>
            <p className="leading-relaxed text-[#17251C]">{whenToSeekExpert}</p>
          </div>
        </div>
      )}

    </div>
  );
}
