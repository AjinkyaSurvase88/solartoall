import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Solar to All | Free AI Solar Design & Top-Rated Installers",
  description: "Get a free, unbiased solar system design tailored for your home or business. AI-powered potential calculator, instant bill analysis, and zero sales pressure.",
  keywords: "solar system design, free solar design, solar panel calculator, solar installer India",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>{children}</body>
    </html>
  );
}
