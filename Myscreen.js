class Myscreen{
	constructor(dimensions, zoomRatio, origin={x: 0, y: 0}){
		this.canvas = document.querySelector('canvas#screen')
		this.dimensions = dimensions
		const {height, width} = this.dimensions
		this.canvas.setAttribute('style', `height: ${height}px; width: ${width}px`)
        this.zoom(zoomRatio)
        this.origin = origin
		this.nodes = []
		this.edges = []
	}

	get center() {
		const y = this.canvas.height / 2
		const x = this.canvas.width / 2
		return {x, y}
	}
    
    shift(origin) {
        this.origin = origin
        this.render()
    }

	zoom (ratio) {
		ratio = 1 / ratio
		const {height, width} = this.dimensions
		this.canvas.height = height * ratio
		this.canvas.width = width * ratio
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

	_extend({start: startTime, endCoord, end: endTime}) {
		return (t, currentState) => {
			let {start, end} = currentState
			if (t === startTime) {
				end = start
			} else {
				const x = start.x + (endCoord.x - start.x) * t / endTime
				const y = start.y + (endCoord.y - start.y) * t / endTime
				end = {x, y}
			}
			return {end}
		}
	}
	
	async createNode(coord, text, radius){
		this.nodes.push(new node(coord, text, radius))
		const start = 1
		const end = 10
		const step = 1
		const createAnim = [{
			id: 'n' + (this.nodes.length - 1),
			anim: this._boomAnim({start, end, step})
		}]
		await this.showAnimate(createAnim,{start, end, step})
	}

	async createEdge(startCoord, endCoord) {
		this.edges.push(new Edge(startCoord, endCoord))
		const start = 1
		const end = 10
		const step = 1
		const createAnim = [{
			id: 'e' + (this.edges.length - 1),
			anim: this._extend({start, end, endCoord})
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
		this.edges = []
	}
	
	render() {
		const ctx = this.canvas.getContext('2d')
		this.clearScreen()
		for(let e of this.edges){
			e.render(ctx, this.origin)
		}
		for(let n of this.nodes){
			n.render(ctx, this.origin)
		}
	}
	
	updateObject(id, anim, t){
		const type = id.substr(0, 1)
		const index = id.substr(1)
		switch (type) {
			case 'n':
				this.nodes[index].update(anim, t)
				break
			case 'e':
				this.edges[index].update(anim, t)
				break
		} 
		
	}
	
	async showAnimate(animCollection, timeFrame){
		const {start, end, step} = timeFrame
		for(let t=start; t<=end; t+=step){
			for(let anim of animCollection){
				this.updateObject(anim.id, anim.anim, t)
			}
			this.render()
			await this._sleep(1)
		}
	}
}