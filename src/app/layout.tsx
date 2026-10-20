import type { Metadata } from "next";
import "./globals.css";
import AppFrame from "@/components/AppFrame";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://naomipharmacy.co.ke"),
  title: { default: "Naomi Pharmacy | Your health. Delivered fast.", template: "%s | Naomi Pharmacy" },
  description: "Trusted online pharmacy and same day medicine delivery in Nairobi, Kenya. Order everyday essentials, upload prescriptions, and talk to a licensed pharmacist.",
  icons: { icon: "/naomi-mark.svg" },
  openGraph: { title: "Naomi Pharmacy", description: "Your health. Delivered fast.", type: "website", locale: "en_KE" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-KE"><head><link rel="stylesheet" href="/medino-master/assets/css/font-awesome-4.7.0.min.css" /><link rel="stylesheet" href="/medino-master/assets/css/linearicons.css" /><meta name="theme-color" content="#f7faf9" /></head><body><AppFrame>{children}</AppFrame></body></html>;
}
