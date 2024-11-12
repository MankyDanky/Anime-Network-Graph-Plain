class Queue {
  constructor() {
      this.items = {}
      this.frontIndex = 0
      this.backIndex = 0
      this.length = 0
  }
  enqueue(item) {
      this.items[this.backIndex] = item
      this.backIndex++
      this.length++
      return item + ' inserted'
  }
  dequeue() {
      const item = this.items[this.frontIndex]
      delete this.items[this.frontIndex]
      this.frontIndex++
      this.length--
      return item
  }
  peek() {
      return this.items[this.frontIndex]
  }
  get printQueue() {
      return this.items;
  }
}

var selectedNode = "";
var elements = [{ group: 'nodes', data: { id: "1", title: "Cowboy Bebop"}, locked: true}];
const visited = new Set(["1"]);
const queue = new Queue();
queue.enqueue("1");
console.log(queue.length);
while (queue.length > 0) {
  console.log("here");
  let id = queue.dequeue();
  let recommendations;

  fetch('https://api.jikan.moe/v4/anime/' + id + "/recommendations")
  .then(response => {
    if (response.ok) {
      return response.json()
    } else {
      throw new Error('API request failed');
    }
  })
  .then(data => {
    recommendations = data["data"];
    for (let i = 0; i < recommendations.length; i++) {
      if (!visited.has(recommendations[i]["entry"]["mal_id"])) {
        visited.add(recommendations[i]["entry"]["mal_id"]);
        elements.push({ group: 'nodes', data: { id: recommendations[i]["entry"]["mal_id"], title: recommendations[i]["entry"]["title"]}, locked: true})
      }
    }
    console.log(elements);
    cy.add(elements);
  })
  .catch(error => {
    console.error(error);
  });
}
fetch('https://api.jikan.moe/v4/anime/1')
  .then(response => {
    if (response.ok) {
      return response.json(); // Parse the response data as JSON
    } else {
      throw new Error('API request failed');
    }
  })
  .then(data => {
    // Process the response data here
    console.log(data["data"]["title"]); // Example: Logging the data to the console
  })
  .catch(error => {
    // Handle any errors here
    console.error(error); // Example: Logging the error to the console
  });


var cy = cytoscape({
  container: document.getElementById('cy'),
  layout: {
    name: 'grid',
    cols: 3
  },
  style: [{
    "selector": "node",
    "style": {
      "label": "data(title)",
      "font-family": "Trebuchet MS",
      "font-size": "20px",
      "font-weight": "bold",
      "text-valign": 'center',
      "text-halign": 'center',
      "color": "white",
      "text-outline-color": "black",
      "text-outline-width": 1,
      height: 200,
      width: 200,
      "overlay-opacity": 0,
      "background-color": "#808080",
  }}],
});

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