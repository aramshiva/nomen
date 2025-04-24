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
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { TopBar } from "@/components/top-bar";

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLTableRowElement | null>(null);

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

  const fetchPopularNames = async (pageNum = 1, shouldAppend = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const pageSize = 100;
      let apiUrl;
      if (year === "all") {
        apiUrl = `/api/popular/all?page=${pageNum}&pageSize=${pageSize}`;
        if (sex !== "all") {
          apiUrl += `&sex=${sex}`;
        }
      } else {
        apiUrl = `/api/year?year=${year}&page=${pageNum}&pageSize=${pageSize}`;
        if (sex !== "all") {
          apiUrl += `&sex=${sex}`;
        }
      }

      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        if (result.data.length === 0) {
          setHasMore(false);
          return;
        }
        
        const sortedData = result.data.sort(
          (a: PopularNameData, b: PopularNameData) => b.amount - a.amount,
        );

        const startRank = (pageNum - 1) * pageSize + 1;
        const rankedData: PopularNameData[] = sortedData.map(
          (item: PopularNameData, index: number) => ({
            ...item,
            rank: startRank + index,
          }),
        );

        if (shouldAppend) {
          setData(prevData => [...prevData, ...rankedData]);
        } else {
          setData(rankedData);
        }
      } else {
        if (!shouldAppend) {
          setData([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching popular names:", error);
      if (!shouldAppend) {
        setData([]);
      }
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setInitialLoad(false);
    }
  };

  const loadMoreItems = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPopularNames(nextPage, true);
    }
  }, [isLoading, hasMore, page]);

  useEffect(() => {
    fetchYearOptions();
    fetchPopularNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPopularNames(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, sex]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !initialLoad) {
          loadMoreItems();
        }
      },
      { threshold: 0.5 }
    );
    
    observerRef.current = observer;
    
    if (lastItemRef.current) {
      observer.observe(lastItemRef.current);
    }
    
    return () => observer.disconnect();
  }, [loadMoreItems, initialLoad]);

  return (
    <div className={inter.className + " min-h-screen flex flex-col"}>
      <TopBar title="Most Popular Names">
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
          <Link href="/">
            <Button variant="secondary">Back to Search</Button>
          </Link>
        </div>
      </TopBar>

      <div className="flex-1 overflow-auto p-4">
        {initialLoad && isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Loading popular names...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="container mx-auto">
            <h2 className="text-xl font-semibold mb-4">
              {year === "all" ? "All Time" : year}{" "}
              {sex === "M" ? "Male" : sex === "F" ? "Female" : ""} Names
              {/* Removed "Top 1000" text as we now have infinite scroll */}
            </h2>
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow 
                    key={index} 
                    ref={index === data.length - 10 ? lastItemRef : null}
                  >
                    <TableCell>{item.rank}</TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/?name=${item.name}&sex=${item.sex}`}
                        className="hover:underline text-primary"
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {isLoading && !initialLoad && (
              <div className="py-4 text-center">
                <p className="text-muted-foreground">Loading more names...</p>
              </div>
            )}
            {!hasMore && (
              <div className="py-4 text-center">
                <p className="text-muted-foreground">No more names to load</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No popular names found</p>
          </div>
        )}
      </div>
    </div>
  );
}
