class Edge{
    constructor(start, end, width=5) {
        this.start = start
        this.end = end
        this.width = 5
    }

    processCoord(coord, origin) {
        const x = coord.x + origin.x
        const y = coord.y + origin.y
        return {x, y}
    }

    render(ctx, origin){
        let {x: sx, y: sy} = this.processCoord(this.start, origin)
        let {x: ex, y: ey} = this.processCoord(this.end, origin)
        ctx.beginPath()
        ctx.lineWidth = this.width
        ctx.moveTo(sx, sy)
        ctx.lineTo(ex, ey)
        ctx.stroke()
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