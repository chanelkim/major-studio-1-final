// Use statemapData
// if (window.statemapData !== undefined) {
//   console.log("statemapData is available");
// }
console.log("Using statemapData in otherScript:", window.statemapData);

// ********************************************************
// references:
// Zoom to bounding box, D3 Gallery Observable; source: https://observablehq.com/@d3/zoom-to-bounding-box
// Scale and center map; source: https://stackoverflow.com/questions/42430361/scaling-d3-v4-map-to-fit-svg-or-at-all
// Advanced Mapmaking: Using d3, d3-scale and d3-zoom With Changing Data to Create Sophisticated Maps; source: https://soshace.com/advanced-mapmaking-using-d3-d3-scale-and-d3-zoom-with-changing-data-to-create-sophisticated-maps/
// ********************************************************

// --------------------------------------------------------
// VARIABLES
// --------------------------------------------------------
// let usdata = d3.json("data/us.json");
// let statecount = d3.json("data/stateCount.json");
// console.log(usdata);
// console.log(statecount);
const mapWidth = 975;
const mapHeight = 610;
let max;
let min;

const geoObjectNone = {
  state: [
    "Alaska",
    "Arkansas",
    "Hawaii",
    "Idaho",
    "Indiana",
    "Mississippi",
    "Montana",
    "Nebraska",
    "Nevada",
    "North Carolina",
    "North Dakota",
    "Oklahoma",
    "Oregon",
    "South Dakota",
    "West Virginia",
    "Wyoming",
  ],
};

// Draw the map
function drawMap(us, statecount) {
  const land = topojson.feature(us, us.objects.states);
  // console.log("Topojson US:", land);

  // Merge the US state data and the state count data
  const mergedFeatures = _.map(land.features, (feature) => {
    const stateName = feature.properties.name;
    const matchingState = _.find(statecount, { geostate: stateName });
    // If matching state is found, merge the properties; otherwise, keep the original properties
    const mergedProperties = matchingState
      ? { ...feature.properties, ...matchingState }
      : feature.properties;
    return { ...feature, properties: mergedProperties };
  });
  const mergedGeoJSON = {
    type: "FeatureCollection",
    features: mergedFeatures,
  };
  console.log("Merged US:", mergedGeoJSON);
  merged = mergedGeoJSON;

  const interiors = topojson.mesh(us, us.objects.states, (a, b) => a !== b);

  const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

  const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([min, max]);

  svg = d3
    .select(".statemap-container")
    .append("svg")
    .attr("viewBox", "0 0 " + mapWidth + " " + mapHeight)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .on("click", reset);

  const path = d3.geoPath().projection(scale(0.8, mapWidth, mapHeight));

  const g = svg.append("g"); // group together with "g"

  const states = g
    .append("g")
    .attr("fill", "#444")
    .attr("cursor", "pointer")
    .selectAll("path")
    .data(merged.features)
    .join("path")
    .on("click", clicked)
    .attr("d", path)
    .attr("class", "state");

  states.append("title").text((d) => d.properties.name);

  // interior state lines
  g.append("path")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-linejoin", "round")
    .attr("d", path(interiors));

  svg.call(zoom);

  //   //   --------------------------------------------------------
  //   // TOOL TIP
  //   // --------------------------------------------------------
  //   const tooltip = d3
  //     .select("#chart-2")
  //     .append("div")
  //     .attr("class", "tooltip")
  //     .style("opacity", 0);
  //   states
  //     .on("mouseover", function (event, d) {
  //       // Show the tooltip on mouseover for depths other than 0

  //       tooltip.transition().duration(200).style("opacity", 0.9);

  //       // Customize the tooltip content based on depth
  //       let tooltipContent = "";
  //       if (d.depth === 1) {
  //         tooltipContent = `
  //           ${d.data.children[0].georegion || "Unknown region"} (${
  //           d.data.children[0].geostate || "Unknown state"
  //         })
  //           <h3>${d.data.name || "Unknown contributor"}</h3>
  //           <h2><strong>${
  //             d.data.count
  //           }</strong><span class="h4"> contributions</span></h2>`;
  //       } else if (d.depth === 2) {
  //         tooltipContent = `
  //           ${d.data.geostate || "Unknown state"}
  //           <h3>${d.parent.data.name}</h3>
  //           <h2><strong>${d.data.name}</strong></h2>`;
  //       } else {
  //         tooltipContent = `
  //           <h3>${d.parent.data.name}</h3>`;
  //       }
  //       // CSS style (.treemap-container .tooltip)
  //       tooltip.html(tooltipContent);
  //     })
  //     .on("mouseout", function () {
  //       // Hide the tooltip on mouseout
  //       tooltip.transition().duration(500).style("opacity", 0);
  //     });

  // --------------------------------------------------------
  // FUNCTIONS
  // --------------------------------------------------------

  // Scale and center map
  function scale(scaleFactor, mapWidth, mapHeight) {
    return d3.geoTransform({
      point: function (x, y) {
        this.stream.point(
          (x - mapWidth / 2) * scaleFactor + mapWidth / 2,
          (y - mapHeight / 2) * scaleFactor + mapHeight / 2
        );
      },
    });
  }

  function reset() {
    states.transition().style("fill", null);
    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity,
        d3.zoomTransform(svg.node()).invert([mapWidth / 2, mapHeight / 2])
      );
  }

  function clicked(event, d) {
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    event.stopPropagation();
    states.transition().style("fill", null);

    // Check the current zoom level
    const currentTransform = d3.zoomTransform(svg.node());
    const isZoomedIn = currentTransform.k !== 1;

    // Toggle between zooming in and zooming out
    if (isZoomedIn) {
      // Zoom out using the reset function
      reset();
    } else {
      // Zoom in
      d3.select(this).transition().style("fill", "#64281E"); // color of state when clicked (brown)
      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(mapWidth / 2, mapHeight / 2)
            .scale(
              Math.min(
                8,
                0.5 / Math.max((x1 - x0) / mapWidth, (y1 - y0) / mapHeight)
              )
            )
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
          d3.pointer(event, svg.node())
        );
    }
  }

  function zoomed(event) {
    const { transform } = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }

  return svg.node();
}

// --------------------------------------------------------
// ASYNC LOAD DATA + DRAW MAP
// --------------------------------------------------------
async function loadData() {
  const us = await d3.json("data/us.json");
  const statecount = await d3.json("data/stateCount.json");
  const stateindex = await d3.json("data/IoAD_merged_geo_data.json");

  console.log("US geography data:", us);
  console.log("State count data:", statecount);
  drawMap(us, statecount, stateindex);
}

loadData();
// drawMap(usdata, statecountdata);
