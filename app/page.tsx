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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Heatmap from "@/components/heatmap";
import { Download } from "lucide-react";
import { useTheme } from "next-themes";

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
  const urlMap = searchParams.get("map");
  const [name, setName] = useState(urlName || "");
  const [sex, setSex] = useState(urlSex || "");
  const [showMap, setShowMap] = useState(urlMap === "true");
  const [data, setData] = useState<NameData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedSex, setSubmittedSex] = useState("");
  const { theme, setTheme } = useTheme();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !sex) return;

    if (name !== submittedName || sex !== submittedSex || showMap !== (urlMap === "true")) {
      const url = new URL(window.location.href);
      url.searchParams.set("name", name);
      url.searchParams.set("sex", sex);
      if (showMap) url.searchParams.set("map", "true");
      window.history.pushState({}, "", url);
    }

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
    if (urlName && urlSex && !hasSearched) {
      setName(urlName);
      setSex(urlSex);
      setShowMap(urlMap === "true");
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlName, urlSex, urlMap]);

  const exportToCsv = () => {
    if (data.length === 0) return;

    const headers = ["Name", "Sex", "Amount", "Year"];
    const csvContent = [
      headers.join(","),
      ...data.map(
        (item) => `${item.name},${item.sex},${item.amount},${item.year}`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${submittedName}-${submittedSex}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!hasSearched) {
    return (
      <motion.div
        className={`${inter.className}`}
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6 }}
      >
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
              <motion.div
                className="flex flex-col space-y-2"
                layoutId="search-map-checkbox-container"
              >
                <motion.div
                  layoutId="search-map-checkbox"
                  className="flex items-center"
                >
                  <Checkbox
                    id="show-map"
                    checked={showMap}
                    onClick={() => setShowMap(!showMap)}
                  />
                  <label htmlFor="show-map" className="ml-2 cursor-pointer">
                    Show Map
                  </label>
                  <Badge variant="secondary" className="ml-2">
                    Beta
                  </Badge>
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
              <div className="flex justify-center items-center text-sm text-muted-foreground flex-row gap-2">
                <Link href="/popular" className="underline">
                  Popular Names
                </Link>
                {" | "}
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
            </form>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
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
        <div className="pt-3 px-2 sm:pt-5 sm:px-9 sm:pb-5 pb-3 md:flex md:flex-row md:gap-2">
          <div className="w-full pb-3 md:pb-0">
            <Chart name={submittedName} sex={submittedSex} />
          </div>
          {showMap && <Heatmap sex={submittedSex} name={submittedName} />}
        </div>
        <div className="flex-1 overflow-auto p-4">
          {data.length > 0 ? (
            <div className="container mx-auto">
              <div className="flex justify-end mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCsv}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Export CSV
                </Button>
              </div>
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
            <div className="h-full flex items-center justify-center flex-col">
              <p className="text-muted-foreground">No results found</p>
              <p className="text-gray-400 text-sm">
                Years with under five occurances are not shown for privacy
                reasons
              </p>
            </div>
          )}
        </div>
      </div>
    </>
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
