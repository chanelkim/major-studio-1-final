// REFERENCES
// Lab 08: Interactivity
// MANAGAING STATES WITH VANILLA JS; source: https://www.youtube.com/watch?v=2DV-bONIPqQ (July 6, 2021)

// STATE SCHEMA
let state = {
  data: null, // Placeholder for the loaded data
  catalog: {
    // text: "Catalog",
    svg: "#catalog-svg",
    dataUrl: "data/catalog_cleaned.json",
  },
  treemap: {
    // text: "Contributors",
    svg: "#treemap-svg",
    dataUrl: "data/test.json",
  },
  statemap: {
    // text: "Map",
    svg: "#statemap-svg",
    dataUrl: ["data/stateCount.json", "data/us.json"], // array of data sources,
  },
  objects: {
    // text: "Home",
    svg: "#objects-svg",
    dataUrl: "data/test.json",
  },
};

// --------------------------------------------------------
// EVENT LISTENERS
// --------------------------------------------------------
// EXAMPLE FOR TIMEOUT
// setTimeout(() => {
//   setState(() => {
//     state.text = "Changed by setTimeout";
//   });
// }, 3000);

// --------------------------------------------------------
// LOAD DATA
// --------------------------------------------------------
function loadData(objectKey) {
  try {
    const object = state[objectKey];
    if (!object) {
      throw new Error(`Object "${objectKey}" not found in the state.`);
    }

    // If dataUrl is an array, load each dataset
    if (Array.isArray(object.dataUrl)) {
      const promises = object.dataUrl.map((url) => {
        return fetch(url).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        });
      });

      // Wait for all promises to resolve
      return Promise.all(promises)
        .then((data) => {
          // Expose the loaded data globally
          window[objectKey + "Data"] = data;

          // Return an object with the loaded data
          return { [objectKey]: data };
        })
        .catch((error) => {
          throw error;
        });
    } else {
      // If dataUrl is a single URL, load the dataset
      return fetch(object.dataUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // Expose the loaded data globally
          window[objectKey + "Data"] = data;

          // Return an object with the loaded data
          return { [objectKey]: data };
        })
        .catch((error) => {
          throw error;
        });
    }
  } catch (error) {
    console.error(`Error loading data for ${objectKey}:`, error.message);
    throw error;
  }
}

// --------------------------------------------------------
// GLOBAL DATA VARIABLES
// --------------------------------------------------------
// Define an array of object keys to loop through
const keysToLoad = Object.keys(state).filter((key) => key !== "data");

Promise.all(keysToLoad.map(loadData))
  .then((dataArray) => {
    // dataArray contains the loaded data for each object in order
    const allData = Object.assign({}, ...dataArray);
    console.log("All data globally:", allData);
    // Other actions with allData within this scope
  })
  .catch((error) => {
    console.error("Error loading data:", error.message);
  });
