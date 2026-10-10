import React, { useEffect, useState } from "react";
import { Loader2, Sprout, Sparkles, Scan, CheckCircle2 } from "lucide-react";

export default function Loader({ strings }) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="agro-card p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6">
      
      {/* Animated Radar Scanning Emblem */}
      <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
        {/* Pulsing Outer Rings */}
        <div className="absolute inset-0 rounded-full border-2 border-[#22C55E]/30 animate-ping opacity-30" />
        <div className="absolute inset-2 rounded-full border border-[#14532D]/20 animate-pulse" />
        
        {/* Radar Spinner */}
        <div className="w-20 h-20 rounded-full bg-[#14532D] text-[#BEF264] flex items-center justify-center shadow-lg shadow-[#14532D]/20">
          <Sprout className="w-9 h-9 animate-pulse-subtle" />
        </div>

        {/* Orbiting Scan Badge */}
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#BEF264] text-[#14532D] flex items-center justify-center shadow-md animate-bounce">
          <Scan className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-2xl font-bold text-[#17251C] font-heading">
          {strings.analyzing || "Analyzing Crop Leaf..."}
        </h3>
        <p className="text-sm text-[#647067] max-w-sm mx-auto leading-relaxed">
          {strings.loaderSubtext || "Evaluating visible foliar symptoms and pathological markers with AI..."}
        </p>
      </div>

      {/* Progress Steps Simulation */}
      <div className="bg-[#F7FAF5] rounded-2xl p-4 border border-[#E2E8E0] text-left space-y-2.5 max-w-sm mx-auto text-xs">
        <div className="flex items-center gap-2 text-[#14532D] font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>Image normalized (224×224 bilinear)</span>
        </div>
        <div className="flex items-center gap-2 text-[#14532D] font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>Scanning 38 crop pathogen categories</span>
        </div>
        <div className="flex items-center gap-2 text-[#647067] font-medium">
          <span className="w-4 h-4 rounded-full border-2 border-[#22C55E] border-t-transparent animate-spin" />
          <span>Synthesizing agronomic care recommendations</span>
        </div>
      </div>

      {secondsElapsed > 6 && (
        <div className="p-3 bg-[#FFFBEB] rounded-2xl border border-[#FDE68A] text-xs text-[#92400E] text-left flex items-start gap-2.5 max-w-sm mx-auto">
          <Sparkles className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <span>
            {secondsElapsed > 20
              ? "Warming neural network model weights on server..."
              : "Compiling detailed diagnosis & cultural sanitation recommendations..."}
          </span>
        </div>
      )}

      <div className="text-xs text-[#647067] font-semibold">
        Time Elapsed: {secondsElapsed}s
      </div>
    </div>
  );
}
