# Mutable JSX

Experimental Reactive library focused on mutability. DOM Expressions is the Render Runtime to commit changes to the DOM (way faster than a Virtual DOM).

This is a work in progress. The goal is to use a Reactive Graph + DOM Expressions to provide a library with an API that I could modify to my needs.

## History

To achieve the goal I had to mash up many different repos to get something working that I could understand, modify and finally extend.

1. Started based on a version of mobx-jsx https://github.com/ryansolid/mobx-jsx
2. Replaced mobx with https://dev.to/ryansolid/building-a-reactive-library-from-scratch-1i0p . Run into issues with nested effects.
3. Replaced the article implementation with a pure JavaScript version of Solid Graph.
