import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
// 'prop-types' import removed as requested

import '../styles/Header.css';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Menu, X } from 'lucide-react';
import logo from '../assets/VT_logo.png';

// --- Optimization: GSAP Plugin Registration ---
// Plugins are registered once, globally, at the top level.
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// --- Optimization: Data-Driven UI ---
// Nav links are defined as data, making the component
// easier to maintain and test.
const navLinksData = [
  { href: '#header', section: 'header', label: 'Home' },
  { href: '#how-it-works', section: 'how-it-works', label: 'How it Works' },
  { href: '#footer', section: 'footer', label: 'Support' },
];

// --- Optimization: Isolate Imperative Code (Hook) ---
// The entire `applyMatrixEffect` function is moved into a custom hook.
// This encapsulates the complex, non-React DOM manipulation and
// provides a clean, declarative API (`useMatrixEffect(ref)`).
// It also properly handles cleanup.

const matrixChars = '0123456789';

const applyMatrixEffect = (element) => {
  const originalText = element.textContent;
  const letters = originalText.split('');

  // Set innerHTML once to create the spans
  element.innerHTML = letters
    .map((char) =>
      char === ' '
        ? ' '
        : `<span data-original="${char}" class="matrix-letter" style="display: inline-block; transition: all 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform: scale(1); color: #f1f5f9; opacity: 1;">${char}</span>`
    )
    .join('');

  const letterSpans = Array.from(element.querySelectorAll('.matrix-letter'));
  let intervals = []; // Store intervals for cleanup

  const handleMouseEnter = () => {
    if (window.innerWidth <= 768) return; // Disable on mobile

    // 1. Fade out
    letterSpans.forEach((span) => {
      span.style.transition = 'none';
      span.style.opacity = '0';
      span.style.transform = 'scale(0.8) translateY(5px)';
    });

    // 2. Wave effect fade-in
    letterSpans.forEach((span, index) => {
      setTimeout(() => {
        span.style.transition = 'all 0.4s ease-out';
        span.style.opacity = '1';
        span.style.transform = 'scale(1.2) translateY(-2px)';
        span.style.textShadow = '0 0 8px rgba(241, 245, 249, 0.8)';
      }, index * 40);
    });

    // 3. Glitch effect
    letterSpans.forEach((span, index) => {
      const originalChar = span.getAttribute('data-original');
      if (originalChar === ' ') return;

      let glitchCount = 0;
      const maxGlitches = Math.random() * 6 + 4;

      setTimeout(() => {
        const intervalId = setInterval(() => {
          if (glitchCount >= maxGlitches) {
            // Smooth return to original
            span.style.transition =
              'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            span.textContent = originalChar;
            span.style.color = '#f1f5f9';
            span.style.transform = 'scale(1) translateY(0px) rotate(0deg)';
            span.style.textShadow = '0 0 3px rgba(241, 245, 249, 0.4)';
            span.style.filter = 'none';
            span.style.opacity = '1';
            clearInterval(intervalId);

            setTimeout(() => {
              span.style.transition =
                'all 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }, 300);
            return;
          }

          // Glitch
          span.textContent =
            matrixChars[Math.floor(Math.random() * matrixChars.length)];
          const scales = [0.8, 1.3, 0.9, 1.1];
          const shadows = [
            '0 0 5px rgba(241, 245, 249, 0.9)',
            '0 0 10px rgba(241, 245, 249, 0.7), 0 0 20px rgba(241, 245, 249, 0.3)',
            '0 0 15px rgba(241, 245, 249, 0.5)',
            '0 0 8px rgba(241, 245, 249, 0.8)',
          ];
          const scaleIndex = glitchCount % 4;

          span.style.color = '#f1f5f9';
          span.style.transform = `scale(${scales[scaleIndex]}) translateY(-${Math.random() * 3
            }px) rotate(${(Math.random() - 0.5) * 10}deg)`;
          span.style.textShadow = shadows[scaleIndex];
          span.style.filter = `blur(${Math.random() * 0.5}px) brightness(${0.8 + Math.random() * 0.4
            })`;

          glitchCount++;
        }, 40 + Math.random() * 40);
        intervals.push(intervalId); // Store for cleanup
      }, index * 40);
    });
  };

  const handleMouseLeave = () => {
    if (window.innerWidth <= 768) return; // Disable on mobile

    // Clear all running glitch intervals immediately
    intervals.forEach(clearInterval);
    intervals = [];

    // Fade out
    letterSpans.forEach((span, index) => {
      setTimeout(() => {
        span.style.transition = 'all 0.3s ease-out';
        span.style.opacity = '0';
        span.style.transform = 'scale(0.8) translateY(5px)';
      }, index * 20);
    });

    // Fade back in to normal
    setTimeout(() => {
      letterSpans.forEach((span, index) => {
        setTimeout(() => {
          span.style.transition = 'all 0.2s ease-out';
          span.style.opacity = '1';
          span.style.transform = 'scale(1) translateY(0px) rotate(0deg)';
          span.style.textShadow = 'none';
          span.style.filter = 'none';
          span.style.color = '#f1f5f9';
          span.textContent = span.getAttribute('data-original');
        }, index * 15);
      });
    }, letterSpans.length * 20 + 100);
  };

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  // Return a cleanup function
  return () => {
    intervals.forEach(clearInterval);
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
    // Restore original text content on cleanup
    element.innerHTML = originalText;
  };
};

const useMatrixEffect = (ref) => {
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const cleanup = applyMatrixEffect(ref.current);
    return () => cleanup();
  }, [ref]);
};

// --- Optimization: Reusable NavLink Component ---
// This component encapsulates the link logic and the complex
// matrix effect, keeping the parent `NavigationComponent` clean.
const NavLink = ({ href, onClick, children }) => {
  const linkRef = useRef(null);
  useMatrixEffect(linkRef); // Apply the effect via the hook

  return (
    <a ref={linkRef} href={href} className="nav-link" onClick={onClick}>
      {children}
    </a>
  );
};

// --- Optimization: Memoized NavigationComponent ---
// 1. Moved outside the `Header` to prevent re-creation on every render.
// 2. `React.memo` prevents re-renders if its props (`onScrollTo`)
//    haven't changed.
const NavigationComponent = React.memo(({ onScrollTo, isOpen, closeMenu }) => {
  const navContainerRef = useRef(null);
  const navLinksRef = useRef(null);
  const dotsRef = useRef(null);
  const navRef = useRef(null);

  useGSAP(() => {
    const navContainer = navContainerRef.current;
    const navLinks = navLinksRef.current;
    const dots = dotsRef.current;

    let mm = gsap.matchMedia();

    // Desktop animations
    mm.add("(min-width: 769px)", () => {
      let currentScrollProgress = 0;
      let isHovered = false;

      // --- Optimization: Performance ---
      // `force3D: true` hints to the browser to use hardware acceleration.
      gsap.set(navContainer, {
        scale: 1,
        transformOrigin: 'center center',
        force3D: true,
      });
      gsap.set(navLinks, {
        scale: 1,
        opacity: 1,
        y: 0,
        transformOrigin: 'center center',
        force3D: true,
      });
      gsap.set(dots, {
        scale: 1,
        opacity: 0,
        y: 10,
        pointerEvents: 'none',
        transformOrigin: 'center center',
        force3D: true,
      });

      ScrollTrigger.create({
        trigger: '#header', // Changed to ID selector for more specificity
        start: 'bottom top+=100',
        end: 'bottom top+=20',
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          currentScrollProgress = self.progress;

          if (!isHovered && self.progress > 0) {
            const scaleValue = gsap.utils.interpolate(1, 0.7, self.progress);
            const linkOpacity = gsap.utils.interpolate(
              1,
              0,
              (self.progress - 0.3) / 0.4
            );
            const linkY = gsap.utils.interpolate(
              0,
              -15,
              (self.progress - 0.3) / 0.4
            );
            const dotOpacity = gsap.utils.interpolate(
              0,
              1,
              (self.progress - 0.6) / 0.4
            );
            const dotY = gsap.utils.interpolate(
              10,
              0,
              (self.progress - 0.6) / 0.4
            );

            // --- CRITICAL PERFORMANCE OPTIMIZATION ---
            // Replaced slow `gsap.timeline()` with `gsap.to()`.
            // This stops creating/destroying timelines on every scroll frame.
            gsap.to(navContainer, {
              scale: scaleValue,
              duration: 0.1,
              ease: 'none',
            });
            gsap.to(navLinks, {
              opacity: self.progress > 0.3 ? linkOpacity : 1,
              y: self.progress > 0.3 ? linkY : 0,
              duration: 0.1,
              ease: 'none',
            });
            gsap.to(dots, {
              opacity: self.progress > 0.6 ? dotOpacity : 0,
              y: self.progress > 0.6 ? dotY : 10,
              pointerEvents: self.progress > 0.6 ? 'auto' : 'none',
              duration: 0.1,
              ease: 'none',
            });
          }
        },
      });

      // Hover logic remains timeline-based, which is fine as
      // it only runs on mouse events, not on every scroll frame.
      const handleMouseEnter = () => {
        isHovered = true;
        if (currentScrollProgress > 0) {
          gsap
            .timeline()
            .to(navContainer, {
              scale: 1,
              duration: 0.4,
              ease: 'power2.out',
              force3D: true,
            })
            .to(
              dots,
              { opacity: 0, y: 10, pointerEvents: 'none', duration: 0.2 },
              0
            )
            .to(navLinks, { opacity: 1, y: 0, duration: 0.3 }, 0.1);
        }
      };

      const handleMouseLeave = () => {
        isHovered = false;
        if (currentScrollProgress > 0) {
          const scaleValue = gsap.utils.interpolate(
            1,
            0.7,
            currentScrollProgress
          );
          const linkOpacity = gsap.utils.interpolate(
            1,
            0,
            (currentScrollProgress - 0.3) / 0.4
          );
          const linkY = gsap.utils.interpolate(
            0,
            -15,
            (currentScrollProgress - 0.3) / 0.4
          );
          const dotOpacity = gsap.utils.interpolate(
            0,
            1,
            (currentScrollProgress - 0.6) / 0.4
          );
          const dotY = gsap.utils.interpolate(
            10,
            0,
            (currentScrollProgress - 0.6) / 0.4
          );

          const tl = gsap.timeline();
          tl.to(navContainer, {
            scale: scaleValue,
            duration: 0.4,
            ease: 'power2.out',
            force3D: true,
          });

          if (currentScrollProgress > 0.3) {
            tl.to(
              navLinks,
              { opacity: linkOpacity, y: linkY, duration: 0.2 },
              0
            );
          }
          if (currentScrollProgress > 0.6) {
            tl.to(
              dots,
              {
                opacity: dotOpacity,
                y: dotY,
                pointerEvents: 'auto',
                duration: 0.3,
              },
              0.1
            );
          } else {
            tl.to(
              dots,
              { opacity: 0, y: 10, pointerEvents: 'none', duration: 0.3 },
              0.1
            );
          }
        }
      };

      navContainer.addEventListener('mouseenter', handleMouseEnter);
      navContainer.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        mm.revert();
      };
    }); // end mm.add
  }, []); // Empty dependency array prevents infinite re-renders without breaking external GSAP selectors

  return (
    <div
      className={`nav-container gsap-nav ${isOpen ? 'mobile-open' : ''}`}
      ref={navContainerRef}
      style={{
        position: 'fixed',
        top: window.innerWidth <= 768 ? '0' : '24px',
        left: window.innerWidth <= 768 ? '0' : '50%',
        transform: window.innerWidth <= 768 ? 'none' : 'translateX(-50%)',
        zIndex: 1000,
      }}
    >
      <nav className="nav" ref={navRef}>
        <div className={`nav-links ${isOpen ? 'open' : ''}`} ref={navLinksRef}>
          {/* --- Optimization: Data-Driven Links --- */}
          {navLinksData.map((link) => (
            <NavLink
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                onScrollTo(link.section);
                closeMenu();
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-dots" ref={dotsRef}>
          <div className="dot"></div>
        </div>
      </nav>
    </div>
  );
});

NavigationComponent.displayName = 'NavigationComponent';

// --- Main Header Component ---

const Header = () => {
  const [navPortal, setNavPortal] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Optimization: Portal Creation ---
  // This effect runs only once on mount to find/create the portal target.
  useEffect(() => {
    let portalContainer = document.getElementById('nav-portal');
    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.id = 'nav-portal';
      // --- Accessibility: Role and Label ---
      // Add ARIA attributes to the portal root for screen readers
      portalContainer.setAttribute('role', 'region');
      portalContainer.setAttribute('aria-label', 'Sticky Navigation');
      document.body.appendChild(portalContainer);
    }
    setNavPortal(portalContainer);

    // No cleanup needed, portal should persist
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    gsap.to(window, {
      duration: 1,
      scrollTo: `#${sectionId}`,
      ease: 'power2.inOut',
    });
  }, []);

  // --- Optimization: Memoized Logo ---
  // The logo itself is wrapped in `useMemo` to prevent re-rendering
  // the `<img>` tag and `<h1>` unless `scrollToSection` changes
  // (which it won't, but it's good practice).
  const Logo = useMemo(
    () => (
      <div className="logo">
        {/* --- Accessibility: Clickable Parent --- */}
        {/* Wrap logo and text in one link for a larger click target
            and better screen reader experience. */}
        <a
          href="#header"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('header');
          }}
          aria-label="VeriTrust - Go to Homepage"
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <img src={logo} alt="VeriTrust logo" className="logo-img" />
          <h1>VeriTrust</h1>
        </a>
      </div>
    ),
    [scrollToSection] // Dependency on the memoized function
  );

  return (
    <>
      <header className="header" id="header">
        <div className="container header-content">
          {Logo}
          <div className="nav-placeholder"></div>
          <div className="header-actions">
            <a href="/login" className="auth-btn login-btn">Login</a>
            <a href="/register" className="auth-btn register-btn">Register</a>
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>
      {/* --- Optimization: React Portal --- */}
      {/* The navigation is rendered into the portal element,
        detaching it from the header's DOM hierarchy. */}
      {navPortal &&
        createPortal(
          <NavigationComponent
            onScrollTo={scrollToSection}
            isOpen={isMobileMenuOpen}
            closeMenu={() => setIsMobileMenuOpen(false)}
          />,
          navPortal
        )}
    </>
  );
};

export default Header;