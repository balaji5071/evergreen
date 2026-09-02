"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  PhoneCall,
  Package,
  Star,
  UserCheck,
  MessageSquareHeart,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import BottomNav from "@/components/customer/BottomNav";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do I track my order?",
      answer:
        "Go to the 'Orders' tab in the navigation menu and click 'Track Order' on your active order to view real-time live status updates.",
    },
    {
      question: "Can I modify my order after placing it?",
      answer:
        "Orders are instantly sent to our kitchen. If your status is 'Placed', call our restaurant support immediately to request modification.",
    },
    {
      question: "What is your refund policy?",
      answer:
        "We provide replacement or refunds for missing/damaged items. Please inform support within 30 minutes of receiving your meal.",
    },
  ];

  const googleReviewUrl = "https://www.google.com/maps/search/Evergreen+Restaurant+and+Cafe+Ambagarh+Chowki";

  return (
    <div className="flex-1 flex flex-col pb-24 md:pb-12 bg-[#FAF8F5]">
      {/* Header Container */}
      <header className="bg-white border-b border-[#E6E2D8]/80 sticky top-[64px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#EAF5EF] rounded-2xl text-[#0C3B2E]">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">
                Help & Support
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Find answers to common questions or reach our support team
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#E6E2D8] bg-slate-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
            />
          </div>
        </div>
      </header>

      {/* Main Content Container - Max 7xl on desktop */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Common Topics Grid */}
        <section className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#0C3B2E]">Common Topics</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "My Orders", icon: Package, href: "/orders", external: false },
              { label: "Account & Security", icon: UserCheck, href: "/profile", external: false },
              { label: "Rate Us on Google", icon: Star, href: googleReviewUrl, external: true },
            ].map((topic, i) => {
              const TopicIcon = topic.icon;
              return topic.external ? (
                <a
                  key={i}
                  href={topic.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 bg-amber-50 rounded-3xl border border-amber-200/60 flex flex-col items-center justify-center text-center space-y-2 hover:bg-amber-100 transition-all duration-200 shadow-xs hover:-translate-y-0.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center shadow-xs">
                    <TopicIcon className="w-6 h-6 fill-amber-400" />
                  </div>
                  <span className="text-xs font-extrabold text-amber-700 flex items-center space-x-1">
                    <span>{topic.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </a>
              ) : (
                <Link
                  key={i}
                  href={topic.href}
                  className="p-5 bg-[#EAF5EF] rounded-3xl border border-emerald-200/60 flex flex-col items-center justify-center text-center space-y-2 hover:bg-emerald-100 transition-all duration-200 shadow-xs hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white text-[#0C3B2E] flex items-center justify-center shadow-xs">
                    <TopicIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-extrabold text-[#0C3B2E]">{topic.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQs Section */}
        <section id="faqs" className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#0C3B2E]">Frequently Asked Questions</h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-[#0C3B2E] cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-emerald-800 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Still Need Help Section */}
        <section id="support" className="space-y-4 pt-2">
          <h2 className="font-serif text-xl font-bold text-[#0C3B2E]">Still Need Help?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-3xl bg-[#0C3B2E] text-white flex items-center justify-between shadow-lg hover:bg-[#07251D] transition"
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-amber-400 text-slate-900 rounded-2xl">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-amber-200">WhatsApp Chat</p>
                  <p className="text-xs text-emerald-100">Response in 1-2 mins</p>
                </div>
              </div>
            </a>

            <a
              href="mailto:support@evergreen.com"
              className="p-5 rounded-3xl bg-white border border-[#E6E2D8] flex items-center justify-between text-slate-800 hover:bg-slate-50 transition shadow-card-soft"
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-[#EAF5EF] text-[#0C3B2E] rounded-2xl">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#0C3B2E]">Email Support</p>
                  <p className="text-xs text-slate-500">support@evergreen.com</p>
                </div>
              </div>
            </a>

            <a
              href="tel:+919876543210"
              className="p-5 rounded-3xl bg-white border border-[#E6E2D8] flex items-center justify-between text-slate-800 hover:bg-slate-50 transition shadow-card-soft"
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-[#EAF5EF] text-[#0C3B2E] rounded-2xl">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#0C3B2E]">Call Hotline</p>
                  <p className="text-xs text-slate-500">+91 98765 43210</p>
                </div>
              </div>
            </a>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
