import React from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function ErrorBanner({ error, onReset, strings }) {
  if (!error) return null;

  return (
    <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-3xl p-6 sm:p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto shadow-inner">
        <AlertOctagon className="w-6 h-6" />
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#991B1B] font-heading">
          {strings.errorTitle || "Unable to Complete Analysis"}
        </h3>
        <p className="text-sm text-[#B91C1C] mt-1 max-w-sm mx-auto leading-relaxed">
          {error.message || String(error)}
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="min-h-[46px] px-6 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] active:scale-95 text-white font-bold rounded-2xl shadow-md shadow-[#DC2626]/20 text-xs transition-all inline-flex items-center gap-2 cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        <span>{strings.tryAgain || "Try Again"}</span>
      </button>
    </div>
  );
}
