import React, { useRef, useMemo, useEffect } from 'react'
import request from 'xhr'

type Props = React.SVGProps<SVGSVGElement>

// Stores the sprites as queryable documents per URL.
const sprites = new Map<string, Document>()

// Creates a sprite document from the raw body contents that can later be
// queried for individual symbols.
const createDocumentFromSprite = (body) => {
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

const requestSprite = async (link: string) => {
  const [url, id] = link.split('#')

  const sprite = await new Promise((done) =>
    request(
      {
        uri: absuluteUrl(url),
      },
      (error, response, body) => {
        done(body)
      }
    )
  )

  sprites.set(url, createDocumentFromSprite(sprite))
}

// Whether the current environment requires the polyfill to insert the SVG from the sprite.
const shouldPolyfill = () => {
  const newerIEUA = /\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/
  const webkitUA = /\bAppleWebKit\/(\d+)\b/,
    olderEdgeUA = /\bEdge\/12\.(\d+)\b/
  const edgeUA = /\bEdge\/.(\d+)\b/
  const inIframe = window.top !== window.self

  return (
    newerIEUA.test(navigator.userAgent) ||
    (navigator.userAgent.match(olderEdgeUA) || [])[1] < 10547 ||
    (navigator.userAgent.match(webkitUA) || [])[1] < 537 ||
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
  forcePolyfill,
  ...props
}: Props & { forcePolyfill: boolean }) => {
  const ref = useRef(null)
  const polyfill = useMemo(() => forcePolyfill || shouldPolyfill(), [
    forcePolyfill,
  ])
  const { link } = validateProps({ href, xlinkHref })

  if (polyfill) {
    useEffect(() => {
      if (ref.current) {
        requestSprite(link)
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
