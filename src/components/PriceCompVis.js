import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import AuMap from "../data/AuMap";
import testlocs from '../data/test_locs.json';

/*
Proposed data format:
{
    "vic":{
        "prices":{
            "item1":1.21
            ...
        },
        "active":true, // hoveres
        "location": [12,56] // coords for svg
    }
}

zoom refers to if zoom extent is > 4
setActive - when location is hovered over this becomes active
*/

const PriceCompVis = ({ data, setActive, zoomed, setZoomed}) => {
  if (zoomed) {
    data = data["regions"]
  }
  else {
    data = data["states"]
  }
  // Element References
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const svgContainer = useRef(null); // The PARENT of the SVG 
  const heatMapScaleRef = useRef(null);
  const resetZoomRef = useRef(null);
  let textsize = 1;
  // Generic Selections

  

  const tooltip = d3.select(tooltipRef.current);
  const heatmapScale=  d3.select(heatMapScaleRef.current);

  const unitSize = zoomed? 0.5 : 1.2;

  const colourPalette = d3.interpolateHsl("green", "red")

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    let zoom = d3.zoom()
    .scaleExtent([0.9, 15])
    .translateExtent([[0, 0], [1000, 1000]])
    .on('zoom', handleZoom);
    function handleZoom(e) {
      if (e.transform.k > 4) setZoomed(true);
      else setZoomed(false);
        textsize = 1/e.transform.k
        svg.select(".zoom-box").attr('transform', e.transform);
    }
    svg.call(zoom);
    svg.select(".prompt-message").raise()
  }, [])

  useEffect(() => { 
    const svg = d3.select(svgRef.current);
    const mapGroup = svg.select(".zoom-box")
      if (!zoomed) {
        mapGroup.selectAll(".map-marker").remove();
        mapGroup.selectAll(".map-state")
          .on("click", function(e, d) {
              // BUG: some 'pan' events block this click event
              const element = d3.select(this);
              setActive("left", element.attr("id").split("-")[1]);
            })
            .on("contextmenu", function(e, d) {
              const element = d3.select(this);
              e.preventDefault();
              setActive("right", element.attr("id").split("-")[1]);
            });
      }
      else { // zoomed in
          const locnames = Object.keys(data);
    
          locnames.forEach(locname => {
              const loc = data[locname]
              mapGroup.append("circle").attr("id", "map-"+locname)
                .attr("class", "map-marker")
                .attr("fill", "limegreen")
                .attr("cx", loc.location?  loc.location[0] : 10)
                .attr("cy", loc.location?  loc.location[1] : 10)
                .attr("r", 2)
                //.attr("pointer-events", "none")
                .attr("cursor", "pointer")
                .on("mouseenter", function(d) {
                  const element = d3.select(this);
                  element.raise();
                  mapGroup.select(`text[id='price-${locname}']`)
                    .attr("visibility", "visible")
                  // element.style("fill", "green")
                  // setActive(element.attr("id").split("-")[1])
                })
                .on("mouseleave", function(d) {
                  const element = d3.select(this);
                  element.raise();
                  d3.select(`text[id='price-${locname}']`)
                    .attr("visibility", "hidden")
                  // element.style("fill", "green")
                  // setActive(element.attr("id").split("-")[1])
                })
                .on("click", function(d) {
                  const element = d3.select(this);
                  const bbox = element.node().getBBox();
                  setActive("left", element.attr("id").split("-")[1])
                })
                .on("contextmenu", function(e, d) {
                  const element = d3.select(this);
                  e.preventDefault();
                  setActive("right", element.attr("id").split("-")[1])
                })
              // Colour states differently
              d3.selectAll(".map-state").transition(1000).attr("fill", "#FFFDD0")
          })
        }
        
    }, [setActive, zoomed]); // on click needs to be updated everytime this function changes
  

  useEffect(() => { // if data changes
    // D3 Code
    const svg = d3.select(svgRef.current);
    const mapGroup = svg.select(".zoom-box")
    const promptMessage = svg.select(".prompt-message")
    const locs = Object.keys(data);

    const prices = mapGroup.selectAll(".map-price");
    prices.remove();

    const totalPrices = locs.filter(s => data[s].isLegit)
        .map(s => data[s].totalPrice);
    
    const priceExtent = d3.extent(totalPrices)
    const priceScale = d3.scaleLinear()
        .domain(priceExtent)
        .range([0,1])
    
    if (data[locs[0]].items.length == 0) {
        heatmapScale.style("display", "none")
        promptMessage.attr("visibility", "visible").raise()
    }
    else {
        heatmapScale.select("#heatmap-max").text(priceExtent[0]? "$"+priceExtent[0].toFixed(2) : "n/a")
        heatmapScale.select("#heatmap-min").text(priceExtent[0]? "$"+priceExtent[1].toFixed(2) : "n/a")
        heatmapScale.style("display", "block")
        promptMessage.attr("visibility", "hidden").raise()
    }
    locs.forEach(locname => {
        const shape = d3.select(`[id='map-${locname}']`)
        const loc = data[locname]

        if (loc.isLegit && loc.items.length > 0) {
          shape.attr("fill", colourPalette(priceScale(loc.totalPrice)));
        }
        else {
          shape.attr("fill", "grey"); // invalid
        }

        const text = mapGroup.append("text").attr("id", "price-"+locname)
                .attr("class", "map-price")
                .attr("font-size", unitSize+"em")
                .attr("fill", "white")
                .attr("x", loc.location?  loc.location[0] : 10)
                .attr("y", loc.location?  loc.location[1]-10 : 10)
                .attr("text-anchor", "middle")
                .attr("pointer-events", "none")
        
        
        
        // text = mapGroup.select("#price-"+loc)
        const items = loc["items"]
        const totalPrice = loc["totalPrice"]
        const isLegit = loc["isLegit"]
        // Handling nulls? if all items are not on the list, grey it out? 
        text.text(locname+": "+(totalPrice.toFixed(2) > 0 ? 
                    "$"+totalPrice.toFixed(2) + (isLegit? "" : "*") : // mark items with null with *
                    items.length == 0 ? "" : "n/a"
        ))
            .attr("visibility", zoomed? "hidden" : "visible")
            .raise()
    })
  }, [data]); // redraw chart if data changes

  return (
    <div ref={svgContainer} className="pc-vis-container" style={{height:"95%", position:"relative"}}>
      <div ref={tooltipRef} className="lc-tooltip" style={{position:"absolute", display:"none", pointerEvents:"none"}}>
        <div className="date"></div>
        <div className="data"></div>
      </div>
      <div ref={heatMapScaleRef} className="heatmap-scale" style={{display:"none"}}>
        <div className="heatmap-label" id="heatmap-min"></div>
        <div className="heatmap-label" id="heatmap-max"></div>
      </div>
      <div ref={resetZoomRef} className="reset-zoom" style={{display:"none"}}>
        <svg height="24" id="icon" viewBox="0 0 32 32" width="24" xmlns="http://www.w3.org/2000/svg">
            <path fill="white" d="M22.4478,21A10.855,10.855,0,0,0,25,14,10.99,10.99,0,0,0,6,6.4658V2H4v8h8V8H7.332a8.9768,8.9768,0,1,1-2.1,8H3.1912A11.0118,11.0118,0,0,0,14,25a10.855,10.855,0,0,0,7-2.5522L28.5859,30,30,28.5859Z"/>
        </svg>
      </div>
      <AuMap ref={svgRef}></AuMap>
    </div>
  );
};

export default PriceCompVis;