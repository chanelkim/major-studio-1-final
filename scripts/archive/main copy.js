// // REFERENCES
// // Lab 08: Interactivity
// // MANAGAING STATES WITH VANILLA JS; source: https://www.youtube.com/watch?v=2DV-bONIPqQ (July 6, 2021)

// // --------------------------------------------------------
// // VARIABLES
// // --------------------------------------------------------

// // CATALOG
// const CATALOGID = "catalogid";

// let data = [];
// let menuButtonText = ["catalog", "treemap", "statemap", "objects"];

// // STATE SCHEMA
// let state = {
//   text: "Hello World",
//   name: "Changed by JS",
//   ouput: `$("#output").innerHTML`,

//   // data: [],
//   catalog: {
//     text: menuButtonText[0],
//     svg: {},
//   },
//   treemap: {
//     text: menuButtonText[1],
//     svg: `$("#chart").innerHTML`,
//   },
//   statemap: {
//     text: menuButtonText[2],
//     svg: {},
//   },
//   objects: {
//     text: menuButtonText[3],
//     svg: {},
//   },
// };

// // --------------------------------------------------------
// // SET UP THE DOM
// // --------------------------------------------------------
// // this function is a shortcut for document.querySelectorAll
// $ = (q) => {
//   const els = document.querySelectorAll(q);
//   // els is the list of elements
//   if (els.length > 1) {
//     return els;
//   } else if (els.length) {
//     return els[0];
//   }
// };

// el = (q) => {
//   let el = document.querySelector(q);
//   if (el.length > 1) {
//     return el;
//   } else if (el.length) {
//     return el[0];
//   }
// };

// // function that will render the HTML content
// function renderDOM() {
//   $("#radioGroup").innerHTML = ""; // clear the DOM
// }

// function setState(callback) {
//   callback();
//   renderDOM(); // DOM is rendered again
// }

// // --------------------------------------------------------
// // EVENT LISTENERS
// // --------------------------------------------------------
// // EXAMPLE FOR TIMEOUT
// // setTimeout(() => {
// //   setState(() => {
// //     state.text = "Changed by setTimeout";
// //   });
// // }, 3000);

// $("#catalog").onclick = () => {
//   setState(() => {
//     console.log("catalog clicked");
//     // $("#radioGroup").innerHTML = "";
//   });
// };

// // $("#treemap").onclick = () => {
// //   setState(() => {
// //     console.log("treemap clicked");
// //     // $("#radioGroup").innerHTML = "";
// //   });
// // };
// $("#treemap").onclick = () => {
//   setState(() => {
//     if ($("#chart").innerHTML === "") {
//       console.log("objects clicked AGAIN");
//       $("#chart").innerHTML = state.treemap.svg;
//     } else {
//       console.log("objects clicked");
//       state.treemap.svg = $("#chart").innerHTML;
//       $("#chart").innerHTML = "";
//     }
//   });
// };

// $("#statemap").onclick = () => {
//   console.log("statemap clicked");
//   $("#output").innerHTML = "";
// };

// $("#objects").onclick = () => {
//   setState(() => {
//     if ($("#output").innerHTML === "") {
//       console.log("objects clicked AGAIN");
//       $("#output").innerHTML = state.ouput;
//     } else {
//       console.log("objects clicked");
//       state.ouput = $("#output").innerHTML;
//       $("#output").innerHTML = "";
//     }
//   });
// };

// renderDOM();

// // --------------------------------------------------------
// // LOAD DATA
// // --------------------------------------------------------

// // this function loads the data and then initiates everything
// async function dataLoad() {
//   // initialize the layout: We can do this before data has been loaded
//   // initializeLayout();

//   // load external data file
//   let source = await d3.json("data/test.json");

//   // we're adding an additional attribute to each object
//   source.forEach((d, i) => {
//     d.id = d[CATALOGID] + "_" + i; // need a unique ID here
//   });

//   // and copy the data array into our global data variable
//   data = Array.from(source);
//   console.log("test:", data);
// }

// // --------------------------------------------------------
// // LAYOUT
// // --------------------------------------------------------
// // function initializeLayout() {
// //   const svgWidth = dimensions[0];
// //   const svgHeight = 0.5 * dimensions[1];

// //   const parent = d3.select(".svg-container");
// //   const svg = parent
// //     .append("svg")
// //     .attr("width", svgWidth)
// //     .attr("height", svgHeight);

// //   // svg.append("g");
// // }

// dataLoad();
