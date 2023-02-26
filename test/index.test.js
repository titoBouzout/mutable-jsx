import { root, mutable, effect } from 'mutable-jsx'

let m = mutable({ message: 'hello' })

root(() => {
	effect(() => {
		console.log('-----------')
		console.log('message', m.message)
		effect(() => {
			console.log('message', m.message)
		})
	})
})

setInterval(() => {
	m.message = 'hola 5a'
}, 2000)
