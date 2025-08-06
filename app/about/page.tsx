"use client";

import { Inter } from "next/font/google";
import { motion } from "motion/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { SiGithub } from "react-icons/si";

const inter = Inter({ subsets: ["latin"] });

export default function Page() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <motion.div
        className={`${inter.className}`}
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-muted-foreground text-md">
          <div className="w-[30rem] max-w-full">
            <motion.a href="/" className="text-black dark:text-white font-bold text-2xl font-gosha lowercase pb-1">
              Nomen
            </motion.a>
            <p className="text-sm pb-5">
              A parser for every name listed on a social security card between
              1880-2023, tabulated from the United States Social Security
              Adminstration{"'"}s data.
            </p>
            <p>
              I{"'"}m{" "}
              <Link href="https://github.com/aramshiva">
                Aram
              </Link>. Over the last couple
              months i{"'"}ve been working on Nomen.
            </p>
            <p>
              Nomen is open source and avaliable on my{" "}
              <Link
                href="https://github.com/aramshiva/nomen"
                className="inline-flex items-center gap-1 text-black dark:text-white align-middle font-bold"
              >
                <SiGithub /> GitHub.
              </Link>
            </p>
            <p className="pt-2">
              Names dataset is based on the{" "}
              <Link
                className="underline"
                href="https://catalog.data.gov/dataset/baby-names-from-social-security-card-applications-national-data"
              >
                SSA National Baby Names Dataset
              </Link>{" "}
              and <Link href="/actuary">Mortality Data</Link> from the{" "}
              <Link
                className="underline"
                href="https://www.ssa.gov/oact/STATS/table4c6.html"
              >
                SSA Actuarial Life Tables
              </Link>
            </p>

            <div className="py-5">
              <p className="pb-2">
                Like what I do? Feel free to sponsor me on GitHub:
              </p>
              <iframe
                src="https://github.com/sponsors/aramshiva/button"
                title="Sponsor aramshiva"
                height="32"
                width="119"
              ></iframe>
            </div>
            <div className="pt-5 flex justify-center items-center text-sm text-muted-foreground flex-row gap-2">
              <button
                onClick={() =>
                  setTheme(
                    theme === "dark"
                      ? "light"
                      : theme === "system"
                      ? "light"
                      : "dark"
                  )
                }
                className="underline"
              >
                Change Theme
              </button>
            </div>
            <div className="pt-2 flex justify-center items-center text-sm text-muted-foreground flex-row gap-2">
              <Link href="/" className="underline">
                Home
              </Link>
              {" | "}
              <Link href="/popular" className="underline">
                Popular Names
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
