import React from "react";
import { Layers } from "lucide-react";

export default function TopPredictions({ topList, strings }) {
  if (!topList || topList.length <= 1) return null;

  return (
    <div className="agro-card p-6 border border-[#E2E8E0] space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-[#17251C] font-heading">
        <Layers className="w-4 h-4 text-[#22C55E]" />
        <span>{strings.otherPossibilities || "Other Differential Possibilities"}</span>
      </div>

      <div className="space-y-2.5">
        {topList.map((item, idx) => {
          const pct = Math.round(item.confidence * 100);
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7FAF5] border border-[#E2E8E0] text-xs transition-colors hover:bg-white"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#14532D] text-[#BEF264] font-bold flex items-center justify-center text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-bold text-[#17251C]">
                    {item.crop} — {item.disease}
                  </p>
                  <p className="text-[11px] text-[#647067]">
                    {item.isHealthy ? "Healthy classification" : "Pathological pattern"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-[#14532D] text-sm">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
