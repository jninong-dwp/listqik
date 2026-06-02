import type { ReactNode } from "react";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "@/styles/marketing-landing.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export default function EsStartNowLayout({ children }: { children: ReactNode }) {
  return <div className={`${dmSans.variable} ${playfairDisplay.variable} marketingLpRoot`}>{children}</div>;
}

