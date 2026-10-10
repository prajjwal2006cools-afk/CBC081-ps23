import React from "react";
import { ShieldCheck, UserCheck, AlertCircle } from "lucide-react";

export default function TrustSection() {
  return (
    <section id="about" className="py-16 bg-white border-t border-[#E2E8E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-[#0B1F17] rounded-3xl p-8 sm:p-12 border border-[#14532D] text-white relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14532D] text-[#BEF264] text-xs font-bold uppercase tracking-wider border border-[#22C55E]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Responsible AI Agro Directive</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Trust, Scientific Rigor & Responsible Crop Care
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              AcropGuard AI Agro is designed to provide immediate, data-driven screening assistance for farmers and agronomy students. Our models analyze visual symptoms based on trained pathological datasets, offering probabilistic guidance and low-risk cultural practices.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-slate-300 border-t border-white/10">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#BEF264] shrink-0" />
                <span>Informational advisory — not an unconditional chemical recommendation.</span>
              </div>
              <div className="hidden sm:block text-slate-500">•</div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Verify with local agricultural extension officers before applying synthetic pesticides.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
