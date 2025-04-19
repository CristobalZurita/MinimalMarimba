/* main.js*/ 

document.addEventListener('DOMContentLoaded', function() {
	// Obtener referencias a elementos
	const secondaryMenuItems = document.querySelectorAll('.secondary-menu-item, .media-tab');
	const bioSections = document.querySelectorAll('.bio-section');
	const backToTopBtn = document.querySelector('.back-to-top');
	const mainNav = document.querySelector('#nav');
	const secondaryNav = document.querySelector('.secondary-nav');
	

	
	// Calcular altura de las barras de navegación para el scroll
	function getNavHeightsTotal() {
	  const mainNavHeight = mainNav ? mainNav.offsetHeight : 0;
	  const secondaryNavHeight = secondaryNav ? secondaryNav.offsetHeight : 0;
	  return mainNavHeight + secondaryNavHeight;
	}
	
	// Función para obtener la sección actual de la URL
	function getCurrentSection() {
	  const hash = window.location.hash.substring(1);
	  return hash || 'concepto'; // Por defecto, 'concepto' si no hay hash
	}
	
	// Función para actualizar el menú activo y mostrar la sección correspondiente
	function updateActiveSection() {
	  const currentSection = getCurrentSection();
	  
	  // Actualizar menú activo
	  secondaryMenuItems.forEach(item => {
		const itemSection = item.getAttribute('data-section');
		if (itemSection === currentSection) {
		  item.classList.add('active');
		} else {
		  item.classList.remove('active');
		}
	  });
	  
	  // Mostrar la sección correspondiente
	  bioSections.forEach(section => {
		if (section.id === currentSection) {
		  section.classList.add('active');
		} else {
		  section.classList.remove('active');
		}
	  });
	}
	
	// Función para desplazarse a una sección de manera controlada
	function scrollToSection(sectionId) {
	  // CORRECCIÓN: En lugar de intentar desplazarse a cada sección específica
	  // simplemente nos desplazamos a la parte superior del contenedor principal
	  // esto evita los problemas con el cálculo de alturas y posiciones
	  
	  const articleBox = document.querySelector('.box.post');
	  if (articleBox) {
		const navHeight = getNavHeightsTotal();
		window.scrollTo({
		  top: articleBox.offsetTop - navHeight - 10,
		  behavior: 'smooth'
		});
	  }
	}
	
	// Añadir listeners a los elementos del menú secundario
	secondaryMenuItems.forEach(item => {
	  item.addEventListener('click', function(e) {
		e.preventDefault();
		
		const section = this.getAttribute('data-section') || (this.hasAttribute('href') ? this.getAttribute('href').substring(1) : '');
		
		// Actualizar menú activo sin esperar al evento hashchange
		secondaryMenuItems.forEach(mi => mi.classList.remove('active'));
		this.classList.add('active');
		
		// Actualizar las secciones visibles
		bioSections.forEach(s => {
		  if (s.id === section) {
			s.classList.add('active');
		  } else {
			s.classList.remove('active');
		  }
		});
		
		// Actualizar URL con el nuevo hash sin causar scroll
		history.pushState(null, null, '#' + section);
		
		// Desplazarse a la parte superior del contenedor principal
		scrollToSection(section);
	  });
	});
	
	// Manejar clics en enlaces de anclaje dentro de la página
	document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
	  link.addEventListener('click', function(e) {
		const targetId = this.getAttribute('href').substring(1);
		const targetElement = document.getElementById(targetId);
		
		if (targetElement && targetElement.classList.contains('bio-section')) {
		  e.preventDefault();
		  
		  // Actualizar hash
		  history.pushState(null, null, '#' + targetId);
		  
		  // Actualizar secciones activas
		  bioSections.forEach(s => {
			if (s.id === targetId) {
			  s.classList.add('active');
			} else {
			  s.classList.remove('active');
			}
		  });
		  
		  // Actualizar menú
		  secondaryMenuItems.forEach(item => {
			if (item.getAttribute('data-section') === targetId) {
			  item.classList.add('active');
			} else {
			  item.classList.remove('active');
			}
		  });
		  
		  // Scroll
		  scrollToSection(targetId);
		}
	  });
	});
	
	// Botón de volver arriba
	window.addEventListener('scroll', function() {
	  if (window.pageYOffset > 300) {
		backToTopBtn.classList.add('visible');
	  } else {
		backToTopBtn.classList.remove('visible');
	  }
	});
	
	if (backToTopBtn) {
	  backToTopBtn.addEventListener('click', function(e) {
		e.preventDefault();
		window.scrollTo({
		  top: 0,
		  behavior: 'smooth'
		});
	  });
	}
	
	// Actualizar menú cuando cambia el hash en la URL
	window.addEventListener('hashchange', updateActiveSection);
	
	// Inicializar: marcar la sección activa al cargar
	updateActiveSection();
	
	// Manejar caso de carga inicial con hash
	if (window.location.hash) {
	  // Pequeño retraso para asegurar que todo está cargado
	  setTimeout(() => {
		scrollToSection(getCurrentSection());
	  }, 100);
	}
	
	// Ocultar el botón de volver arriba inicialmente
	if (backToTopBtn) {
	  backToTopBtn.classList.remove('visible');
	}
	
	/**
	 * Funcionalidad adicional para la galería de imágenes
	 * Esta parte se ejecutará solo si existe una galería en la página
	 */
	if (document.querySelector('.gallery-item')) {
	  setupGallery();
	}
  });
  
  /**
   * Configuración de la galería de imágenes con lightbox
   */
  function setupGallery() {
	// Referencias a elementos del lightbox
	const lightbox = document.getElementById('lightbox');
	if (!lightbox) return;
	
	const lightboxImg = document.querySelector('#lightbox .lightbox-image');
	const lightboxCaption = document.querySelector('#lightbox .lightbox-caption');
	const closeBtn = document.querySelector('#lightbox .close-btn');
	const prevBtn = document.querySelector('#lightbox .prev-btn');
	const nextBtn = document.querySelector('#lightbox .next-btn');
	
	// Variables para controlar la navegación
	let currentGallery = [];
	let currentIndex = 0;
	
	// Función para abrir el lightbox
	function openLightbox(img) {
	  // Obtener todas las imágenes de la misma galería
	  const galleryId = img.closest('.gallery').getAttribute('data-category');
	  currentGallery = Array.from(document.querySelectorAll(`.gallery[data-category="${galleryId}"] .gallery-item img`));
	  currentIndex = currentGallery.indexOf(img);
	  
	  // Actualizar el contenido del lightbox
	  updateLightboxContent();
	  
	  // Mostrar el lightbox
	  lightbox.classList.add('active');
	  
	  // Deshabilitar scroll del cuerpo
	  document.body.style.overflow = 'hidden';
	}
	
	// Función para actualizar el contenido del lightbox
	function updateLightboxContent() {
	  const img = currentGallery[currentIndex];
	  const fullSrc = img.getAttribute('data-full') || img.src;
	  
	  // Actualizar imagen
	  lightboxImg.src = fullSrc;
	  lightboxImg.alt = img.alt;
	  
	  // Actualizar caption si existe
	  if (lightboxCaption) {
		const figcaption = img.closest('.gallery-item').querySelector('figcaption');
		lightboxCaption.textContent = figcaption ? figcaption.textContent : '';
	  }
	  
	  // Actualizar botones de navegación
	  updateNavButtons();
	}
	
	// Función para actualizar visibilidad de botones de navegación
	function updateNavButtons() {
	  // Mostrar/ocultar botones según la cantidad de imágenes
	  if (currentGallery.length <= 1) {
		prevBtn.style.display = 'none';
		nextBtn.style.display = 'none';
	  } else {
		prevBtn.style.display = 'flex';
		nextBtn.style.display = 'flex';
	  }
	}
	
	// Cerrar el lightbox
	function closeLightbox() {
	  lightbox.classList.remove('active');
	  document.body.style.overflow = ''; // Restaurar scroll
	}
	
	// Navegar a la imagen anterior
	function prevImage() {
	  currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
	  updateLightboxContent();
	}
	
	// Navegar a la imagen siguiente
	function nextImage() {
	  currentIndex = (currentIndex + 1) % currentGallery.length;
	  updateLightboxContent();
	}
	
	// Asignar eventos a los elementos del lightbox
	if (closeBtn) {
	  closeBtn.addEventListener('click', function(e) {
		e.stopPropagation();
		closeLightbox();
	  });
	}
	
	if (prevBtn) {
	  prevBtn.addEventListener('click', function(e) {
		e.stopPropagation();
		prevImage();
	  });
	}
	
	if (nextBtn) {
	  nextBtn.addEventListener('click', function(e) {
		e.stopPropagation();
		nextImage();
	  });
	}
	
	// Cerrar lightbox al hacer clic en el fondo
	lightbox.addEventListener('click', function(e) {
	  if (e.target === lightbox) {
		closeLightbox();
	  }
	});
	
	// Navegación con teclado
	document.addEventListener('keydown', function(e) {
	  if (!lightbox.classList.contains('active')) return;
	  
	  switch (e.key) {
		case 'Escape':
		  closeLightbox();
		  break;
		case 'ArrowLeft':
		  prevImage();
		  break;
		case 'ArrowRight':
		  nextImage();
		  break;
	  }
	});
	
	// Asignar evento click a todas las imágenes de galerías
	document.querySelectorAll('.gallery-item img').forEach(img => {
	  img.addEventListener('click', function() {
		openLightbox(this);
	  });
	});
  }