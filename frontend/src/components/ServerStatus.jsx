import React from "react";
import { Activity, CheckCircle, AlertCircle, ShieldAlert } from "lucide-react";

export default function ServerStatus({ status }) {
  const isOnline = status?.online;
  const isModelReady = status?.data?.ai_model_loaded;
  const isMock = status?.data?.mock_mode_enabled;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        isOnline
          ? isModelReady
            ? "bg-[#F0FDF4] text-[#14532D] border-[#BBF7D0]"
            : "bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]"
          : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
      }`}
      title={
        isOnline
          ? isModelReady
            ? "Backend Online & MobileNetV2 Model Active"
            : "Backend Online (Simulation Fallback Mode)"
          : "Backend Server Offline"
      }
    >
      <span className="relative flex h-2 w-2">
        {isOnline && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isModelReady ? "bg-[#22C55E]" : "bg-[#F59E0B]"
            }`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isOnline
              ? isModelReady
                ? "bg-[#22C55E]"
                : "bg-[#F59E0B]"
              : "bg-[#EF4444]"
          }`}
        />
      </span>
      <span>
        {isOnline
          ? isModelReady
            ? "AI Engine Live"
            : "Fallback Engine"
          : "Server Offline"}
      </span>
    </div>
  );
}
