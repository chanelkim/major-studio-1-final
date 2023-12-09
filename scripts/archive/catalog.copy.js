// // Use catalogData
// if (window.catalogData !== undefined) {
//   console.log("Using catalogData in otherScript");
// }
// // --------------------------------------------------------
// // VARIABLES
// // --------------------------------------------------------
// // Group by section
// const groupedData = groupDataBySection(window.catalogData);
// // console.log("section 1:", groupedData.get(1));

// // Group by input theme
// groupDataByTheme(window.catalogData, "Textiles");

// // Map themes to subsections
// const themeRelations = createThemeRelations(window.catalogData);
// relateThemes(window.catalogData);

// // --------------------------------------------------------
// // LAYOUT
// // --------------------------------------------------------
// // initializeLayout(groupedData, themeRelations);
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

// // function selectSVG(svgSelector) {
// //   // Select the SVG element based on the provided selector
// //   return d3.select(svgSelector);
// // }

// // // Example usage:
// // const statemap = selectSVG(state.statemap.svg);

// // --------------------------------------------------------
// // 1. FUNCTIONS for organizing CATALOG DATA
// // --------------------------------------------------------
// // // Function to group data by section
// // function groupDataBySection(data) {
// //   return d3.group(data, (d) => d.section);
// // }

// // // Function to group data by theme
// // function groupDataByTheme(data) {
// //   return d3.group(data, (d) => d.theme);
// // }

// // Map theme relationships
// function relateThemes(data) {
//   const themeRelations = d3.rollup(
//     data,
//     (values) => {
//       const relatedData = {
//         theme: values[0].theme,
//         category: [],
//         subcategory: [],
//         type: [],
//         catalogid: [],
//       };

//       values.forEach((item) => {
//         const catalogID = item.catalogid;

//         item.theme.forEach((individualTheme) => {
//           // Check if the theme already exists in the map
//           if (!relatedData[individualTheme]) {
//             relatedData[individualTheme] = {
//               theme: individualTheme,
//               category: [],
//               subcategory: [],
//               type: [],
//               catalogid: [],
//             };
//           }

//           // Add categories, subcategories, and types to the theme entry only if they include the theme
//           if (
//             item.category.some((category) => category.includes(individualTheme))
//           ) {
//             relatedData[individualTheme].category.push(...item.category);
//             relatedData[individualTheme].subcategory.push(...item.subcategory);
//             relatedData[individualTheme].type.push(...item.type);
//             relatedData[individualTheme].catalogid.push(catalogID);
//           } else {
//             // If category does not include theme, add only matching subcategories and types
//             relatedData[individualTheme].subcategory.push(
//               ...item.subcategory.filter((subcategory) =>
//                 subcategory.includes(individualTheme)
//               )
//             );
//             relatedData[individualTheme].type.push(
//               ...item.type.filter((type) => type.includes(individualTheme))
//             );
//           }
//         });
//       });

//       // Convert arrays to sets to remove duplicates
//       Object.values(relatedData).forEach((value) => {
//         value.category = [...new Set(value.category)];
//         value.subcategory = [...new Set(value.subcategory)];
//         value.type = [...new Set(value.type)];
//       });

//       return relatedData;
//     },
//     (d) => d.theme
//   );

//   console.log("Theme relationships:", themeRelations);
//   return themeRelations;
// }

// //--------------------------------------------------------
// // 2. FUNCTIONS for drawing html buttons
// // --------------------------------------------------------
// // Function to group data by section
// function groupDataBySection(data) {
//   console.log("Data in groupDataBySection:", data); // Log the data
//   return d3.group(data, (d) => d.section);
// }

// // Function to group data by category
// function groupDataByCategory(data) {
//   return d3.group(data, (d) => d.category);
// }

// // Function to group data by theme
// function groupDataByTheme(data) {
//   return d3.group(data, (d) => d.theme);
// }

// // Function to create theme relations
// function createThemeRelations(data) {
//   const themeRelations = new Map();

//   data.forEach((item) => {
//     item.theme.forEach((theme) => {
//       if (!themeRelations.has(theme)) {
//         themeRelations.set(theme, {
//           category: new Set(),
//           subcategory: new Set(),
//           type: new Set(),
//           catalogid: new Set(),
//         });
//       }

//       const themeData = themeRelations.get(theme);

//       item.category.forEach((category) => themeData.category.add(category));
//       item.subcategory.forEach((subcategory) =>
//         themeData.subcategory.add(subcategory)
//       );
//       item.type.forEach((type) => themeData.type.add(type));
//       themeData.catalogid.add(item.catalogid);
//     });
//   });

//   return themeRelations;
// }

// // Finally, call the initializeLayout function
// initializeLayout(groupedData, themeRelations);

// // LAYOUT
// function initializeLayout(groupedData, themeRelations) {
//   const radioGroupContainer = d3.select("#component");

//   Object.keys(groupedData).forEach((section) => {
//     const colDiv = radioGroupContainer.append("div").classed("col-12", true);

//     const fieldset = colDiv.append("fieldset").classed("row", true);

//     const addedThemes = new Set();

//     groupedData[section].forEach((item, index) => {
//       item.theme.forEach((theme) => {
//         // Check if the theme has been added to the set
//         if (!addedThemes.has(theme)) {
//           const uniqueId = `option_${theme}_${index}`;

//           const radioInput = fieldset
//             .append("input")
//             .attr("type", "radio")
//             .classed("btn-check", true)
//             .classed("col", true)
//             .attr("name", "options")
//             .attr("id", uniqueId)
//             .attr("autocomplete", "off")
//             .attr("data-label", theme);

//           const label = fieldset
//             .append("label")
//             .classed("btn", true)
//             .classed("btn-outline-primary", true)
//             .classed("text-dark", true)
//             .classed("col", true)
//             .attr("for", uniqueId)
//             .text(theme);

//           // Add the theme to the set to avoid duplication
//           addedThemes.add(theme);

//           // Add a click event to toggle the active class and visibility of related arrays
//           radioInput.on("change", () => {
//             const selectedTheme = theme;
//             // Toggle the visibility of category, subcategory, and type based on the selected theme
//             toggleVisibility(selectedTheme, themeRelations);

//             // Toggle the "active" class for the clicked radio button
//             d3.selectAll('input[name="options"]').classed("active", false);
//             radioInput.classed("active", true);
//           });
//         }
//       });
//     });
//   });

//   // Add a container for the related radios
//   const relatedRadiosContainer = radioGroupContainer
//     .append("div")
//     .attr("id", "relatedRadios")
//     .classed("col-12", true);

//   console.log("Initializing layout...");
// }
// // initializeLayout(groupedData, themeRelations);

// // Call the function to generate buttons based on data
// // generateButtons(window.catalogData);

// /* ARCHIVE ------------------*/
// // // Group data by section
// // function groupDataBySection(data) {
// //     const groupedData = d3.group(data, (d) => d.section);
// //     //   console.log("Sections:", groupedData);
// //     return groupedData;
// //   }

// //   // Group data by imput theme
// //   function groupDataByTheme(data, desiredTheme) {
// //     const groupedData = d3.group(data, (d) =>
// //       d.theme.includes(desiredTheme) ? desiredTheme : "Other"
// //     );
// //     // Filter out the 'Other' key
// //     const filteredGroups = new Map(
// //       [...groupedData].filter(([key, value]) => key !== "Other")
// //     );
// //     console.log(`Data grouped by ${desiredTheme}:`, filteredGroups);
// //     return filteredGroups;
// //   }
// // function relateThemes(data) {
// //   const themeRelations = d3.rollup(
// //     data,
// //     (values) => {
// //       const relatedData = {
// //         theme: values[0].theme,
// //         category: [],
// //         subcategory: [],
// //         type: [],
// //         catalogid: [],
// //       };

// //       values.forEach((item) => {
// //         relatedData.catalogid.push(item.catalogid);

// //         if (item.category.includes(relatedData.theme)) {
// //           relatedData.category.push(...item.category);
// //         } else {
// //           relatedData.subcategory.push(
// //             ...item.subcategory.filter((subcategory) =>
// //               subcategory.includes(relatedData.theme)
// //             )
// //           );
// //           relatedData.type.push(
// //             ...item.type.filter((type) => type.includes(relatedData.theme))
// //           );
// //         }
// //       });

// //       // Convert arrays to sets to remove duplicates
// //       relatedData.category = [...new Set(relatedData.category)];
// //       relatedData.subcategory = [...new Set(relatedData.subcategory)];
// //       relatedData.type = [...new Set(relatedData.type)];

// //       return relatedData;
// //     },
// //     (d) => d.theme
// //   );

// //   console.log("Theme relationships:", themeRelations);
// //   return themeRelations;
// // }

// // function relateThemes(data) {
// //   // Create a map to associate themes with their related categories, subcategories, and types
// //   const themeRelations = new Map();

// //   data.forEach((item) => {
// //     const catalogID = item.catalogid;

// //     item.theme.forEach((theme) => {
// //       // Check if the theme already exists in the map
// //       if (!themeRelations.has(theme)) {
// //         themeRelations.set(theme, {
// //           theme: [theme],
// //           category: [],
// //           subcategory: [],
// //           type: [],
// //           catalogid: [],
// //         });
// //       }

// //       // Add categories, subcategories, and types to the theme entry only if they include the theme
// //       if (item.category.some((category) => category.includes(theme))) {
// //         themeRelations.get(theme).category.push(...item.category);
// //         themeRelations.get(theme).subcategory.push(...item.subcategory);
// //         themeRelations.get(theme).type.push(...item.type);
// //         themeRelations.get(theme).catalogid.push(catalogID);
// //       } else {
// //         // If category does not include theme, add only matching subcategories and types
// //         themeRelations
// //           .get(theme)
// //           .subcategory.push(
// //             ...item.subcategory.filter((subcategory) =>
// //               subcategory.includes(theme)
// //             )
// //           );
// //         themeRelations
// //           .get(theme)
// //           .type.push(...item.type.filter((type) => type.includes(theme)));
// //       }
// //     });
// //   });

// //   // Convert arrays to sets to remove duplicates
// //   themeRelations.forEach((value) => {
// //     value.category = [...new Set(value.category)];
// //     value.subcategory = [...new Set(value.subcategory)];
// //     value.type = [...new Set(value.type)];
// //   });

// //   console.log("Theme relationships:", themeRelations);
// //   return themeRelations;
// // }

// // /* INITIALIZE LAYOUT ------------------*/
// // // Function to set up the layout ------------------
// // function initializeLayout(groupedData, themeRelations) {
// //   const radioGroupContainer = document.getElementById("radioGroup");

// //   Object.keys(groupedData).forEach((section) => {
// //     const colDiv = document.createElement("div");
// //     colDiv.className = "col-12";

// //     const fieldset = document.createElement("fieldset");
// //     fieldset.className = "row";

// //     const addedThemes = new Set();

// //     groupedData[section].forEach((item, index) => {
// //       item.theme.forEach((theme) => {
// //         // Check if the theme has been added to the set
// //         if (!addedThemes.has(theme)) {
// //           const radioInput = document.createElement("input");
// //           radioInput.type = "radio";
// //           radioInput.className = "btn-check col";
// //           radioInput.name = "options"; // Use the same name for all radio buttons
// //           radioInput.id = `option_${theme}_${index}`;
// //           radioInput.autocomplete = "off";
// //           radioInput.setAttribute("data-label", theme);

// //           const label = document.createElement("label");
// //           label.className = "btn btn-outline-primary text-dark col";
// //           label.htmlFor = `option_${theme}_${index}`;
// //           label.textContent = theme;

// //           fieldset.appendChild(radioInput);
// //           fieldset.appendChild(label);

// //           // Add the theme to the set to avoid duplication
// //           addedThemes.add(theme);

// //           // Add a click event to toggle the active class and visibility of related arrays
// //           radioInput.addEventListener("change", () => {
// //             const selectedTheme = theme;
// //             // Toggle the visibility of category, subcategory, and type based on the selected theme
// //             toggleVisibility(selectedTheme, themeRelations);

// //             // Toggle the "active" class for the clicked radio button
// //             const radioButtons = document.querySelectorAll(
// //               'input[name="options"]'
// //             );
// //             radioButtons.forEach((radio) => {
// //               radio.classList.remove("active");
// //             });

// //             radioInput.classList.toggle("active");
// //           });
// //         }
// //       });
// //     });
// //     colDiv.appendChild(fieldset);
// //     radioGroupContainer.appendChild(colDiv);
// //   });

// //   // Add a container for the related radios
// //   const relatedRadiosContainer = document.createElement("div");
// //   relatedRadiosContainer.id = "relatedRadios";
// //   relatedRadiosContainer.className = "col-12";
// //   radioGroupContainer.appendChild(relatedRadiosContainer);

// //   console.log("Initializing layout...");
// // }

// // /* related FUNCTIONS for RADIO BUTTONS ------------------*/
// // // Function to update visibility of category, subcategory, and type based on the selected theme ------------------
// // function toggleVisibility(selectedTheme, themeRelations) {
// //   console.log("Selected Theme:", selectedTheme);
// //   if (!themeRelations.has(selectedTheme)) {
// //     console.error(
// //       `The theme ${selectedTheme} does not exist in themeRelations.`
// //     );
// //     return;
// //   }

// //   // Get the container where the new radio buttons will be appended
// //   const container = document.getElementById("relatedRadios");

// //   // Clear any existing radio buttons in the container
// //   container.innerHTML = "";

// //   // Get the related themes based on the selected theme
// //   const relatedThemes = themeRelations.get(selectedTheme);
// //   console.log("Relationships:", relatedThemes);

// //   const relatedCategories = themeRelations.get(selectedTheme).category;
// //   const relatedSubcategories = themeRelations.get(selectedTheme).subcategory;
// //   const relatedTypes = themeRelations.get(selectedTheme).type;
// //   const relatedIds = themeRelations.get(selectedTheme).catalogid;

// //   // Helper function to handle the click event for new radio buttons
// //   const handleRadioButtonClick = (event, value) => {
// //     console.log("New radio button clicked:", value);
// //     console.log("Selected radio button:", event.target);
// //   };

// //   // Display related category radios
// //   console.log("Related Category:", relatedCategories, relatedIds);
// //   relatedCategories.forEach((category) => {
// //     // createRadioButton(container, "category", category);
// //     createRadioButton(container, "category", relatedIds, category);

// //     const radio = document.querySelector(
// //       `input[name="category"][data-value="${category}"]`
// //     );
// //     if (radio) {
// //       radio.style.display = "inline-block";
// //       // Add a click event to the new radio button
// //       console.log(radio, handleRadioButtonClick);
// //       radio.addEventListener("change", (event) =>
// //         handleRadioButtonClick(event, category)
// //       );
// //     }
// //   });

// //   // Display related subcategory radios
// //   console.log("Related Subcategory:", relatedSubcategories, relatedIds);
// //   relatedSubcategories.forEach((subcategory) => {
// //     // createRadioButton(container, "subcategory", subcategory);
// //     createRadioButton(container, "subcategory", relatedIds, subcategory);

// //     const radio = document.querySelector(
// //       `input[name="category"][data-value="${subcategory}"]`
// //     );
// //     if (radio) {
// //       radio.style.display = "inline-block";
// //       // Add a click event to the new radio button
// //       console.log(radio, handleRadioButtonClick);
// //       radio.addEventListener("change", (event) =>
// //         handleRadioButtonClick(event, subcategory)
// //       );
// //     }
// //   });

// //   // Display related type radios
// //   console.log("Related Type:", relatedTypes, relatedIds);
// //   console.log("---------------------------");
// //   relatedTypes.forEach((type) => {
// //     // createRadioButton(container, "type", type);
// //     createRadioButton(container, "type", relatedIds, type);

// //     const radio = document.querySelector(
// //       `input[name="category"][data-value="${type}"]`
// //     );
// //     if (radio) {
// //       radio.style.display = "inline-block";
// //       // Add a click event to the new radio button
// //       console.log(radio, handleRadioButtonClick);
// //       radio.addEventListener("change", (event) =>
// //         handleRadioButtonClick(event, type)
// //       );
// //     }
// //   });
// // }

// // function createRadioButton(container, name, catalogid, value) {
// //   const radioInput = document.createElement("input");
// //   const uniqueId = `${name}_${catalogid.length}_${value}`;
// //   radioInput.value = value;
// //   radioInput.id = uniqueId;
// //   radioInput.type = "radio";
// //   radioInput.className = "btn-check col";
// //   radioInput.name = name;
// //   radioInput.autocomplete = "off";
// //   radioInput.setAttribute("data-value", value);

// //   const label = document.createElement("label");
// //   label.htmlFor = uniqueId;
// //   label.textContent = value;
// //   label.className = "btn btn-outline-primary text-dark col";

// //   container.appendChild(radioInput);
// //   container.appendChild(label);
// // }
