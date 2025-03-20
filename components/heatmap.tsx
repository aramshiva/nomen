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

export default function Heatmap({ sex, name }: { sex: string; name: string }) {
  const submittedSex = sex;
  const submittedName = name;
  const { theme } = useTheme();

  return (
    <Card className="w-full pb-2">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>
            {submittedName} {submittedSex ? `(${submittedSex})` : ""} - Heatmap
            <Badge variant="secondary" className="ml-2">
              Beta
            </Badge>
          </CardTitle>
          <CardDescription>
            Showing name frequency across states from 1910 and later.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-full pb-[4rem]">
        <div className="w-[20rem] md:w-[25rem]">
          <Geo theme={theme} sex={submittedSex} name={submittedName} />
        </div>
      </CardContent>
    </Card>
  );
}
