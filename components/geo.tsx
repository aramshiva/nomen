// im sorry for anyone reading this code, i know its a mess.
// it was made with d3, ai, and a lot of luck
// i have no idea how it works, but it does
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

interface GeoProps {
  height?: number | "auto" | "100%";
  width?: number | "auto" | "100%";
  name?: string;
}

export default function Geo({ height = 610, width = 975, name }: GeoProps) {
  const svgRef = useRef(null);
  
  const getNumericDimension = (value: number | "auto" | "100%", defaultValue: number) => {
    if (typeof value === 'number') return value;
    return defaultValue;
  };

  useEffect(() => {
    const numericHeight = getNumericDimension(height, 610);
    const numericWidth = getNumericDimension(width, 975);
    
    const sampleData = [
      { state: "Alabama", value: 5.2 },
      { state: "Alaska", value: 7.1 },
      { state: "Arizona", value: 6.8 },
      { state: "Arkansas", value: 3.9 },
      { state: "California", value: 8.7 },
      { state: "Colorado", value: 4.5 },
      { state: "Connecticut", value: 5.4 },
      { state: "Delaware", value: 4.0 },
      { state: "Florida", value: 7.2 },
      { state: "Georgia", value: 6.1 },
      { state: "Hawaii", value: 2.8 },
      { state: "Idaho", value: 3.2 },
      { state: "Illinois", value: 6.5 },
      { state: "Indiana", value: 4.9 },
      { state: "Iowa", value: 3.5 },
      { state: "Kansas", value: 3.8 },
      { state: "Kentucky", value: 5.0 },
      { state: "Louisiana", value: 6.9 },
      { state: "Maine", value: 3.0 },
      { state: "Maryland", value: 5.6 },
      { state: "Massachusetts", value: 6.0 },
      { state: "Michigan", value: 5.8 },
      { state: "Minnesota", value: 3.7 },
      { state: "Mississippi", value: 7.0 },
      { state: "Missouri", value: 4.8 },
      { state: "Montana", value: 3.4 },
      { state: "Nebraska", value: 3.1 },
      { state: "Nevada", value: 8.5 },
      { state: "New Hampshire", value: 2.9 },
      { state: "New Jersey", value: 6.7 },
      { state: "New Mexico", value: 7.5 },
      { state: "New York", value: 7.8 },
      { state: "North Carolina", value: 5.7 },
      { state: "North Dakota", value: 2.5 },
      { state: "Ohio", value: 5.3 },
      { state: "Oklahoma", value: 4.6 },
      { state: "Oregon", value: 6.3 },
      { state: "Pennsylvania", value: 5.5 },
      { state: "Rhode Island", value: 6.2 },
      { state: "South Carolina", value: 5.9 },
      { state: "South Dakota", value: 2.7 },
      { state: "Tennessee", value: 4.7 },
      { state: "Texas", value: 7.6 },
      { state: "Utah", value: 3.3 },
      { state: "Vermont", value: 2.6 },
      { state: "Virginia", value: 4.3 },
      { state: "Washington", value: 6.4 },
      { state: "West Virginia", value: 5.1 },
      { state: "Wisconsin", value: 3.6 },
      { state: "Wyoming", value: 3.0 }
    ];

    const createMap = async () => {
      const us = await d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json');
      
      if (!us || !svgRef.current) return;

      d3.select(svgRef.current).selectAll("*").remove();

      const color = d3.scaleQuantize<string>()
        .domain([1, 10])
        .range(d3.schemeBlues[9]);
      
      const scaleFactor = numericHeight / 610;
      const scaledWidth = numericWidth || 975 * scaleFactor;
      
      const projection = d3.geoAlbersUsa()
        .scale(1300 * scaleFactor)
        .translate([scaledWidth / 2, numericHeight / 2]);
      
      const path = d3.geoPath().projection(projection);
      
      const states = topojson.feature(us, us.objects.states);
      const stateIdMap = new Map();
      
      states.features.forEach(feature => {
        const stateName = feature.properties.name;
        stateIdMap.set(stateName, feature.id);
      });
      
      const valueMap = new Map();
      sampleData.forEach(d => {
        const stateId = stateIdMap.get(d.state);
        if (stateId) valueMap.set(stateId, d.value);
      });
      
      const statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
      
      const svg = d3.select(svgRef.current)
        .attr("viewBox", [0, 0, scaledWidth, numericHeight])
        .attr("style", "width: 100%; height: 100%;");
      
      svg.append("g")
        .selectAll("path")
        .data(states.features)
        .join("path")
        .attr("fill", d => {
          const value = valueMap.get(d.id);
          return value ? color(value) : "#ccc";
        })
        .attr("d", path)
        .append("title")
        .text(d => {
          const value = valueMap.get(d.id);
          return `${d.properties.name}\n${value ? value.toFixed(1) : "No data"}%`;
        });
      
      svg.append("path")
        .datum(statemesh)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);
    };

    createMap();
    
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, [height, width]);

  const svgStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  return (
    <svg 
      ref={svgRef} 
      style={svgStyle}
      data-name={name}
    />
  );
}
