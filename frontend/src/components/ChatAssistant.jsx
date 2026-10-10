import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, Bot, User, AlertCircle } from "lucide-react";
import { sendChat } from "../api/client";

export default function ChatAssistant({ context, strings }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello! I am your AI Agronomist Assistant. Ask me anything about ${context?.crop || "your crop"} and how to manage ${context?.disease || "its health"}.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const quickQuestions = [
    `How do I prevent ${context?.disease || "this disease"} from spreading?`,
    "What organic cultural practices work best?",
    "How should I adjust watering and soil humidity?",
  ];

  const handleSend = async (messageText) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    setChatError(null);
    const userMsg = { role: "user", content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await sendChat({
        message: text.trim(),
        context: {
          crop: context?.crop,
          disease: context?.disease,
          confidence: context?.confidence,
        },
        history: nextMessages.slice(-6),
      });

      if (res && res.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      } else {
        throw new Error("No response from assistant");
      }
    } catch (err) {
      setChatError("Agronomist engine is currently busy. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="agro-card p-6 sm:p-8 space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E0]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#14532D] text-[#BEF264] flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#17251C] font-heading">
              {strings.askAgronomist || "Ask AI Agronomist"}
            </h3>
            <p className="text-xs text-[#647067]">Follow-up consultation on organic care, watering, or pruning</p>
          </div>
        </div>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="text-xs px-3.5 py-1.5 rounded-full bg-[#F7FAF5] hover:bg-[#F0FDF4] hover:text-[#14532D] hover:border-[#22C55E]/40 border border-[#E2E8E0] text-[#17251C] font-semibold transition-all text-left disabled:opacity-50 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message history */}
      <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-[#17251C] text-white"
                    : "bg-[#14532D] text-[#BEF264] shadow-sm"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-[#14532D] text-white rounded-tr-none font-medium"
                    : "bg-[#F7FAF5] text-[#17251C] border border-[#E2E8E0] rounded-tl-none font-normal"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#647067] italic p-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
            <span>AI Agronomist is analyzing your question...</span>
          </div>
        )}
      </div>

      {/* Error banner */}
      {chatError && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs text-[#991B1B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{chatError}</span>
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-[#E2E8E0]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={strings.chatPlaceholder || "Ask about treatment, watering, pruning, or remedies..."}
          disabled={isLoading}
          className="flex-1 min-h-[44px] px-4 text-xs sm:text-sm bg-[#F7FAF5] border border-[#E2E8E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:bg-white text-[#17251C] transition-all"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="min-h-[44px] px-4 bg-[#14532D] hover:bg-[#0B1F17] active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-1 text-xs shadow-md shadow-[#14532D]/20 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4 text-[#BEF264]" />
        </button>
      </form>
    </div>
  );
}
