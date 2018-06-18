import React, {Component} from 'react'
import PropTypes from 'prop-types'
import request from 'request'

let browserPolyfill = 'unchecked'
const sprites = {}

/**
 * Checks if the current browser requires the polyfill. Result will be cached as
 * the browser cannot change.
 **/
const browserRequiresPolyfill = () => {
  if (browserPolyfill !== 'unchecked') {
    return browserPolyfill
  }

  const newerIEUA = /\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/
  const webkitUA = /\bAppleWebKit\/(\d+)\b/, olderEdgeUA = /\bEdge\/12\.(\d+)\b/
  const edgeUA = /\bEdge\/.(\d+)\b/
  const inIframe = window.top !== window.self

  browserPolyfill = (
    newerIEUA.test(navigator.userAgent) ||
    (navigator.userAgent.match(olderEdgeUA) || [])[1] < 10547 ||
    (navigator.userAgent.match(webkitUA) || [])[1] < 537 ||
    edgeUA.test(navigator.userAgent) &&
    inIframe
  )

  return browserPolyfill
}

/**
 * Converts an URL to an absulte URL that can be used for an AJAX request.
 **/
const getAbsuluteUrl = (url) => {
  const link = document.createElement('a')
  link.href = url
  return link.href
}

/**
 * Append the contents of the <symbol> tag to the ref node.
 **/
const appendToNode = (node, symbol) => {
  const symbolChildren = symbol.childNodes

  removeNodeContents(node)

  for (var i = 0; i < symbolChildren.length; i++) {
    node.appendChild(symbolChildren[i])
  }
}

/**
 * Removes the children of a node.
 **/
const removeNodeContents = (node) => {
  while (node.firstChild) {
      node.removeChild(node.firstChild)
  }
}

/**
 * Creates a sprite document from the raw body contents that can later be
 * queried for individual symbols.
 **/
const createDocumentFromSprite = (body) => {
  const spriteDocument = document.implementation.createHTMLDocument('')
  spriteDocument.body.innerHTML = body

  return spriteDocument
}

/**
 * Renders an SVG Icon from a sprite with polyfill if necessary.
 **/
export default class ReactSVGPolyfill extends Component {
  /**
   * Adapts the state if new props arrive.
   **/
  static getDerivedStateFromProps(props, state) {
    const srcSplit = props.href.split("#")
    const url = srcSplit.shift()

    return {
      fetch: Boolean(url.length),
      url: url,
      id: srcSplit.join("#"),
      polyfill: props.polyfill && browserRequiresPolyfill() && url
    }
  }

  /**
   * Constructor, sets whether the polyfill is required on the state.
   **/
  constructor(props) {
    super(props)
    this.state = ReactSVGPolyfill.getDerivedStateFromProps(props)
    this.outlet = React.createRef()
  }

  /**
   * Fetch the sprite if necessary after the component was mounted.
   **/
  componentDidMount () {
    this.checkSprite()
  }

  /**
   * Check if a new sprite needs to be loaded after the component has updated.
   **/
  componentDidUpdate () {
    this.checkSprite()
  }

  /**
   * Check whether a sprite should be loaded and if so load it.
   **/
  checkSprite() {
    const { url, fetch, polyfill } = this.state

    if (!polyfill) {
      return
    }

    if (!url && fetch) {
      return console.warn('react-sprite: Empty sprite url provided.')
    }

    if (fetch) {
      return this.requestSprite(url, this.insertSymbol.bind(this))
    }

    this.insertSymbol(document)
  }

  /**
   * Load the sprite with an AJAX call and cache it.
   **/
  requestSprite (url, callback) {
    if (sprites[url]) {
      callback(sprites[url])
    }

    request(getAbsuluteUrl(url), (error, response, body) => {
      if (error) {
        return
      }

      sprites[url] = createDocumentFromSprite(body)

      callback(sprites[url])
    })
  }

  /**
   * Queries the sprite document for the symbol and then adds the contents to
   * the rendered node.
   **/
  insertSymbol (sprite) {
    const symbol = sprite.getElementById(this.state.id)

    console.log('syn', symbol, this.state.id)

    if (!symbol || !this.outlet.current) {
      return
    }

    appendToNode(this.outlet.current, symbol)
  }

  /**
   * Renders an svg with a ref, so that the content can later be added.
   **/
  renderPolyfillOutlet () {
    return <svg className="icon" viewBox="0 0 24 24" ref={this.outlet} />
  }

  /**
   * Renders the icon, with or without polyfill, depending on the state.
   **/
  render () {
    console.log(this.props.href)
    if (this.state.polyfill) {
      return this.renderPolyfillOutlet()
    }

    return (
      <svg className="icon">
        <use xlinkHref={this.props.href} />
      </svg>
    )
  }
}

ReactSVGPolyfill.propTypes = {
  href: PropTypes.string.isRequired,
  polyfill: PropTypes.bool,
}
