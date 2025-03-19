"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Inter } from "next/font/google";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, Suspense } from "react";
import { motion } from "motion/react";
import Chart from "@/components/chart";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/top-bar";

const inter = Inter({ subsets: ["latin"] });

interface NameData {
  name: string;
  sex: string;
  amount: number;
  year: number;
}

function Search() {
  const searchParams = useSearchParams();
  const urlName = searchParams.get("name");
  const urlSex =
    searchParams.get("sex")?.toUpperCase() ||
    (searchParams.get("sex")?.toLowerCase() === "male"
      ? "M"
      : searchParams.get("sex")?.toLowerCase() === "female"
      ? "F"
      : "");
  const [name, setName] = useState(urlName || "");
  const [sex, setSex] = useState(urlSex || "");
  const [data, setData] = useState<NameData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedSex, setSubmittedSex] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !sex) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/names?name=${name}&sex=${sex}`);
      const result = await response.json();
      setData(result);
      setHasSearched(true);
      setSubmittedName(name);
      setSubmittedSex(sex);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (urlName && urlSex) {
      setName(urlName);
      setSex(urlSex);
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlName, urlSex]);

  if (!hasSearched) {
    return (
      <div className={inter.className}>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="w-[30rem] max-w-full">
            <motion.p className="font-bold text-xl">Nomen</motion.p>
            <p className="text-muted-foreground text-sm pb-5">
              A parser for every name listed on a social security card between
              1880-2023, tabulated from the United States Social Security
              Adminstration{"'"}s data.
            </p>
            <form onSubmit={handleSearch} className="flex flex-col space-y-5">
              <motion.div
                className="flex flex-col space-y-2"
                layoutId="name-input-container"
              >
                <p>First Name:</p>
                <motion.div layoutId="name-input">
                  <Input
                    type="text"
                    placeholder="Enter a name"
                    className="w-full"
                    aria-label="Name search"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </motion.div>
              </motion.div>
              <motion.div className="" layoutId="sex-select-container">
                <p>Sex:</p>
                <motion.div layoutId="sex-select">
                  <Select value={sex} onValueChange={setSex}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>
              <motion.div layoutId="search-button">
                <Button type="submit" disabled={isLoading} className="w-full">
                  <motion.span
                    key={isLoading ? "loading" : "idle"}
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.6 }}
                  >
                    {isLoading ? "Searching..." : "Search"}
                  </motion.span>
                </Button>
              </motion.div>
              <div className="flex justify-center items-center text-sm text-muted-foreground">
                <Link href="/popular" className="underline">
                  Popular Names
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={inter.className + " min-h-screen flex flex-col"}>
      <TopBar>
        <form
          onSubmit={handleSearch}
          className="flex-1 flex flex-col md:flex-row gap-4 items-center"
        >
          <motion.div className="w-full" layoutId="name-input-container">
            <motion.div layoutId="name-input">
              <Input
                type="text"
                placeholder="Enter a name"
                aria-label="Name search"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </motion.div>
          </motion.div>
          <motion.div
            className="w-full md:w-40"
            layoutId="sex-select-container"
          >
            <motion.div layoutId="sex-select">
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </motion.div>
          <motion.div layoutId="search-button">
            <Button type="submit" disabled={isLoading}>
              <motion.span
                key={isLoading ? "loading" : "idle"}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.6 }}
              >
                {isLoading ? "Searching..." : "Search"}
              </motion.span>
            </Button>
          </motion.div>
        </form>
      </TopBar>

      <div className="pt-3 px-2 sm:pt-5 sm:px-9 sm:pb-5 pb-3">
        <Chart name={submittedName} sex={submittedSex} />
      </div>
      <div className="flex-1 overflow-auto p-4">
        {data.length > 0 ? (
          <div className="container mx-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sex}</TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell className="text-right">{item.year}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Fallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-[30rem] max-w-full">
        <p className="font-bold text-xl">Nomen</p>
        <p className="text-muted-foreground text-sm pb-5">Loading...</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Fallback />}>
      <Search />
    </Suspense>
  );
}
