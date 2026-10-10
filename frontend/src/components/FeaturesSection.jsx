import React from "react";
import { Brain, ShieldAlert, Camera, Stethoscope, Smartphone, MessageSquareHeart } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Disease Identification",
      description:
        "Trained on 38 botanical categories including Apple, Tomato, Corn, Potato, and Grape crops to deliver differential predictions with probability rankings.",
      highlight: "38 Target Classes",
    },
    {
      icon: ShieldAlert,
      title: "Early Detection Support",
      description:
        "Helps spot foliar symptoms, fungal lesions, blights, and leaf spots early before pathogens propagate across entire fields or greenhouses.",
      highlight: "Proactive Protection",
    },
    {
      icon: Camera,
      title: "Image-Based Leaf Analysis",
      description:
        "Direct camera capture or gallery image upload with real-time format validation, resolution checks, and automatic image normalization.",
      highlight: "Rapid Diagnostics",
    },
    {
      icon: Stethoscope,
      title: "Treatment & Prevention Guidance",
      description:
        "Actionable cultural practices, organic sanitation advice, watering adjustments, and explicit guidelines on when to involve local extension officers.",
      highlight: "Safe Remediation",
    },
    {
      icon: Smartphone,
      title: "Farmer-Friendly Interface",
      description:
        "High-contrast text, generous 48px+ touch targets, instant 1-click sample leaf testing, and responsive design tailored for field devices.",
      highlight: "Field-Ready UI",
    },
    {
      icon: MessageSquareHeart,
      title: "Multilingual Agronomist Chat",
      description:
        "Full support for English, Hindi, and Kannada language switching, accompanied by an interactive agronomist assistant for follow-up crop questions.",
      highlight: "Multi-Language & Q&A",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-[#F7FAF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#14532D]/10 text-[#14532D] tracking-wide uppercase">
            Core Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17251C] tracking-tight font-heading">
            Built for Modern Agricultural Care
          </h2>
          <p className="text-base text-[#647067]">
            Empowering growers and agronomists with reliable AI detection and safe, responsible crop care.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-[#E2E8E0] hover:border-[#22C55E]/40 hover:shadow-lg hover:shadow-[#14532D]/5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-[#14532D] flex items-center justify-center border border-[#BBF7D0] group-hover:bg-[#14532D] group-hover:text-[#BEF264] transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F7FAF5] text-[#14532D] border border-[#E2E8E0]">
                      {feat.highlight}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#17251C] font-heading mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[#647067] leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E2E8E0]/60 flex items-center gap-2 text-xs font-semibold text-[#14532D]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span>Production-tested feature</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
