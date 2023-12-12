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
const mapWidth = 975;
const mapHeight = 610;

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

  const interiors = topojson.mesh(us, us.objects.states, (a, b) => a !== b);

  const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

  // Extract contrcount values for color scale domain
  const contrcounts = mergedFeatures.map(
    (feature) => feature.properties.contrcount
  );
  const countMin = d3.min(contrcounts);
  const countMax = d3.max(contrcounts);

  // const colorScale = d3
  //   // .scaleSequential(d3.interpolateBlues)
  //   .scaleSequential(d3.interpolateTurbo)
  //   .domain([countMin, countMax]);

  const customColorScale = d3
    .scaleSequential(customInterpolator)
    .domain([countMin, countMax]);

  // Define a hash pattern for zero count
  svg
    .append("defs")
    .append("pattern")
    .attr("id", "hashPattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 15)
    .attr("height", 15)
    .append("rect")
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#C8D2DC"); // grey

  // Add lines to the hash pattern
  d3.select("#hashPattern")
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 15)
    .attr("y2", 15)
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  // Add lines to the hash pattern
  d3.select("#hashPattern")
    .append("line")
    .attr("x1", 0)
    .attr("y1", 15)
    .attr("x2", 15)
    .attr("y2", 0)
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  // Fill in zero count for missing states and apply color
  const statesWithColor = mergedFeatures.map((feature) => {
    const count = feature.properties.contrcount || 0;
    // const fillColor = count > 0 ? colorScale(count) : "url(#hashPattern)";
    const fillColor = count > 0 ? customColorScale(count) : "url(#hashPattern)";
    return { ...feature, properties: { ...feature.properties, fillColor } };
  });

  const mergedGeoJSON = {
    type: "FeatureCollection",
    features: statesWithColor,
  };
  console.log("Merged US:", mergedGeoJSON);
  merged = mergedGeoJSON;

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
    .attr("cursor", "pointer")
    .selectAll("path")
    .data(merged.features)
    .join("path")
    .on("click", clicked)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .attr("d", path)
    .attr("class", "state")
    .style("fill", (d) => d.properties.fillColor);

  states.append("title").text((d) => d.properties.name);

  // interior state lines
  g.append("path")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-linejoin", "round")
    .attr("d", path(interiors));

  // svg.call(zoom); // delete this line to disable free zooming

  // --------------------------------------------------------
  // CUSTOM COLORS & LEGEND
  // --------------------------------------------------------
  // Custom interpolate function for a range of colors
  function customInterpolator(t) {
    const color1 = "#3C5064"; // metal
    const color2 = "#F0B43C"; // gold
    const interpolatedColor = d3.interpolateRgb(color1, color2)(t);
    return interpolatedColor;
  }

  // Create a color key (legend)
  const numSwatches = 10;

  const colorKey = d3
    .select("#chart-states") // You can select the container where you want to append the key
    .append("div")
    .attr("class", "color-key");

  const keyColorScale = d3
    .scaleSequential(customInterpolator)
    .domain([0, numSwatches - 1]);

  const colorSwatches = colorKey
    .selectAll(".color-swatch")
    .data(d3.range(numSwatches)) // Generate values between 0 and 1 for color interpolation
    .enter()
    .append("div")
    .attr("class", "color-swatch")
    .style("background-color", (d) => keyColorScale(d));

  colorSwatches
    .append("div")
    .attr("class", "color-label")
    .text((d) => {
      if (d === 0) return countMin + 1; // Label for the first swatch (min value)
      if (d === numSwatches - 1) return countMax; // Label for the last swatch (max value)
      return ""; // Labels for other swatches (empty)
    });

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
      d3.select(this).transition().style("fill", "#F0B43C"); // color of state when clicked (blue)
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

    // Update fill color during zoom
    states.style("fill", (d) => d.properties.fillColor);
  }

  return svg.node();
}

// --------------------------------------------------------
// TOOL TIP
// --------------------------------------------------------

// Hover color handling functions
function handleMouseOver(event, d) {
  d3.select(this).style("fill", "#64281E"); // hover color

  // Show custom tooltip
  const customTooltip = document.getElementById("map-tooltip");
  const tooltipContent = `<h3>${
    d.properties.name
  }</h3><br><span class="h4">contributions</span><h2><strong> ${
    d.properties.contrcount || 0
  }</strong></h2>`;

  customTooltip.innerHTML = tooltipContent;

  const [x, y] = d3.pointer(event);
  customTooltip.style.display = "block";
  customTooltip.style.left = x + 20 + "px";
  customTooltip.style.top = y + 20 + "px";
}

function handleMouseOut(event, d) {
  d3.select(this).style("fill", (d) => d.properties.fillColor); // go back to the original fill color

  // Hide custom tooltip
  const customTooltip = document.getElementById("map-tooltip");
  customTooltip.style.display = "none";
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
