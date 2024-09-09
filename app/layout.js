"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { store } from "@/app/store/store";
import { Provider } from "react-redux";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>{children}</Provider>
      </body>
    </html>
  );
}
