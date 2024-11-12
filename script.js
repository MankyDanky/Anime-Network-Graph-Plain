import { generateRandGraph } from "./utils/testing-tools.js";
import { randomIntFromInterval } from "./utils/math-tools.js";

// Sleep to prevent API request errors
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Queue {
  constructor() {
    this.items = {};
    this.frontIndex = 0;
    this.backIndex = 0;
    this.length = 0;
  }
  enqueue(item) {
    this.items[this.backIndex] = item;
    this.backIndex++;
    this.length++;
    return item + " inserted";
  }
  dequeue() {
    const item = this.items[this.frontIndex];
    delete this.items[this.frontIndex];
    this.frontIndex++;
    this.length--;
    return item;
  }
  peek() {
    return this.items[this.frontIndex];
  }
  get printQueue() {
    return this.items;
  }
}

var MinPos = 0,
  MaxPos = 10000;
var selectedNode = "";
var elements = [
  {
    group: "nodes",
    data: { id: "whatever", title: "Cowboy" },
    locked: true,
  },
];

// Create graph
var cy = cytoscape({
  container: document.getElementById("cy"),
  layout: {
    name: "grid",
    cols: 3,
  },

  // Graph style
  style: [
    {
      selector: "node",
      style: {
        label: "data(title)",
        "font-family": "Trebuchet MS",
        "font-size": "20px",
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
});

// Recursive add page function
function addPage(p) {
  // Make API requrest for top anime on given page
  fetch(
    "https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=" +
      p.toString()
  )
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
      console.log(anime);
      // Iterate over each anime
      for (let i = 0; i < anime.length; i++) {
        // Add the given anime to the graph
        let element = {
          group: "nodes",
          data: {
            id: anime[i]["mal_id"],
            title: anime[i]["titles"][0]["title"],
            size: (anime[i]["members"] / 5000000) * 300,
          },
          locked: true,
          position: {
            x: randomIntFromInterval(MinPos, MaxPos),
            y: randomIntFromInterval(MinPos, MaxPos),
          },
        };

        // Add element to elements array
        elements.push(element);
      }
    })
    .catch((error) => {
      console.error(error);
    });
  sleep(2000).then(() => {
    if (p < 8) {
      addPage(p + 1);
    } else {
      cy.add(elements);
    }
  });
}

function makeCyInteractive() {
  cy.on("mouseover", "node", function (evt) {
    var node = evt.target;
    if (selectedNode != node.id) {
      var ani = node.animation({
        style: {
          "background-color": "#b0b0b0",
          "font-size": "25px",
          width: 250,
          height: 250,
        },
        duration: 100,
      });
      ani.play();
    }
  });

  cy.on("mouseout", "node", function (evt) {
    var node = evt.target;
    if (selectedNode != node.id) {
      console.log(node.id);
      console.log(selectedNode.id);
      var ani = node.animation({
        style: {
          "background-color": "#808080",
          "font-size": "20px",
          width: 200,
          height: 200,
        },
        duration: 100,
      });
      ani.play();
    }
  });

  cy.on("select", "node", function (evt) {
    var node = evt.target;
    selectedNode = node.id;
    var ani = node.animation({
      style: {
        "background-color": "#479aff",
        "font-size": "30px",
        width: 300,
        height: 300,
      },
      duration: 100,
    });
    ani.play();
  });

  cy.on("unselect", "node", function (evt) {
    var node = evt.target;
    selectedNode = "";
    var ani = node.animation({
      style: {
        "background-color": "#808080",
      },
      duration: 100,
    });
    ani.play();
  });
}
