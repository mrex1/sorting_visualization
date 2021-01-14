class Myscreen{
	constructor(dimensions, zoomRatio, origin={x: 0, y: 0}){
		this.canvas = document.querySelector('canvas#screen')
		this.dimensions = dimensions
		const {height, width} = this.dimensions
		this.canvas.setAttribute('style', `height: ${height}px; width: ${width}px`)
        this.zoom(zoomRatio)
        this.origin = origin
		this.objects = []
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
	
	async createObject(object, animation, {start, end, step}){
		this.objects.push(object)
		const id = this.objects.length - 1
		const createAnim = [{
			id,
			anim: animation
		}]
		await this.showAnimate(createAnim, {start, end, step})
		return id
	}

	clearScreen() {
		const ctx = this.canvas.getContext('2d')
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}

	reset() {
		this.clearScreen()
		this.ojects = []
	}
	
	render() {
		const ctx = this.canvas.getContext('2d')
		this.clearScreen()
		for(let o of this.objects){
			o.render(ctx, this.origin)
		}
	}
	
	updateObject(id, anim, t){
		this.objects[id].update(anim, t)
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