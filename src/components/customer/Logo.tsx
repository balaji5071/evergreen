"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  href?: string;
}

export default function Logo({
  size = "md",
  showText = true,
  className = "",
  href = "/",
}: LogoProps) {
  const dimensions = {
    sm: 36,
    md: 48,
    lg: 64,
    xl: 88,
  }[size];

  const content = (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <div className="relative shrink-0 transition-transform duration-300 hover:scale-105">
        <Image
          src="/logo.png"
          alt="Evergreen Cafe & Restaurant"
          width={dimensions}
          height={dimensions}
          className="object-contain rounded-full drop-shadow-sm"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-serif font-black text-[#0C3B2E] tracking-tight leading-none text-base sm:text-lg">
            Evergreen
          </span>
          <span className="text-[9px] font-bold text-[#6D9773] tracking-widest uppercase mt-0.5">
            Cafe & Restaurant
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
