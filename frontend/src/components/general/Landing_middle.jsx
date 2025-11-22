import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Using HashLoader for consistent branding across the site
import { HashLoader } from "react-spinners";
import { FaTools, FaArrowRight, FaPencilRuler } from "react-icons/fa";

// --- Data ---
const occupations = [
  { title: 'Plumber', image: '/plumber.png' },
  { title: 'Electrician', image: '/electrician.png' },
  { title: 'Carpenter', image: '/carpenter.png' },
  { title: 'Painter', image: '/painter.png' },
  { title: 'AC Repair', image: '/ac.png' },
  { title: 'Washing Machine', image: '/washing-machine.png' },
  { title: 'TV Repair', image: '/tv.png' },
  { title: 'Laptop Repair', image: '/laptop.png' },
  { title: 'Fridge Repair', image: 'fridge.png' },
];

// --- Professional Color Palette ---
const colors = {
  primaryBrand: "#0056b3",
  accentBrand: "#ff6b00",
  darkHeading: "#1a1a1a", // Near black for text on hover/click
  bodyText: "#4a4a4a",
  bgGradientStart: "#f3f6f9",
  bgGradientEnd: "#ffffff"
};

// --- Isolated Service Card Component ---
const ServiceCard = ({ occupation, onNavigate, accentColor }) => {
    const [isLoading, setIsLoading] = useState(true);
    const imgRef = useRef(null);

    const handleImageLoaded = () => {
        setIsLoading(false);
    };

    const handleImageError = (e) => {
        setIsLoading(false);
        e.target.src = 'https://via.placeholder.com/300x200?text=Karigar+Service';
    };

    // Fix for cached images not triggering onLoad
    useEffect(() => {
        if (imgRef.current && imgRef.current.complete) {
            handleImageLoaded();
        }
    }, []);

    return (
        // Using col-6 for mobile (2 cards per row) and col-md-4/col-lg-3 for larger screens
        <div className="col-6 col-md-4 col-lg-3 service-card-col animate-fade-up" style={{opacity: 0}}>
            <div
                className="card h-100 service-card"
                onClick={onNavigate}
            >
                <div className="image-wrapper">
                    {isLoading && (
                        <div className="loader-overlay">
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                                <HashLoader color={accentColor} size={30} />
                            </div>
                        </div>
                    )}

                    <img
                        ref={imgRef}
                        src={occupation.image}
                        className="card-img-top"
                        alt={occupation.title}
                        style={{ opacity: isLoading ? 0 : 1 }}
                        onLoad={handleImageLoaded}
                        onError={handleImageError}
                    />
                    <div className="overlay"></div>
                </div>
                {/* Reduced padding on mobile for card body */}
                <div className="card-body text-center py-3 py-md-4">
                    {/* Slightly smaller title font on mobile */}
                    <h5 className="card-title fw-bold mb-1 mobile-card-title" style={{ color: colors.darkHeading }}>
                        {occupation.title}
                    </h5>
                    <p className="mb-0 text-muted mobile-card-text">View Specialists <FaArrowRight size={10} className="ms-1"/></p>
                </div>
            </div>
        </div>
    );
};


const Landing_middle = () => {
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(false);

  const handleNavigation = (path) => {
    setPageLoading(true);
    setTimeout(() => {
      setPageLoading(false);
      navigate(path);
    }, 800);
  };

  // --- Full Page Loader ---
  if (pageLoading) {
    return (
      <div 
        style={{ 
          position: "fixed", 
          top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", 
          flexDirection: 'column', 
          gap: '20px', 
          justifyContent: "center", 
          alignItems: "center", 
          backgroundColor: "#fff",
          zIndex: 9999 
        }}
      >
        <HashLoader color={colors.accentBrand} size={50} />
        <p style={{color: colors.bodyText, letterSpacing:'1px', fontWeight:'500'}}>Entering Karigar...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.bgGradientEnd, overflowX: "hidden", fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif", minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ flex: 1 }}>
        {/* --- Hero Section --- */}
        {/* Reduced vertical padding on mobile (py-4) vs desktop (py-md-5) */}
        <header className="hero-section py-4 py-md-5 mb-4 mb-md-5">
           <div className="container text-center py-3 py-md-5 position-relative" style={{ zIndex: 2 }}>
            
            {/* 1. Brand Identifier */}
            <div className="mb-3 mb-md-4 d-inline-flex align-items-center justify-content-center px-3 py-2 rounded-pill animate-fade-up" style={{backgroundColor: 'rgba(0,86,179,0.08)'}}>
               <FaTools size={14} className="me-2" style={{ color: colors.primaryBrand }} /> 
               <span className="fw-bold" style={{letterSpacing: '1px', color: colors.primaryBrand, fontSize:'0.8rem'}}>KARIGAR PLATFORM</span>
            </div>

            {/* 2. Headline Container */}
            <div className="animate-fade-up delay-100">
                {/* Added 'hero-headline' class for responsive font sizing in CSS */}
                <h1 className="display-3 fw-bolder mb-3 mb-md-4 hero-headline" style={{ color: colors.darkHeading, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                <div className="d-flex justify-content-center mb-2">
                    <span className="typing-text" style={{ color: colors.primaryBrand }}>Welcome to Karigar</span>
                </div>
                <span style={{ color: colors.accentBrand, position: 'relative' }}>
                    Reliable Professionals, On Demand.
                    <svg className="d-none d-md-block" style={{position:'absolute', bottom:'-10px', left:0, width:'100%', height:'8px'}} viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6C70 6 130 2 198 2" stroke={colors.accentBrand} strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                </span>
                </h1>
            </div>
            
            {/* 3. Subtitle */}
            {/* Removed inline maxWidth on mobile via CSS class 'hero-subtitle' */}
            <p className="lead mb-4 mb-md-5 mx-auto animate-fade-up delay-200 hero-subtitle" style={{ color: colors.bodyText, fontSize: '1.15rem' }}>
              The modern way to hire skilled experts for your home and business needs. Secure, vetted, and efficient.
            </p>

            {/* 4. Split CTAs */}
            {/* Buttons stack vertically on mobile (flex-column) and side-by-side on small screens+ (flex-sm-row) */}
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-3 mt-md-4 animate-fade-up delay-300 px-3 px-sm-0">
              
              {/* --- WORKER BUTTON (The Blue One) --- */}
              {/* Kept w-100 for mobile, removed w-sm-auto. Sizing on larger screens is now handled by CSS. */}
              <button className="btn btn-lg d-flex align-items-center justify-content-center px-4 py-3 professional-btn worker-btn w-100" onClick={() => handleNavigation("/signin")}>
                <FaPencilRuler size={24} className="me-3 icon-style" /> 
                <div className="text-start lh-1">
                  <span style={{fontSize: '0.75rem', opacity: 0.8, display:'block', marginBottom:'4px'}}>Looking for work?</span>
                  <span className="fw-bold" style={{fontSize: '0.95rem'}}>Join as a Professional</span>
                </div>
              </button>
              
              {/* --- CUSTOMER BUTTON (The Orange One) --- */}
              {/* Kept w-100 for mobile, removed w-sm-auto. Sizing on larger screens is now handled by CSS. */}
              <button className="btn btn-lg d-flex align-items-center justify-content-center px-4 py-3 professional-btn customer-btn w-100" onClick={() => handleNavigation("/signin_customer")}>
                 <div className="text-start lh-1 me-3">
                  <span style={{fontSize: '0.75rem', opacity: 0.9, display:'block', marginBottom:'4px'}}>Need a service?</span>
                  <span className="fw-bold" style={{fontSize: '0.95rem'}}>Hire a Karigar</span>
                </div>
                 <FaArrowRight size={18} className="icon-style" />
              </button>
            </div>
          </div>
        </header>

        {/* --- Services Section --- */}
        <section className="py-4 py-md-5 container-fluid" style={{backgroundColor: '#fafafa', borderTop: '1px solid #eee'}}>
          <div className="container">
          <div className="text-center mb-4 mb-md-5 animate-fade-up delay-400">
            <h6 className="text-uppercase fw-bold" style={{ color: colors.primaryBrand, letterSpacing: "1.5px", fontSize:'0.8rem' }}>Explore Expertise</h6>
            <h2 className="fw-bold h2 mobile-section-title" style={{ color: colors.darkHeading }}>Our Service Categories</h2>
          </div>

          {/* Reduced gutter spacing on mobile (g-3) vs desktop (g-4) */}
          <div className="row g-3 g-md-4 justify-content-center services-grid">
            {occupations.map((occ) => (
                <ServiceCard 
                    key={occ.title}
                    occupation={occ}
                    onNavigate={() => handleNavigation("/signin_customer")}
                    accentColor={colors.accentBrand}
                />
            ))}
          </div>
          </div>
        </section>
      </div>

  
      {/* --- CSS Styles --- */}
      <style>{`
        /* --- ANIMATIONS --- */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translate3d(0, 30px, 0); }
            to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .animate-fade-up {
            animation-name: fadeInUp; animation-duration: 0.8s; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; } .delay-300 { animation-delay: 0.3s; } .delay-400 { animation-delay: 0.4s; }
        .services-grid .service-card-col:nth-child(1) { animation-delay: 0.5s; } .services-grid .service-card-col:nth-child(2) { animation-delay: 0.6s; } .services-grid .service-card-col:nth-child(3) { animation-delay: 0.7s; } .services-grid .service-card-col:nth-child(4) { animation-delay: 0.8s; } .services-grid .service-card-col:nth-child(5) { animation-delay: 0.9s; } .services-grid .service-card-col:nth-child(6) { animation-delay: 1.0s; } .services-grid .service-card-col:nth-child(7) { animation-delay: 1.1s; } .services-grid .service-card-col:nth-child(8) { animation-delay: 1.2s; } .services-grid .service-card-col:nth-child(9) { animation-delay: 1.3s; }

        /* --- TYPING EFFECT --- */
        .typing-text { display: inline-block; overflow: hidden; border-right: 3px solid ${colors.accentBrand}; white-space: nowrap; margin: 0 auto; letter-spacing: 1px; animation: typing 2.5s steps(30, end), blink-caret .75s step-end infinite; }
        @keyframes typing { from { width: 0 } to { width: 100% } }
        @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: ${colors.accentBrand}; } }

        /* --- LAYOUT & COMPONENT STYLES --- */
        .hero-section { background: linear-gradient(135deg, ${colors.bgGradientStart} 0%, ${colors.bgGradientEnd} 100%); position: relative; overflow: hidden; }
        .hero-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(${colors.primaryBrand} 0.5px, transparent 0.5px); background-size: 20px 20px; opacity: 0.05; z-index: 1; }

        /* Default styles for larger screens */
        .hero-headline { fontSize: 3.5rem; }
        .hero-subtitle { maxWidth: 650px; }
        .mobile-card-title { fontSize: 1.1rem; }
        .mobile-card-text { fontSize: 0.85rem; }
        .image-wrapper { height: 160px; position: relative; overflow: hidden; background: linear-gradient(to bottom, #f8f9fa, #e9ecef); }

        .professional-btn { border-radius: 12px; border: none; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); box-shadow: 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1); color: #ffffff; }
        .professional-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
        /* Helper to ensure icons inherit text color */
        .icon-style { color: inherit; }

        /* --- DESKTOP BUTTON SIZING (min-width: 576px) --- */
        /* On larger screens, force buttons to a substantial, uniform width for balance */
        @media (min-width: 576px) {
          .professional-btn {
            width: 300px;
          }
        }


        /* --- MOBILE RESPONSIVE STYLES (under 576px) --- */
        @media (max-width: 576px) {
            /* 1. Smaller Headline */
            .hero-headline { fontSize: 2rem !important; }
            /* 2. Full width subtitle */
            .hero-subtitle { maxWidth: 100% !important; padding: 0 15px; font-size: 1rem !important; }
            /* 3. Smaller section title */
            .mobile-section-title { font-size: 1.75rem; }
            /* 4. Shorter image height for small cards */
            .image-wrapper { height: 130px; }
            /* 5. Smaller card text */
            .mobile-card-title { fontSize: 0.95rem !important; }
            .mobile-card-text { fontSize: 0.75rem !important; }
            /* 6. Adjust button padding and icon size */
            .btn-lg { padding: 0.75rem 1rem; }
            .btn-lg svg { width: 20px; height: 20px; margin-right: 0.5rem !important; }
        }
        
        /* --- WORKER BUTTON STYLES (Blue) --- */
        .worker-btn {
            background-color: ${colors.primaryBrand};
            box-shadow: 0 4px 15px rgba(0, 86, 179, 0.3);
        }
        
        /* FIX: HOVER STATE = Keep Blue BG, Turn Text BLACK */
        .worker-btn:hover {
             background-color: ${colors.primaryBrand} !important; 
             color: ${colors.darkHeading} !important; /* <-- Text becomes BLACK */
        }

        /* ACTIVE STATE (Clicking) - Worker: Keep Blue BG, Keep Text BLACK */
        .worker-btn:active, 
        .worker-btn:focus,
        .worker-btn:active:focus {
            background-color: ${colors.primaryBrand} !important;
            color: ${colors.darkHeading} !important; /* <-- Keep text BLACK */
            box-shadow: inset 0 3px 5px rgba(0,0,0,0.2) !important;
            transform: translateY(1px) !important;
            outline: none !important;
        }


        /* --- CUSTOMER BUTTON STYLES (Orange Gradient) --- */
        .customer-btn {
            background: linear-gradient(45deg, ${colors.accentBrand}, #ff8f33);
            box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
        }

        /* FIX: HOVER STATE = Keep Gradient BG, Turn Text BLACK */
        .customer-btn:hover {
            background: linear-gradient(45deg, ${colors.accentBrand}, #ff8f33) !important;
            color: ${colors.darkHeading} !important; /* <-- Text becomes BLACK */
        }

        /* ACTIVE STATE (Clicking) - Customer: Keep Gradient BG, Keep Text BLACK */
        .customer-btn:active,
        .customer-btn:focus,
        .customer-btn:active:focus {
            background: linear-gradient(45deg, ${colors.accentBrand}, #ff8f33) !important;
            color: ${colors.darkHeading} !important; /* <-- Keep text BLACK */
            box-shadow: inset 0 3px 5px rgba(0,0,0,0.2) !important;
            transform: translateY(1px) !important;
            outline: none !important;
        }


        .service-card { border: none; border-radius: 16px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.03); transition: all 0.4s ease; cursor: pointer; overflow: hidden; border-top: 4px solid transparent; }
        .service-card:hover { box-shadow: 0 15px 30px rgba(0,50,100,0.1); transform: translateY(-8px); border-top-color: ${colors.accentBrand}; }
        .loader-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; }
        .image-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease, opacity 0.4s ease-in-out; }
        .image-wrapper .overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0); transition: background 0.3s ease; z-index: 2; }
        .service-card:hover img { transform: scale(1.08); }
        .service-card:hover .overlay { background: rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};

export default Landing_middle;
