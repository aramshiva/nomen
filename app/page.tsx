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
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
import Heatmap from "@/components/heatmap";
import { Download } from "lucide-react";
import Actuary from "@/components/actuary";
import Numbers from "@/components/numbers";
const inter = Inter({ subsets: ["latin"] });
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  // const urlActuary = searchParams.get("actuary");
  const [name, setName] = useState(urlName || "");
  const [sex, setSex] = useState(urlSex || "");
  // const [showActuary, setShowActuary] = useState(urlActuary === "true");
  const [data, setData] = useState<NameData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submittedSex, setSubmittedSex] = useState("");

  const performSearch = async (searchName: string, searchSex: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/names?name=${searchName}&sex=${searchSex}`
      );
      const result = await response.json();
      setData(result);
      setHasSearched(true);
      setSubmittedName(searchName);
      setSubmittedSex(searchSex);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !sex) {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("name", name);
    url.searchParams.set("sex", sex);
    // if (showActuary) url.searchParams.set("actuary", "true");
    window.history.pushState({}, "", url);

    await performSearch(name, sex);
  };

  useEffect(() => {
    const handlePopState = () => {
      const currentUrl = new URL(window.location.href);
      const currentName = currentUrl.searchParams.get("name");
      const currentSex = currentUrl.searchParams.get("sex");

      if (currentName && currentSex) {
        setName(currentName);
        setSex(currentSex);
        performSearch(currentName, currentSex);
      } else {
        setHasSearched(false);
        setData([]);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (urlName && urlSex && !hasSearched) {
      setName(urlName);
      setSex(urlSex);
      // setShowActuary(urlActuary === "true");
      performSearch(urlName, urlSex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlName, urlSex]);

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

  const exportToJson = () => {
    if (data.length === 0) return;

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${submittedName}-${submittedSex}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToXml = () => {
    if (data.length === 0) return;

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<nameData>
${data
  .map(
    (item) => `  <record>
    <name>${item.name}</name>
    <sex>${item.sex}</sex>
    <amount>${item.amount}</amount>
    <year>${item.year}</year>
  </record>`
  )
  .join("\n")}
</nameData>`;

    const blob = new Blob([xmlContent], {
      type: "application/xml;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${submittedName}-${submittedSex}.xml`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPdf = () => {
    if (data.length === 0) return;
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Avenir Next", Avenir, "Nimbus Sans L", Roboto, Noto, "Segoe UI", Arial, Helvetica, "Helvetica Neue", sans-serif; 
      margin: 20px; 
      font-size: 14px;
    }
    h1 { color: #333; margin-bottom: 24px; }
    
    .table-container {
      width: 100%;
      caption-bottom: true;
      font-size: 0.875rem;
    }
    
    table { 
      width: 100%;
      border-collapse: collapse;
      caption-side: bottom;
    }
    
    thead {
      position: sticky;
      top: 0;
      background: #ffffff;
    }
    
    thead tr {
      border-bottom: 1px solid #e2e8f0;
    }
    
    th {
      height: 40px;
      padding: 0 8px;
      text-align: left;
      vertical-align: middle;
      font-weight: 500;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
    }
    
    th:last-child {
      text-align: right;
    }
    
    tbody tr {
      border-bottom: 1px solid #e2e8f0;
      transition: background-color 0.15s ease;
    }
    
    tbody tr:hover {
      background-color: rgba(248, 250, 252, 0.5);
    }
    
    tbody tr:last-child {
      border-bottom: none;
    }
    
    td {
      padding: 8px;
      vertical-align: middle;
    }
    
    td:first-child {
      font-weight: 500;
    }
    
    td:last-child {
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th style="width: 100px;">Name</th>
          <th>Sex</th>
          <th>Amount</th>
          <th>Year</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.sex}</td>
            <td>${item.amount}</td>
            <td>${item.year}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  </div>
  <p>powered by nomen.sh</p>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
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
              Nomen
            </motion.p>
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
              <div className="flex justify-center items-center text-sm text-muted-foreground flex-row gap-2">
                <Link href="/popular" className="underline">
                  Popular Names
                </Link>
                {" | "}
                <Link href="/compare" className="underline">
                  Compare Names
                </Link>
                {" | "}
                <Link href="/about" className="underline">
                  About
                </Link>
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
        {data.length > 0 && (
          <div className="pt-3 px-2 sm:pt-5 sm:px-9 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-2">
            <Chart name={submittedName} sex={submittedSex} />
            <Heatmap sex={submittedSex} name={submittedName} />
            <>
              <div>
                <Actuary name={submittedName} sex={submittedSex} />
              </div>
              <div>
                <Numbers name={submittedName} sex={submittedSex} />
              </div>
            </>
          </div>
        )}
        <div className="flex-1 overflow-auto p-4">
          {data.length > 0 ? (
            <div className="container mx-auto">
              <div className="flex justify-end mb-3">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    {" "}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download size={16} />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={exportToCsv}>
                      Download CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToPdf}>
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToJson}>
                      Download JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToXml}>
                      Download XML
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
        <p className="font-bold text-2xl font-gosha lowercase">Nomen</p>
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
