"use client";
import { motion } from "motion/react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { SiGithub } from "react-icons/si";

const inter = Inter({ subsets: ["latin"] });

export default function About() {
  return (
    <div>
      <motion.div
        className={`${inter.className}`}
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center justify-center text-sm min-h-screen p-6 text-muted-foreground">
          <div className="w-[30rem] max-w-full">
            <p className="font-bold text-2xl font-gosha lowercase pb-1 text-black">
              Nomen
            </p>
            <p className="pb-5">
              A parser for every name listed on a social security card between
              1880-2023, tabulated from the United States Social Security
              Adminstration{"'"}s data.
            </p>
            <p className="text-foreground">
              thanks for using nomen!
              <br />
              nomen was made by{" "}
              <span className="items-center gap-1 inline-flex">
                <SiGithub />
                <Link href="https://github.com/aramshiva">@aramshiva</Link>
              </span>
            </p>
            <div className="pt-3" />
            <Link className="text-black hover:underline" href="/">
              ← go back to nomen
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
