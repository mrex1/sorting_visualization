function _sleep(t) {
    return new Promise((res, rej) => {
        setTimeout(res, t)
    })
}

function _boomAnim({ start, end, step }) {
    return (t, currentState) => {
        let { radius } = currentState
        if (t === start) {
            radius *= (t / end)
        } else {
            radius = radius * t / (t - step)
        }
        return { radius }
    }
}

function _lightUpAnim(color) {
    const rgb = color.replace(/[rgba() ]/g, '').split(',')
    return (t, currentState) => {
        const color = `rgba(${rgb[0] * t / 10}, ${rgb[1] * t / 10}, ${rgb[2] * t / 10}, ${rgb[3] * t / 10})`
        return { color }
    }
}

function _extend({ start: startTime, endCoord, end: endTime }) {
    return (t, currentState) => {
        let { start, end } = currentState
        if (t === startTime) {
            end = start
        } else {
            const x = start.x + (endCoord.x - start.x) * t / endTime
            const y = start.y + (endCoord.y - start.y) * t / endTime
            end = { x, y }
        }
        return { end }
    }
}