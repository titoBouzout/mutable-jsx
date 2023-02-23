export {
	root,
	cleanup,
	createSelector,
	Component,
	lazy,
	createContext,
	useContext,
	map,
	splitProps,
	untrack,
} from './lib'

import type { JSX } from 'dom-expressions/src/jsx'

export type Context = {
	id: symbol
	Provider: (props: any) => any
	defaultValue: unknown
}
export type FunctionComponent<P = {}> = (
	props: PropsWithChildren<P>,
) => JSX.Element

type ComponentConstructor<P> =
	| FunctionComponent<P>
	| (new (props: PropsWithChildren<P>) => JSX.Element)

export type ComponentProps<
	T extends keyof JSX.IntrinsicElements | ComponentConstructor<any>,
> = T extends ComponentConstructor<infer P>
	? P
	: T extends keyof JSX.IntrinsicElements
	? JSX.IntrinsicElements[T]
	: {}

type PropsWithChildren<P> = P & { children?: JSX.Element }

export * from 'dom-expressions/src/client'

export type { JSX } from 'dom-expressions/src/jsx'
