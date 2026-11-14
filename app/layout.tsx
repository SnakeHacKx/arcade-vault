import type { Metadata } from "next";
import { Press_Start_2P, JetBrains_Mono, Courier_Prime } from "next/font/google";
import { Suspense } from "react";
import { Nav, NavView } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arcade Vault · Portal Retro",
  description: "Juega online y compite por el puntaje más alto.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${pressStart.variable} ${jetbrains.variable} ${courierPrime.variable}`}
    >
      <body>
        <div className="av-bg" />
        <div className="av-noise" />
        <div id="root">
          <Suspense fallback={<NavView pathname={null} />}>
            <Nav />
          </Suspense>
          <main className="av-main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
