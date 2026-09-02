import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { SocketProvider } from "@/context/SocketContext";
import ToastBanner from "@/components/customer/ToastBanner";
import Navbar from "@/components/customer/Navbar";
import FooterSeoGeo from "@/components/customer/FooterSeoGeo";
import JsonLd from "@/components/seo/JsonLd";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://evergreen-restaurant.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Evergreen Cafe & Restaurant | Best Food & Online Delivery in Ambagarh Chowki, Rajnandgaon",
    template: "%s | Evergreen Cafe Ambagarh Chowki",
  },
  description:
    "Order delicious food online from Evergreen Cafe & Restaurant in Ambagarh Chowki, Rajnandgaon (491665), Chhattisgarh. Authentic North Indian, Indo-Chinese, Biryani, Fast Food & Beverages with fast local delivery.",
  keywords: [
    "Evergreen Cafe",
    "Evergreen Restaurant Ambagarh Chowki",
    "Food delivery in Ambagarh Chowki",
    "Best restaurant near Ambagarh Chowki",
    "Restaurants in Rajnandgaon",
    "Food delivery 491665",
    "North Indian food Ambagarh Chowki",
    "Chinese restaurant Ambagarh Chowki",
    "Chicken Biryani Ambagarh Chowki",
    "Cafe in Ambagarh Chowki Rajnandgaon",
    "Online food ordering Ambagarh Chowki",
    "Evergreen menu",
  ],
  authors: [{ name: "Evergreen Cafe & Restaurant" }],
  creator: "Evergreen Cafe",
  publisher: "Evergreen Cafe & Restaurant",
  category: "Food & Dining",
  applicationName: "Evergreen Cafe",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Evergreen Cafe & Restaurant | Best Food & Online Delivery in Ambagarh Chowki, Rajnandgaon",
    description:
      "Handcrafted meals cooked fresh & delivered fast. Explore North Indian, Chinese, Biryani, and beverages in Ambagarh Chowki, Rajnandgaon - 491665.",
    url: baseUrl,
    siteName: "Evergreen Cafe & Restaurant",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Evergreen Cafe & Restaurant Ambagarh Chowki Rajnandgaon",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Evergreen Cafe & Restaurant | Ambagarh Chowki, Rajnandgaon",
    description:
      "Order fresh, authentic dishes online with fast local home delivery in Ambagarh Chowki, Rajnandgaon (491665).",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "IN-CT",
    "geo.placename": "Ambagarh Chowki, Rajnandgaon, Chhattisgarh",
    "geo.position": "20.7816;80.7417",
    ICBM: "20.7816, 80.7417",
  },
};

const mainRestaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "FoodEstablishment", "LocalBusiness"],
  "@id": `${baseUrl}/#restaurant`,
  name: "Evergreen Cafe & Restaurant",
  alternateName: [
    "Evergreen Restaurant Ambagarh Chowki",
    "Evergreen Cafe Rajnandgaon",
  ],
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  image: `${baseUrl}/logo.png`,
  description:
    "Premier restaurant and online food delivery service in Ambagarh Chowki, Rajnandgaon district (491665), Chhattisgarh offering North Indian, Indo-Chinese, Biryani, and Beverages.",
  telephone: "+919876543210",
  email: "support@evergreen.com",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ravan Gali, Nisha Complex, Ambagarh Chowki",
    addressLocality: "Ambagarh Chowki",
    addressRegion: "Chhattisgarh",
    postalCode: "491665",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 20.7816,
    longitude: 80.7417,
  },
  servesCuisine: [
    "North Indian",
    "Indo-Chinese",
    "Biryani",
    "Fast Food",
    "Beverages",
    "Desserts",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "10:00",
      closes: "22:30",
    },
  ],
  hasMenu: `${baseUrl}/menu`,
  acceptsReservations: "False",
  paymentAccepted: "Cash, UPI",
  potentialAction: {
    "@type": "OrderAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${baseUrl}/menu`,
      inLanguage: "en",
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    deliveryMethod: ["http://purl.org/goodrelations/v1#DeliveryModeDirectDownload"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <JsonLd data={mainRestaurantJsonLd} />
      </head>
      <body className="bg-[#FAF8F5] text-slate-900 min-h-screen flex flex-col font-sans antialiased selection:bg-[#0C3B2E] selection:text-white">
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <ToastBanner />
              <Navbar />
              <div className="flex-1 flex flex-col w-full bg-[#FAF8F5] relative">
                {children}
              </div>
              <FooterSeoGeo />
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
