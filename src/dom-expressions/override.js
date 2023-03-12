export function template(html, check, isSVG) {
	return {
		cloneNode: function (e) {
			console.log('override is working')
			const t = document.createElement('template')
			t.innerHTML = html
			if (
				'_DX_DEV_' &&
				check &&
				t.innerHTML.split('<').length - 1 !== check
			)
				throw `The browser resolved template HTML does not match JSX input:\n${t.innerHTML}\n\n${html}. Is your HTML properly formed?`
			const node = isSVG
				? t.content.firstChild.firstChild
				: t.content.firstChild

			this.cloneNode = node.cloneNode.bind(node)
			return this.cloneNode(e)
		},
	}
}
