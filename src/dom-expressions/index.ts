// Used by the compiler on dom expressions client.js

export {
	root, // used on render
	effect, // used to update stuff
	untrack, // used on directives "use:"
	createComponent, // used to create components

	// unused for now
	memo,
	mergeProps,
} from '../lib'

// local
export const sharedConfig = {}
export const getOwner = null
