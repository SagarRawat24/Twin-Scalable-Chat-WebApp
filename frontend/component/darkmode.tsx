'use client';

import { SunMediumIcon } from "./sun-medium";
import { MoonIcon } from "./moon";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function DarkMode() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="
        p-2 rounded-sm
        hover:bg-zinc-200
        dark:hover:bg-white/10
        transition-all duration-300"

      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <SunMediumIcon size={16} className=" dark:text-white" />
      ) : (
        <MoonIcon size={16} className=" text-black/60" />
      )}
    </button>
  );
}
