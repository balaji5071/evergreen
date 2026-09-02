import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Orders & Live Tracking",
  description: "Track your active food orders and view past order history from Evergreen Cafe & Restaurant.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
