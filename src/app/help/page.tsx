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
  HelpCircle,
  ExternalLink,
  ArrowUpRight,
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

  const googleReviewUrl =
    "https://www.google.com/maps/search/Evergreen+Restaurant+and+Cafe+Ambagarh+Chowki";

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col pb-28 md:pb-16 bg-[#FAF8F5] text-slate-900 font-sans">
      {/* Header Container matching Evergreen Botanical Sage & Cream Hero */}
      <header className="bg-gradient-to-br from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] border-b border-[#0C3B2E]/10 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-white border border-[#0C3B2E]/15 text-[#0C3B2E] flex items-center justify-center shadow-2xs shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0C3B2E] tracking-tight">
                Help &amp; Support
              </h1>
              <p className="text-xs text-slate-600">
                Find answers to common questions or reach our support team
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0C3B2E]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#0C3B2E]/15 bg-white text-xs text-slate-700 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-[#0C3B2E] focus:ring-2 focus:ring-[#0C3B2E]/10 transition"
            />
          </div>
        </div>
      </header>

      {/* Main Content Container - Max 7xl on desktop */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Common Topics Grid */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#0C3B2E]">
            Common Topics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                label: "My Orders",
                sub: "Track or view order history",
                icon: Package,
                href: "/orders",
                external: false,
              },
              {
                label: "Account & Security",
                sub: "Manage profile & preferences",
                icon: UserCheck,
                href: "/profile",
                external: false,
              },
              {
                label: "Rate Us on Google",
                sub: "Share your Evergreen experience",
                icon: Star,
                href: googleReviewUrl,
                external: true,
              },
            ].map((topic, i) => {
              const TopicIcon = topic.icon;
              return topic.external ? (
                <a
                  key={i}
                  href={topic.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 bg-gradient-to-br from-amber-300/35 to-amber-400/25 rounded-3xl border border-amber-400/40 flex flex-col items-center justify-center text-center space-y-2.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-2xs group"
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-amber-400/40 text-[#0C3B2E] flex items-center justify-center shadow-2xs">
                    <TopicIcon className="w-5 h-5 text-amber-500 fill-amber-400" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-[#0C3B2E] inline-flex items-center gap-1">
                      <span>{topic.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <p className="text-xs text-slate-600">{topic.sub}</p>
                  </div>
                </a>
              ) : (
                <Link
                  key={i}
                  href={topic.href}
                  className="p-6 bg-white rounded-3xl border border-[#0C3B2E]/10 flex flex-col items-center justify-center text-center space-y-2.5 hover:bg-[#EAF5EF]/60 hover:border-[#0C3B2E]/25 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-2xs group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 text-[#0C3B2E] flex items-center justify-center group-hover:bg-[#0C3B2E] group-hover:text-amber-300 transition-colors">
                    <TopicIcon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-[#0C3B2E] inline-flex items-center gap-1">
                      <span>{topic.label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <p className="text-xs text-slate-500">{topic.sub}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQs Section */}
        <section id="faqs" className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#0C3B2E]">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl border border-[#0C3B2E]/10 shadow-2xs hover:border-[#0C3B2E]/25 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-[#0C3B2E] cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-3 transition-colors ${
                        isOpen
                          ? "bg-[#0C3B2E] text-white"
                          : "bg-[#EAF5EF] text-[#0C3B2E]"
                      }`}
                    >
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-[#0C3B2E]/10 pt-3.5">
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
          <h2 className="text-lg sm:text-xl font-bold text-[#0C3B2E]">
            Still Need Help?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-3xl bg-gradient-to-br from-[#0C3B2E] to-[#155240] text-white flex items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-amber-400 text-[#0C3B2E] flex items-center justify-center shrink-0 shadow-2xs">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">WhatsApp Chat</p>
                  <p className="text-xs text-emerald-100/85">
                    Response in 1-2 mins
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-amber-300 shrink-0" />
            </a>

            <a
              href="mailto:support@evergreen.com"
              className="p-5 rounded-3xl bg-white border border-[#0C3B2E]/10 flex items-center justify-between text-slate-800 hover:bg-[#EAF5EF]/50 hover:border-[#0C3B2E]/25 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 text-[#0C3B2E] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#0C3B2E]">
                    Email Support
                  </p>
                  <p className="text-xs text-slate-500">support@evergreen.com</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#0C3B2E]/60 shrink-0" />
            </a>

            <a
              href="tel:+919876543210"
              className="p-5 rounded-3xl bg-white border border-[#0C3B2E]/10 flex items-center justify-between text-slate-800 hover:bg-[#EAF5EF]/50 hover:border-[#0C3B2E]/25 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 text-[#0C3B2E] flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#0C3B2E]">Call Hotline</p>
                  <p className="text-xs text-slate-500">+91 98765 43210</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#0C3B2E]/60 shrink-0" />
            </a>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}