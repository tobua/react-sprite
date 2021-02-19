import React, { useRef, useMemo, useEffect, SVGProps } from 'react'
import request from 'xhr'

type Props = SVGProps<SVGSVGElement>

// Stores the sprites as queryable documents per URL.
const sprites = new Map<string, Document>()
// Contains the currently open sprite requests and the callbacks waiting for a sprite.
const requests = new Map<string, Array<(sprite: Document) => void>>()

// Creates a sprite document from the raw body contents that can later be
// queried for individual symbols.
const createDocumentFromSprite = (body: string) => {
  const spriteDocument = document.implementation.createHTMLDocument('')
  spriteDocument.body.innerHTML = body
  return spriteDocument
}

// Converts a URL to an absulte URL that can be used for an AJAX request.
const absoluteUrl = (url: string) => {
  const link = document.createElement('a')
  link.href = url
  return link.href
}

const insertSymbolFromSprite = (
  sprite: Document,
  node: HTMLElement,
  id: string
) => {
  const spriteSymbol = sprite.getElementById(id)
  const symbolChildren = spriteSymbol.childNodes
  const childrenCount = symbolChildren.length

  // Take over viewBox attribute from symbol to ensure proper display.
  if (spriteSymbol.hasAttribute('viewBox')) {
    node.setAttribute('viewBox', spriteSymbol.getAttribute('viewBox'))
  }

  // Remove previous polyfill if there's one.
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }

  for (let i = 0; i < childrenCount; i += 1) {
    const currentNode = symbolChildren[i]
    // Not entirely clear where some of those Text nodes come from.
    if (currentNode && !(currentNode instanceof Text)) {
      node.appendChild(currentNode.cloneNode(true))
    }
  }
}

// Load the SVG sprite, and query it to get the symbol we want to polyfill in.
const requestSprite = async (link: string, node: HTMLElement) => {
  const [url, id] = link.split('#')

  if (sprites.has(url)) {
    insertSymbolFromSprite(sprites.get(url), node, id)
    return
  }

  if (requests.has(url)) {
    requests
      .get(url)
      .push((sprite: Document) => insertSymbolFromSprite(sprite, node, id))
    return
  }

  requests.set(url, [])

  request(
    {
      uri: absoluteUrl(url),
    },
    (error, _, sprite: string) => {
      if (error && process.env.NODE_ENV !== 'production') {
        console.warn(`ReactSprite: unable to load sprite from ${url}.`)
        requests.delete(url)
        return
      }

      const spriteDocument = createDocumentFromSprite(sprite)

      if (!sprites.has(url)) {
        sprites.set(url, spriteDocument)
      }

      const pending = requests.get(url)

      // Resolve other pending requests for this sprite.
      pending.forEach((done) => done(spriteDocument))

      insertSymbolFromSprite(spriteDocument, node, id)

      requests.delete(url)
    }
  )
}

// Whether the current environment requires the polyfill to insert the SVG from the sprite.
const shouldPolyfill = () => {
  const newerIEUA = /\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/
  const webkitUA = /\bAppleWebKit\/(\d+)\b/
  const olderEdgeUA = /\bEdge\/12\.(\d+)\b/
  const edgeUA = /\bEdge\/.(\d+)\b/
  const inIframe = window.top !== window.self

  return (
    newerIEUA.test(navigator.userAgent) ||
    Number((navigator.userAgent.match(olderEdgeUA) || [])[1]) < 10547 ||
    Number((navigator.userAgent.match(webkitUA) || [])[1]) < 537 ||
    (edgeUA.test(navigator.userAgent) && inIframe)
  )
}

const validateProps = ({ href, xlinkHref }: Props) => {
  const link = href ?? xlinkHref

  // No validation messages in production, just as development hints.
  if (process.env.NODE_ENV !== 'production') {
    if (typeof link !== 'string' || link.length < 1) {
      console.warn(`ReactSprite: invalid href provided (${link}).`)
    }
  }

  return {
    link,
  }
}

export default ({
  href,
  xlinkHref,
  force,
  ...props
}: Props & { force: boolean }) => {
  const ref = useRef(null)
  const polyfill = useMemo(() => force || shouldPolyfill(), [force])
  const { link } = validateProps({ href, xlinkHref })

  if (polyfill) {
    useEffect(() => {
      if (ref.current) {
        requestSprite(link, ref.current)
      }
    })
  }

  if (polyfill) {
    return <svg {...props} ref={ref} />
  }

  return (
    <svg {...props}>
      <use xlinkHref={link} />
    </svg>
  )
}
