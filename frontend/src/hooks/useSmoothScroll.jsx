import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import ScrollSmoother from 'gsap/ScrollSmoother';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

/**
 * A hook to initialize and manage a GSAP ScrollSmoother instance
 * with performance-optimized settings.
 */
const useSmoothScroll = () => {
  useGSAP(() => {
    // --- Best Practice: Device Detection ---
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndDevice = navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const getOptimalSettings = () => {
      if (prefersReducedMotion) {
        return {
          smooth: 0,
          effects: false,
          smoothTouch: false,
          normalizeScroll: false, // Don't normalize if not smoothing
        };
      }
      if (isMobile || isLowEndDevice) {
        return {
          smooth: 1.0,
          effects: true,
          smoothTouch: 0.05,
          normalizeScroll: true,
        };
      }
      return {
        smooth: 1.2,
        effects: true,
        smoothTouch: 0.08,
        normalizeScroll: true,
      };
    };

    const settings = getOptimalSettings();

    // Kill any existing instance before creating a new one
    ScrollSmoother.get()?.kill();

    const smoother = ScrollSmoother.create({
      wrapper: '.smooth-wrapper',
      content: '.smooth-content',
      ...settings,
      ignoreMobileResize: true,
      ease: 'power2.out',
    });

    // --- Background animation ---
    const startSize = 100;
    const endSize = 180;

    gsap.to('.smooth-wrapper', {
      backgroundSize: `${endSize}% ${endSize}%`, // Animate to this value
      ease: 'none',
      scrollTrigger: {
        trigger: '.smooth-content',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const currentSize = startSize + (endSize - startSize) * self.progress;
          const wrapper = document.querySelector('.smooth-wrapper');
          if (wrapper) wrapper.style.backgroundSize = `${currentSize}% ${currentSize}%`;
        },
      },
    });

    // --- Best Practice: Debounced Resize ---
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        smoother.refresh();
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // The 200ms delay is a pragmatic way to ensure other
    // components have time to mount and create their triggers.
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    // --- Best Practice: useGSAP Cleanup ---
    // The return function from useGSAP handles all cleanup.
    // It will kill the smoother, the `gsap.to` tween (bgTween),
    // and its ScrollTrigger.
    return () => {
      clearTimeout(resizeTimeout);
      clearTimeout(refreshTimeout);
      window.removeEventListener('resize', handleResize);
      if (smoother) {
        smoother.kill();
      }
      // Ensure body and html are reset so subsequent pages aren't hidden/locked
      gsap.set(['body', 'html'], { clearProps: 'all' });
      // Remove any lingering ScrollTrigger instances
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);
};

export default useSmoothScroll;