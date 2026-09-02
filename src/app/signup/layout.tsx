import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Sign up for an Evergreen Cafe & Restaurant account to save delivery addresses and quickly order food in Ambagarh Chowki, Rajnandgaon (491665).",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
