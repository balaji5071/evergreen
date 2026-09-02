import { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://evergreen-restaurant.com";

export const metadata: Metadata = {
  title: "Explore Full Menu & Food Delivery Prices",
  description:
    "Explore Evergreen Cafe & Restaurant's full menu in Ambagarh Chowki, Rajnandgaon (491665). Freshly prepared North Indian curries, Biryani, Chinese noodles, snacks, and beverages. Order online now!",
  openGraph: {
    title: "Full Food Menu & Prices | Evergreen Cafe Ambagarh Chowki",
    description:
      "Paneer Butter Masala, Chicken Dum Biryani, Hakka Noodles, Cold Coffee & more. Fast local delivery in Ambagarh Chowki, Rajnandgaon - 491665.",
    url: `${baseUrl}/menu`,
  },
};

const menuJsonLd = {
  "@context": "https://schema.org",
  "@type": "Menu",
  "@id": `${baseUrl}/menu/#menu`,
  name: "Evergreen Cafe & Restaurant Official Menu",
  description: "Complete food menu of Evergreen Cafe & Restaurant located at Ravan Gali, Nisha Complex, Ambagarh Chowki, Rajnandgaon, Chhattisgarh - 491665.",
  mainEntityOfPage: `${baseUrl}/menu`,
  inLanguage: "en-US",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "INR",
    lowPrice: "25",
    highPrice: "290",
    offerCount: "25+",
  },
  hasMenuSection: [
    {
      "@type": "MenuSection",
      name: "North Indian Curries & Breads",
      description: "Authentic North Indian curries, tandoori breads, and paneer specials.",
    },
    {
      "@type": "MenuSection",
      name: "Biryani & Rice",
      description: "Aromatic Hyderabadi Biryanis cooked with premium basmati rice.",
    },
    {
      "@type": "MenuSection",
      name: "Indo-Chinese Delights",
      description: "Wok-tossed noodles, fried rice, Manchurian, and starters.",
    },
    {
      "@type": "MenuSection",
      name: "Beverages & Shakes",
      description: "Thick cold coffees, fresh lime sodas, and handcrafted teas.",
    },
  ],
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={menuJsonLd} />
      {children}
    </>
  );
}
