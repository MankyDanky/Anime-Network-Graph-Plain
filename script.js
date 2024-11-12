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

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var MinPos = 0, MaxPos = 10000;
var selectedNode = "";
var elements = [
  { group: "nodes", data: { id: "1", title: "Cowboy Bebop" }, locked: true },
];
const visited = new Set(["1"]);
const queue = new Queue();
queue.enqueue("1");
console.log(queue.length);

var cy = cytoscape({
  container: document.getElementById("cy"),
  layout: {
    name: "grid",
    cols: 3,
  },
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
        height: 200,
        width: 200,
        "overlay-opacity": 0,
        "background-color": "#808080",
      },
    },
  ],
});

while (queue.length > 0) {
  console.log("here");
  let id = queue.dequeue();
  let recommendations;

  fetch("https://api.jikan.moe/v4/anime/" + id + "/recommendations")
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("API request failed");
      }
    })
    .then((data) => {
      recommendations = data["data"];
      for (let i = 0; i < recommendations.length; i++) {
        if (!visited.has(recommendations[i]["entry"]["mal_id"])) {
          visited.add(recommendations[i]["entry"]["mal_id"]);
          let element = {
            group: "nodes",
            data: {
              id: recommendations[i]["entry"]["mal_id"],
              title: recommendations[i]["entry"]["title"],
            },
            locked: true,
            position: {x : randomIntFromInterval(MinPos, MaxPos), y : randomIntFromInterval(MinPos, MaxPos)}
          };
          elements.push(element);
          console.log(elements);
          cy.add(element);
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

/*
cy.on("mouseover", "node", function(evt) {
  var node = evt.target;
  if (selectedNode != node.id) {
    var ani = node.animation({
      style: {
        "background-color": "#b0b0b0",
        "font-size": "25px",
        width: 250,
        height: 250
      },
      duration: 100
    });
    ani.play();
  }
});

cy.on("mouseout", "node", function(evt) {
  var node = evt.target;
  if (selectedNode != node.id) {
    console.log(node.id);
    console.log(selectedNode.id);
    var ani = node.animation ({
      style: {
        "background-color": "#808080",
        "font-size": "20px",
        width: 200,
        height: 200
      },
      duration: 100
    });
    ani.play();
  }
});

cy.on("select", "node", function(evt) {
  var node = evt.target;
  selectedNode = node.id;
  var ani = node.animation({
    style: {
      "background-color": "#479aff",
      "font-size": "30px",
      width: 300,
      height: 300
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
