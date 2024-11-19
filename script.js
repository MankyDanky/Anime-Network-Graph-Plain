let elData;
let cy;
let selectedNode = "";

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
      let titleText = data["data"]["titles"][0]["title"];
      if (titleText.length > 30) {
        titleText = titleText.substring(0, 20) + " ...";
      }
      title.innerHTML=titleText;
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


console.log()

function main() {

  // Get elements from JSON data
  fetch("data.json")
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

  // Create graph after two seconds
  sleep(2000).then(() => {
    // Create graph
    cy = cytoscape({
      container: document.getElementById("cy"),
      // zoom levels
      zoom: 1,
      maxZoom: 5, // zoom in amount
      minZoom: 0.05, // zoom out amount
      // Graph layout
      layout: {
        name: 'cose',
          animate: false,
          animationEasing: 'ease-out',
          animationDuration: 1000,
          nodeRepulsion: 2000000,
          nodeOverlap: 1000000,
          idealEdgeLength: 1000,
          gravity: 0,
          initialTemp: 3000,
          randomize: true
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
            "transition-property": "background-color, font-size, visibility",
            'transition-duration': "0.1s",
            "transition-timing-function": "ease",
          },
        },
        {selector: "edge",
          style: {
            "overlay-opacity": 0,
            "line-color": "#808080",
            "width": function(edge){
              return 1.5/edge.data("weight")
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
          selector: 'node.neighbor',
          style: {
            "background-color": "#ebd834",
            "font-size": function(node){return node.data("size")*0.12},
            "width": function (node) {return node.data("size")*1.2},
            "height": function (node) {return node.data("size")*1.2},
          }
        },
        {
          selector: 'node.hover',
          style: {
            "background-color": "#adadad",
            "font-size": function(node){return node.data("size")*0.125},
            "width": function (node) {return node.data("size")*1.25},
            "height": function (node) {return node.data("size")*1.25},
          }
        },
        {
          selector: 'node:selected',
          style: {
            "background-color": "#479aff",
            "font-size": function(node){return node.data("size")*0.15},
            "width": function (node) {return node.data("size")*1.5},
            "height": function (node) {return node.data("size")*1.5},
          }
        },
        {
          selector: '.hidden',
          style: {
            visibility: "hidden",
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
      let neighbors = node.neighborhood('node');
      
      
      // Give enough time to hide board if a node is selected then redisplay board
      sleep(250).then(()=>{

        selectedNode = node.data("id");
        toggleInfoBoard();
        sleep(250).then(()=>{
          // get the neighbors of the selected node and highlight them
          
          
          
          for (let i=0;i<neighbors.length;i++){
            neighbors[i].addClass("neighbor");
          }
        });
      })
    });
    
    cy.on("unselect", "node", function(evt) {
      selectedNode = "";
      toggleInfoBoard();
      let node = evt.target;
      let neighbors = node.neighborhood('node');
      
      sleep(250).then(()=> {
        // de-highlight the neighboring nodes
        for (let i=0;i<neighbors.length;i++){
          neighbors[i].removeClass("neighbor");
        }
      });

    });

    // Lock nodes
    cy.autoungrabify(true);

    // Filter node visibility when search button clicked
    document.getElementById("searchButton").addEventListener("click", () => {
      let filterText = document.getElementById("searchText").value.toLowerCase();
      filterByText(filterText);
    })

    // Filter node visibility while typing
    let searchBox = document.getElementById("searchText");
    searchBox.addEventListener("keydown", () => {
      sleep(100).then(()=>{
        let filterText = searchBox.value.toLowerCase();
        filterByText(filterText);
      });
    });

    // Remove loading screen after content is done loading
    let loadingScreen = document.getElementById("loading");
    loadingScreen.classList.add("loaded");
    sleep(250).then(()=> {
      loadingScreen.remove();
    });

  })
}

// function for filtering node visibility with filtertext
function filterByText(filterText) {

  // if empty, show all
  if (filterText === "") {
    let elements = cy.elements();
    for (let i = 0; i < elements.length; i++) {
      elements[i].removeClass("hidden")
    }
  } else {

    // first remove all previous hidden attributes from nodes
    let elements = cy.elements();
    for (let i = 0; i < elements.length; i++) {
      elements[i].removeClass("hidden")
    }

    let hiddenNodes = new Set();
    let nodes = cy.nodes();
    
    // if the filter doesn't match any text in the alt. titles of the anime
    // the node will be hidden
    for (let i = 0; i < nodes.length; i++) {
      let titles = nodes[i].data("alternateTitles");
      if (!titles.toLowerCase().includes(filterText)) {
        hiddenNodes.add(nodes[i].data("id"))
        nodes[i].addClass("hidden")
      }
    }

    // if one of the nodes is hidden, the edge is also hidden
    let edges = cy.edges();
    for (let i = 0; i < edges.length; i++) {
      if (hiddenNodes.has(edges[i].data("target")) || hiddenNodes.has(edges[i].data("source"))) {
        edges[i].addClass("hidden")
      }
    }
  }
}


main();
