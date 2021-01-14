class SortVisualiser {
	constructor (arr, radius, screen) {
		this.arr = arr
		this.radius = radius
		this.screen = screen
		this.nodeIds = []
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

	async _swap (i, j) {
		const idA = this.nodeIds[i]
		const idB = this.nodeIds[j]
		let coordA = this.screen.objects[idA].coord
		let coordB = this.screen.objects[idB].coord
		let center = {}
		let animation = []
		for (let dimension in coordA) {
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
		await this.screen.showAnimate(animation, {
			start: 0,
			end: 180,
			step: 5
		})
		let temp = this.screen.objects[idA]
		this.screen.objects[idA] = this.screen.objects[idB]
		this.screen.objects[idB] = temp
	}

	async _compare(i, j) {
		const idA = this.nodeIds[i]
		const idB = this.nodeIds[j]
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
				id: idA,
				anim: compareAnim({start, end, step})
			}
		)
		animation.push(
			{
				id: idB,
				anim: compareAnim({start, end, step})
			}
		)
		await this.screen.showAnimate(animation, {start, end, step})
		return this.screen.objects[idA].text > this.screen.objects[idB].text
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
			const start = 1
			const end = 10
			const step = 1
			const id = await this.screen.createObject(
				new node({x ,y}, ele, radius),
				_boomAnim({start, end, step}),
				{start, end, step})
			this.nodeIds.push(id)
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