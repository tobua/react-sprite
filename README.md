# ReactSprite

> Dynamic SVG Sprite Polyfill Component for React

```jsx
<ReactSprite href="sprite.svg#close" />
// Will be turned into
<svg>
  <use xlink:href="sprite.svg#close" />
</svg>
```

Not a whole lot 😛 but more importantly for browsers that do not support the use tag for SVG sprites the plugin will request and cache the sprite, query it for the relevant symbol and insert it manually into the DOM.

## Installation & Usage

```
npm i react-sprite
```

```jsx
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import ReactSprite from 'react-sprite'

const SimpleIcon = () => <ReactSprite href={`sprite.svg#${'close'}`} />

const StatefulIcon = () => {
  const [icon, toggleOpen] = useState('closed')

  return (
    <ReactSprite
      href={`sprite.svg#${icon}`}
      onClick={() => toggleOpen(icon === 'closed' ? 'open' : 'closed')}
    />
  )
}

const WithOptions = (props) => (
  <ReactSprite
    // Same as href.
    xlinkHref="sprite.svg#close"
    // Force use of polyfill even in browsers with support.
    force
    // Any other SVG element props will be passed over.
    viewBox="0 0 50 50"
    onClick={() => alert('Hello there!')}
    {...props}
  />
)

createRoot(document.body).render(
  <>
    <SimpleIcon />
    <StatefulIcon />
    <WithOptions className="my-icon" />
  </>
)
```
