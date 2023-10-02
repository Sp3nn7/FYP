import xml.dom.minidom as xml
import numpy as np
import copy
import json
doc = xml.parse("regions.kml")

places = doc.getElementsByTagName("Placemark")

topLeftSvg = [0,0]
bottomRightSvg = [890, 850]
topLeftGeo = [113.04078, -10.31995] # negated to match
bottomRightGeo = [154.2864, -43.85493]

pos = []


def transform(coord):
    coord = np.subtract(coord, topLeftGeo) # zero
    scale = np.divide(bottomRightSvg, np.subtract(bottomRightGeo, topLeftGeo))
    coord = np.multiply(coord, scale)
    if coord[1] < 300:
        coord = np.add(coord, [3, 27])
    if coord[1] > 700:
        coord = np.add(coord, [0, -3])
    else:
        coord = np.add(coord, [5, -13])
    if coord[1] > 790:
        coord = np.add(coord, [2, 5])
    
    return coord

# build test locations
for x in range(113, 154, 1):
    for y in range(-10, -44, -1):
        pos.append(list(transform([x,y])))

# Transform actual locations
newcoords = {}
for p in places:
    name = p.getElementsByTagName("name")[0].firstChild.nodeValue.strip().upper()
    coord = list(map(float, p.getElementsByTagName("coordinates")[0].firstChild.nodeValue.strip().split(',')))[:-1]
    svg_coord = transform(copy.deepcopy(coord))
    newcoords[name] = list(svg_coord)

json_object = json.dumps(newcoords, indent=4)
with open("../src/data/region_locs.json", "w") as outfile:
    outfile.write(json_object)
    outfile.close()

# latitude and logitude lines
# with open("test_locs.json", "w") as outfile:
#     # outfile.write(json.dumps(list(map(lambda p: newcoords[p], pos))))
#     outfile.write(json.dumps(pos))
#     outfile.close()