
let elData;
let cy;
let selectedNode = "";

// Get elements from JSON data
fetch("elements.json")
  .then((res) => {
      if (!res.ok) {
          throw new Error
              (`HTTP error! Status: ${res.status}`);
      }
      return res.json();
  })
  .then((data)=> {
    elData = data;
    return data
  })
  .catch((error) => console.error("Unable to fetch data:", error));

// Show/hide info board
function toggleInfoBoard() {
  
  // Get icon and board to hide/display
  const icon = document.getElementById("icon");
  const board = document.getElementById("info");

  // Check whether board is being hidden or displayed
  if (selectedNode === "") {
    board.classList.remove("displayed");
    icon.classList.remove("displayed");
    
  } else {
    // Get necessary html elements
    
    const title = document.getElementById("infoTitle");
    const popularityRank = document.getElementById("popularityRank");
    const score = document.getElementById("score");
    const genres = document.getElementById("genres");
    
    // Get necessary anime information
    fetch("https://api.jikan.moe/v4/anime/" + selectedNode)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("API request failed");
      }
    })
    .then((data) => {
      // Update board information
      if (selectedNode != "") {
        board.classList.add("displayed");
        icon.classList.add("displayed");
      }
      title.innerHTML=data["data"]["titles"][0]["title"];
      popularityRank.innerHTML=data["data"]["popularity"];
      let genresText = "";
      let genresNumber = data["data"]["genres"].length;
      for (let i = 0; i < genresNumber; i++) {
        genresText +=  data["data"]["genres"][i]["name"]
        if (i < genresNumber-1) {
          genresText += ", ";
        }
      }
      genres.innerHTML=genresText;
      score.innerHTML=data["data"]["score"];
      icon.src=data["data"]["images"]["jpg"]["image_url"];
    })
    .catch((error) => {
      console.error(error);
    })
  }
}

// Sleep to prevent fetch request errors
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Create graph after two seconds
sleep(2000).then(() => {
  //let graphedAnime = new Set();
  //let connectedAnime = new Set();
  // Create graph
  cy = cytoscape({
    container: document.getElementById("cy"),
    // Graph layout
    layout: {
      name: 'cose',
      ready: function(){},
      stop: function(){},
      animate: true,
      animationEasing: undefined,
      animationDuration: undefined,
      animateFilter: function ( node, i ){ return true; },
      animationThreshold: 250,
      refresh: 20,
      fit: true,
      padding: 30,
      boundingBox: undefined,
      nodeDimensionsIncludeLabels: false,
      randomize: true,
      componentSpacing: 100,
      nodeRepulsion: function( node ){ return 300000; },
      nodeOverlap: 1000,
      idealEdgeLength: function( edge ){ return 0},
      edgeElasticity: function( edge ){ return 32; },
      nestingFactor: 1.2,
      gravity: 1,
      numIter: 2000,
      initialTemp: 2000,
      coolingFactor: 0.99,
      minTemp: 1.0
    },
    // Graph style
    style: [
      {
        selector: "node",
        style: {
          label: "data(title)",
          "font-family": "Trebuchet MS",
          "font-size": function(node){return node.data("size")/10},
          "font-weight": "bold",
          "text-valign": "center",
          "text-halign": "center",
          color: "white",
          "text-outline-color": "black",
          "text-outline-width": 1,
          height: "data(size)",
          width: "data(size)",
          "overlay-opacity": 0,
          "background-color": "#808080",
          "transition-property": "background-color",
          'transition-duration': 0.5,
          "transition-timing-function": "ease",
        },
      },
      {selector: "edge",
        style: {
          "overlay-opacity": 0,
          "line-color": "#808080",
          "width": function(edge){
            return 10 - edge.data("weight")
          },
          "overlay-opacity": 0
        },
      },
      {
        selector: 'edge:selected',
        style: {
          'line-color': "#808080",
        }
      },
      {
        selector: 'node.hover',
        style: {
          "transition-property": "background-color",
          'transition-duration': 0.5,
          "transition-timing-function": "ease",
          "background-color": "#adadad",
          "font-size": function(node){return node.data("size")*0.125},
          "width": function (node) {return node.data("size")*1.25},
          "height": function (node) {return node.data("size")*1.25},
        }
      },
      {
        selector: 'node:selected',
        style: {
          "transition-property": "background-color",
          'transition-duration': 0.5,
          "transition-timing-function": "ease",
          "background-color": "#479aff",
          "font-size": function(node){return node.data("size")*0.15},
          "width": function (node) {return node.data("size")*1.5},
          "height": function (node) {return node.data("size")*1.5},
        }
      }
    ],
    elements: elData
  });

  // Node selection and hover responses
  cy.on("mouseover", "node", function(evt) {
    let node = evt.target;
    node.addClass("hover");
  });
  
  cy.on("mouseout", "node", function(evt) {
    let node = evt.target;
    node.removeClass("hover");
    
  });
  
  cy.on("select", "node", function(evt) {
    let node = evt.target;
    sleep(250).then(()=>{
      selectedNode = node.data("id");
      toggleInfoBoard();
    })
  });
  
  cy.on("unselect", "node", function(evt) {
    selectedNode = "";
    toggleInfoBoard();
  });

})


/*
// Recursive add page function
function addPage(p) {
  // Make API requrest for top anime on given page
  fetch("https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=" + p.toString())
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("API request failed");
    }
  })
  .then((data) => {
    // Get array of anime
    let anime = data["data"];
    
    // Iterate over each anime
    for (let i = 0; i < anime.length; i++) {
      // Add the given anime to the graph
      let element = {
        group: "nodes",
        data: {
          id: anime[i]["mal_id"],
          title: anime[i]["titles"][0]["title"],
          size: anime[i]["members"]/5000000*300
        }
      };

      // Connect anime after delay
      sleep(8000 + i * p * 4000).then(()=> {
        addRelations(anime[i]["mal_id"])
      });

      // Add element to graph
      graphedAnime.add(anime[i]["mal_id"]);
      elements.push(element);
    }
  })
  .catch((error) => {
    console.error(error);
  });

  // Add next page
  sleep(1000).then(()=> {
    if (p < 8) {
      addPage(p+1);
      console.log("Next page")
    }
    else
    { 
      console.log(elements)
      console.log("Done adding pages, will add graph in 10 minutes")
      sleep(4000*201).then(()=> {
        createGraph()
        console.log(elements)
      });
    }
  });
}

// Add first page
addPage(1);

// Add edge data 
function addRelations(id) {
  fetch("https://api.jikan.moe/v4/anime/" + id + "/recommendations")
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("API request failed");
    }
  })
  .then((data) => {
    // Get array of connected anime
    let relatedAnime = data["data"];
    
    // Iterate over each anime
    for (let i = 0; i < Math.min(relatedAnime.length, 10); i++) {
      if (graphedAnime.has(relatedAnime[i]["entry"]["mal_id"]) && !connectedAnime.has(relatedAnime[i]["entry"]["mal_id"])) {
        // Add the given anime to the graph
        let edge = {
          group: "edges",
          data: {
            source: id,
            target: relatedAnime[i]["entry"]["mal_id"],
            "weight": i
          }
        };
        // Add edge to graph
        elements.push(edge);
      }
    }
    connectedAnime.add(id)
  })
  .catch((error) => {
    console.error(error);
  });
}
*/