import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shipping · El Loco Casaca",
  description: "Gestión de envios del marketplace El Loco Casaca",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="border-b-4 border-red-600 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <img src="/escudoRiver.png" alt="River" className="h-8 w-auto" />
                <span className="text-lg font-bold tracking-tight text-slate-900">El Loco Casaca</span>
                <span className="rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Shipping
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="text-sm text-slate-700 hover:text-slate-900">Iniciar sesión</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700">
                      Registrarse
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </div>
          </header>
          <audio
            src="/Muchachos.mp3"
            controls
            loop
            className="fixed bottom-4 right-4 z-50 rounded-full bg-white shadow-lg"/>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}