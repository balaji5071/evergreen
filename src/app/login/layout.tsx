import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Login",
  description: "Log in to your Evergreen Cafe & Restaurant account to track orders, manage addresses, and enjoy seamless food ordering in Ambagarh Chowki, Rajnandgaon (491665).",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
