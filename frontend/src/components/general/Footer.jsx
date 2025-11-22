const Footer = () => {
  return (
    <footer className="bg-light text-dark pt-5 mt-5 border-top">
      {/* Added text-center text-sm-start: Centers text on phones, left-aligns on tablets+ */}
      <div className="container text-center text-sm-start">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4">
          {/* Column 1: Brand */}
          <div className="col mb-4 mb-sm-3">
             {/* Added justify-content-center justify-content-sm-start to center logo on phone */}
            <a
              href="/"
              className="d-flex align-items-center justify-content-center justify-content-sm-start mb-3 link-dark text-decoration-none"
              aria-label="Bootstrap"
            >
              {/* Replaced placeholder SVG with a generic icon for demo purposes */}
              <i className="bi bi-tools fs-2 me-2 text-primary"></i>
              <span className="fs-4 fw-bold">Karigar</span>
            </a>
            <p className="text-muted">© 2025 Karigar<br />Quality services on demand.</p>
          </div>

          {/* Column 2: Services */}
          <div className="col mb-4 mb-sm-3">
            <h5>Services</h5>
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <a href="#" className="nav-link p-0 text-muted">Plumber</a>
              </li>
              <li className="nav-item mb-2">
                <a href="#" className="nav-link p-0 text-muted">Electrician</a>
              </li>
              <li className="nav-item mb-2">
                <a href="#" className="nav-link p-0 text-muted">Carpenter</a>
              </li>
              <li className="nav-item mb-2">
                <a href="#" className="nav-link p-0 text-muted">Painter</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="col mb-4 mb-sm-3">
            <h5>Company</h5>
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <a href="#" className="nav-link p-0 text-muted">About Us</a>
              </li>
              <li className="nav-item mb-2">
                <a href="#" className="nav-link p-0 text-muted">Careers</a>
              </li>
              <li className="nav-item mb-2">
                <a href="#" className="nav-link p-0 text-muted">Contact</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Help */}
          <div className="col mb-3">
            <h5>Help</h5>
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <a href="#" className="nav-link p-0 text-muted">FAQs</a>
              </li>
              <li className="nav-item mb-2">
                <a href="#" className="nav-link p-0 text-muted">Support</a>
              </li>
              <li className="nav-item mb-2">
                <a href="#" className="nav-link p-0 text-muted">Privacy</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        {/* Added align-items-center: Centers items horizontally when stacked on mobile */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center py-4 mt-4 border-top">
          <p className="mb-0 small text-muted">© 2025 Karigar. All rights reserved.</p>
          {/* Added mt-3 mt-sm-0: Adds space between text and icons only when stacked on mobile */}
          <ul className="list-unstyled d-flex mb-0 mt-3 mt-sm-0">
            <li className="ms-3">
              {/* Replaced SVGs with Bootstrap Icons (bi-) classes for easier usage */}
              <a className="link-secondary fs-5" href="#">
                <i className="bi bi-instagram"></i>
              </a>
            </li>
            <li className="ms-3">
              <a className="link-secondary fs-5" href="#">
                <i className="bi bi-facebook"></i>
              </a>
            </li>
            <li className="ms-3">
              <a className="link-secondary fs-5" href="#">
                <i className="bi bi-twitter-x"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
       {/* --- Yellow Stripe Footer Section --- */}
       <div style={{ backgroundColor: '#ffeb3b', color: '#000000', textAlign: 'center', padding: '12px 0', fontWeight: '700', fontSize: '1rem', width: '100%', letterSpacing: '1px', boxShadow: '0 -4px 10px rgba(0,0,0,0.1)', textTransform: 'uppercase' }}>
        Himanshu 2k22/co/207
      </div>
    </footer>
  );
};

export default Footer;
