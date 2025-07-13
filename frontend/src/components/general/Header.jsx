import { useState } from 'react';

const Header = () => {
  const [location, setLocation] = useState('');

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(latitude);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          console.log(data);
          const city =data.display_name||
            'Unknown';
          setLocation(city);
        } catch {
          alert('Failed to fetch location');
        }
      },
      () => {
        alert('Permission denied or error occurred');
      }
    );
  };

  return (
    <header className="bg-white shadow-sm border-bottom">
      <div className="container-fluid d-flex align-items-center py-2 px-2">
        {/* Logo */}
        <a href="/" className="d-flex align-items-center text-dark text-decoration-none me-auto">
          <svg className="me-1" width="36" height="32" role="img" aria-label="Bootstrap">
            <use xlinkHref="#bootstrap" />
          </svg>
          <span className="fs-3 fw-bold">Karigar</span>
        </a>

        {/* Nav + Location + Search + Profile */}
        <div className="d-flex align-items-center gap-3 flex-nowrap">

          {/* Navigation */}
          <ul className="nav align-items-center">
            <li className="nav-item dropdown me-2">
              <a className="nav-link dropdown-toggle text-dark fw-medium" data-bs-toggle="dropdown" href="#">
                Home Services
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Plumber</a></li>
                <li><a className="dropdown-item" href="#">Electrician</a></li>
                <li><a className="dropdown-item" href="#">Carpenter</a></li>
                <li><a className="dropdown-item" href="#">Painter</a></li>
              </ul>
            </li>
            <li className="nav-item dropdown me-2">
              <a className="nav-link dropdown-toggle text-dark fw-medium" data-bs-toggle="dropdown" href="#">
                Appliances
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">TV</a></li>
                <li><a className="dropdown-item" href="#">Fridge</a></li>
                <li><a className="dropdown-item" href="#">AC</a></li>
                <li><a className="dropdown-item" href="#">Washing Machine</a></li>
              </ul>
            </li>
            <li className="nav-item dropdown me-2">
              <a className="nav-link dropdown-toggle text-dark fw-medium" data-bs-toggle="dropdown" href="#">
                Electronics
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Laptop</a></li>
              </ul>
            </li>
            {/* <li className="nav-item">
              <a className="nav-link text-dark fw-medium" href="#">More</a>
            </li> */}
          </ul>

          {/* Location Input */}
          <div className="d-flex align-items-center" style={{ maxWidth: '260px' }}>
            <input
              type="text"
              className="form-control rounded-pill px-3 me-2"
              placeholder="Enter or Detect Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button
              className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-1"
              onClick={detectLocation}
              type="button"
            >
              <i className="bi bi-crosshair"></i>
              <span className="d-none d-sm-inline">Detect</span>
            </button>
          </div>

          {/* Search */}
          <form className="d-flex" style={{ maxWidth: '180px' }}>
            <input
              type="search"
              className="form-control rounded-pill px-3 py-2"
              placeholder="Search..."
            />
          </form>
          
        </div>
      </div>
    </header>
  );
};

export default Header;
