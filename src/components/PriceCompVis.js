import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import AuMap from "../data/AuMap";

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
const ZOOM_THRESHOLD = 1.15; // limit to change from state view to region view

const PriceCompVis = ({ data, setActive, zoomed, setZoomed}) => {
  let locdata, zoomedIn = zoomed[0].k >= ZOOM_THRESHOLD;
  if (zoomedIn) {
    locdata = data["regions"]
  }
  else {
    locdata = data["states"]
  }
  // Element References
  const svgRef = useRef(null);
  const svgContainer = useRef(null); // The PARENT of the SVG 
  const heatMapScaleRef = useRef(null);
  const resetZoomRef = useRef(null);
  let unitsize = 2/(zoomed[0].k)*3;
  // Generic Selections
  const heatmapScale=  d3.select(heatMapScaleRef.current);

  const colourPalette = d3.interpolateHsl("green", "red")

  function handleZoom(e) {
    // save previous value
    d3.select(".zoom-box").attr('transform', e.transform)
    setZoomed([e.transform, zoomed[0]]);
  }

  useEffect(() => {
    const mapGroup = d3.select(".zoom-box")
    Object.keys(data["regions"]).forEach(locname => {
      const loc = data["regions"][locname]
        mapGroup
          .append("circle").attr("id", "map-"+locname)
          .attr("class", "map-marker")
          .attr("cx", loc.location[0])
          .attr("cy", loc.location[1])
          .attr("r", unitsize)
          .attr("cursor", "pointer")
    }
    )
  }, [])

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    let zoom = d3.zoom()
      .scaleExtent([0.9, 30])
      .translateExtent([[0, 0], [1000, 1000]])
      .on('zoom', handleZoom);
    svg.call(zoom);
    svg.select(".prompt-message").raise()
    const mapGroup = svg.select(".zoom-box");
    if (zoomed[0].k <= ZOOM_THRESHOLD && zoomed[1].k > ZOOM_THRESHOLD) { // zoomed out
      mapGroup.selectAll(".map-marker").attr("visibility", "hidden");
    }
    else if (zoomed[0].k >= ZOOM_THRESHOLD && zoomed[1].k < ZOOM_THRESHOLD) { // zoomed in
      mapGroup.selectAll(".map-marker").attr("visibility", "visible");
      d3.selectAll(".map-state").transition(1000)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 0.1)
    }
    
    mapGroup.selectAll(".map-marker").attr("r", unitsize);
  }, [zoomed])

  
  useEffect(() => { 
    const svg = d3.select(svgRef.current);
    
    svg.selectAll(".map-state")
      .on("click", function(e, d) {
          // BUG: some 'pan' events block this click event
          const element = d3.select(this);
          flashColour("left");
          setActive("left", element.attr("id").split("-")[1]);
        })
        .on("contextmenu", function(e, d) {
          const element = d3.select(this);
          e.preventDefault();
          flashColour("right");
          setActive("right", element.attr("id").split("-")[1]);
        });
      
    svg.selectAll(".map-marker")
      .on("mouseenter", function(d) {
        const element = d3.select(this);
        const locname = element.attr("id").split("-")[1]
        element.raise();
        d3.select(`text[id='price-${locname}']`)
          .attr("visibility", "visible")
      })
      .on("mouseleave", function(d) {
        const element = d3.select(this);
        const locname = element.attr("id").split("-")[1]
        element.raise();
        d3.select(`text[id='price-${locname}']`)
          .attr("visibility", "hidden")
      })
      .on("click", function(d) {
        const element = d3.select(this);
        flashColour("left");
        setActive("left", element.attr("id").split("-")[1])
      })
      .on("contextmenu", function(e, d) {
        const element = d3.select(this);
        flashColour("right");
        e.preventDefault();
        setActive("right", element.attr("id").split("-")[1])
      })
    }, [setActive]); // on click needs to be updated everytime this function changes
  

  useEffect(() => { // if data changes
    // D3 Code
    const svg = d3.select(svgRef.current);
    const mapGroup = svg.select(".zoom-box")
    const promptMessage = svg.select(".prompt-message")
    const locs = Object.keys(locdata);

    const prices = mapGroup.selectAll(".map-price");
    prices.remove();

    const totalPrices = locs.filter(s => locdata[s].isLegit)
        .map(s => locdata[s].totalPrice);
    
    const priceExtent = d3.extent(totalPrices)
    const priceScale = d3.scaleLinear()
        .domain(priceExtent)
        .range([0,1])
    
    if (locdata[locs[0]].items.length === 0) {
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
        const loc = locdata[locname]
        if (loc.isLegit && loc.items.length > 0) {
          shape.attr("fill", colourPalette(priceScale(loc.totalPrice)));
        }
        else {
          
          shape.attr("fill", "grey"); // invalid
        }
        const text = mapGroup.append("text").attr("id", "price-"+locname)
          .attr("class", "map-price")
          .attr("font-size", (zoomed[0].k > ZOOM_THRESHOLD ? (unitsize/2).toFixed(2) : 1.5) +"em")
          .attr("fill", "black")
          .attr("x", loc.location[0])
          .attr("y", loc.location[1]-unitsize*3)
          .attr("text-anchor", "middle")
          .attr("pointer-events", "none")
        
        const items = loc["items"]
        const totalPrice = loc["totalPrice"]
        const isLegit = loc["isLegit"]
        // Handling nulls? if all items are not on the list, grey it out? 
        text.text((totalPrice.toFixed(2) > 0 ? 
                    locname+": "+"$"+totalPrice.toFixed(2) + (isLegit? "" : "*") : // mark items with null with *
                    items.length === 0 ? "" : locname+": n/a"
        ))
            .attr("visibility", zoomedIn? "hidden" : "visible")
            .raise()
    })
  }, [locdata, zoomedIn]); // redraw chart if data changes

  return (
    <div ref={svgContainer} className="pc-vis-container" style={{height:"95%", position:"relative"}}>
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

const flashColour= (column) => {
  const locationLabel = d3.select(`#${column}LocHeader`)
  locationLabel.classed("colour-flash", false)
  setTimeout(() => locationLabel.classed("colour-flash", true), 1);
}

export default PriceCompVis;