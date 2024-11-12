import { randomIntFromInterval } from "./math-tools.js";

var minPos = 100,
  maxPos = 1000,
  maxSize = 100,
  minSize = 20;

export function generateRandGraph(num) {
  // generates an array of nodes and edges based on the cytoscape format
  // to be added to a cy object

  let nodes = [],
    edges = [];

  let Size = randomIntFromInterval(minSize, maxSize);
  // gernate an array of nodes, random position and random size
  for (let i = 0; i < num; i++) {
    nodes.push({
      group: "nodes",
      data: {
        id: i,
        title: i.toString(),
        size: 30, 
      },
    //   position: {
    //     x: randomIntFromInterval(minPos, maxPos),
    //     y: randomIntFromInterval(minPos, maxPos),
    //   },
      locked: false,
    });
  }

    // generate edges with random weight
    for (let i = 0; i < num; i++) {
      for (let j = i + 1; j < num; j += randomIntFromInterval(0, 4)) {
        let weight = 10000;
        edges.push({
          group: "edges",
          data: {
            source: i,
            target: j,
            weight: weight,
          },
        });
      }
    }

  return [...nodes, ...edges];
}
