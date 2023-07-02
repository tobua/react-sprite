import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import ReactSprite from 'react-sprite'
import { Exmpl, Code } from 'exmpl'

import menu from 'icon/menu.svg'
import close from 'icon/close.svg'
import menuRound from 'icon/menu-round.svg'
import closeRound from 'icon/close-round.svg'

const icons = {
  menu,
  menuRound,
  close,
  closeRound,
}

const iconStyles = { width: 30, height: 30 }

const Icon = () => {
  const [iconKey, setIconKey] = useState('menu')

  const icon = icons[iconKey]
  const iconUrl = icon.url.replace('-usage', '')

  return (
    <>
      <select onChange={(event) => setIconKey(event.target.value)}>
        <option value="menu">Menu</option>
        <option value="menuRound">Menu Round</option>
        <option value="close">Close</option>
        <option value="closeRound">Close Round</option>
      </select>
      <br />
      <br />
      <ReactSprite style={iconStyles} viewBox={icon.viewBox} href={iconUrl} force />
      <Code>{`<ReactSprite
  href="${iconUrl}"
  // Force usage of polyfill in any browser.
  force
/>`}</Code>
      <h3>Without Polyfill</h3>
      <svg style={iconStyles} viewBox={icon.viewBox}>
        <use xlinkHref={icon.url} />
      </svg>
      <Code>{`<svg viewBox="${icon.viewBox}">
  <use xlinkHref="${icon.url}" />
</svg>`}</Code>
    </>
  )
}

createRoot(document.body).render(
  <Exmpl title="React Sprite Demo" npm="react-sprite" github="tobua/react-sprite">
    <Icon />
    <h2>Installation & Usage</h2>
    <Code>npm i react-sprite</Code>
    <Code>{`import ReactSprite from 'react-sprite'

const Icon = () => <ReactSprite href="sprite.svg#close" />`}</Code>
  </Exmpl>
)
