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
import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

interface Survivor {
  age: number;
  probability: number;
}

interface PopularNameData {
  name: string;
  sex: string;
  amount: number;
  estimatedSurvivors?: Survivor[];
  year?: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ActuaryPage() {
  const [data, setData] = useState<PopularNameData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination({ ...pagination, page: newPage });
  };

  const handleLimitChange = (newLimit: string) => {
    setPagination({ ...pagination, limit: parseInt(newLimit), page: 1 });
  };

  const fetchActuaryData = async () => {
    setIsLoading(true);
    try {
      const apiUrl = `/api/actuary/all?page=${pagination.page}&limit=${pagination.limit}`;

      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
        setPagination(result.pagination);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching actuary data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActuaryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  const formatSurvivalProbability = (survivors: Survivor[] | undefined) => {
    if (!survivors || !Array.isArray(survivors)) return "N/A";

    const age80 = survivors.find((s) => s.age === 80);
    if (age80) {
      return `${(age80.probability * 100).toFixed(2)}%`;
    }

    const lastAge = survivors[survivors.length - 1];
    return lastAge
      ? `${(lastAge.probability * 100).toFixed(2)}% at age ${lastAge.age}`
      : "N/A";
  };

  return (
    <div className={inter.className + " min-h-screen flex flex-col"}>
      <TopBar title="ACTUARY">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="secondary">Back to Search</Button>
          </Link>
        </div>
      </TopBar>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Loading actuary data...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Rows per page:</span>
                <Select
                  value={pagination.limit.toString()}
                  onValueChange={handleLimitChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} entries
              </div>
            </div>

            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Population</TableHead>
                  <TableHead className="text-right">Survival to 80</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
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
                    <TableCell>{item.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {formatSurvivalProbability(item.estimatedSurvivors)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No actuary data found</p>
          </div>
        )}
      </div>
    </div>
  );
}
