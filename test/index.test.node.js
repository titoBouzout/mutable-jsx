import { root, signal, effect } from '../dist/index.js'

root(() => {
	let [read, write] = signal('hello')
	effect(() => {
		console.log('-----------')
		console.log('message', read())
		effect(() => {
			console.log('message', read())
		})
	})

	setTimeout(() => {
		write('hola 5a')
	}, 2000)
})
