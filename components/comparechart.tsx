"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NameData {
  name: string;
  sex?: string;
  amount: number;
  year: number;
}

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
  amount1: {
    label: "Amount",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface ChartProps {
  name: string;
  sex?: string;
  name1?: string;
  sex1?: string;
}

export default function Chart({ name, sex, name1, sex1 }: ChartProps) {
  const [timeRange, setTimeRange] = React.useState("100y");
  const [chartData1, setChartData1] = React.useState<NameData[]>([]);
  const [chartData2, setChartData2] = React.useState<NameData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchNameData = async (name: string, sex?: string) => {
          if (!name) return [];

          let url = `/api/names?name=${encodeURIComponent(name)}`;
          if (sex) {
            url += `&sex=${encodeURIComponent(sex)}`;
          }
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(
              `API request failed with status ${response.status}`,
            );
          }
          return response.json();
        };

        const data1 = await fetchNameData(name, sex);
        setChartData1(data1);

        if (name1) {
          const data2 = await fetchNameData(name1, sex1);
          setChartData2(data2);
        } else {
          setChartData2([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [name, sex, name1, sex1]);

  const filterDataByTimeRange = (data: NameData[]) => {
    if (timeRange === "all") {
      return data;
    }

    let yearsToSubtract = 100;
    if (timeRange === "200y") {
      yearsToSubtract = 200;
    } else if (timeRange === "50y") {
      yearsToSubtract = 50;
    } else if (timeRange === "20y") {
      yearsToSubtract = 20;
    }
    const startYear = currentYear - yearsToSubtract;
    return data.filter((item) => item.year >= startYear);
  };

  const filteredData1 = filterDataByTimeRange(chartData1);
  const filteredData2 = filterDataByTimeRange(chartData2);

  const prepareChartData = () => {
    const allYears = new Set<number>();
    filteredData1.forEach((item) => allYears.add(item.year));
    filteredData2.forEach((item) => allYears.add(item.year));

    const yearMap: Record<
      number,
      { year: number; amount1?: number; amount2?: number }
    > = {};

    Array.from(allYears)
      .sort()
      .forEach((year) => {
        yearMap[year] = { year };
      });

    filteredData1.forEach((item) => {
      yearMap[item.year].amount1 = item.amount;
    });

    filteredData2.forEach((item) => {
      yearMap[item.year].amount2 = item.amount;
    });

    return Object.values(yearMap).sort((a, b) => a.year - b.year);
  };

  const combinedData = prepareChartData();

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>
            {name} {sex ? `(${sex})` : ""}
            {name1 ? ` vs ${name1} ${sex1 ? `(${sex1})` : ""}` : ""} -
            Historical Data
          </CardTitle>
          <CardDescription>
            {name1
              ? "Comparing name frequencies over time"
              : "Name frequency over time"}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Last 100 years" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all" className="rounded-lg">
              All time
            </SelectItem>
            <SelectItem value="200y" className="rounded-lg">
              Last 200 years
            </SelectItem>
            <SelectItem value="100y" className="rounded-lg">
              Last 100 years
            </SelectItem>
            <SelectItem value="50y" className="rounded-lg">
              Last 50 years
            </SelectItem>
            <SelectItem value="20y" className="rounded-lg">
              Last 20 years
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 pb-[4rem]">
        <div className="flex flex-col items-center justify-center h-full">
          {isLoading ? (
            <div className="flex h-[250px] items-center justify-center">
              <p>Loading data...</p>
            </div>
          ) : error ? (
            <div className="flex h-[250px] items-center justify-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredData1.length === 0 && filteredData2.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground">
              <p>No data available for the selected time range.</p>
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={combinedData}>
                <defs>
                  <linearGradient id="fillAmount1" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-amount)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-amount)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillAmount2" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-amount1)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-amount1)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />

                <Area
                  name={name}
                  dataKey="amount1"
                  type="monotone"
                  fill="url(#fillAmount1)"
                  stroke="var(--color-amount)"
                  connectNulls={true}
                />
                <Area
                  name={name1}
                  dataKey="amount2"
                  type="monotone"
                  fill="url(#fillAmount2)"
                  stroke="var(--color-amount1)"
                  connectNulls={true}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
