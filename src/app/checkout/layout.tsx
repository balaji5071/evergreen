import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout & Address",
  description: "Complete your order from Evergreen Cafe & Restaurant.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
