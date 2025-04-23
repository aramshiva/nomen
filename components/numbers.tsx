import {
<<<<<<< HEAD
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { useEffect, useState } from "react";
import CountUp from "react-countup";

export default function Actuary({ sex, name }: { sex: string; name: string }) {
  const [peopleAlive, setPeopleAlive] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPeopleAlive(null);
    setError(null);
    const fetchPeopleAlive = async () => {
      try {
        if (!name || !sex) return;
        const response = await fetch(
          `/api/names/total?name=${name}&sex=${sex}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        console.log(data);

        if (data && typeof data.total === "number") {
          setPeopleAlive(data.total);
        } else {
          setError("Unexpected data format");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching actuary data:", err);
      }
    };

    fetchPeopleAlive();
  }, [name, sex]);

  return (
    <Card className="w-full pb-2">
      <Tooltip>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b pb-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>
              {name} {sex ? `(${sex})` : ""} - Total
              <Badge variant="secondary" className="ml-2">
                Beta
              </Badge>
            </CardTitle>
            <CardDescription>
              Showing total approximate number of people with this name.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full pb-2">
          <TooltipTrigger>
            <div className="w-[20rem] md:w-[25rem]">
              <p className="pt-5 fill-foreground text-3xl font-bold">
                {peopleAlive === null ? (
                  "Loading..."
                ) : error ? (
                  "Error loading data"
                ) : (
                  <CountUp end={peopleAlive} separator="," />
                )}
              </p>
              <p className="text-muted-foreground text-sm pb-5">
                people alive with this name
              </p>
            </div>
          </TooltipTrigger>
        </CardContent>
        <TooltipContent>
          <p>
            Data is based of SSA&apos;s actuary database, may not be reliable.
          </p>
        </TooltipContent>
      </Tooltip>
    </Card>
  );
}
=======
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "./ui/card";
  import { Badge } from "./ui/badge";
  import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
  import { useEffect, useState } from "react";
  import CountUp from "react-countup";
  
  export default function Actuary({ sex, name }: { sex: string; name: string }) {
    const [peopleAlive, setPeopleAlive] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      setPeopleAlive(null);
      setError(null);
      const fetchPeopleAlive = async () => {
        try {
          if (!name || !sex) return;
          const response = await fetch(`/api/names/total?name=${name}&sex=${sex}`);

          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }

          const data = await response.json();
          console.log(data);

          if (data && typeof data.total === 'number') {
            setPeopleAlive(data.total);
          } else {
            setError('Unexpected data format');
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
            <CardHeader className="flex items-center gap-2 space-y-0 border-b pb-5 sm:flex-row">
              <div className="grid flex-1 gap-1 text-center sm:text-left">
                <CardTitle>
                  {name} {sex ? `(${sex})` : ""} -
                  Total 
                  <Badge variant="secondary" className="ml-2">
                    Beta
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Showing total approximate number of people with this name.
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
                      <CountUp 
                      end={peopleAlive} 
                      separator="," 
                    />
                  }
                </p>
                <p className="text-muted-foreground text-sm pb-5">
                    people alive with this name
                </p>
                </div>
              </TooltipTrigger>
            </CardContent>
          <TooltipContent>
            <p>Data is based of SSA&apos;s actuary database, may not be reliable.</p>
          </TooltipContent>
        </Tooltip>
      </Card>
    );
  }
>>>>>>> parent of 8229b75 (move to src dir + add wip about pg)
