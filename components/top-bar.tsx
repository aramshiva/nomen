import { ReactNode } from "react";
import { motion } from "motion/react";
import { ThemeToggle } from "./theme-toggle";

interface TopBarProps {
  title?: string;
  children?: ReactNode;
  hideThemeToggle?: boolean;
}

export function TopBar({
  title,
  children,
  hideThemeToggle = false,
}: TopBarProps) {
  return (
    <div className="border-b p-4 bg-background shadow-sm sticky top-0 z-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between gap-4">
        <div className="flex">
          <motion.a
            href="/"
            className="font-bold mr-4 cursor-pointer text-2xl font-gosha lowercase pb-1"
            layoutId="title"
          >
            Nomen
          </motion.a>
          {title && <h1 className="text-sm font-semibold">{title}</h1>}
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          {children && <div className="flex-1 md:flex-initial">{children}</div>}
          {!hideThemeToggle && <ThemeToggle />}
        </div>
      </div>
    </div>
  );
}
