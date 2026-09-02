"use client";

import React, { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { subscribeUserToPush } from "@/lib/pushClient";

export default function PushNotificationPrompt() {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setSupported(true);
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.pushManager
            .getSubscription()
            .then((sub: any) => {
              if (sub) setSubscribed(true);
            })
            .catch((err) => {
              console.warn("Could not get existing push subscription:", err);
            });
        })
        .catch((err) => {
          console.warn("ServiceWorker ready state check failed:", err);
        });
    }
  }, []);

  const handleSubscribe = async () => {
    if (!user) {
      alert("Please log in to enable push notifications");
      return;
    }

    setLoading(true);
    const sub = await subscribeUserToPush();
    setLoading(false);

    if (sub) {
      setSubscribed(true);
    } else {
      alert("Push notifications could not be enabled. Please check your browser notification permissions or network connection.");
    }
  };

  if (!supported || !user) return null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-[#0C3B2E] text-white shadow-card-soft flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
          {subscribed ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-xs font-bold text-amber-200">
            {subscribed ? "Notifications Active" : "Order Status Notifications"}
          </p>
          <p className="text-[11px] text-emerald-100/90 font-light">
            {subscribed
              ? "You'll receive live order alerts & deals."
              : "Get instant alerts on meal preparation & delivery."}
          </p>
        </div>
      </div>

      {!subscribed && (
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-900 text-xs font-bold shadow-md hover:bg-amber-300 transition whitespace-nowrap cursor-pointer disabled:opacity-50"
        >
          {loading ? "Enabling..." : "Enable"}
        </button>
      )}
    </div>
  );
}
