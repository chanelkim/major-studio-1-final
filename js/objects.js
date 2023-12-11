// Use objectsData
// if (window.objectsData !== undefined) {
//   console.log("objectsData is available");
// }
console.log("Using objectsData in otherScript:", window.objectsData);

// ********************************************************
// Objects
// references:
// ********************************************************
// // set the dimensions and margins of the graph
var margin = { top: 40, right: 40, bottom: 40, left: 40 };
// Get the dimensions of the user's screen
var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;

// Calculate the width and height of the chart area, taking into account the margins
var objWidth = screenWidth - margin.left - margin.right;
var objHeight = screenHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select(".objects-container")
  .append("svg")
  .attr("viewBox", "0 0 " + objWidth + " " + objHeight)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g");
//   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// // Select the button element by its ID
// const loadButton = document.getElementById("load-json-button");

// // Select the UL element for displaying the keys
// const keyList = document.getElementById("key-list");

// // Add a click event listener to the button
// loadButton.addEventListener("click", () => {
//   // Define the path to your JSON file
//   const jsonFilePath = "data/textLinks-results-v2.json";

//   // Use D3.js to load the JSON file
//   d3.json(jsonFilePath).then((data) => {
//     // Log the loaded JSON object to the console
//     console.log(data);

//     // Extract the keys of the JSON object
//     const keys = Object.keys(data[0]);

//     // Clear any previous content from the list
//     keyList.innerHTML = "";

//     // Create list items for each key and append them to the UL
//     keys.forEach((key) => {
//       const listItem = document.createElement("p");
//       listItem.textContent = key;
//       keyList.appendChild(listItem);
//     });
//   });
// });

// Load the JSON files
const stemmedWordsPath = "data/textLinks-results-v2.json";
const titlesDataPath = "data/IoAD_merged_geo_data.json";

// Create an array to store matched titles
const matchedTitles = [];

// Use D3.js to load the titles JSON file
d3.json(titlesDataPath).then((titlesData) => {
  console.log("Titles Data:", titlesData);

  // Use D3.js to load the stemmed words JSON file
  d3.json(stemmedWordsPath).then((stemmedWordsArray) => {
    console.log("Stemmed Words Array:", stemmedWordsArray);

    // Extract "Word" values from the stemmed words JSON and store them in a Set for efficient matching
    const stemmedWordsSet = new Set(
      stemmedWordsArray.map((item) => item.Word.toLowerCase())
    );

    // Loop through each title in the titles data
    titlesData.forEach((item) => {
      if (typeof item.title === "string") {
        const titleWords = item.title.toLowerCase().split(" "); // Split the title into words

        titleWords.forEach((word) => {
          const stemmedWord = word.toLowerCase();

          if (stemmedWordsSet.has(stemmedWord)) {
            matchedTitles.push({
              word: stemmedWord,
              name: item.attributioninverted,
              title: item.title,
              objectID: item.objectid,
              url: item.imagematch,
              beginyear: item.beginyear,
              endyear: item.endyear,
            });
          }
        });
      }
    });
    // Transform "matchedTitles" into an array of objects that resemble the expected structure
    const imagesData = matchedTitles.map((item) => ({
      beginyear: item.beginyear,
      endyear: item.endyear,
      wordMatch: item.word,
      id: item.objectID,
      artist: item.name,
      title: item.title,
      imagematch: item.url,
    }));
    // Log the matched titles
    displayImages(imagesData);
    console.log("imagesData: ", imagesData);
    console.log("Matched Titles:", matchedTitles);
  });
});

//---------------APP FUNCTION---------------
// this function creates all of our DOM elements
function displayImages(json) {
  // select a <div> with an id of "app"
  // this is where we want all of our images to be added
  let app = d3.select("#chart-objects").text("");

  // Sort the data first by wordMatch, then by objectID, and finally by title
  let data = json.sort((a, b) => {
    // Compare by wordMatch first
    if (a.wordMatch !== b.wordMatch) {
      return a.wordMatch.localeCompare(b.wordMatch);
    } else {
      // If wordMatch values are equal, sort by objectID
      if (a.id !== b.id) {
        return a.id - b.id;
      } else {
        // If objectIDs are equal, sort by title A-Z
        return a.title.localeCompare(b.title);
      }
    }
  });

  //---------------CARDS---------------
  // define "cards" for each item
  let card = app
    .selectAll("div.card")
    .data(data)
    .join("div")
    .attr("class", "card");
  // create a div with a class of "image" and populate it with an <img/> tag that contains our filepath
  card
    .append("div")
    .attr("class", "image")
    .append("img")
    .attr("src", (d) => {
      return d.imagematch;
    });

  // word match & object id
  card
    .append("p")
    .attr("class", "wordmatch")
    .html((d) => {
      return `Object ID: ${d.id}`;
    })
    .append("p")
    .attr("class", "wordmatch")
    .html((d) => {
      return `<strong>Word match: </strong><br><h1>${d.wordMatch}</h1>`;
    });

  card
    // object title
    .append("h4")
    .attr("class", "title")
    .html((d) => {
      return `${d.title}`;
    });

  card
    .append("p")
    .attr("class", "attributioninverted")
    .html((d) => {
      return `<strong>${d.artist}</strong>`;
    })
    .append("p")
    .attr("class", "years")
    .html((d) => {
      return `(${d.beginyear} - ${d.endyear})`;
    });
}

// // ---------- NATURAL LIBRARY (NPL) ----------
// // const natural = require("natural");

// // Load the JSON files
// const wordsDataPath = "data/textLinks-results-v2.json";
// const titlesDataPath = "data/IoAD.json";

// // Function to perform stemming on a word
// const stemWord = (word) => {
//   const stemmer = natural.PorterStemmer;
//   return stemmer.stem(word);
// };

// // Create a map of stemmed words
// const stemmedWords = new Map();

// // Use D3.js to load the JSON file for words
// d3.json(wordsDataPath).then((wordsData) => {
//   // Stem each word and store it in the map
//   wordsData.forEach((wordObject) => {
//     const word = wordObject.Word;
//     const stemmedWord = stemWord(word);
//     stemmedWords.set(stemmedWord, word);
//   });

//   // Use D3.js to load the JSON file for titles
//   d3.json(titlesDataPath).then((titlesData) => {
//     // Match the stemmed words with titles
//     const matchedTitles = [];

//     titlesData.forEach((title) => {
//       const titleWords = title.toLowerCase().split(" "); // Split the title into words

//       titleWords.forEach((word) => {
//         const stemmedWord = stemWord(word);
//         if (stemmedWords.has(stemmedWord)) {
//           const originalWord = stemmedWords.get(stemmedWord);
//           matchedTitles.push({
//             word: originalWord,
//             title: title,
//           });
//         }
//       });
//     });

//     // Log the matched titles
//     console.log(matchedTitles);
//   });
// });
