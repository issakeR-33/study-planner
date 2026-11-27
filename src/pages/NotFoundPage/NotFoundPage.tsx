import { Link } from 'react-router'
import './NotFoundPage.scss'

function NotFoundPage() {
  return (
    <section className="not-found-page">
      <p className="not-found-page__code">404</p>
      <h2 className="not-found-page__title">Сторінку не знайдено</h2>
      <Link to="/tasks" className="not-found-page__link">
        До списку завдань
      </Link>
    </section>
  )
}

export default NotFoundPage
