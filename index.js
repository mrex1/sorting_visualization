class node{
	constructor(coord, text, radius){
		this.text = text
		this.coord = coord
		this.strokeColor = 'black'
		this.radius = radius
		if(text < 100) {
			this.color = `rgba(0, 125, 255, ${(100 - text) / 100})`
		} else {
			text %= 100
			this.color = `rgba(255, 125, 0, ${text / 100})`
		}
	}
	
	render(ctx){
		ctx.beginPath()
		const {x, y} = this.coord
		ctx.fillStyle = this.color
		ctx.lineWidth = 4
		ctx.arc(x, y, this.radius, 0, 2 * Math.PI)
		ctx.fill()
		ctx.strokeStyle = ctx.fillStyle = this.strokeColor
		ctx.stroke()
		ctx.font = `${this.radius}px Arial`
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.fillText(this.text, x, y)
	}
	
	update(anim, t){
		const params = anim(t, this)
		for (let param in params) {
			if (params[param] && param in this) {
				this[param] = params[param]
			}
		}
	}
}

class screen{
	constructor(dimensions){
		this.canvas = document.querySelector('canvas#screen')
		this.dimensions = dimensions
		this.nodes = []
	}
	
	_sleep(t){
		return new Promise( (res, rej) => {
			setTimeout(res, t)
		})
	}
	
	_boomAnim({start, end, step}) {
		return (t, currentState) => {
			let {radius} = currentState
			if (t === start) {
				radius *= (t / end)
			} else {
				radius = radius * t / (t - step)
			}
			return {radius}
		}
	}
	
	_lightUpAnim(color){
		const rgb = color.replace(/[rgba() ]/g, '').split(',')
		return (t, currentState) => {
			const color = `rgba(${rgb[0]* t/10}, ${rgb[1]* t/10}, ${rgb[2]* t/10}, ${rgb[3]* t/10})`
			return { color }
		}
	}
	
	async createNode(coord, text, radius){
		this.nodes.push(new node(coord, text, radius))
		const start = 1
		const end = 10
		const step = 1
		const createAnim = [{
			id: this.nodes.length - 1,
			anim: this._boomAnim({start, end, step})
		}]
		await this.showAnimate(createAnim,{start, end, step})
	}
	
	async lightUpNode(id, rgb) {
		const lightUpAnim = [{
			id,
			anim: this._lightUpAnim(rgb)
		}]
		await this.showAnimate(lightUpAnim,{
			start: 1,
			end: 10,
			step: 0.5
		})
	}
	
	clearScreen() {
		const ctx = this.canvas.getContext('2d')
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}

	reset() {
		this.clearScreen()
		this.nodes = []
	}
	
	render() {
		const ctx = this.canvas.getContext('2d')
		this.clearScreen()
		for(let n of this.nodes){
			const {x, y} = n.coord
			n.render(ctx)
		}
	}
	
	updateNode(id, anim, t){
		this.nodes[id].update(anim, t)
	}
	
	async showAnimate(animCollection, timeFrame){
		const {start, end, step} = timeFrame
		for(let t=start; t<=end; t+=step){
			for(let anim of animCollection){
				this.updateNode(anim.id, anim.anim, t)
			}
			this.render()
			await this._sleep(1)
		}
	}
}

const myscreen = new screen()


class SortVisualiser {
	constructor (arr, radius) {
		this.arr = arr
		this.radius = radius
	}
	
	_rotate(t, coord, center) {
		let square = v => (v*v)
		t %= 180
		let r = (coord, center) => Math.sqrt(square(coord.x - center.x) + square(coord.y - center.y))
		let dx =  r(coord, center) * Math.cos(t/180*Math.PI)
		let	dy = r(coord, center) * Math.sin(t/180*Math.PI)
		dx = Math.abs(dx)
		dy = Math.abs(dy)
		dx = dx < 0.000001 ? 0 : dx
		dy = dy < 0.000001 ? 0 : dy
		let {x, y} = center
		if (coord.x < x && coord.y >= y) {
			x -= dx
			y += dy
		} else if (coord.x >= x && coord.y > y) {
			x += dx
			y += dy
		} else if (coord.x > x && coord.y <= y) {
			x += dx
			y -= dy
		} else if (coord.x <= x && coord.y < y) {
			x -= dx
			y -= dy
		}
		return {coord: {x, y}}
	}

	async _swap (idA, idB) {
		let coordA = myscreen.nodes[idA].coord
		let coordB = myscreen.nodes[idB].coord
		let center = {}
		let animation = []
		for (let dimension in coordA) {
			if (!(dimension in coordB)) {
				console.error('inconsistent dimensions of the given coordinates')
				return
			}
			center[dimension] = (coordA[dimension] + coordB[dimension]) / 2
		}
		const swapAnim = (t, currentState) => {
			const {coord} = currentState
			return this._rotate(t, coord, center)
		}
		animation.push(
			{
				id: idA,
				anim: swapAnim
			}
		)
		animation.push(
			{
				id: idB,
				anim: swapAnim
			}
		)
		await myscreen.showAnimate(animation, {
			start: 0,
			end: 180,
			step: 5
		})
		let temp = myscreen.nodes[idA]
		myscreen.nodes[idA] = myscreen.nodes[idB]
		myscreen.nodes[idB] = temp
	}

	async _compare(i, j) {
		let animation = []
		const start = 1
		const end = 10
		const step = 1
		const compareAnim = ({start, end, step}) => (t, currentState) => {
			const {coord, color} = currentState
			let nextCoord = coord
			const range = end - start + step
			if (t <= range / 2) {
				nextCoord.y -= step / range * 200
			} else {
				nextCoord.y += step / range * 200
			}
			const rgb = color.split(',').slice(0, 3).join(',')
			const a = color.split(',')[3].replace(/[, )]/g, '')
			const newa = t === start ? (a * t / end) : (a * (t / (t - step)))
			return {
				color: rgb + `, ${newa})`,
				coord: nextCoord
			}
		}
		animation.push(
			{
				id: i,
				anim: compareAnim({start, end, step})
			}
		)
		animation.push(
			{
				id: j,
				anim: compareAnim({start, end, step})
			}
		)
		await myscreen.showAnimate(animation, {start, end, step})
		return myscreen.nodes[i].text > myscreen.nodes[j].text
	}
		
	async createNodes () {
		const { arr, radius } = this
		const numOfNodes = arr.length
		const leftPadding = 5
		const lineWidth = 4
		for (let i = 0 ; i < numOfNodes ; i++) {
			let ele = arr[i]
			let x = radius + 2 * i * radius + lineWidth * 2 * i + leftPadding
			let y = 15 * radius
			await myscreen.createNode({x ,y}, ele, radius)
		}
	}
	
	async selectionSort () {
		const numOfNodes = this.arr.length
		for (let i = 0 ; i < numOfNodes ; i++) {
			for (let j = i + 1 ; j < numOfNodes ; j++) {
				if (await this._compare(i, j)) {
					await this._swap(i, j)
				}
			}
		}
	}
	
	async quickSort (start, end) {
		if (end === undefined && start === undefined) {
			start = 0
			end = start + this.arr.length - 1
		}
		const length = end - start + 1
		if (length <= 1) {
			return
		}
		let j;
		let pivot = end
		for (let i = start ; i < pivot ; i++) {
			if (await this._compare(i, pivot)) {
				if (j === undefined) {
					j = i
				}
			} else {
				if (j !== undefined) {
					await this._swap(i, j)
					j++
				}
			}
		}
		if (j !== undefined) {
			await this._swap(pivot, j)
			pivot = j
		}
		await this.quickSort(start, pivot - 1)
		await this.quickSort(pivot + 1, end)
	}
}

let locked = false
let arr = []
let sv
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

async function _genArr() {
	myscreen.reset()
	arr = []
	for(let i = 0 ; i < numOfNodes ; i++){
		arr.push(parseInt(Math.random() * 200))
	}
	sv = new SortVisualiser(arr, r)
	await sv.createNodes()
}

async function _quicksort() {
	if (arr.length > 0) {
		await sv.quickSort()
	}
}

async function _selectionSort() {
	if (arr.length > 0) {
		await sv.selectionSort()
	}
}

const genArr = lock(_genArr)
const quicksort = lock(_quicksort)
const selectionSort = lock(_selectionSort)
