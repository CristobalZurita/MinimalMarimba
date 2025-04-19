/**
 * mobile-nav.js - Enhanced Mobile Navigation
 * Provides robust, accessible mobile menu functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  const titleBar = document.querySelector('#titleBar');
  const toggle = titleBar ? titleBar.querySelector('.toggle') : null;
  const navPanel = document.querySelector('#navPanel');
  
  if (!toggle || !navPanel) return;

  // Accessibility improvements
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'navPanel');
  navPanel.setAttribute('aria-hidden', 'true');

  function toggleMenu() {
      const isOpen = document.body.classList.toggle('navPanel-visible');
      
      // Update ARIA attributes
      toggle.setAttribute('aria-expanded', isOpen.toString());
      navPanel.setAttribute('aria-hidden', (!isOpen).toString());
      
      // Optional: Trap focus when menu is open
      if (isOpen) {
          const focusableElements = navPanel.querySelectorAll(
              'a[href], button, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length) {
              focusableElements[0].focus();
          }
      }
  }

  // Toggle menu when hamburger is clicked
  toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
  });

  // Close menu when a link is clicked (except anchor links)
  navPanel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href && href !== '#' && !href.startsWith('#')) {
              document.body.classList.remove('navPanel-visible');
              toggle.setAttribute('aria-expanded', 'false');
              navPanel.setAttribute('aria-hidden', 'true');
          }
      });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
      if (document.body.classList.contains('navPanel-visible') &&
          !e.target.closest('#navPanel') &&
          !e.target.closest('#titleBar')) {
          document.body.classList.remove('navPanel-visible');
          toggle.setAttribute('aria-expanded', 'false');
          navPanel.setAttribute('aria-hidden', 'true');
      }
  });

  // Close with Escape key
  document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && document.body.classList.contains('navPanel-visible')) {
          document.body.classList.remove('navPanel-visible');
          toggle.setAttribute('aria-expanded', 'false');
          navPanel.setAttribute('aria-hidden', 'true');
          toggle.focus(); // Return focus to toggle button
      }
  });

  // Close when resizing to larger screens
  window.addEventListener('resize', function() {
      if (window.innerWidth > 980 && document.body.classList.contains('navPanel-visible')) {
          document.body.classList.remove('navPanel-visible');
          toggle.setAttribute('aria-expanded', 'false');
          navPanel.setAttribute('aria-hidden', 'true');
      }
  });
});