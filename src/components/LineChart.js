import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";


const LineChart = ({ data, cities }) => {

  // Element References
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const svgContainer = useRef(null); // The PARENT of the SVG 

  // State to track width and height of SVG Container
  const [dimensions, setDimensions] = useState({ });

  const cityNames = cities.filter(c => c.active).map(c => c.name);

  // Generic Selections
  const svg = d3.select(svgRef.current);
  const tooltip = d3.select(tooltipRef.current);

  // Accessors
  const getYScale = () => d3.scaleLinear()
    .domain([0, d3.max(cityNames.map(c => d3.max(data[c])))*1.2])
    .range([dimensions.containerHeight, 0]);

  const getXScale = () => d3.scaleTime()
    .domain(d3.extent(data.x))
    .range([0, dimensions.containerWidth]);

  // This function calculates width and height of the container
  const getSvgContainerSize = () => {
    d3.select(svgRef.current)
      .attr("width", 0)
      .attr("height", 0);
    const newWidth = svgContainer.current.clientWidth;
    const newHeight = svgContainer.current.clientHeight;
    const margin = 60;

    setDimensions({width: newWidth, 
      height: newHeight, 
      margins: margin,
      containerWidth: newWidth - 2*margin,
      containerHeight: newHeight - 2*margin});
  };

  useEffect(() => { // Runs on intial render
    getSvgContainerSize();
    // listen for resize changes, and detect dimensions again when they change
    window.addEventListener("resize", getSvgContainerSize);

    // cleanup event listener
    return () => window.removeEventListener("resize", getSvgContainerSize);
  }, []);

  useEffect(() => { // Runs when the window is resized
    // D3 Code
    svg
      .classed("line-chart-svg", true)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    // clear all previous content on refresh
    const everything = svg.selectAll("*");
    everything.remove();

    // Append container and tooltip line
    const container = svg
      .append("g")
      .classed("container", true)
      .attr("transform", `translate(${dimensions.margins}, ${dimensions.margins})`);

    const tooltipLine = container
      .append("line")
      .classed("tool-tip-line", true)
      .attr("y1", 0)
      .attr("y2", dimensions.containerHeight)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .style("opacity", 0)
      .style("pointer-events", "none");

    // Scales
    const yScale = getYScale(), xScale = getXScale();

    // Draw lines on chart
    cities.forEach((c, _) => drawLine(container, data, c, xScale, yScale))
    
    drawAxis(xScale, yScale, container, data.inflation, dimensions);
    
    // Create tooltip tracker
    container
      .append("rect")
      .classed("mouse-tracker", true)
      .attr("width", dimensions.containerWidth)
      .attr("height", dimensions.containerHeight)
      .style("opacity", 0)
      .on("touchmouse mousemove", tooltipMouseTrack(xScale, tooltip, tooltipLine, dimensions, data, cityNames))
      .on("mouseleave", function () {
        tooltipLine.style("opacity", 0);
        tooltip.style("display", "none");
      });

  }, [dimensions]); // redraw chart if data or dimensions change

  useEffect(() => { // if data changes
    // D3 Code
    const container = svg.select(".container");

    // Scales
    const yScale = getYScale(), xScale = getXScale();

    // Draw / Transition Lines
    cities.forEach((c, _) => drawLine(container, data, c, xScale, yScale))

    // Axis
    drawAxis(xScale, yScale, container, data.inflation, dimensions);
    
    const tooltipLine = container.select('.tool-tip-line')

    container
      .select(".mouse-tracker")
      .style("opacity", 0)
      .on("touchmouse mousemove", tooltipMouseTrack(xScale, tooltip, tooltipLine, dimensions, data, cityNames));  

  }, [data]); // redraw chart if data or dimensions change

  return (
    <div ref={svgContainer} className="line-chart" style={{height:"95%", position:"relative"}}>
      <div ref={tooltipRef} className="lc-tooltip" style={{position:"absolute", display:"none", pointerEvents:"none"}}>
        <div className="date"></div>
        <div className="data"></div>
      </div>
      <svg ref={svgRef} style={{zIndex:-1, display: "block"}}/>
    </div>
  );
};

export default LineChart;


// Helper Functions
const drawLine = (container, data, c, xScale, yScale) => {
    // Line Generator
    const lineGenerator = d3.line()
      .x((_, i) => xScale(data.x[i]))
      .y((_, i) => yScale(data[c.name][i]))
      .defined((_, i) => (data[c.name][i] !== null));

    // Select Line
    const line = container.select(`#${c.name}`);
    
    if (c.active) {
      // Draw new path
      if (line.empty()) container
        .append("path")
        .datum(data.x)
        .attr("id", c.name)
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", c.colour)
        .attr("stroke-width", 2);
      
      // Transition existing path
      else line.datum(data.x)
        .transition()
        .duration(500)
        .attr("d", lineGenerator);
    }
    else {
      // Remove path if city is unchecked
      line.remove();
    }
  }

const drawAxis = (xScale, yScale, container, inflation, {containerHeight, containerWidth, margins}) => {
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => `\$${d}`);
  const xAxis = d3.axisBottom(xScale);
  let yGroup = d3.select('.yAxis');
  let xGroup = d3.select('.xAxis');

  if(yGroup.empty()){ // draw if axis does not exist
    yGroup = container
      .append("g")
      .classed("yAxis", true)
      .call(yAxis);
    
    yGroup.append("text")
      .attr("class", "ylabel")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", "1.4em")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "hanging")
      .attr("fill", "currentColor")
      .attr("transform", `translate(${-(margins)+5}, ${containerHeight/2}) rotate(-90)`)
      .text(inflation? "2023 Price (ajusted with inflation)" : "Price")

    xGroup = container
      .append("g")
      .classed("xAxis", true)
      .style("transform", `translateY(${containerHeight}px)`)
      .call(xAxis);
    
    xGroup.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", "1.4em")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "bottom")
      .attr("fill", "currentColor")
      .attr("transform", `translate(${containerWidth/2}, ${margins-25})`)
      .text("Year")
  }
  else { // transition if axis does exist
    yGroup.select(".ylabel")
      .text(inflation? "2023 Price (ajusted with inflation)" : "Price")
    
    yGroup.transition(500).call(yAxis);
    xGroup.transition(500).call(xAxis);
  }
}

const tooltipMouseTrack = (xScale, tooltip, tooltipLine, 
  dimensions, data, cityNames) => (event) => {
    const mousePos = d3.pointer(event, this);

        // x coordinate stored in mousePos index 0
        const date = xScale.invert(mousePos[0]);

        // Custom Bisector - left, center, right
        const dateBisector = d3.bisector(d=>d).center;

        const bisectionIndex = dateBisector(data.x, date);
        // math.max prevents negative index reference error
        const hoveredIndex = Math.max(0, bisectionIndex);

        // Update Image
        tooltipLine
          .style("opacity", 1)
          .attr("x1", xScale(data.x[hoveredIndex]))
          .attr("x2", xScale(data.x[hoveredIndex]))
          .raise();

        const ypos = mousePos[1] > dimensions.height/2 ?
          mousePos[1] - 150 :
          mousePos[1] + 150;

        tooltip
          .style("display", "block")
          .style("top", `${ypos}px`)
          .style("left", `${xScale(data.x[hoveredIndex])}px`);
        
        tooltip.select(".data")
          .html(`${cityNames.map(
            c => c+ ": $" + (data[c][hoveredIndex] ? data[c][hoveredIndex].toFixed(2) : "-")
          ).join('<br />')}`);

        const dateFormatter = d3.timeFormat("%B %-d, %Y");

        tooltip.select(".date").text(`${dateFormatter(data.x[hoveredIndex])}`);
  }