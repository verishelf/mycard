import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Frank Posada IV | Contact Card",
  description: "Get in touch with Frank Posada IV - Contact information and social media",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ overflow: 'hidden', height: '100%', position: 'fixed', width: '100%', WebkitOverflowScrolling: 'none' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased`}
        style={{ overflow: 'hidden', height: '100%', position: 'fixed', width: '100%', WebkitOverflowScrolling: 'none' }}
      >
        {children}
      </body>
    </html>
  );
}
