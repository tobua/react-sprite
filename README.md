# ReactSprite

> Dynamic SVG Sprite Polyfill Component for React

The missing React Component to polyfill dynamic SVG sprite icons in IE11 and above.

## Installation

```
npm i react-sprite
```

## Usage

```jsx
import { render } from "react-dom";
import ReactSprite from "react-sprite";

render(<ReactSprite href={`sprite.svg#${"close"}`} />, document.body);
```

## Options

The following props are available on the component.

`href` required

Can be either a link to an inline sprite like `#arrow` or to an external sprite
with the URL in front `sprite.svg#arrow`.

`any` optional (className, onClick etc.)

Any other props can be passed to the component as well and will be added to the
top node.
