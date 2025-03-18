"use client";

import { Button } from "@/components/ui/button";
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
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

interface PopularNameData {
  name: string;
  sex: string;
  amount: number;
  rank: number;
  year?: number;
}

export default function PopularNamesPage() {
  const [year, setYear] = useState<string>("all");
  const [sex, setSex] = useState<string>("all");
  const [data, setData] = useState<PopularNameData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [yearOptions, setYearOptions] = useState<string[]>([]);

  const fetchYearOptions = async () => {
    try {
      const years = [];
      for (let y = 2023; y >= 1880; y--) {
        years.push(y.toString());
      }
      setYearOptions(["all", ...years]);
    } catch (error) {
      console.error("Error fetching year options:", error);
    }
  };

  const fetchPopularNames = async () => {
    setIsLoading(true);
    try {
      let apiUrl;
      if (year === "all") {
        apiUrl = `/api/popular/all`;
        if (sex !== "all") {
          apiUrl += `?sex=${sex}`;
        }
      } else {
        apiUrl = `/api/year?year=${year}`;
        if (sex !== "all") {
          apiUrl += `&sex=${sex}`;
        }
      }

      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const sortedData = result.data.sort(
          (a: PopularNameData, b: PopularNameData) => b.amount - a.amount
        );

        const rankedData: PopularNameData[] = sortedData.map(
          (item: PopularNameData, index: number) => ({
            ...item,
            rank: index + 1,
          })
        );

        setData(rankedData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching popular names:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchYearOptions();
    fetchPopularNames();
  }, []);

  useEffect(() => {
    fetchPopularNames();
  }, [year, sex]);

  return (
    <div className={inter.className + " min-h-screen flex flex-col"}>
      <div className="border-b p-4 bg-white shadow-sm dark:bg-gray-950 dark:border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Link href="/">
              <motion.p
                className="font-bold mr-4 cursor-pointer"
                layoutId="title"
              >
                Nomen
              </motion.p>
            </Link>
            <h1 className="text-sm font-semibold">Most Popular Names</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-40">
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y === "all" ? "All Time" : y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ThemeToggle />
            <Link href="/">
              <Button variant="outline">Back to Search</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Loading popular names...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="container mx-auto">
            <h2 className="text-xl font-semibold mb-4">
              {year === "all" ? "All Time" : year} Top 500{" "}
              {sex === "M" ? "Male" : sex === "F" ? "Female" : ""} Names
            </h2>
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-950">
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  {year === "all" && (
                    <TableHead className="text-right">
                      Most Popular Year
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.rank}</TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/?name=${item.name}&sex=${item.sex}`}
                        className="hover:underline text-blue-600 dark:text-blue-400"
                      >
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {item.sex === "M" ? "Male" : "Female"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.amount.toLocaleString()}
                    </TableCell>
                    {year === "all" && (
                      <TableCell className="text-right">{item.year}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No popular names found</p>
          </div>
        )}
      </div>
    </div>
  );
}
