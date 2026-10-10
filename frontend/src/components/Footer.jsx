import React from "react";
import { Sprout, ArrowUp, Heart } from "lucide-react";

export default function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-[#E2E8E0] pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#E2E8E0]">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo("hero")}>
              <div className="w-10 h-10 rounded-2xl bg-[#14532D] text-[#BEF264] flex items-center justify-center shadow-sm">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-[#17251C] font-heading">
                  AcropGuard
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#14532D] text-[#BEF264] uppercase tracking-wider">
                  AI Agro
                </span>
              </div>
            </div>

            <p className="text-sm text-[#647067] leading-relaxed max-w-sm">
              Early crop disease detection and agronomic advisory platform powered by MobileNetV2 neural intelligence and expert cultural remediation guidance.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17251C] mb-4 font-heading">
              Platform Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-[#647067]">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo("hero")}
                  className="hover:text-[#14532D] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo("detect-disease")}
                  className="hover:text-[#14532D] transition-colors"
                >
                  Detect Disease
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo("how-it-works")}
                  className="hover:text-[#14532D] transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo("features")}
                  className="hover:text-[#14532D] transition-colors"
                >
                  Features & Capabilities
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo("about")}
                  className="hover:text-[#14532D] transition-colors"
                >
                  Responsible AI Guidelines
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture / Tech Stack */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17251C] mb-4 font-heading">
              Technology Architecture
            </h4>
            <ul className="space-y-2 text-xs text-[#647067]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span>MobileNetV2 Deep Learning (Keras)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span>FastAPI + Uvicorn Server</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span>React 18 + Vite + Tailwind CSS</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span>Gemini Agronomic Advisory Engine</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#647067]">
          <p>© 2026 AcropGuard AI Agro. Precision Crop Protection System.</p>
          <button
            type="button"
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-1.5 text-[#14532D] font-bold hover:underline"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
