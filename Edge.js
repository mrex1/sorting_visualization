class Edge extends VisualizeObject {
    constructor(start, end, width = 5) {
        super()
        this.start = start
        this.end = end
        this.width = 5
    }

    render(ctx, origin) {
        let { x: sx, y: sy } = this.processCoord(this.start, origin)
        let { x: ex, y: ey } = this.processCoord(this.end, origin)
        ctx.globalCompositeOperation = 'destination-over'
        ctx.beginPath()
        ctx.lineWidth = this.width
        ctx.moveTo(sx, sy)
        ctx.lineTo(ex, ey)
        ctx.stroke()
        ctx.globalCompositeOperation = 'source-over'
    }
}