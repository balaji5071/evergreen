"use client";

import React, { useState } from "react";
import { Bell, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("Special 20% OFF Offer Today! 🌿");
  const [body, setBody] = useState("Craving authentic meal? Use code WELCOME50 for instant savings.");
  const [url, setUrl] = useState("/menu");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ success?: boolean; text?: string }>({});

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setSending(true);
    setMessage({});

    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });

      const data = await res.json();
      setSending(false);

      if (res.ok) {
        setMessage({ success: true, text: "Push notification broadcasted successfully to all customers!" });
      } else {
        setMessage({ success: false, text: data.message || "Failed to send notification." });
      }
    } catch (e: any) {
      setSending(false);
      setMessage({ success: false, text: e.message || "Failed to broadcast push notification." });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#0C3B2E]">Broadcast Notifications</h2>
        <p className="text-xs text-slate-500">Send instant Native Web Push notifications & deal alerts</p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center space-x-2 ${
            message.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleBroadcast}
        className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-4"
      >
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Notification Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Hot & Fresh Samosas Ready! 🌿"
            className="w-full px-3.5 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Notification Message</label>
          <textarea
            rows={3}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Order now and get free tea..."
            className="w-full p-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Target Page URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/menu"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full py-4 rounded-2xl btn-emerald flex items-center justify-center space-x-2 text-sm font-bold shadow-lg"
        >
          <Send className="w-4 h-4" />
          <span>{sending ? "Broadcasting Web Push..." : "Broadcast Push Notification"}</span>
        </button>
      </form>
    </div>
  );
}
