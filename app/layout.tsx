import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "./globals.css";
if (typeof window !== "undefined") {
  Object.defineProperty(window, "__REACT_DEVTOOLS_GLOBAL_HOOK__", {
    value: {},
    writable: false,
    configurable: false,
    enumerable: false,
  });
}
export const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NETLIFY_URL
  ? `https://${process.env.NETLIFY_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Periodico Naranja",
  description: "Noticias que inspirar, información que conecta",
  icons: {
    icon: "/Logo.png", // Ruta del archivo en la carpeta /public
    // Si tienes versiones para iOS, puedes añadirlas aquí
    apple: '/Logo.png',
  },
  openGraph: {
    title: "Periodico Naranja",
    description: "Noticias que inspirar, información que conecta",
    siteName: "Periodico Naranja",
    url: defaultUrl,
    images: [
      {
        url: "/Logo.png",
        width: 1200,
        height: 630,
        alt: "Logo Periodico Naranja",
      },
    ],
    locale: "es",
    type: "website",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
