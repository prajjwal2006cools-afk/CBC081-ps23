import React from "react";
import { UploadCloud, Cpu, ClipboardCheck, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: UploadCloud,
      title: "Upload a Crop Image",
      description:
        "Capture a clear, well-lit photo of a single crop leaf directly in the field, upload from your gallery, or test instantly with one of our sample leaves.",
      badge: "Step 1: Capture",
    },
    {
      step: "02",
      icon: Cpu,
      title: "Run AI-Powered Analysis",
      description:
        "Our MobileNetV2 deep learning model analyzes visual foliar symptoms, assessing pathological patterns across 38 distinct plant disease classes.",
      badge: "Step 2: Neural Inference",
    },
    {
      step: "03",
      icon: ClipboardCheck,
      title: "Review Results & Guidance",
      description:
        "Receive immediate diagnostic confidence scores, key visible symptoms, practical cultural sanitation steps, and organic crop-care recommendations.",
      badge: "Step 3: Actionable Care",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-white border-y border-[#E2E8E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#14532D]/10 text-[#14532D] tracking-wide uppercase">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17251C] tracking-tight font-heading">
            How AcropGuard Works
          </h2>
          <p className="text-base text-[#647067]">
            From a single leaf photo to comprehensive agronomic insights in seconds.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-[#F7FAF5] rounded-3xl p-8 border border-[#E2E8E0] hover:border-[#22C55E]/50 hover:shadow-lg hover:shadow-[#14532D]/5 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Step Pill */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#14532D] text-[#BEF264] flex items-center justify-center font-extrabold text-base shadow-sm group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-[#14532D]/20 font-heading">
                    {item.step}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-[#14532D] tracking-wider uppercase">
                    {item.badge}
                  </span>
                  <h3 className="text-xl font-bold text-[#17251C] font-heading">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#647067] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E2E8E0] flex items-center text-xs font-bold text-[#14532D] gap-1 group-hover:gap-2 transition-all">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
