
export const metadata = {
  title: "SmartBudgetSE",
  description: "Svensk budgetapp"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}
