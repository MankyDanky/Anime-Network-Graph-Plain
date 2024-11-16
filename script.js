
var elData;
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

// Sleep to prevent API request errors
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

sleep(2000).then(() => {
  let selectedNode = "";
  //let graphedAnime = new Set();
  //let connectedAnime = new Set();
  
  // Create graph
  let cy = cytoscape({
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
        },
      },
    ],
    elements: elData
  });


  
  function createGraph() {
    let layout = cy.layout({
      name: "cose",
      animate: true,
      edgeElasticity: (edge) => edge.data("weight"),
    });
    layout.run();
  
    /* Saves json file after creatioj
    const JSONToFile = (obj, filename) => {
      const blob = new Blob([JSON.stringify(obj, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    JSONToFile(elements, 'elementsFile');*/
  }
  
  //createGraph()
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

// Interaction effects
/*
cy.on("mouseover", "node", function(evt) {
  var node = evt.target;
  if (selectedNode != node.id) {
    let size = node.data("size");
    var ani = node.animation({
      style: {
        "background-color": "#b0b0b0",
        "font-size": "25px",
        width: size*1.25,
        height: size*1.25
      },
      duration: 100
    });
    ani.play();
  }
});

cy.on("mouseout", "node", function(evt) {
  var node = evt.target;
  if (selectedNode != node.id) {
    let size = node.data("size");
    var ani = node.animation ({
      style: {
        "background-color": "#808080",
        "font-size": "20px",
        width: size,
        height: size
      },
      duration: 100
    });
    ani.play();
  }
});

cy.on("select", "node", function(evt) {
  var node = evt.target;
  selectedNode = node.id;
  let size = node.data("size");
  var ani = node.animation({
    style: {
      "background-color": "#479aff",
      "font-size": "30px",
      width: size*1.5,
      height: size*1.5
    },
    duration: 100
  });
  ani.play();
});

cy.on("unselect", "node", function(evt) {
  var node = evt.target;
  selectedNode = "";
  var ani = node.animation({
    style: {
      "background-color": "#808080"
    },
    duration: 100
  });
  ani.play();
});
*/
