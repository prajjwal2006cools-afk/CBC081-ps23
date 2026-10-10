import React, { useEffect, useState, useRef } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import UploadCard from "./components/UploadCard";
import ImagePreview from "./components/ImagePreview";
import Loader from "./components/Loader";
import ResultCard from "./components/ResultCard";
import TopPredictions from "./components/TopPredictions";
import AdvicePanel from "./components/AdvicePanel";
import ChatAssistant from "./components/ChatAssistant";
import ErrorBanner from "./components/ErrorBanner";
import Disclaimer from "./components/Disclaimer";
import FeaturesSection from "./components/FeaturesSection";
import TrustSection from "./components/TrustSection";
import Footer from "./components/Footer";
import { analyzeImage, checkHealth } from "./api/client";
import { normalizeResult } from "./utils/normalize";
import { translations } from "./utils/i18n";
import { createSampleLeafFile } from "./utils/samples";
import { RotateCcw, Sprout, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function App() {
  const [view, setView] = useState("upload"); // upload | preview | loading | result
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState("en");
  const [serverStatus, setServerStatus] = useState({ online: false, data: null });

  const strings = translations[lang] || translations.en;

  // Check backend health periodically
  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      try {
        const data = await checkHealth();
        if (isMounted) setServerStatus({ online: true, data });
      } catch {
        if (isMounted) setServerStatus({ online: false, data: null });
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const scrollToDetection = () => {
    const el = document.getElementById("detect-disease");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToFeatures = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePickFile = (pickedFile) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(pickedFile);
    setPreviewUrl(URL.createObjectURL(pickedFile));
    setError(null);
    setView("preview");
    scrollToDetection();
  };

  const handleSelectSample = async (sampleType) => {
    const sampleFile = await createSampleLeafFile(sampleType);
    handlePickFile(sampleFile);
  };

  const handleRetake = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setView("upload");
    scrollToDetection();
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setView("loading");
    setError(null);
    scrollToDetection();

    try {
      const rawData = await analyzeImage(file);
      const normalized = normalizeResult(rawData);
      setResult(normalized);
      setView("result");
      setTimeout(() => {
        scrollToDetection();
      }, 100);
    } catch (err) {
      setError(err);
      setView("upload");
    }
  };

  const handleReset = () => {
    handleRetake();
    setResult(null);
  };

  const isResultView = view === "result" && result;

  return (
    <div
      className={`min-h-screen text-[#17251C] flex flex-col font-sans selection:bg-[#BEF264] selection:text-[#14532D] transition-colors duration-500 ${
        isResultView ? "results-botanical-bg" : "bg-[#F7FAF5]"
      }`}
    >
      {/* Botanical Leaf Silhouettes (Active during Results View) */}
      {isResultView && (
        <>
          <svg className="botanical-leaves-left" viewBox="0 0 350 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M120 40C110 90 70 140 20 160C80 170 140 150 180 110C210 150 200 220 150 270C220 250 270 200 280 130C320 200 300 290 230 350C310 320 370 250 360 170" stroke="#14532D" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 220C10 270 0 340 10 410C50 360 80 300 80 230" stroke="#14532D" strokeWidth="4" strokeLinecap="round" />
            <path d="M150 320C110 380 90 460 110 540C160 480 190 410 190 330" stroke="#14532D" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <svg className="botanical-leaves-right" viewBox="0 0 400 680" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M250 20C260 80 310 130 370 150C300 160 230 140 190 100C160 150 170 230 230 280C150 260 100 210 90 130C40 210 60 300 140 370C50 330 -10 260 0 170" stroke="#14532D" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M320 230C360 280 380 360 360 430C320 380 290 310 280 240" stroke="#14532D" strokeWidth="4" strokeLinecap="round" />
            <path d="M230 340C270 400 300 480 280 560C230 500 190 430 190 350" stroke="#14532D" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </>
      )}

      {/* Sticky Header with Navigation & Server Status */}
      <Header lang={lang} setLang={setLang} serverStatus={serverStatus} />

      {/* Hero Section (Complementary Forest-Green Canopy Theme) */}
      <HeroSection
        onAnalyzeClick={scrollToDetection}
        onExploreClick={scrollToFeatures}
      />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Main Interactive Crop Disease Detection Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative z-10">
        {/* Global Error Banner */}
        {error && (
          <div className="mb-8">
            <ErrorBanner
              error={error}
              onReset={() => setError(null)}
              strings={strings}
            />
          </div>
        )}

        {/* Dynamic View State */}
        {view === "upload" && (
          <UploadCard
            onPickFile={handlePickFile}
            onSelectSample={handleSelectSample}
            onError={(msg) => setError({ message: msg })}
            strings={strings}
          />
        )}

        {view === "preview" && (
          <div id="detect-disease" className="scroll-mt-24">
            <ImagePreview
              previewUrl={previewUrl}
              file={file}
              onRetake={handleRetake}
              onAnalyze={handleAnalyze}
              isAnalyzing={false}
              strings={strings}
            />
          </div>
        )}

        {view === "loading" && (
          <div id="detect-disease" className="scroll-mt-24">
            <Loader strings={strings} />
          </div>
        )}

        {view === "result" && result && (
          <div id="detect-disease" className="space-y-6 scroll-mt-24">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl border border-[#D4E5D8] shadow-sm">
              <span className="text-xs font-extrabold text-[#14532D] uppercase tracking-wider flex items-center gap-2">
                <Sprout className="w-4 h-4 text-[#22C55E]" />
                <span>Agricultural Diagnostic Report</span>
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-[#14532D] hover:text-[#0B1F17] flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>{strings.analyzeAnother || "Analyze Another Leaf"}</span>
              </button>
            </div>

            {/* Main Result Card (Sage-tinted card with botanical confidence meter) */}
            <ResultCard result={result} previewUrl={previewUrl} strings={strings} />

            {/* Differential Predictions */}
            <TopPredictions topList={result.topList} strings={strings} />

            {/* Agricultural Care & Remediation Plan */}
            <AdvicePanel
              guidance={result.guidance}
              isHealthy={result.isHealthy}
              strings={strings}
            />

            {/* Interactive Agronomist Chat */}
            <ChatAssistant context={result} strings={strings} />

            {/* Regulatory & Safety Disclaimer */}
            <Disclaimer text={result.disclaimer} />
          </div>
        )}
      </section>

      {/* Capabilities & Features Grid */}
      <FeaturesSection />

      {/* Trust & Scientific Rigor Section */}
      <TrustSection />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
