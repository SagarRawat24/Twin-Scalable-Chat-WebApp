"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "../bones/registry";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Create stable query client
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}