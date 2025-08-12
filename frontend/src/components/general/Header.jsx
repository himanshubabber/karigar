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
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const city = data.display_name || 'Unknown';
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
    <header className="bg-white shadow-sm border-bottom sticky-top z-3">
      <div className="container-fluid py-2 px-3 d-flex flex-wrap align-items-center justify-content-between">
        {/* Logo */}
        <span
  href="/"
  className="d-flex align-items-center text-decoration-none"
  style={{
    fontSize: '1.9rem',
    fontWeight: '900',
    color: '#0d6efd',
    letterSpacing: '1.5px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.25)',
    transition: 'all 0.3s ease',
  }}
>
  <i
    className="bi bi-tools me-2"
    style={{
      fontSize: '1.8rem',
      fontWeight: 'bold',
      transition: 'color 0.3s ease',
    }}
  ></i>
  Karigar
</span>

        {/* Main Navigation */}
        <ul className="nav gap-3 my-2 my-md-0">
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle text-dark fw-medium"
              data-bs-toggle="dropdown"
              href="#"
            >
              Home Services
            </a>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Plumber</a></li>
              <li><a className="dropdown-item" href="#">Electrician</a></li>
              <li><a className="dropdown-item" href="#">Carpenter</a></li>
              <li><a className="dropdown-item" href="#">Painter</a></li>
            </ul>
          </li>

          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle text-dark fw-medium"
              data-bs-toggle="dropdown"
              href="#"
            >
              Appliances
            </a>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">TV</a></li>
              <li><a className="dropdown-item" href="#">Fridge</a></li>
              <li><a className="dropdown-item" href="#">AC</a></li>
              <li><a className="dropdown-item" href="#">Washing Machine</a></li>
            </ul>
          </li>

          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle text-dark fw-medium"
              data-bs-toggle="dropdown"
              href="#"
            >
              Electronics
            </a>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Laptop</a></li>
            </ul>
          </li>
        </ul>

        {/* Right Side Actions */}
        <div className="d-flex align-items-center gap-3 flex-wrap justify-content-end">
          {/* Location Input */}
          <div className="d-flex align-items-center" style={{ maxWidth: '280px' }}>
            <input
              type="text"
              className="form-control rounded-pill px-3 me-2"
              placeholder="Enter or Detect Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button
  className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-2 px-3"
  onClick={detectLocation}
  type="button"
  title="Detect Location"
>
  <i className="bi bi-crosshair"></i>
  <span className="d-none d-sm-inline">Detect</span>
</button>

          </div>

          {/* Search Box */}
          <form className="d-flex align-items-center" style={{ maxWidth: '200px' }}>
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
