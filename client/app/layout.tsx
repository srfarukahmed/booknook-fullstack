import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "@/components/provider";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: {
    default: "BookNook | A little space for big stories",
    template: "BookNook | %s",
  },
  description:
    "A community library to discover, share, borrow, and return your next great read.",
};
export const dynamic = "force-dynamic";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body>
        <Provider>
          <Shell>{children}</Shell>
        </Provider>
      </body>
    </html>
  );
}
