let locked = false
let arr = []
let zoomRatio = 0.3
let sv
let myscreen = new Myscreen({height: 500, width: 500}, zoomRatio)
let numOfVertices = 3
document.querySelector('input#numOfVertices').value = numOfVertices
const r = 40
const numOfNodes = 10

function disableBtn(on) {
	document.querySelectorAll('button').forEach(
		(b) => {
			b.disabled = on
		}
	)
}

function lock(f) {
	return async () => {
		if (locked) {
			return
		}
		locked = true
		disableBtn(locked)
		await f()
		locked = false
		disableBtn(locked)
	}
}

function zoom(screen, ratio) {
	zoomRatio = ratio
    screen.zoom(zoomRatio)
    screen.render()
}

async function genArr() {
	myscreen.reset()
	arr = []
	for(let i = 0 ; i < numOfNodes ; i++){
		arr.push(parseInt(Math.random() * 200))
	}
	sv = new SortVisualiser(arr, r, myscreen)
	await sv.createNodes()
}

async function _quicksort() {
	await genArr()
	await sv.quickSort()
}

async function _selectionSort() {
	await genArr()
	await sv.selectionSort()
}

async function _genGraph() {
	if (numOfVertices <= 0) {
		alert('invalid number of vertices')
		return
	}
	myscreen.reset()
	const adjacency_list = generateCompleteGraph(numOfVertices)
	await drawUndirectedGraph(adjacency_list, myscreen, 80, 20)
}

function _zoomIn() {
	zoomRatio += 0.01
	zoom(myscreen, zoomRatio)
}

function _zoomOut() {
	if (zoomRatio == 0) return
	zoomRatio -= 0.01
	zoom(myscreen, zoomRatio)
}

function getVerticesNum(input) {
	if (input.value !== '') {
		input.value = parseInt(input.value)
		numOfVertices = input.value
	}
}

const quicksort = lock(_quicksort)
const selectionSort = lock(_selectionSort)
const genGraph = lock(_genGraph)
const zoomIn = lock(_zoomIn)
const zoomOut = lock(_zoomOut)