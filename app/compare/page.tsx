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
import Chart from "@/components/comparechart";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/top-bar";
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
  const urlName1 = searchParams.get("name1");
  const urlSex1 =
    searchParams.get("sex1")?.toUpperCase() ||
    (searchParams.get("sex1")?.toLowerCase() === "male"
      ? "M"
      : searchParams.get("sex1")?.toLowerCase() === "female"
        ? "F"
        : "");
  const urlActuary = searchParams.get("actuary");

  const [name, setName] = useState(urlName || "");
  const [sex, setSex] = useState(urlSex || "");
  const [name1, setName1] = useState(urlName1 || "");
  const [sex1, setSex1] = useState(urlSex1 || "");
  const [showActuary, setShowActuary] = useState(urlActuary === "true");
  const [data, setData] = useState<NameData[]>([]);
  const [data1, setData1] = useState<NameData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedSex, setSubmittedSex] = useState("");
  const [submittedName1, setSubmittedName1] = useState("");
  const [submittedSex1, setSubmittedSex1] = useState("");
  const { theme, setTheme } = useTheme();

  const performSearch = async (
    searchName: string,
    searchSex: string,
    isSecond = false,
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/names?name=${searchName}&sex=${searchSex}`,
      );
      const result = await response.json();

      if (isSecond) {
        setData1(result);
        setSubmittedName1(searchName);
        setSubmittedSex1(searchSex);
      } else {
        setData(result);
        setSubmittedName(searchName);
        setSubmittedSex(searchSex);
      }

      if (!hasSearched) {
        setHasSearched(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !sex || !name1 || !sex1) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("name", name);
    url.searchParams.set("sex", sex);
    if (name1 && sex1) {
      url.searchParams.set("name1", name1);
      url.searchParams.set("sex1", sex1);
    }
    if (showActuary) url.searchParams.set("actuary", "true");
    window.history.pushState({}, "", url);

    await performSearch(name, sex);
    if (name1 && sex1) {
      await performSearch(name1, sex1, true);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const currentUrl = new URL(window.location.href);
      const currentName = currentUrl.searchParams.get("name");
      const currentSex = currentUrl.searchParams.get("sex");
      const currentName1 = currentUrl.searchParams.get("name1");
      const currentSex1 = currentUrl.searchParams.get("sex1");

      if (currentName && currentSex) {
        setName(currentName);
        setSex(currentSex);
        performSearch(currentName, currentSex);

        if (currentName1 && currentSex1) {
          setName1(currentName1);
          setSex1(currentSex1);
          performSearch(currentName1, currentSex1, true);
        }
      } else {
        setHasSearched(false);
        setData([]);
        setData1([]);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (urlName && urlSex && !hasSearched) {
      setName(urlName);
      setSex(urlSex);
      setShowActuary(urlActuary === "true");
      performSearch(urlName, urlSex);

      if (urlName1 && urlSex1) {
        setName1(urlName1);
        setSex1(urlSex1);
        performSearch(urlName1, urlSex1, true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlName, urlSex, urlName1, urlSex1, urlActuary]);

  const exportToCsv = (dataSet: number = 0) => {
    const dataToExport = dataSet === 0 ? data : data1;
    const nameToExport = dataSet === 0 ? submittedName : submittedName1;
    const sexToExport = dataSet === 0 ? submittedSex : submittedSex1;

    if (dataToExport.length === 0) return;

    const headers = ["Name", "Sex", "Amount", "Year"];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map(
        (item) => `${item.name},${item.sex},${item.amount},${item.year}`,
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${nameToExport}-${sexToExport}.csv`);
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
            <motion.p className="font-bold text-2xl font-gosha lowercase pb-1">
              Nomen <span className="text-lg">COMPARE</span>
            </motion.p>
            <p className="text-muted-foreground text-sm pb-5">
              Compare trends between two names from 1880-2023, using data from
              the United States Social Security Administration.
            </p>
            <form onSubmit={handleSearch} className="flex flex-col space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-5">
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
                  <motion.div
                    className="flex flex-col space-y-2"
                    layoutId="sex-select-container"
                  >
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
                </div>
                <div className="space-y-5">
                  <motion.div
                    className="flex flex-col space-y-2"
                    layoutId="name1-input-container"
                  >
                    <p>Second Name</p>
                    <motion.div layoutId="name1-input">
                      <Input
                        type="text"
                        placeholder="Enter a name to compare"
                        className="w-full"
                        aria-label="Second name search"
                        value={name1}
                        onChange={(e) => setName1(e.target.value)}
                      />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    className="flex flex-col space-y-2"
                    layoutId="sex1-select-container"
                  >
                    <p>Sex:</p>
                    <motion.div layoutId="sex1-select">
                      <Select value={sex1} onValueChange={setSex1}>
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
                </div>
              </div>
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
                <Link href="/" className="underline">
                  Home
                </Link>
                {" | "}
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
                          : "dark",
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
            className="flex-1 flex flex-col md:flex-row gap-4 items-start"
          >
            <div className="w-full md:w-1/3 grid grid-cols-2 gap-2">
              <motion.div layoutId="name-input-container">
                <motion.div layoutId="name-input">
                  <Input
                    type="text"
                    placeholder="First name"
                    aria-label="Name search"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </motion.div>
              </motion.div>
              <motion.div layoutId="sex-select-container">
                <motion.div layoutId="sex-select">
                  <Select value={sex} onValueChange={setSex}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>
            </div>
            <div className="w-full md:w-1/3 grid grid-cols-2 gap-2">
              <motion.div layoutId="name1-input-container">
                <motion.div layoutId="name1-input">
                  <Input
                    type="text"
                    placeholder="Second name"
                    aria-label="Second name search"
                    value={name1}
                    onChange={(e) => setName1(e.target.value)}
                  />
                </motion.div>
              </motion.div>
              <motion.div layoutId="sex1-select-container">
                <motion.div layoutId="sex1-select">
                  <Select value={sex1} onValueChange={setSex1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>
            </div>
            <motion.div layoutId="search-button">
              <Button type="submit" disabled={isLoading}>
                <motion.span
                  key={isLoading ? "loading" : "idle"}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.6 }}
                >
                  {isLoading ? "Searching..." : "Compare"}
                </motion.span>
              </Button>
            </motion.div>
          </form>
        </TopBar>
        {data.length > 0 && (
          <div className="pt-3 px-2 sm:pt-5 sm:px-9 grid grid-cols-1 gap-3 md:gap-2">
            <Chart
              name={submittedName}
              sex={submittedSex}
              name1={submittedName1}
              sex1={submittedSex1}
            />
            {/* {showActuary && (
              <>
                <div>
                  <Actuary name={submittedName} sex={submittedSex} />
                </div>
                <div>
                  <Numbers name={submittedName} sex={submittedSex} />
                </div>
              </>
            )} */}
          </div>
        )}

        <div className="md:hidden p-4 text-center">
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="text-muted-foreground">
              Full data access is not compatible on mobile at the moment
            </p>
            <p className="text-xs mt-2">
              Please view on a larger screen for detailed tables
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-row space-x-9 p-9">
          <div className="flex-1 overflow-auto">
            {data.length > 0 ? (
              <div className="container mx-auto">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium pl-2">
                    {submittedName} ({submittedSex})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCsv(0)}
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
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.sex}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell className="text-right">
                          {item.year}
                        </TableCell>
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

          <div className="flex-1 overflow-auto">
            {data1.length > 0 ? (
              <div className="container mx-auto">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium pl-2">
                    {submittedName1} ({submittedSex1})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCsv(1)}
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
                    {data1.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.sex}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell className="text-right">
                          {item.year}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : submittedName1 ? (
              <div className="h-full flex items-center justify-center flex-col">
                <p className="text-muted-foreground">No results found</p>
                <p className="text-gray-400 text-sm">
                  Years with under five occurances are not shown for privacy
                  reasons
                </p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center flex-col">
                <p className="text-muted-foreground">No second name selected</p>
                <p className="text-gray-400 text-sm">
                  Add a second name to compare data
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Fallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-[30rem] max-w-full">
        <p className="font-bold text-2xl font-gosha lowercase">
          nomen <span className="">compare</span>
        </p>
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
