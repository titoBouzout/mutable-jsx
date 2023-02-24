import {
	autorun,
	computed,
	untracked,
	$mobx,
	observable,
	action,
} from 'mobx'

export { untracked as untrack }

let globalContext = null
export class Component {
	constructor(props) {
		this.props = props
	}
	render(props) {
		return props.children
	}
}
Component.prototype.isClassComponent = true

export function mergeProps() {}

export function root(fn) {
	let d, ret
	globalContext = {
		disposables: (d = []),
		owner: globalContext,
	}
	ret = untracked(() =>
		fn(() => {
			let k, len
			for (k = 0, len = d.length; k < len; k++) d[k]()
			d = []
		}),
	)
	globalContext = globalContext.owner
	return ret
}
export function cleanup(fn) {
	let ref
	;(ref = globalContext) != null && ref.disposables.push(fn)
}
export function effect(fn, current) {
	const context = {
			disposables: [],
			owner: globalContext,
		},
		cleanupFn = final => {
			const d = context.disposables
			context.disposables = []
			for (let k = 0, len = d.length; k < len; k++) d[k]()
			final && dispose()
		},
		dispose = autorun(() => {
			cleanupFn(false)
			const prev = globalContext
			globalContext = context
			current = fn(current)
			globalContext = prev
		})
	cleanup(() => cleanupFn(true))
}

// only updates when boolean expression changes
export function memo(fn, equal) {
	const o = observable.box(),
		update = action(r => o.set(r))
	effect(prev => {
		const res = fn()
		;(!equal || prev !== res) && update(res)
		return res
	})
	return () => o.get()
}
export function createSelector(source, fn = (a, b) => a === b) {
	let subs = new Map()
	let v
	effect(p => {
		v = source()
		const keys = [...subs.keys()]
		for (let i = 0, len = keys.length; i < len; i++) {
			const key = keys[i]
			if (fn(key, v) || (p !== undefined && fn(key, p))) {
				const o = subs.get(key)
				o.set(null)
			}
		}
		return v
	})
	return key => {
		let l
		if (!(l = subs.get(key))) subs.set(key, (l = observable.box()))
		l.get()
		l._count ? l._count++ : (l._count = 1)
		cleanup(() => (l._count > 1 ? l._count-- : subs.delete(key)))
		return fn(key, v)
	}
}
export function createComponent(Comp, props) {
	if (Comp.prototype && Comp.prototype.isClassComponent) {
		return untracked(() => {
			const comp = new Comp(props)
			return comp.render(props)
		})
	}
	return untracked(() => Comp(props))
}

// dynamic import to support code splitting
export function lazy(fn) {
	return props => {
		let Comp
		const result = observable.box(),
			update = action(component => result.set(component.default))
		fn().then(update)
		const rendered = computed(
			() => (Comp = result.get()) && untracked(() => Comp(props)),
		)
		return () => rendered.get()
	}
}
export function splitProps(props, ...keys) {
	const descriptors = Object.getOwnPropertyDescriptors(props),
		split = k => {
			const clone = {}
			for (let i = 0; i < k.length; i++) {
				const key = k[i]
				if (descriptors[key]) {
					Object.defineProperty(clone, key, descriptors[key])
					delete descriptors[key]
				}
			}
			return clone
		}
	return keys.map(split).concat(split(Object.keys(descriptors)))
}

// context api
export function createContext(defaultValue) {
	const id = Symbol('context')
	return {
		id,
		Provider: createProvider(id),
		defaultValue,
	}
}
export function useContext(context) {
	return lookup(globalContext, context.id) || context.defaultValue
}
export function lookup(owner, key) {
	return (
		owner &&
		((owner.context && owner.context[key]) ||
			(owner.owner && lookup(owner.owner, key)))
	)
}
export function resolveChildren(children) {
	if (typeof children === 'function') {
		const c = observable.box(),
			update = action(child => c.set(child))
		effect(() => update(children()))
		return () => c.get()
	}
	if (Array.isArray(children)) {
		const results = []
		for (let i = 0; i < children.length; i++) {
			let result = resolveChildren(children[i])
			Array.isArray(result)
				? results.push.apply(results, result)
				: results.push(result)
		}
		return results
	}
	return children
}
export function createProvider(id) {
	return function provider(props) {
		let rendered = observable.box(),
			update = action(() =>
				rendered.set(resolveChildren(props.children)),
			)
		effect(() => {
			globalContext.context = {
				[id]: props.value,
			}
			update()
		})
		return () => rendered.get()
	}
}

// Modified version of mapSample from S-array[https://github.com/adamhaile/S-array] by Adam Haile
export function map(list, mapFn) {
	let items = [],
		mapped = [],
		disposers = [],
		fn = typeof list === 'function',
		len = 0
	cleanup(() => {
		for (let i = 0, length = disposers.length; i < length; i++)
			disposers[i]()
	})
	return () => {
		let newItems = fn ? list() : list,
			i,
			j
		!fn && list[$mobx].atom_.reportObserved()
		return untracked(() => {
			let newLen = newItems.length,
				newIndices,
				newIndicesNext,
				temp,
				tempdisposers,
				start,
				end,
				newEnd,
				item

			// fast path for empty arrays
			if (newLen === 0) {
				if (len !== 0) {
					for (i = 0; i < len; i++) disposers[i]()
					disposers = []
					items = []
					mapped = []
					len = 0
				}
			} else if (len === 0) {
				for (j = 0; j < newLen; j++) {
					items[j] = newItems[j]
					mapped[j] = root(mapper)
				}
				len = newLen
			} else {
				temp = new Array(newLen)
				tempdisposers = new Array(newLen)

				// skip common prefix
				for (
					start = 0, end = Math.min(len, newLen);
					start < end && items[start] === newItems[start];
					start++
				);

				// common suffix
				for (
					end = len - 1, newEnd = newLen - 1;
					end >= start &&
					newEnd >= start &&
					items[end] === newItems[newEnd];
					end--, newEnd--
				) {
					temp[newEnd] = mapped[end]
					tempdisposers[newEnd] = disposers[end]
				}

				// remove any remaining nodes and we're done
				if (start > newEnd) {
					for (j = end; start <= j; j--) disposers[j]()
					const rLen = end - start + 1
					if (rLen > 0) {
						mapped.splice(start, rLen)
						disposers.splice(start, rLen)
					}
					items = newItems.slice(0)
					len = newLen
					return mapped
				}

				// insert any remaining updates and we're done
				if (start > end) {
					for (j = start; j <= newEnd; j++) mapped[j] = root(mapper)
					for (; j < newLen; j++) {
						mapped[j] = temp[j]
						disposers[j] = tempdisposers[j]
					}
					items = newItems.slice(0)
					len = newLen
					return mapped
				}

				// 0) prepare a map of all indices in newItems, scanning backwards so we encounter them in natural order
				newIndices = new Map()
				newIndicesNext = new Array(newEnd + 1)
				for (j = newEnd; j >= start; j--) {
					item = newItems[j]
					i = newIndices.get(item)
					newIndicesNext[j] = i === undefined ? -1 : i
					newIndices.set(item, j)
				}
				// 1) step through all old items and see if they can be found in the new set; if so, save them in a temp array and mark them moved; if not, exit them
				for (i = start; i <= end; i++) {
					item = items[i]
					j = newIndices.get(item)
					if (j !== undefined && j !== -1) {
						temp[j] = mapped[i]
						tempdisposers[j] = disposers[i]
						j = newIndicesNext[j]
						newIndices.set(item, j)
					} else disposers[i]()
				}
				// 2) set all the new values, pulling from the temp array if copied, otherwise entering the new value
				for (j = start; j < newLen; j++) {
					if (j in temp) {
						mapped[j] = temp[j]
						disposers[j] = tempdisposers[j]
					} else mapped[j] = root(mapper)
				}
				// 3) in case the new set is shorter than the old, set the length of the mapped array
				len = mapped.length = newLen
				// 4) save a copy of the mapped items for the next update
				items = newItems.slice(0)
			}
			return mapped
		})
		function mapper(disposer) {
			disposers[j] = disposer
			return mapFn(newItems[j], j)
		}
	}
}
