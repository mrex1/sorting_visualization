class node{
	constructor(coord, text, radius, lineWidth = 3){
		this.text = text
		this.coord = coord
		this.strokeColor = 'black'
		this.radius = radius - lineWidth
		this.lineWidth = lineWidth
		if(text < 100) {
			this.color = `rgba(0, 125, 255, ${(100 - text) / 100})`
		} else {
			text %= 100
			this.color = `rgba(255, 125, 0, ${text / 100})`
		}
	}

	processCoord(coord, origin) {
        const x = coord.x + origin.x
        const y = coord.y + origin.y
        return {x, y}
    }
	
	render(ctx, origin){
		ctx.beginPath()
		const {x, y} = this.processCoord(this.coord, origin)
		ctx.fillStyle = this.color
		ctx.lineWidth = this.lineWidth
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
