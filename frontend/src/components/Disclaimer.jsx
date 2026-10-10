import React from "react";
import { Info, ShieldAlert } from "lucide-react";

export default function Disclaimer({ text }) {
  return (
    <div className="bg-[#F7FAF5] rounded-2xl p-4 sm:p-5 border border-[#E2E8E0] text-xs text-[#647067] flex items-start gap-3">
      <ShieldAlert className="w-4 h-4 text-[#14532D] shrink-0 mt-0.5" />
      <p className="leading-relaxed">
        {text ||
          "This is an automated AI diagnostic estimate, not an in-person certified diagnosis. Always consult a local agricultural extension officer or certified agronomist before purchasing or applying treatment chemicals."}
      </p>
    </div>
  );
}
