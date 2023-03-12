import { render, cleanup, signal, effect } from '../dist/index.js'

function Nada(props) {
	return <div>{props.children}</div>
}
function Nada2(props) {
	return <div>{props.test}</div>
}
function App() {
	const [counter, setCounter] = signal(1)
	const sum = () => double() + triple() + counter() * 4 + counter()
	const double = () => counter() * 2
	const triple = () => counter() * 3

	console.log('what?')

	effect(() => {
		console.log('FFF 1 what value changed to', counter())
	})

	effect(() => {
		console.log('FFF 2 value changed to', counter())
		effect(() => {
			console.log('FFF 3 value changed to', counter())
			effect(() => {
				console.log('FFF 4 value changed to', counter())
			})
		})
	})
	const timer = setTimeout(() => setCounter(2), 1000)

	cleanup(() => clearTimeout(timer))

	return (
		<div>
			<Nada>
				<Nada2 test="hello"></Nada2>
			</Nada>
			<div onmouseover={[console.log]}>
				value: {counter()} should be 2
			</div>
			<div>double: {double()} should be 4</div>
			<div>triple: {triple()} should be 6</div>
			<div>cuatro: {counter() * 4} should be 8</div>
			<div>sum: {sum()} should be should be 20</div>
		</div>
	)
}

render(App, document.getElementById('app'))
;(function refresh() {
	let cache = ''
	let url = document.querySelector('script').src
	setInterval(function () {
		fetch(url)
			.then(response => response.text())
			.then(data => {
				if (cache === '') cache = data
				if (data !== cache) {
					location.reload()
				}
			})
	}, 1000)
})()
