import React, { useState } from "react";
import { Sprout, Languages, Menu, X, ArrowUpRight, Cpu } from "lucide-react";
import ServerStatus from "./ServerStatus";

export default function Header({ lang, setLang, serverStatus }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E2E8E0] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo("hero")}>
            <div className="w-11 h-11 rounded-2xl bg-[#14532D] text-[#BEF264] flex items-center justify-center shadow-md shadow-[#14532D]/15 border border-[#14532D]">
              <Sprout className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-[#17251C] tracking-tight font-heading">
                  AcropGuard
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#14532D] text-[#BEF264] tracking-wide uppercase border border-[#14532D]">
                  AI Agro
                </span>
              </div>
              <p className="text-[11px] text-[#647067] font-medium hidden sm:block">
                Precision Crop Disease Diagnostic Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#17251C]">
            <button
              type="button"
              onClick={() => scrollTo("hero")}
              className="hover:text-[#14532D] transition-colors py-1 cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollTo("detect-disease")}
              className="hover:text-[#14532D] transition-colors py-1 cursor-pointer"
            >
              Detect Disease
            </button>
            <button
              type="button"
              onClick={() => scrollTo("how-it-works")}
              className="hover:text-[#14532D] transition-colors py-1 cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollTo("features")}
              className="hover:text-[#14532D] transition-colors py-1 cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollTo("about")}
              className="hover:text-[#14532D] transition-colors py-1 cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Right Controls: Status, Language & CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <ServerStatus status={serverStatus} />

            {/* Language Selector */}
            <div className="relative inline-flex items-center">
              <Languages className="w-4 h-4 text-[#647067] absolute left-2.5 pointer-events-none" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs font-semibold bg-[#F7FAF5] hover:bg-[#FFFFFF] text-[#17251C] rounded-xl border border-[#E2E8E0] focus:outline-none focus:ring-2 focus:ring-[#22C55E] transition-colors cursor-pointer"
                aria-label="Language selection"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => scrollTo("detect-disease")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14532D] hover:bg-[#0B1F17] active:scale-95 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer border border-[#14532D]"
            >
              <span>Analyze Crop</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#BEF264]" />
            </button>
          </div>

          {/* Mobile Menu & Language Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="relative inline-flex items-center">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold bg-[#F7FAF5] text-[#17251C] rounded-lg border border-[#E2E8E0] focus:outline-none"
                aria-label="Language selection"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="kn">KN</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#17251C] hover:bg-[#F7FAF5] border border-[#E2E8E0]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E2E8E0] px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-[#17251C]">
            <button
              type="button"
              onClick={() => scrollTo("hero")}
              className="text-left px-3 py-2 rounded-lg hover:bg-[#F7FAF5] transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollTo("detect-disease")}
              className="text-left px-3 py-2 rounded-lg hover:bg-[#F7FAF5] transition-colors"
            >
              Detect Disease
            </button>
            <button
              type="button"
              onClick={() => scrollTo("how-it-works")}
              className="text-left px-3 py-2 rounded-lg hover:bg-[#F7FAF5] transition-colors"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollTo("features")}
              className="text-left px-3 py-2 rounded-lg hover:bg-[#F7FAF5] transition-colors"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollTo("about")}
              className="text-left px-3 py-2 rounded-lg hover:bg-[#F7FAF5] transition-colors"
            >
              About
            </button>
          </div>

          <div className="pt-2 border-t border-[#E2E8E0] flex flex-col gap-2.5">
            <ServerStatus status={serverStatus} />
            <button
              type="button"
              onClick={() => scrollTo("detect-disease")}
              className="w-full py-2.5 rounded-xl bg-[#14532D] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Analyze Crop</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#BEF264]" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
