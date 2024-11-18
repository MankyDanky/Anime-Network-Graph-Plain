import requests
import time
import json




data = []
graphed = set()
for i in range(8):
    response = requests.get("https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=" + str(i + 1))

    try:
        animes = response.json()["data"]
        for anime in animes:
            node = {}
            graphed.add(anime["mal_id"])
            node["group"] = "nodes"
            node["data"] = {"id": anime["mal_id"], "title": anime["titles"][0]["title"], "size": anime["members"]*300/5000000}
            data.append(node)
    except:
        print("API Error")
    time.sleep(1)

connected = {}

for i in range(200):
    id = data[i]["data"]["id"]
    print("https://api.jikan.moe/v4/anime/" + str(id) + "/recommendations")
    response = requests.get("https://api.jikan.moe/v4/anime/" + str(id) + "/recommendations")

    recommendations = response.json()["data"]
    for i, recommendation in enumerate(recommendations):
        toId = recommendation["entry"]["mal_id"]
        if toId in graphed and not ((toId + id) in connected):
            edge = {}
            edge["group"] = "edges"
            edge["data"] = {"source" : id, "target" : toId, "weight": i}
            data.append(edge)
    time.sleep(1)

with open ('data.json', 'w') as f:
    json.dump(data, f)

