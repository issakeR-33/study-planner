import './Header.scss'

interface HeaderProps {
  title: string
  subtitle?: string
}

function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="header">
      <h1 className="header__title">{title}</h1>
      {subtitle && <p className="header__subtitle">{subtitle}</p>}
    </header>
  )
}

export default Header
