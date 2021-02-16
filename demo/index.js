import { useState } from 'react'
import { render } from 'react-dom'
import ReactSprite from 'react-sprite'
import { Exmpl } from 'exmpl'

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

const Icon = () => {
  const [iconKey, setIconKey] = useState('menu')

  const icon = icons[iconKey]

  return (
    <>
      <select onChange={(event) => setIconKey(event.target.value)}>
        <option value="menu">Menu</option>
        <option value="menuRound">Menu Round</option>
        <option value="close">Close</option>
        <option value="closeRound">Close Round</option>
      </select>
      <p>{icon.url}</p>
      <svg style={{ width: 40, height: 40 }} viewBox={menu.viewBox}>
        <use xlinkHref={menu.url} />
      </svg>
      <ReactSprite
        style={{ width: 30, height: 30 }}
        viewBox={icon.viewBox}
        href={icon.url}
      />
      <ReactSprite
        style={{ width: 30, height: 30 }}
        href="sprite.svg#menu"
        force
      />
      <ReactSprite
        style={{ width: 30, height: 30 }}
        href="sprite.svg#close-round"
        force
      />
    </>
  )
}

render(
  <Exmpl
    title="React Sprite Demo"
    npm="react-sprite"
    github="tobua/react-sprite"
  >
    <Icon />
  </Exmpl>,
  document.body
)
