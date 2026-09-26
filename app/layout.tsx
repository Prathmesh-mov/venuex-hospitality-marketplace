import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomerSupport from "@/components/CustomerSupport"; // Import the support widget

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "venueX - B2B Hospitality Marketplace",
  description: "Exchange idle hospitality inventory securely.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Load official Razorpay checkout script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {/* Global floating Customer Support & Dispute AI Assistant */}
        <CustomerSupport />
      </body>
    </html>
  );
}