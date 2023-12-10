// REFERENCES
// Lab 08: Interactivity
// MANAGAING STATES WITH VANILLA JS; source: https://www.youtube.com/watch?v=2DV-bONIPqQ (July 6, 2021)

// --------------------------------------------------------
// GLOBAL VARIABLES
// --------------------------------------------------------
let CATALOG;
let TREEMAP;
let STATEMAP;
let OBJECTS;

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
    dataUrl: "data/IoAD_merged_geo_data.json",
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

// Promise.all(keysToLoad.map(loadData))
//   .then((dataArray) => {
//     // dataArray contains the loaded data for each object in order
//     const allData = Object.assign({}, ...dataArray);
//     console.log("All data globally:", allData);
//     // Other actions with allData within this scope
//   })
//   .catch((error) => {
//     console.error("Error loading data:", error.message);
//   });

async function loadDataAsync() {
  try {
    const dataArray = await Promise.all(keysToLoad.map(loadData));
    const allData = Object.assign({}, ...dataArray);
    console.log("All data globally:", allData);
    CATALOG = allData.catalog;
    TREEMAP = allData.treemap;
    STATEMAP = allData.statemap;
    OBJECTS = allData.objects;

    // Call a function or callback here
    handleGlobalData();
  } catch (error) {
    console.error("Error loading data:", error.message);
  }
}

// Call the async function
loadDataAsync();

// ...

// Define your function to handle the global data
function handleGlobalData() {
  console.log("GLOBAL CATALOG:", CATALOG);
  console.log("GLOBAL TREEMAP:", TREEMAP);
  console.log("GLOBAL STATEMAP:", STATEMAP);
  console.log("GLOBAL OBJECTS:", OBJECTS);
}
