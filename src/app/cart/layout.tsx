import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "View and review items in your Evergreen Cafe shopping cart.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
