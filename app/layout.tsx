
import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "SmartBudgetSE",
  description: "Svensk budgetapp"
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
