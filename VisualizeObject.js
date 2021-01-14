/**
 * base class for objects on canvas
 */
class VisualizeObject {
    render(ctx, origin) { }

	processCoord(coord, origin) {
        const x = coord.x + origin.x
        const y = coord.y + origin.y
        return {x, y}
    }
    
    update(anim, t) {
        const params = anim(t, this)
        for (let param in params) {
            if (params[param] && param in this) {
                this[param] = params[param]
            }
        }
    }
}