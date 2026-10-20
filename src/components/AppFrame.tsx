"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { CartDrawer, Footer, Header } from "@/components/Site";
import { AnalyticsConsent, CookieConsent, Preloader, SmoothScroll, VoiceTour, WhatsappButton } from "@/components/GlobalUi";

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname.startsWith("/auth/");
  return <SessionProvider><SmoothScroll /><Preloader />{!isAuth && <Header />}{children}{!isAuth && <Footer />}<CartDrawer /><CookieConsent /><VoiceTour /><WhatsappButton /><AnalyticsConsent /></SessionProvider>;
}
