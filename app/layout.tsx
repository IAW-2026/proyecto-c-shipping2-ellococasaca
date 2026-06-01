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
  description: "Gestión de envíos del marketplace El Loco Casaca",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
            <span className="text-sm font-semibold text-gray-900">
              📦 Shipping · El Loco Casaca
            </span>
            <div className="flex items-center gap-3">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-sm text-gray-700 hover:underline">Iniciar sesión</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700">
                    Registrarse
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}