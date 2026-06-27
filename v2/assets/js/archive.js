/**
 * Minimal Marimba — Archivo Documental Vivo
 * Script principal: inyección de componentes, navegación, lightbox, utilidades.
 */

(function () {
  "use strict";

  const BASE_PATH = (window.MM_BASE_PATH || "").replace(/\/$/, "");

  const COMPONENTS = {
    header: "components/header.html",
    footer: "components/footer.html",
  };

  /* ============================================================
     1. Inyección de componentes
     ============================================================ */
  async function injectComponent(selector, url) {
    const target = document.querySelector(selector);
    if (!target) return;

    const fullUrl = BASE_PATH ? BASE_PATH + "/" + url : url;

    try {
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      let html = await response.text();
      html = adjustRelativePaths(html);
      target.innerHTML = html;
      onComponentsLoaded();
    } catch (err) {
      console.warn(`[Minimal Marimba] No se pudo cargar ${fullUrl}:`, err);
    }
  }

  function adjustRelativePaths(html) {
    if (!BASE_PATH) return html;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    doc.querySelectorAll("a[href], img[src], script[src], link[rel='stylesheet']").forEach((el) => {
      const attr = el.hasAttribute("href") ? "href" : "src";
      const value = el.getAttribute(attr) || "";
      if (
        value &&
        !value.startsWith("http") &&
        !value.startsWith("//") &&
        !value.startsWith("#") &&
        !value.startsWith("mailto:") &&
        !value.startsWith("tel:")
      ) {
        el.setAttribute(attr, BASE_PATH + "/" + value);
      }
    });

    return doc.body ? doc.body.innerHTML : html;
  }

  /* ============================================================
     2. Marcar ítem de navegación actual
     ============================================================ */
  function markCurrentNavItem() {
    const nav = document.getElementById("mm-nav");
    if (!nav) return;

    const currentPath = window.location.pathname.split("/").pop() || "home.html";
    const links = nav.querySelectorAll(".mm-nav__link");

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      const hrefFile = href.split("/").pop();
      if (hrefFile === currentPath || (currentPath === "" && hrefFile === "home.html")) {
        link.classList.add("mm-nav__link--current");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("mm-nav__link--current");
        link.removeAttribute("aria-current");
      }
    });
  }

  /* ============================================================
     3. Menú móvil
     ============================================================ */
  function initMobileMenu() {
    const toggle = document.querySelector(".mm-menu-toggle");
    const nav = document.getElementById("mm-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen);
      toggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });

    // Cerrar al hacer clic en un enlace de primer nivel
    nav.querySelectorAll(".mm-nav__link").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 900) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Abrir menú");
        }
      });
    });
  }

  /* ============================================================
     4. Volver arriba
     ============================================================ */
  function initBackToTop() {
    const btn = document.querySelector(".mm-back-to-top");
    if (!btn) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        btn.classList.add("is-visible");
      } else {
        btn.classList.remove("is-visible");
      }
    });

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ============================================================
     5. Lightbox
     ============================================================ */
  function initLightbox() {
    let currentImages = [];
    let currentIndex = 0;

    // Crear lightbox si no existe
    let lightbox = document.getElementById("mm-lightbox");
    if (!lightbox) {
      lightbox = document.createElement("div");
      lightbox.id = "mm-lightbox";
      lightbox.className = "mm-lightbox";
      lightbox.setAttribute("role", "dialog");
      lightbox.setAttribute("aria-modal", "true");
      lightbox.setAttribute("aria-label", "Vista ampliada");
      lightbox.innerHTML = `
        <div class="mm-lightbox__container">
          <button class="mm-lightbox__close" aria-label="Cerrar"><i class="fas fa-times"></i></button>
          <button class="mm-lightbox__prev" aria-label="Imagen anterior"><i class="fas fa-chevron-left"></i></button>
          <img class="mm-lightbox__img" src="" alt="" />
          <button class="mm-lightbox__next" aria-label="Imagen siguiente"><i class="fas fa-chevron-right"></i></button>
          <div class="mm-lightbox__caption"></div>
        </div>
      `;
      document.body.appendChild(lightbox);
    }

    const imgEl = lightbox.querySelector(".mm-lightbox__img");
    const captionEl = lightbox.querySelector(".mm-lightbox__caption");
    const closeBtn = lightbox.querySelector(".mm-lightbox__close");
    const prevBtn = lightbox.querySelector(".mm-lightbox__prev");
    const nextBtn = lightbox.querySelector(".mm-lightbox__next");

    function openLightbox(trigger) {
      const gallery = trigger.closest(".mm-gallery");
      const items = gallery ? Array.from(gallery.querySelectorAll(".mm-gallery__item")) : [trigger.closest(".mm-gallery__item")];
      currentImages = items.map((item) => ({
        src: item.querySelector("img").dataset.full || item.querySelector("img").src,
        alt: item.querySelector("img").alt || "",
        caption: item.querySelector(".mm-gallery__caption")?.textContent || "",
      }));
      currentIndex = items.indexOf(trigger.closest(".mm-gallery__item"));
      if (currentIndex < 0) currentIndex = 0;
      updateLightbox();
      lightbox.classList.add("is-active");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function updateLightbox() {
      const item = currentImages[currentIndex];
      imgEl.src = item.src;
      imgEl.alt = item.alt;
      captionEl.textContent = `${currentIndex + 1} / ${currentImages.length} — ${item.caption || item.alt || "Sin título"}`;
    }

    function closeLightbox() {
      lightbox.classList.remove("is-active");
      document.body.style.overflow = "";
    }

    function next() {
      currentIndex = (currentIndex + 1) % currentImages.length;
      updateLightbox();
    }

    function prev() {
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      updateLightbox();
    }

    document.addEventListener("click", (e) => {
      const item = e.target.closest(".mm-gallery__item");
      if (item) {
        e.preventDefault();
        openLightbox(item);
      }
    });

    closeBtn.addEventListener("click", closeLightbox);
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); next(); });
    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); prev(); });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("is-active")) return;
      switch (e.key) {
        case "Escape": closeLightbox(); break;
        case "ArrowRight": next(); break;
        case "ArrowLeft": prev(); break;
      }
    });
  }

  /* ============================================================
     6. Inicialización
     ============================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    injectComponent("#mm-header-placeholder", COMPONENTS.header);
    injectComponent("#mm-footer-placeholder", COMPONENTS.footer);
  });
})();
