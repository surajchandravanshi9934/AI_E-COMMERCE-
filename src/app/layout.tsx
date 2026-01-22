import type { Metadata } from "next";

import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";

import Provider from "@/Provider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/InitUser";





export const metadata: Metadata = {
  title: "MegaMart",
  description: "Multi-Vender E-Commerce Website ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen bg-linear-to-b from-black">

        <Provider>
          <StoreProvider>
            <InitUser />
            <ToastContainer position="bottom-right" theme="dark" />
            {children}
          </StoreProvider>
        </Provider>

      </body>
    </html>
  );
}
