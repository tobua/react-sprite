import React, { useRef, useMemo, useEffect } from 'react'
import request from 'xhr'

type Props = React.SVGProps<SVGSVGElement>

// Stores the sprites as queryable documents per URL.
const sprites = new Map<string, Document>()

// Creates a sprite document from the raw body contents that can later be
// queried for individual symbols.
const createDocumentFromSprite = (body: string) => {
  const spriteDocument = document.implementation.createHTMLDocument('')
  spriteDocument.body.innerHTML = body

  return spriteDocument
}

// Converts an URL to an absulte URL that can be used for an AJAX request.
const absuluteUrl = (url: string) => {
  const link = document.createElement('a')
  link.href = url
  return link.href
}

const insertSprite = (sprite: Document, node: HTMLElement, id: string) => {
  const symbol = sprite.getElementById(id)

  // Insert symbol contents into SVG ref.
  node.innerHTML = symbol.innerHTML

  // Take over viewBox attribute from symbol to ensure proper display.
  if (symbol.hasAttribute('viewBox')) {
    node.setAttribute('viewBox', symbol.getAttribute('viewBox'))
  }
}

// Load the SVG sprite, and query it to get the symbol we want to polyfill in.
const requestSprite = async (link: string, node: HTMLElement) => {
  const [url, id] = link.split('#')

  if (sprites.has(url)) {
    insertSprite(sprites.get(url), node, id)
    return
  }

  // TODO prevent multiple requests for the same sprite.
  request(
    {
      uri: absuluteUrl(url),
    },
    (error, _, sprite: string) => {
      if (error && process.env.NODE_ENV !== 'production') {
        console.warn(`ReactSprite: unable to load sprite from ${url}.`)
        return
      }

      const spriteDocument = createDocumentFromSprite(sprite)

      if (!sprites.has(url)) {
        sprites.set(url, spriteDocument)
      }

      insertSprite(spriteDocument, node, id)
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
