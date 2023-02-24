import { render, cleanup, mutable } from 'mutable-jsx'

function App() {
	const state = mutable({ counter: 0 }),
		timer = setInterval(() => state.counter++, 1000)
	cleanup(() => clearInterval(timer))

	return <div>{state.counter}</div>
}

render(App, document.getElementById('app'))
