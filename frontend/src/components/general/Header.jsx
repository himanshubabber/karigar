import { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Header = () => {
  const [location, setLocation] = useState('');
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported.');
      return;
    }

    setIsLoadingLoc(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
             { headers: { 'User-Agent': 'KarigarApp/1.0' } }
          );
          const data = await res.json();
          const city = data.display_name|| 'Unknown';
          setLocation(city);
        } catch {
          alert('Failed to fetch location');
        } finally {
          setIsLoadingLoc(false);
        }
      },
      () => {
        alert('Permission denied or error occurred. Please check browser settings.');
        setIsLoadingLoc(false);
      }
    );
  };

  return (
    <>
      {/* Added 'navbar navbar-expand-lg' to enable the collapsing behavior */}
      <header className="stylish-header sticky-top z-3 navbar navbar-expand-lg navbar-light bg-white py-2 py-lg-3">
        <div className="container-fluid px-3 px-lg-4">

          {/* --- Logo --- */}
          <a href="/" className="brand-logo navbar-brand me-auto me-lg-3">
            <i className="bi bi-tools"></i>
            Karigar
          </a>

          {/* --- Mobile Toggle Button (Hamburger) --- */}
          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* --- Collapsible Content --- */}
          <div className="collapse navbar-collapse mt-3 mt-lg-0" id="navbarContent">

            {/* --- Main Navigation --- */}
            <ul className="navbar-nav mx-auto mb-3 mb-lg-0 gap-2 gap-lg-4 justify-content-center text-center text-lg-start">
              <li className="nav-item dropdown">
                <a
                  className="nav-link nav-link-custom dropdown-toggle"
                  data-bs-toggle="dropdown"
                  href="#"
                >
                  Home Services
                </a>
                <ul className="dropdown-menu shadow-sm border-0 mt-2 text-center text-lg-start">
                  <li><a className="dropdown-item" href="#">Plumber</a></li>
                  <li><a className="dropdown-item" href="#">Electrician</a></li>
                  <li><a className="dropdown-item" href="#">Carpenter</a></li>
                  <li><a className="dropdown-item" href="#">Painter</a></li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <a
                  className="nav-link nav-link-custom dropdown-toggle"
                  data-bs-toggle="dropdown"
                  href="#"
                >
                  Appliances
                </a>
                <ul className="dropdown-menu shadow-sm border-0 mt-2 text-center text-lg-start">
                  <li><a className="dropdown-item" href="#">TV</a></li>
                  <li><a className="dropdown-item" href="#">Fridge</a></li>
                  <li><a className="dropdown-item" href="#">AC</a></li>
                  <li><a className="dropdown-item" href="#">Washing Machine</a></li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <a
                  className="nav-link nav-link-custom dropdown-toggle"
                  data-bs-toggle="dropdown"
                  href="#"
                >
                  Electronics
                </a>
                <ul className="dropdown-menu shadow-sm border-0 mt-2 text-center text-lg-start">
                  <li><a className="dropdown-item" href="#">Laptop</a></li>
                </ul>
              </li>
            </ul>

            {/* --- Right Side Actions (Location & Search) --- */}
            {/* Stack on mobile (flex-column), row on large screens (flex-lg-row) */}
            <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-3 justify-content-end">

              {/* Location Input - Full width on mobile */}
              <div className="input-group input-group-stylish rounded-pill w-100 w-lg-auto" style={{ maxWidth: '100%', minWidth: '250px', lgMaxWidth: '320px' }}>
                <span className="input-group-text ps-3">
                  <i className="bi bi-geo-alt-fill"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <button
                  className="btn btn-primary btn-detect m-1 rounded-pill d-flex align-items-center gap-2"
                  onClick={detectLocation}
                  type="button"
                  disabled={isLoadingLoc}
                >
                  {isLoadingLoc ? (
                     <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                     <i className="bi bi-crosshair"></i>
                  )}
                  {/* Show 'Detect' text only on larger screens */}
                  <span className="d-none d-sm-inline">{isLoadingLoc ? '...' : 'Detect'}</span>
                </button>
              </div>

              {/* Search Input - Full width on mobile */}
              <div className="input-group input-group-stylish rounded-pill w-100 w-lg-auto" style={{ maxWidth: '100%', lgMaxWidth: '220px' }}>
                 <span className="input-group-text ps-3">
                  <i className="bi bi-search text-muted fs-6"></i>
                </span>
                <input
                  type="search"
                  className="form-control ps-1"
                  placeholder="Search..."
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= Style Block ================= */}
      <style>{`
        /* --- Header Container --- */
        .stylish-header {
          /* Removed fixed background color here as it's now handled by bg-white on the navbar */
          box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid #f0f2f5;
        }

        /* --- Logo Styling --- */
        .brand-logo {
          font-size: 1.6rem; /* Slightly smaller on mobile */
          font-weight: 900;
          color: #0d6efd;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          transition: color 0.3s ease;
        }
        @media (min-width: 992px) {
            .brand-logo { font-size: 1.8rem; }
        }

        .brand-logo i {
          font-size: 1.5rem;
          margin-right: 8px;
          transition: transform 0.3s ease;
        }
        @media (min-width: 992px) {
            .brand-logo i { font-size: 1.7rem; }
        }


        .brand-logo:hover { color: #0a58ca; }
        .brand-logo:hover i { transform: rotate(-12deg) scale(1.05); }

        /* --- Navigation Links Hover Effect --- */
        .nav-link-custom {
          position: relative;
          font-weight: 500;
          color: #495057 !important;
          padding-bottom: 4px;
          transition: color 0.3s ease;
        }

        .nav-link-custom:hover,
        .dropdown-toggle.show {
          color: #0d6efd !important;
        }

        /* Only show underline on larger screens where hover is possible */
        @media (min-width: 992px) {
            .nav-link-custom::after {
              content: '';
              position: absolute;
              width: 0;
              height: 2px;
              bottom: 0;
              left: 50%;
              background-color: #0d6efd;
              transition: all 0.3s ease-in-out;
              transform: translateX(-50%);
            }

            .nav-link-custom:hover::after,
            .dropdown-toggle.show::after  {
              width: 100%;
            }
        }


        /* --- Stylish Input Groups --- */
        .input-group-stylish {
          border: 1px solid #e9ecef;
          padding: 2px;
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        /* On larger screens, apply max-width */
        @media (min-width: 992px) {
            .input-group-stylish[style*="lgMaxWidth: '320px'"] { max-width: 320px !important; }
            .input-group-stylish[style*="lgMaxWidth: '220px'"] { max-width: 220px !important; }
        }


        .input-group-stylish:focus-within {
          background: #fff;
          border-color: #86b7fe;
          box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1);
        }

        .input-group-stylish .form-control {
          border: none;
          background: transparent;
          font-size: 0.95rem;
          padding-left: 10px;
        }

        .input-group-stylish .form-control:focus {
          box-shadow: none;
        }

        .input-group-stylish .input-group-text {
          background: transparent;
          border: none;
          color: #0d6efd;
          padding-right: 5px;
        }

        .input-group-stylish .btn-detect {
            border-radius: 50px !important;
            padding: 4px 12px;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.2s ease;
        }

        .input-group-stylish .btn-detect:hover {
           transform: translateY(-1px);
           box-shadow: 0 2px 4px rgba(13, 110, 253, 0.2);
        }

        .dropdown-item:hover {
            background-color: #f0f2f5;
            color: #0d6efd;
        }
      `}</style>
    </>
  );
};

export default Header;
