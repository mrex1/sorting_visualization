function generateCompleteGraph(numOfVertices) {
    let result = []
    for (let i = 0 ; i < numOfVertices ; i++) {
        let neighbours = []
        for (let j = i + 1 ; j < numOfVertices ; j++) {
            neighbours.push(j)
        }
        result.push(neighbours)
    }
    return result
}

function polygonCoordinates(screen, numOfVertices, radius, edgeLength) {
    // return a list of coordinates of the vertices of a polygon
    const coords = []
    if (numOfVertices <= 2) {
        for (let i = 0 ; i < numOfVertices ; i++) {
            const x = i * radius * 2 + edgeLength * i + radius
            const y = radius
            coords.push({x, y})
        }
    }
    const midPoint = screen.center
    const angle = Math.PI * 2 / numOfVertices
    const bigRadius = (edgeLength + 2 * radius) / Math.tan(angle/2)
    for (let i = 0 ; i < numOfVertices ; i++) {
        const dy = bigRadius * Math.sin(angle * i + Math.PI / 2)
        const dx = bigRadius * Math.cos(angle * i + Math.PI / 2)
        const x = midPoint.x - dx
        const y = midPoint.y - dy
        coords.push({x, y})
    }
    return coords
}

async function drawUndirectedGraph(adjacency_list, screen, radius, edgeLength) {
    const numOfVertices = adjacency_list.length
    const coords = polygonCoordinates(screen, numOfVertices, radius, edgeLength)
    for (let i = 0 ; i < numOfVertices ; i++) {
        const coord = coords[i]
        const text = i + 1
        const start = 1
        const end = 10
        const step = 1
        await screen.createObject(
            new node(coord, text, radius),
            _boomAnim({start, end, step}),
            {start, end, step})
    }
    let edgeList = []
    for (let i = 0 ; i < numOfVertices ; i++) {
        for (let j of adjacency_list[i]) {
            edgeList.push([Math.min(i, j), Math.max(i, j)])
        }
    }
    edgeList.sort((a, b) => {
        if (a[0] > b[0]) return 1
        if (a[0] < b[0]) return -1
        if (a[1] > b[1]) return 1
        return -1
    })
    //remove duplicate
    for (let i = 0 ; i < edgeList.length - 1 ; i++) {
        if (edgeList[i][0] == edgeList[i + 1][0] && edgeList[i][1] == edgeList[i + 1][1]) {
            edgeList.splice(i, 1)
        }
    }
    for (let edge of edgeList) {
        const startCoord = coords[edge[0]]
        const endCoord = coords[edge[1]]
        const start = 1
        const end = 10
        const step = 1
        await screen.createObject(new Edge(startCoord, endCoord),
            _extend({start, end, endCoord}),
            {start, end ,step})
    }
}