import { Link, NavLink } from "react-router"

export const Navbar = () => {
  return (
    <>
    <nav className='navbar fixed-top navbar-expand-lg bg-body-tertiary'>
      <div className='container-fluid'>
        <Link className='navbar-brand' to="/" >Restaurant</Link>
        <div className='collapse navbar-collapse'>
          <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
            <li className='nav-item'>
              <NavLink className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
              } to="/">Tables</NavLink>
            </li>
            
          </ul>
        </div>
      </div>
    </nav>
    </>
  )
}
