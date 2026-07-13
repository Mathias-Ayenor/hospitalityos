/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Brain, Bot, HelpCircle, Loader2 } from "lucide-react";
import { HospitalityAPI } from "../../services/api";

interface AICopilotProps {
  activeTab: "reception" | "finance" | "operations" | "executive";
  hotelState: any; // Contextual state representing current numbers for grounding
}

export default function AICopilot({ activeTab, hotelState }: AICopilotProps) {
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string; timestamp: Date }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on active business context
  const suggestions: Record<string, string[]> = {
    reception: [
      "Draft a late check-out email",
      "Which deluxe rooms are available?",
      "Wi-Fi troubleshooting script",
    ],
    finance: [
      "Calculate ADR and suggest premium rates",
      "Draft financial summary report",
      "Who has outstanding payments?",
    ],
    operations: [
      "Generate prioritized housekeeping list",
      "Review urgent maintenance tickets",
      "Draft cleaning checklist for suite rooms",
    ],
    executive: [
      "Suggest dynamic pricing for weekends",
      "Recommend summer occupancy campaigns",
      "Growth strategy checklist for new branch",
    ]
  };

  // Switch welcome message when active tab changes
  useEffect(() => {
    const welcomeMessages: Record<string, string> = {
      reception: "Hello! I am your Reception Desk Co-pilot. I can help you recommend available rooms, formulate customer emails, and answer guest accommodation questions.",
      finance: "Welcome. I am your Finance AI. I can calculate average daily rates (ADR), analyze outstanding balances, and draft revenue summaries.",
      operations: "Greetings. I am your Operations AI. I can prioritize room cleaning logs, audit maintenance tickets, and suggest housekeeping priorities.",
      executive: "Hello General Manager. I am your Executive AI. I can predict booking rates, outline marketing campaigns, and give dynamic pricing suggestions."
    };

    setMessages([
      {
        sender: "ai",
        text: welcomeMessages[activeTab] || "Hello! I am your HospitalityOS AI assistant.",
        timestamp: new Date()
      }
    ]);
  }, [activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    if (!textToSend) {
      setInput("");
    }

    setMessages(prev => [...prev, { sender: "user", text: promptText, timestamp: new Date() }]);
    setLoading(true);

    try {
      const responseText = await HospitalityAPI.askCopilot(promptText, activeTab, hotelState);
      setMessages(prev => [...prev, { sender: "ai", text: responseText, timestamp: new Date() }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: `Error calling HospitalityOS AI server: ${err.message || "Unknown error"}. Is process.env.GEMINI_API_KEY set?`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPersonaHeader = () => {
    switch (activeTab) {
      case "reception":
        return { name: "Reception Assistant AI", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
      case "finance":
        return { name: "Finance Advisory AI", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
      case "operations":
        return { name: "Operations Optimizer AI", color: "text-sky-500 bg-sky-500/10 border-sky-500/20" };
      case "executive":
        return { name: "Executive Strategic AI", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" };
      default:
        return { name: "HospitalityOS Copilot", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" };
    }
  };

  const header = getPersonaHeader();

  return (
    <div id="ai-copilot-container" className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100">HospitalityOS Co-pilot</h2>
            <div className={`mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-mono ${header.color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              {header.name}
            </div>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-400">
              {m.sender === "ai" ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold">{header.name}</span>
                </>
              ) : (
                <span className="font-semibold">Operator</span>
              )}
              <span>•</span>
              <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div
              className={`max-w-[90%] rounded-xl px-3.5 py-2.5 leading-relaxed shadow-sm whitespace-pre-wrap ${
                m.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none font-mono"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-400">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold">{header.name} is thinking...</span>
            </div>
            <div className="bg-slate-800/90 text-slate-400 border border-slate-700/60 rounded-xl rounded-tl-none px-3.5 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="font-mono">Processing real-time metrics...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Tray */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-1.5">
        <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Suggested queries
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestions[activeTab]?.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              disabled={loading}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded px-2 py-1 text-left cursor-pointer transition disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${header.name}...`}
          disabled={loading}
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 transition font-sans"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg p-2 flex items-center justify-center cursor-pointer transition shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
