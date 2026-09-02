import { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://evergreen-restaurant.com";

export const metadata: Metadata = {
  title: "Help Center & Ordering FAQs",
  description:
    "Have questions about ordering food from Evergreen Cafe & Restaurant in Ambagarh Chowki, Rajnandgaon (491665)? Learn about order tracking, delivery zones, refund policies, and contact details.",
  openGraph: {
    title: "Help Center & FAQs | Evergreen Cafe Ambagarh Chowki",
    description:
      "Get help with your order, track delivery status, or contact Evergreen Cafe support team at Ravan Gali, Nisha Complex, Ambagarh Chowki.",
    url: `${baseUrl}/help`,
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I track my food order from Evergreen Cafe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can track your order in real time by visiting the 'Orders' tab in the main navigation. You will see live status updates from kitchen preparation to delivery rider dispatch.",
      },
    },
    {
      "@type": "Question",
      name: "Does Evergreen Cafe deliver in Ambagarh Chowki (491665)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Evergreen Cafe delivers fresh food directly to homes, offices, and hostels in Ambagarh Chowki, Nisha Complex area, Ravan Gali, Rajnandgaon Road, and nearby locations within a 5km radius.",
      },
    },
    {
      "@type": "Question",
      name: "Where is Evergreen Cafe located in Ambagarh Chowki?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Evergreen Cafe & Restaurant is located at Ravan Gali, Nisha Complex, Ambagarh Chowki, Rajnandgaon, Chhattisgarh - 491665.",
      },
    },
  ],
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      {children}
    </>
  );
}
