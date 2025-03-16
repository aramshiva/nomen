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
  ChartLegend,
  ChartLegendContent,
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
} satisfies ChartConfig;

interface ChartProps {
  name: string;
  sex?: string;
}

export default function Chart({ name, sex }: ChartProps) {
  const [timeRange, setTimeRange] = React.useState("100y");
  const [chartData, setChartData] = React.useState<NameData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let url = `/api/names?name=${encodeURIComponent(name)}`;
        if (sex) {
          url += `&sex=${encodeURIComponent(sex)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        setChartData(data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [name, sex]);

  const filteredData = chartData.filter((item) => {
    if (timeRange === "all") {
      return true;
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
    return item.year >= startYear;
  });

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>
            {name} {sex ? `(${sex})` : ""} - Historical Data
          </CardTitle>
          <CardDescription>Showing name frequency over time</CardDescription>
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
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex h-[250px] items-center justify-center">
            <p>Loading data...</p>
          </div>
        ) : error ? (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center">
            <p>No data available for the selected time range.</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
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
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value) => [
                      `${value}`,
                      " people were born this year.",
                    ]}
                  />
                }
              />
              <Area
                dataKey="amount"
                type="monotone"
                fill="url(#fillAmount)"
                stroke="var(--color-amount)"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
