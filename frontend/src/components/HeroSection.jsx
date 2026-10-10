import React from "react";
import { ArrowRight, Sparkles, ShieldCheck, Cpu, Leaf, Eye } from "lucide-react";

export default function HeroSection({ onAnalyzeClick, onExploreClick }) {
  return (
    <section id="hero" className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 hero-forest-bg">
      {/* Botanical Leaf SVG Silhouettes Watermark */}
      <svg className="botanical-leaves-hero-left" viewBox="0 0 350 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M120 40C110 90 70 140 20 160C80 170 140 150 180 110C210 150 200 220 150 270C220 250 270 200 280 130" stroke="#BEF264" stroke-width="4" stroke-linecap="round" />
        <path d="M40 220C10 270 0 340 10 410C50 360 80 300 80 230" stroke="#BEF264" stroke-width="3" stroke-linecap="round" />
        <path d="M150 320C110 380 90 460 110 540C160 480 190 410 190 330" stroke="#BEF264" stroke-width="3" stroke-linecap="round" />
      </svg>

      {/* Subtle organic background gradient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#BEF264]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#BEF264]/15 border border-[#BEF264]/30 text-[#BEF264] text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#BEF264]" />
              <span>Next-Gen Agricultural Intelligence</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] font-heading">
              Healthy Crops. <br className="hidden sm:inline" />
              <span className="text-[#BEF264]">
                Smarter Farming.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-[#A3C4AC] leading-relaxed max-w-2xl font-normal">
              Identify crop diseases early with AI-powered image analysis and actionable crop-care guidance.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onAnalyzeClick}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#BEF264] hover:bg-[#d4f78e] active:scale-[0.98] text-[#0B2418] font-extrabold text-base shadow-lg shadow-[#BEF264]/25 transition-all cursor-pointer"
              >
                <span>Analyze Your Crop</span>
                <ArrowRight className="w-5 h-5 text-[#0B2418]" />
              </button>

              <button
                type="button"
                onClick={onExploreClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white font-bold text-base border border-white/20 shadow-sm transition-all cursor-pointer backdrop-blur-md"
              >
                <span>Explore Features</span>
              </button>
            </div>

            {/* Credibility / Tech Badges */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-[#BEF264] font-heading">38</p>
                <p className="text-xs text-[#A3C4AC] font-medium mt-0.5">Crop & Disease Classes</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-[#BEF264] font-heading">Sub-Second</p>
                <p className="text-xs text-[#A3C4AC] font-medium mt-0.5">MobileNetV2 Inference</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-[#BEF264] font-heading">Actionable</p>
                <p className="text-xs text-[#A3C4AC] font-medium mt-0.5">Remediation Steps</p>
              </div>
            </div>

          </div>

          {/* Right Column: Agricultural Visual with Smart HUD */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Outer Glow & Card */}
              <div className="relative rounded-3xl overflow-hidden border border-white/20 bg-[#0E2B1B]/70 shadow-2xl shadow-black/40 backdrop-blur-md">
                <img
                  src="/hero-field.jpg"
                  alt="Agricultural field foliage and smart crop analysis"
                  className="w-full h-[380px] sm:h-[440px] object-cover"
                />

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F17]/90 via-transparent to-black/20" />

                {/* Scanning HUD Line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#BEF264] to-transparent shadow-[0_0_12px_#BEF264] animate-scan-beam pointer-events-none" />

                {/* Top Floating Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="glass-panel-dark px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-white border border-white/15">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
                    <span>Real-Time Leaf Pathology</span>
                  </div>
                  <div className="glass-panel px-3 py-1.5 rounded-xl text-[11px] font-bold text-[#14532D]">
                    MobileNetV2 Engine
                  </div>
                </div>

                {/* Bottom Overlay Card */}
                <div className="absolute bottom-4 inset-x-4 glass-panel p-4 rounded-2xl shadow-lg border border-white/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#14532D] text-[#BEF264] flex items-center justify-center font-bold text-sm">
                        <Leaf className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#17251C]">AI Leaf Health Scanner</p>
                        <p className="text-[11px] text-[#647067]">Foliar Spot & Blight Detection</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#14532D] border border-[#BBF7D0]">
                      Active
                    </span>
                  </div>
                </div>

              </div>

              {/* Decorative Corner Leaf Accent */}
              <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-2xl bg-[#BEF264] text-[#14532D] hidden sm:flex items-center justify-center shadow-md -z-10 rotate-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
