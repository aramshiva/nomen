// im sorry for anyone reading this code, i know its a mess.
// it was made with d3, ai, and a lot of luck
// i have no idea how it works, but it does
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Topology, GeometryCollection } from "topojson-specification";
import { FeatureCollection } from "geojson";

interface GeoProps {
  height?: number | "auto" | "100%";
  width?: number | "auto" | "100%";
  name?: string;
  sex?: string;
  theme?: string;
}

export default function Geo({
  height = 610,
  width = 975,
  name,
  theme,
  sex,
}: GeoProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [stateData, setStateData] = useState<
    Array<{ state: string; value: number }>
  >([]);

  const getNumericDimension = (
    value: number | "auto" | "100%",
    defaultValue: number,
  ) => {
    if (typeof value === "number") return value;
    return defaultValue;
  };

  const getStateNameFromAbbreviation = (abbr: string) => {
    type StateAbbreviation = keyof typeof stateMap;
    const stateMap = {
      AL: "Alabama",
      AK: "Alaska",
      AZ: "Arizona",
      AR: "Arkansas",
      CA: "California",
      CO: "Colorado",
      CT: "Connecticut",
      DE: "Delaware",
      FL: "Florida",
      GA: "Georgia",
      HI: "Hawaii",
      ID: "Idaho",
      IL: "Illinois",
      IN: "Indiana",
      IA: "Iowa",
      KS: "Kansas",
      KY: "Kentucky",
      LA: "Louisiana",
      ME: "Maine",
      MD: "Maryland",
      MA: "Massachusetts",
      MI: "Michigan",
      MN: "Minnesota",
      MS: "Mississippi",
      MO: "Missouri",
      MT: "Montana",
      NE: "Nebraska",
      NV: "Nevada",
      NH: "New Hampshire",
      NJ: "New Jersey",
      NM: "New Mexico",
      NY: "New York",
      NC: "North Carolina",
      ND: "North Dakota",
      OH: "Ohio",
      OK: "Oklahoma",
      OR: "Oregon",
      PA: "Pennsylvania",
      RI: "Rhode Island",
      SC: "South Carolina",
      SD: "South Dakota",
      TN: "Tennessee",
      TX: "Texas",
      UT: "Utah",
      VT: "Vermont",
      VA: "Virginia",
      WA: "Washington",
      WI: "Wisconsin",
      WV: "West Virginia",
      WY: "Wyoming",
      DC: "District of Columbia",
    };
    return stateMap[abbr as StateAbbreviation] || "";
  };

  useEffect(() => {
    const fetchStateData = async () => {
      try {
        let url = "/api/state/all";
        const params = new URLSearchParams();

        if (name) params.append("name", name);
        if (sex) params.append("sex", sex);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch state data");
        }
        const data = await response.json();

        interface StateDataItem {
          state: string;
          amount: number;
        }

        // const maxAmount = Math.max(
        //   ...data.map((item: StateDataItem) => item.amount),
        // ); // sum of state with the highest qualifying citizens

        let maxAmount = data.reduce(
          (sum: number, item: StateDataItem) => sum + item.amount,
          0,
        ); // sum of all citizens counted
        interface ProcessedStateData {
          state: string;
          value: number;
        }

        const processedData = data.reduce(
          (acc: ProcessedStateData[], item: StateDataItem) => {
            const stateAbbr = item.state;
            const stateName = getStateNameFromAbbreviation(stateAbbr);
            const percentage = (item.amount / maxAmount) * 100;

            const existing = acc.find(
              (s: ProcessedStateData) => s.state === stateName,
            );
            if (existing) {
              existing.value += percentage;
            } else {
              acc.push({ state: stateName, value: percentage });
            }

            return acc;
          },
          [] as ProcessedStateData[],
        );

        setStateData(processedData);
      } catch (error) {
        console.error("Error fetching state data:", error);
        setStateData([]);
      }
    };

    fetchStateData();
  }, [name, sex]);

  console.log(stateData);

  useEffect(() => {
    const numericHeight = getNumericDimension(height, 610);
    const numericWidth = getNumericDimension(width, 975);
    const createMap = async () => {
      interface UsAtlasData {
        objects: {
          states: Topology;
        };
      }

      const us = await d3.json<UsAtlasData>(
        "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json",
      );

      if (!us || !svgRef.current) return;

      d3.select(svgRef.current).selectAll("*").remove();

      const color = d3.scaleQuantize<string>().domain([0, 100]);
      color.range([
        "#4a6b85",
        "#3d7bb0",
        "#2b8fd6",
        "#1ca3f2",
        "#0db7ff",
        "#0aa2e6",
        "#088bcc",
        "#0673b3",
        "#045c99",
        "#034580",
        "#023a6e",
        "#012f5c",
        "#01244a",
        "#001938",
        "#001026",
      ]);
      // color.range(["#56ebd3", "#33837f", "#85c2d4", "#155392", "#0494fb"]);

      const scaleFactor = numericHeight / 610;
      const scaledWidth = numericWidth || 975 * scaleFactor;

      const projection = d3
        .geoAlbersUsa()
        .scale(1300 * scaleFactor)
        .translate([scaledWidth / 2, numericHeight / 2]);

      const path = d3.geoPath().projection(projection);
      const states = topojson.feature(
        us as unknown as Topology,
        us.objects.states as unknown as GeometryCollection,
      ) as FeatureCollection;
      const stateIdMap = new Map();

      states.features.forEach((feature: GeoJSON.Feature) => {
        const stateName = feature.properties?.name;
        stateIdMap.set(stateName, feature.id);
      });

      const valueMap = new Map();
      stateData.forEach((d) => {
        const stateId = stateIdMap.get(d.state);
        if (stateId) valueMap.set(stateId, d.value);
      });

      const statemesh = topojson.mesh(
        us as unknown as Topology,
        us.objects.states as unknown as GeometryCollection,
        (a, b) => a !== b,
      );

      const svg = d3
        .select(svgRef.current)
        .attr("viewBox", [0, 0, scaledWidth, numericHeight])
        .attr("style", "width: 100%; height: 100%;");

      svg
        .append("g")
        .selectAll("path")
        .data(states.features)
        .join("path")
        .attr("fill", (d) => {
          const value = valueMap.get(d.id);

          if (theme === "dark") {
            return value ? color(value) : "#333";
          } else if (theme === "light") {
            return value ? color(value) : "#ccc";
          } else {
            return value ? color(value) : "#ccc";
          }
        })
        .attr("d", path)
        .append("title")
        .text((d) => {
          const value = valueMap.get(d.id);
          return `${d.properties?.name || "Unknown"}\n${
            value ? value.toFixed(1) : 1
          }%`;
        });

      svg
        .append("g")
        .attr("transform", "translate(610,20)")
        .call((g) => {
          const legendWidth = 260;
          const legendHeight = 10;
          const legendMargin = { top: 0, right: 10, bottom: 20, left: 10 };

          const legendScale = d3
            .scaleLinear()
            .domain(color.domain())
            .range([0, legendWidth]);

          const legendAxis = d3
            .axisBottom(legendScale)
            .ticks(5)
            .tickSize(-legendHeight);

          g.append("g")
            .attr(
              "transform",
              `translate(${legendMargin.left},${legendMargin.top})`,
            )
            .selectAll("rect")
            .data(
              color.range().map((d, i) => ({
                offset: i / (color.range().length - 1),
                color: d,
              })),
            )
            .join("rect")
            .attr("x", (d) => legendScale(color.invertExtent(d.color)[0]))
            .attr("y", 0)
            .attr("width", (d, i, nodes) => {
              const next =
                i < nodes.length - 1
                  ? color.invertExtent(color.range()[i + 1])[0]
                  : color.domain()[1];
              return (
                legendScale(next) - legendScale(color.invertExtent(d.color)[0])
              );
            })
            .attr("height", legendHeight)
            .attr("fill", (d) => d.color);

          g.append("g")
            .attr(
              "transform",
              `translate(${legendMargin.left},${legendHeight})`,
            )
            .call(legendAxis)
            .call((g) => g.select(".domain").remove())
            .call((g) => g.selectAll(".tick line").attr("stroke", "#ccc"));
        });
      svg
        .append("path")
        .datum(statemesh)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);
    };

    createMap();

    const currentRef = svgRef.current;

    return () => {
      if (currentRef) {
        d3.select(currentRef).selectAll("*").remove();
      }
    };
  }, [height, width, stateData]);

  const svgStyle = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return <svg ref={svgRef} style={svgStyle} data-name={name} />;
}
