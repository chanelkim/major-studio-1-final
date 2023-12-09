// Use treemapData
// if (window.treemapData !== undefined) {
//   console.log("--------------------------------");
//   console.log("treemapData is available");
// }
console.log("Using treemapData in otherScript:", window.treemapData);
console.log("Using GLOBAL TREEMAP in treemap.js:", TREEMAP);

// REFERENCES
// D3 Responsive Zoomable Treemap (D3 v4+) Aleksander Lenart; source: https://codepen.io/figle/pen/qapRZQ

// --------------------------------------------------------
// VARIABLES
// --------------------------------------------------------
let index;
let allArtists = [];
let hierarchicalData;

const svgWidth = 1920;
const svgHeight = 1080;

let width = (height = 100); // % of the parent element
let x = d3.scaleLinear().domain([0, width]).range([0, width]);
let y = d3.scaleLinear().domain([0, height]).range([0, height]);

const customColors = [
  "#E63C28", // red
  "#F0D23C", // bright yellow
  "#F0B43C", // gold
  "#3282DC", // blue
  "#64281E", // brown
  "#E6B4BE", // pink
  "#3C5064", // metal
  "#C8D2DC", // grey
  "#505A32", // green
  "#C8D2DC", // grey
  "#5A50B4", // violet
];

const tooltip = d3
  .select("#chart")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// --------------------------------------------------------
// LOAD DATA + PERFORM FUNCTIONS
// --------------------------------------------------------
d3.json("/data/IoAD_artists_imgs.json").then(function (data) {
  index = data;
  analyzeData();
  drawTreemap();
});

// --------------------------------------------------------
// PREP FUNCTION - EXTRACT DATA
// --------------------------------------------------------
function analyzeData() {
  // go through the array of data
  index.forEach(function (n) {
    // match = false
    artistName = n.attribution;
    title = n.title;
    objectid = n.objectid;
    imagematch = n.imagematch;

    const artist = allArtists.find((p) => p.name === artistName);

    // check if it matches what we need
    if (!artist) {
      allArtists.push({
        name: artistName,
        titles: [
          {
            title: title,
            objectid: objectid,
            imagematch: imagematch,
          },
        ],
        count: 1, // initialize count to 1
      });
    } else {
      artist.titles.push({
        title: title,
        objectid: objectid,
        imagematch: imagematch,
      });
      artist.count++;
    }
  });

  // --------------------------------------------------------
  // PREP FUNCTION - REFORMAT DATA FOR D3 HIERARCHY
  // --------------------------------------------------------
  function formatDataForHierarchy() {
    const hierarchyData = {
      name: "Artists", // Root node
      children: [],
    };

    allArtists.forEach(function (artist) {
      if (artist && artist.titles) {
        const artistNode = {
          name: artist.name || "Unknown artist", // use a default value if artist.name is undefined
          count: artist.count || 0, // use a default value if artist.count is undefined
          children: [],
        };

        artist.titles.forEach((title) => {
          // Filter out titles with missing or undefined values
          if (title.title && title.objectid && title.imagematch) {
            artistNode.children.push({
              name: title.title,
              objectid: title.objectid,
              imagematch: title.imagematch,
              value: 1,
            });
          }
        });

        hierarchyData.children.push(artistNode);
      }
    });

    return hierarchyData;
  }

  hierarchicalData = formatDataForHierarchy();
  console.log("hierarchicalData:", hierarchicalData);
}

// --------------------------------------------------------
// DRAW FUNCTION
// --------------------------------------------------------
function drawTreemap() {
  data = hierarchicalData;

  let currentDepth;

  const color = d3.scaleOrdinal(
    data.children.map((d) => d.name),
    customColors
  );

  svg = d3
    .select(".treemap-container")
    .append("svg")
    .attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
    .attr("preserveAspectRatio", "xMidYMid meet");
  // .append("g");

  const treemap = d3
    .treemap()
    .tile(d3.treemapBinary)
    .size([width, height])
    .paddingInner(0)
    .round(true);

  const nodes = d3
    .hierarchy(data)
    .sum((d) => (d.value ? 1 : 0))
    .sort((a, b) => b.height - a.height || b.value - a.value);
  console.log("nodes:", nodes);

  treemap(nodes);

  chart = d3.select("#chart");

  const cells = chart
    .selectAll(".node")
    .data(nodes.descendants())
    .enter()
    .append("div")
    .attr("class", function (d) {
      return "node level-" + d.depth;
    })
    .attr("title", function (d) {
      return d.data.name ? d.data.name : "null";
    });
  console.log("cells:", cells);

  cells
    .style("left", function (d) {
      return x(d.x0) + "%";
    })
    .style("top", function (d) {
      return y(d.y0) + "%";
    })
    .style("width", function (d) {
      return x(d.x1) - x(d.x0) + "%";
    })
    .style("height", function (d) {
      return y(d.y1) - y(d.y0) + "%";
    })
    .style("background-color", function (d) {
      while (d.depth > 2) d = d.parent;
      return color(d.data.name);
    })
    .on("click", zoom);
  // .append("p")
  // .attr("class", "label")
  // .text(function (d) {
  //   return d.data.name ? d.data.name : "---";
  // });

  // --------------------------------------------------------
  // TOOL TIP
  // --------------------------------------------------------
  cells
    .on("mouseover", function (event, d) {
      // Show the tooltip on mouseover for depths other than 0
      if (d.depth !== 0) {
        tooltip.transition().duration(200).style("opacity", 0.9);

        // Customize the tooltip content based on depth
        let tooltipContent = "";
        if (d.depth === 1) {
          tooltipContent = `
          <h2><strong>${d.data.name}</strong></h2>
          <h3>Contributor</h3>
          <h2><strong>${d.data.count} works</strong></h2>`;
        } else if (d.depth === 2) {
          tooltipContent = `
          <h3>${d.parent.data.name}</h3>
          <h2><strong>${d.data.name}</strong></h2>`;
        } else {
          tooltipContent = `
          <h3>${d.parent.data.name}</h3>`;
        }

        tooltip
          .html(tooltipContent)
          .style("left", event.pageX + "px")
          .style("top", event.pageY + "px");
      }
    })
    .on("mouseout", function () {
      // Hide the tooltip on mouseout
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // --------------------------------------------------------
  // UP - EVENT LISTENER
  // --------------------------------------------------------
  const parent = d3
    .select(".up")
    .datum(nodes)
    //   .on("click", zoom);
    .on("click", (event, d) => zoom(d));
  console.log("parent:", parent);

  if (nodes) {
    parent.datum(nodes).on("click", (event, d) => zoom(event, d));
  } else {
    console.error("Nodes data is not available.");
  }

  // --------------------------------------------------------
  // ZOOM FUNCTION
  // --------------------------------------------------------
  function zoom(event, d) {
    if (!d) {
      // Handle the case when 'd' is undefined
      console.error("Invalid data for zoom:", d);
      return;
    }
    console.log("zoom:", d);
    // http://jsfiddle.net/ramnathv/amszcymq/
    data = hierarchicalData;

    console.log("clicked: " + d.data.name + ", depth: " + d.depth);

    currentDepth = d.depth;
    console.log("currentDepth:", currentDepth);
    parent.datum(d.parent || nodes);

    x.domain([d.x0, d.x1]);
    y.domain([d.y0, d.y1]);

    var t = d3.transition().duration(800).ease(d3.easeCubicOut);

    cells
      .transition(t)
      .style("left", function (d) {
        return x(d.x0) + "%";
      })
      .style("top", function (d) {
        return y(d.y0) + "%";
      })
      .style("width", function (d) {
        return x(d.x1) - x(d.x0) + "%";
      })
      .style("height", function (d) {
        return y(d.y1) - y(d.y0) + "%";
      })
      .style("background-image", function (d) {
        // Check if the currentDepth is 1 and the node has imagematch data
        if ((currentDepth === 1 || currentDepth === 2) && d.data.imagematch) {
          // Set the background image using the imagematch data
          return `url(${d.data.imagematch})`;
        }
        // Default to no background image
        return "none";
      })
      .style("background-color", function (d) {
        while (d.depth > 2) d = d.parent;
        return color(d.data.name);
      });

    cells // hide this depth and above
      .filter(function (d) {
        return d.ancestors();
      })
      .classed("hide", function (d) {
        return d.children ? true : false;
      });

    cells // show this depth + 1 and below
      .filter(function (d) {
        return d.depth > currentDepth;
      })
      .classed("hide", false);
  }
}

// --------------------------------------------------------
// PRELOAD IMAGE FUNCTION
// --------------------------------------------------------
// function preloadImages(data) {
function preloadImages(data) {
  const preloadContainer = document.createElement("div");
  preloadContainer.style.display = "none";

  // Flatten the hierarchicalData to get all imagematch URLs
  const imageUrls = flattenData(data)
    .map((item) => item.imagematch)
    .filter(Boolean);

  imageUrls.forEach((url) => {
    const img = document.createElement("img");
    img.src = url;
    preloadContainer.appendChild(img);
  });

  document.body.appendChild(preloadContainer);
}

// Function to flatten hierarchical data
function flattenData(data) {
  const result = [];

  function flatten(node) {
    if (node && node.data) {
      result.push(node.data);

      if (node.children) {
        node.children.forEach(flatten);
      }
    }
  }

  flatten(data);

  return result;
}

// Call the preloadImages function when the page is initiated
window.addEventListener("load", function () {
  preloadImages(hierarchicalData);
});
