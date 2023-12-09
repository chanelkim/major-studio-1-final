// Use catalogData
if (window.catalogData !== undefined) {
  console.log("Using catalogData in otherScript");
}
// --------------------------------------------------------
// VARIABLES
// --------------------------------------------------------
// // Group by section
// const groupedData = groupDataBySection(window.catalogData);
// console.log("groupedData:", groupedData);
// // console.log("section 1:", groupedData.get(1));

// // Group by input theme
// groupDataByTheme(window.catalogData, "Textiles");

// // Map themes to subsections
// const themeRelations = relateThemes(window.catalogData);

// // ----------------TEST------------------
// const dataBySection = groupDataBySection(window.catalogData);
// console.log("dataBySection:", dataBySection);
// console.log("query particular section:", dataBySection.get(2));

// const dataBySectionTheme = d3.group(
//   window.catalogData,
//   (d) => d.section,
//   (d) => d.theme
// );
// console.log("sectionTheme:", dataBySectionTheme);

// const dataBySectioncategory = d3.index(
//   window.catalogData,
//   //   (v) => v.length,
//   (d) => d.theme
// );
// console.log("sectioncategory:", dataBySectioncategory);

// --------------------------------------------------------
// 1. FUNCTIONS for organizing CATALOG DATA
// --------------------------------------------------------
// Function to group data by section
function groupDataBySection(data) {
  //   console.log("Data in groupDataBySection:", data);
  return d3.group(data, (d) => d.section);
}

// Function to group data by category
function groupDataByCategory(data) {
  //   console.log("Data in groupDataByCategory:", data);
  return d3.group(data, (d) => d.category);
}

// Map theme relationships
function relateThemes(data) {
  const themeRelations = d3.rollup(
    data,
    (values) => {
      const relatedData = {
        theme: values[0].theme,
        category: [],
        subcategory: [],
        type: [],
        catalogid: [],
      };

      values.forEach((item) => {
        const catalogID = item.catalogid;

        item.theme.forEach((individualTheme) => {
          // Check if the theme already exists in the map
          if (!relatedData[individualTheme]) {
            relatedData[individualTheme] = {
              theme: individualTheme,
              category: [],
              subcategory: [],
              type: [],
              catalogid: [],
            };
          }

          // Add categories, subcategories, and types to the theme entry only if they include the theme
          if (
            item.category.some((category) => category.includes(individualTheme))
          ) {
            relatedData[individualTheme].category.push(...item.category);
            relatedData[individualTheme].subcategory.push(...item.subcategory);
            relatedData[individualTheme].type.push(...item.type);
            relatedData[individualTheme].catalogid.push(catalogID);
          } else {
            // If category does not include theme, add only matching subcategories and types
            relatedData[individualTheme].subcategory.push(
              ...item.subcategory.filter((subcategory) =>
                subcategory.includes(individualTheme)
              )
            );
            relatedData[individualTheme].type.push(
              ...item.type.filter((type) => type.includes(individualTheme))
            );
          }
        });
      });

      // Convert arrays to sets to remove duplicates
      Object.values(relatedData).forEach((value) => {
        value.category = [...new Set(value.category)];
        value.subcategory = [...new Set(value.subcategory)];
        value.type = [...new Set(value.type)];
      });

      return relatedData;
    },
    (d) => d.theme
  );

  console.log("Theme relationships:", themeRelations);
  return themeRelations;
}

// // Function to create theme relations
// function createThemeRelations(data) {
//     const themeRelations = new Map();

//     data.forEach((item) => {
//       item.theme.forEach((theme) => {
//         if (!themeRelations.has(theme)) {
//           themeRelations.set(theme, {
//             category: new Set(),
//             subcategory: new Set(),
//             type: new Set(),
//             catalogid: new Set(),
//           });
//         }

//         const themeData = themeRelations.get(theme);

//         item.category.forEach((category) => themeData.category.add(category));
//         item.subcategory.forEach((subcategory) =>
//           themeData.subcategory.add(subcategory)
//         );
//         item.type.forEach((type) => themeData.type.add(type));
//         themeData.catalogid.add(item.catalogid);
//       });
//     });

//     return themeRelations;
//   }

//--------------------------------------------------------
// 2. FUNCTIONS for drawing html buttons
// --------------------------------------------------------

// Function to dynamically generate buttons based on the data
function generateButtons(data) {
  const componentContainer = d3.select("#component");
  componentContainer.html(""); // Clear existing content

  const groupedDataBySection = groupDataBySection(data);

  groupedDataBySection.forEach((item, index) => {
    const rowDiv = componentContainer
      .append("div")
      .classed("row", true)
      .attr("role", "group");

    const catsContainer = rowDiv
      .append("div")
      .classed("d-flex flex-row p-0", true)
      .attr("role", "group");

    const addedThemes = new Set(); // Keep track of added themes
    const groupedDataByCategory = groupDataByCategory(item);

    groupedDataByCategory.forEach((categoryData, categoryIndex) => {
      categoryData.forEach((dataItem) => {
        // Convert the theme array to a string for duplicate checking
        const themeString = JSON.stringify(dataItem.theme);
        // Convert the theme array to a string for duplicate checking
        //   const themeString = JSON.stringify(categoryData[0].theme);

        // Check if the theme has been added before creating buttons
        if (!addedThemes.has(themeString)) {
          addedThemes.add(themeString); // Add the theme to the set

          const catId = `cat-${index + 1}-${categoryIndex + 1}`;
          const subcatId = `subcats-test-${index + 1}-${categoryIndex + 1}`;
          const typesId = `types-test-${index + 1}-${categoryIndex + 1}`;

          const categoryButton = catsContainer
            .append("button")
            .classed("btn", true)
            .classed("col-12", true) // Span the entire row
            .classed("col-md-6", true) // Set maximum width for larger screens
            .classed("col-lg-4", true) // Set maximum width for larger screens
            .classed("border", true)
            .classed("border-2", true)
            .classed("border-black", true)
            .classed("d-flex", true)
            .classed("p-2", true)
            .classed("align-middle", true)
            .attr("type", "button")
            .attr("id", catId)
            .attr("data-bs-toggle", "collapse") // Add collapse toggle
            .attr("data-bs-target", `#${subcatId}`)
            .html(`<tspan id="category">${categoryData[0].category}</tspan>`);

          const subcatDiv = catsContainer
            .append("div")
            .classed("col-lg-12", true)
            .classed("p-0", true)
            .classed("collapse", true)
            .attr("id", subcatId);

          categoryData.forEach((item, rowIndex) => {
            item.subcategory.forEach((subcat, subcatIndex) => {
              const subcatButton = subcatDiv
                .append("button")
                .classed("btn", true)
                .classed("col", true)
                .classed("border", true)
                .classed("border-2", true)
                .classed("border-black", true)
                .classed("d-flex", true)
                .classed("p-2", true)
                .classed("align-middle", true)
                .classed("align-items-stretch", true) // Add align-items-stretch class
                .classed("flex-wrap", true) // Add flex-wrap class
                .attr("type", "button")
                .attr(
                  "id",
                  `${catId}-subcategory-${rowIndex + 1}-${subcatIndex + 1}`
                )
                .html(`<tspan id="subcategory">${subcat}</tspan>`);
            });
          });

          const typesDiv = catsContainer
            .append("div")
            .classed("collapse", true)
            .attr("id", typesId);

          categoryData.forEach((item, rowIndex) => {
            const rowIndexTypesId = `${typesId}-${rowIndex + 1}`;

            item.type.forEach((type, typeIndex) => {
              const typeButton = typesDiv
                .append("button")
                .classed("btn", true)
                .classed("col", true)
                .classed("border", true)
                .classed("border-2", true)
                .classed("border-black", true)
                .classed("d-flex", true)
                .classed("p-1", true)
                .classed("align-middle", true)
                .classed("align-items-stretch", true) // Add align-items-stretch class
                .classed("flex-wrap", true) // Add flex-wrap class
                .attr("type", "button")
                .attr("id", `${catId}-type-${rowIndex + 1}-${typeIndex + 1}`)
                .html(`<tspan id="type-token">${type}</tspan>`);
            });
          });
        }
      });
    });
  });
}

// Call the function to generate buttons based on data
generateButtons(window.catalogData);

// Generate buttons v2

/* ARCHIVE ------------------*/
// // Group data by section
// function groupDataBySection(data) {
//     const groupedData = d3.group(data, (d) => d.section);
//     //   console.log("Sections:", groupedData);
//     return groupedData;
//   }

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
//         relatedData.catalogid.push(item.catalogid);

//         if (item.category.includes(relatedData.theme)) {
//           relatedData.category.push(...item.category);
//         } else {
//           relatedData.subcategory.push(
//             ...item.subcategory.filter((subcategory) =>
//               subcategory.includes(relatedData.theme)
//             )
//           );
//           relatedData.type.push(
//             ...item.type.filter((type) => type.includes(relatedData.theme))
//           );
//         }
//       });

//       // Convert arrays to sets to remove duplicates
//       relatedData.category = [...new Set(relatedData.category)];
//       relatedData.subcategory = [...new Set(relatedData.subcategory)];
//       relatedData.type = [...new Set(relatedData.type)];

//       return relatedData;
//     },
//     (d) => d.theme
//   );

//   console.log("Theme relationships:", themeRelations);
//   return themeRelations;
// }

// function relateThemes(data) {
//   // Create a map to associate themes with their related categories, subcategories, and types
//   const themeRelations = new Map();

//   data.forEach((item) => {
//     const catalogID = item.catalogid;

//     item.theme.forEach((theme) => {
//       // Check if the theme already exists in the map
//       if (!themeRelations.has(theme)) {
//         themeRelations.set(theme, {
//           theme: [theme],
//           category: [],
//           subcategory: [],
//           type: [],
//           catalogid: [],
//         });
//       }

//       // Add categories, subcategories, and types to the theme entry only if they include the theme
//       if (item.category.some((category) => category.includes(theme))) {
//         themeRelations.get(theme).category.push(...item.category);
//         themeRelations.get(theme).subcategory.push(...item.subcategory);
//         themeRelations.get(theme).type.push(...item.type);
//         themeRelations.get(theme).catalogid.push(catalogID);
//       } else {
//         // If category does not include theme, add only matching subcategories and types
//         themeRelations
//           .get(theme)
//           .subcategory.push(
//             ...item.subcategory.filter((subcategory) =>
//               subcategory.includes(theme)
//             )
//           );
//         themeRelations
//           .get(theme)
//           .type.push(...item.type.filter((type) => type.includes(theme)));
//       }
//     });
//   });

//   // Convert arrays to sets to remove duplicates
//   themeRelations.forEach((value) => {
//     value.category = [...new Set(value.category)];
//     value.subcategory = [...new Set(value.subcategory)];
//     value.type = [...new Set(value.type)];
//   });

//   console.log("Theme relationships:", themeRelations);
//   return themeRelations;
// }

// /* INITIALIZE LAYOUT ------------------*/
// // Function to set up the layout ------------------
// function initializeLayout(groupedData, themeRelations) {
//   const radioGroupContainer = document.getElementById("radioGroup");

//   Object.keys(groupedData).forEach((section) => {
//     const colDiv = document.createElement("div");
//     colDiv.className = "col-12";

//     const fieldset = document.createElement("fieldset");
//     fieldset.className = "row";

//     const addedThemes = new Set();

//     groupedData[section].forEach((item, index) => {
//       item.theme.forEach((theme) => {
//         // Check if the theme has been added to the set
//         if (!addedThemes.has(theme)) {
//           const radioInput = document.createElement("input");
//           radioInput.type = "radio";
//           radioInput.className = "btn-check col";
//           radioInput.name = "options"; // Use the same name for all radio buttons
//           radioInput.id = `option_${theme}_${index}`;
//           radioInput.autocomplete = "off";
//           radioInput.setAttribute("data-label", theme);

//           const label = document.createElement("label");
//           label.className = "btn btn-outline-primary text-dark col";
//           label.htmlFor = `option_${theme}_${index}`;
//           label.textContent = theme;

//           fieldset.appendChild(radioInput);
//           fieldset.appendChild(label);

//           // Add the theme to the set to avoid duplication
//           addedThemes.add(theme);

//           // Add a click event to toggle the active class and visibility of related arrays
//           radioInput.addEventListener("change", () => {
//             const selectedTheme = theme;
//             // Toggle the visibility of category, subcategory, and type based on the selected theme
//             toggleVisibility(selectedTheme, themeRelations);

//             // Toggle the "active" class for the clicked radio button
//             const radioButtons = document.querySelectorAll(
//               'input[name="options"]'
//             );
//             radioButtons.forEach((radio) => {
//               radio.classList.remove("active");
//             });

//             radioInput.classList.toggle("active");
//           });
//         }
//       });
//     });
//     colDiv.appendChild(fieldset);
//     radioGroupContainer.appendChild(colDiv);
//   });

//   // Add a container for the related radios
//   const relatedRadiosContainer = document.createElement("div");
//   relatedRadiosContainer.id = "relatedRadios";
//   relatedRadiosContainer.className = "col-12";
//   radioGroupContainer.appendChild(relatedRadiosContainer);

//   console.log("Initializing layout...");
// }

// /* related FUNCTIONS for RADIO BUTTONS ------------------*/
// // Function to update visibility of category, subcategory, and type based on the selected theme ------------------
// function toggleVisibility(selectedTheme, themeRelations) {
//   console.log("Selected Theme:", selectedTheme);
//   if (!themeRelations.has(selectedTheme)) {
//     console.error(
//       `The theme ${selectedTheme} does not exist in themeRelations.`
//     );
//     return;
//   }

//   // Get the container where the new radio buttons will be appended
//   const container = document.getElementById("relatedRadios");

//   // Clear any existing radio buttons in the container
//   container.innerHTML = "";

//   // Get the related themes based on the selected theme
//   const relatedThemes = themeRelations.get(selectedTheme);
//   console.log("Relationships:", relatedThemes);

//   const relatedCategories = themeRelations.get(selectedTheme).category;
//   const relatedSubcategories = themeRelations.get(selectedTheme).subcategory;
//   const relatedTypes = themeRelations.get(selectedTheme).type;
//   const relatedIds = themeRelations.get(selectedTheme).catalogid;

//   // Helper function to handle the click event for new radio buttons
//   const handleRadioButtonClick = (event, value) => {
//     console.log("New radio button clicked:", value);
//     console.log("Selected radio button:", event.target);
//   };

//   // Display related category radios
//   console.log("Related Category:", relatedCategories, relatedIds);
//   relatedCategories.forEach((category) => {
//     // createRadioButton(container, "category", category);
//     createRadioButton(container, "category", relatedIds, category);

//     const radio = document.querySelector(
//       `input[name="category"][data-value="${category}"]`
//     );
//     if (radio) {
//       radio.style.display = "inline-block";
//       // Add a click event to the new radio button
//       console.log(radio, handleRadioButtonClick);
//       radio.addEventListener("change", (event) =>
//         handleRadioButtonClick(event, category)
//       );
//     }
//   });

//   // Display related subcategory radios
//   console.log("Related Subcategory:", relatedSubcategories, relatedIds);
//   relatedSubcategories.forEach((subcategory) => {
//     // createRadioButton(container, "subcategory", subcategory);
//     createRadioButton(container, "subcategory", relatedIds, subcategory);

//     const radio = document.querySelector(
//       `input[name="category"][data-value="${subcategory}"]`
//     );
//     if (radio) {
//       radio.style.display = "inline-block";
//       // Add a click event to the new radio button
//       console.log(radio, handleRadioButtonClick);
//       radio.addEventListener("change", (event) =>
//         handleRadioButtonClick(event, subcategory)
//       );
//     }
//   });

//   // Display related type radios
//   console.log("Related Type:", relatedTypes, relatedIds);
//   console.log("---------------------------");
//   relatedTypes.forEach((type) => {
//     // createRadioButton(container, "type", type);
//     createRadioButton(container, "type", relatedIds, type);

//     const radio = document.querySelector(
//       `input[name="category"][data-value="${type}"]`
//     );
//     if (radio) {
//       radio.style.display = "inline-block";
//       // Add a click event to the new radio button
//       console.log(radio, handleRadioButtonClick);
//       radio.addEventListener("change", (event) =>
//         handleRadioButtonClick(event, type)
//       );
//     }
//   });
// }

// function createRadioButton(container, name, catalogid, value) {
//   const radioInput = document.createElement("input");
//   const uniqueId = `${name}_${catalogid.length}_${value}`;
//   radioInput.value = value;
//   radioInput.id = uniqueId;
//   radioInput.type = "radio";
//   radioInput.className = "btn-check col";
//   radioInput.name = name;
//   radioInput.autocomplete = "off";
//   radioInput.setAttribute("data-value", value);

//   const label = document.createElement("label");
//   label.htmlFor = uniqueId;
//   label.textContent = value;
//   label.className = "btn btn-outline-primary text-dark col";

//   container.appendChild(radioInput);
//   container.appendChild(label);
// }
