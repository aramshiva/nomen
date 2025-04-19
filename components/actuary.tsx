import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "./ui/card";
  import Geo from "./geo";
  import { Badge } from "./ui/badge";
  import { useTheme } from "next-themes";
  import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
  import { useEffect, useState } from "react";
  
  export default function Actuary({ sex, name }: { sex: string; name: string }) {
    const { theme } = useTheme();
    const [peopleAlive, setPeopleAlive] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      setPeopleAlive(null);
      setError(null);
      const fetchPeopleAlive = async () => {
        try {
          if (!name || !sex) return;
          
          const response = await fetch(
            `/api/actuary?name=${encodeURIComponent(name)}&gender=${sex}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          
          const data = await response.json();
          if (data.success) {
            setPeopleAlive(data.data.estimatedSurvivors);
          } else {
            setError(data.message);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          console.error('Error fetching actuary data:', err);
        }
      };

      fetchPeopleAlive();
    }, [name, sex]);
  
    return (
      <Card className="w-full pb-2">
        <Tooltip>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1 text-center sm:text-left">
                <CardTitle>
                  {name} {sex ? `(${sex})` : ""} -
                  Actuarial Data
                  <Badge variant="secondary" className="ml-2">
                    Beta
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Showing approximate number of people alive with this name.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full pb-2">
            <TooltipTrigger>
              <div className="w-[20rem] md:w-[25rem]">
                <p className="pt-5 fill-foreground text-3xl font-bold">
                  {peopleAlive === null ? 
                    "Loading..." : 
                    error ? 
                      "Error loading data" :
                      peopleAlive.toLocaleString()
                  }
                </p>
                <p className="text-muted-foreground text-sm pb-5">
                    people alive with this name
                </p>
                </div>
              </TooltipTrigger>
            </CardContent>
          <TooltipContent>
            <p>Data can be slightly inaccurate and may feature inconsistencies</p>
          </TooltipContent>
        </Tooltip>
      </Card>
    );
  }
  