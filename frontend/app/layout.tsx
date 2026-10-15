import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AseguraSimple",
  description: "Sistema de Gestión de Seguros",
  verification: {
    google: "dcNDxe2BN3PQ4IaIT2JOxKu6_E6bss36-Xr3l2SpomA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased transition-colors duration-300">
        <Providers>
          {children}
        </Providers>

        {/* 🔥 Píxel Base de Meta Ads */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            fbq('init', '1122456603589693');
            fbq('track', 'PageView');
          `}
        </Script>
      </body>
    </html>
  );
}