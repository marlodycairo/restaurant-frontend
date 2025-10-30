
export const Navbar = () => {
  return (
    <>
    <nav className='navbar fixed-top navbar-expand-lg bg-body-tertiary'>
      <div className='container-fluid'>
        <a className='navbar-brand' href="#">Restaurant</a>
        <div className='collapse navbar-collapse'>
          <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
            <li className='nav-item'>
              <a className='nav-link active' aria-current="page" href="#">Table</a>
            </li>
            <li className='nav-item'>
              <a className='nav-link' href="#">About</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    </>
  )
}
