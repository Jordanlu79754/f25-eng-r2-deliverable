/* eslint-disable */
"use client";
import { useRef, useEffect, useState  } from "react";
import { select } from "d3-selection";
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis"; // D3 is a JavaScript library for data visualization: https://d3js.org/
import { csv } from "d3-fetch";

// Example data: Only the first three rows are provided as an example
// Add more animals or change up the style as you desire

// Interface
interface AnimalDatum  {
  name: string;
  speed: number;
  diet: "carnivore" | "herbivore" | "omnivore";
}

export default function AnimalSpeedGraph() {
  // useRef creates a reference to the div where D3 will draw the chart.
  // https://react.dev/reference/react/useRef
  const graphRef = useRef<HTMLDivElement>(null);

  const [animalData, setAnimalData] = useState<AnimalDatum[]>([]);

  // Load CSV data
  useEffect(() => {
    (async () => {
    try {
      const VALID_DIETS = new Set<AnimalDatum["diet"]>(["carnivore", "herbivore", "omnivore"]);

      const rows = await csv("/sample_animals.csv", (d) => {
        const name = (d["name"] ?? "").toString().trim();
        const dietRaw = (d["diet"] ?? "").toString().trim().toLowerCase();
        const speed = Number(d["speed"]);

        if (!name) return null;
        if (!Number.isFinite(speed)) return null;
        if (!VALID_DIETS.has(dietRaw as AnimalDatum["diet"])) return null;

        return {
          name,
          diet: dietRaw as AnimalDatum["diet"],
          speed,
        };
      });

      const cleaned = rows.filter((r): r is AnimalDatum => r !== null);

      cleaned.sort((a, b) => b.speed - a.speed);

      // sort + take top N
      const N = 15;
      setAnimalData(cleaned.slice(0, N));

    } catch (err) {
      console.error("Failed to load /sample_animals.csv", err);
    }
  })();
  }, []);

  useEffect(() => {
    // Clear any previous SVG to avoid duplicates when React hot-reloads
    if (graphRef.current) {
      graphRef.current.innerHTML = "";
    }

    if (animalData.length === 0) return;

    // Set up chart dimensions and margins
    const containerWidth = graphRef.current?.clientWidth ?? 800;
    const containerHeight = graphRef.current?.clientHeight ?? 500;

    // Set up chart dimensions and margins
    const width = Math.max(containerWidth, 600); // Minimum width of 600px
    const height = Math.max(containerHeight, 400); // Minimum height of 400px
    const margin = { top: 70, right: 60, bottom: 80, left: 100 };

    // Create the SVG element where D3 will draw the chart
    // https://github.com/d3/d3-selection
    const svg  = select(graphRef.current!)
      .append<SVGSVGElement>("svg")
      .attr("width", width)
      .attr("height", height)
      .classed("animal-speed-chart", true);

    // HINT: Look up the documentation at these links
    // https://github.com/d3/d3-scale#band-scales
    // https://github.com/d3/d3-scale#linear-scales
    // https://github.com/d3/d3-scale#ordinal-scales
    // https://github.com/d3/d3-axis
    // Build scales
    const x = scaleBand()
      .domain(animalData.map((d) => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.15);

    const yMax = max(animalData, (d) => d.speed) ?? 0;

    const y = scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Color scale for diet types
    const color = scaleOrdinal<AnimalDatum["diet"], string>()
      .domain(["carnivore", "herbivore", "omnivore"])
      .range(["#ef4444", "#22c55e", "#3b82f6"]);

    // Bars
    svg
      .append("g")
      .selectAll("rect")
      .data(animalData)
      .join("rect")
      .attr("x", (d) => x(d.name)!)
      .attr("y", (d) => y(d.speed))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.speed))
      .attr("fill", (d) => color(d.diet));

      svg
      .append("g")
      .selectAll("rect")
      .data(animalData)
      .join("rect")
      .attr("x", (d) => x(d.name)!)
      .attr("y", (d) => y(d.speed))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.speed))
      .attr("fill", (d) => color(d.diet));

    // Axis labels
    svg
      .append("text")
      .attr("x", (margin.left + width - margin.right) / 2)
      .attr("y", height - 20)
      .style("text-anchor", "middle")
      .text("Animal");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + (height - margin.bottom)) / 2)
      .attr("y", 20)
      .style("text-anchor", "middle")
      .text("Speed (km/h)");

    // Y-axis (speed)
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(8));

    // X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x));

    // Legend of the graph
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - margin.right - 140},${margin.top})`);

    const legendItems: AnimalDatum["diet"][] = ["carnivore", "herbivore", "omnivore"];

    legendItems.forEach((diet, i) => {
      const row = legend.append("g").attr("transform", `translate(0, ${i * 18})`);

      row
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(diet));

      row
        .append("text")
        .attr("x", 18)
        .attr("y", 10)
        .text(diet.charAt(0).toUpperCase() + diet.slice(1));
    });

  }, [animalData]);

  // Return the graph
  return (<div ref={graphRef} className="h-[500px] w-full" />);
}
