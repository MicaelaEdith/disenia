/* ==========================================================================
   DISEÑÁ LO QUE VIENE — comportamiento
   Sin dependencias. Solo: menú mobile, resaltado de sección activa,
   desplazamiento con offset para el header sticky, carrusel de la
   galería y configuración del CTA hacia la aplicación complementaria.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     CONFIGURACIÓN
     Reemplazar el valor vacío por la URL de la aplicación complementaria.
     Ejemplo: var URL_APLICACION = "https://ejemplo.com/consulta";
     Mientras esté vacía, el botón queda inerte y se muestra la nota.
     ------------------------------------------------------------------ */
  var URL_APLICACION = "";

  /* ------------------------------ Menú ------------------------------ */
  var toggle = document.querySelector(".nav__toggle");
  var lista = document.getElementById("nav-menu");

  function cerrarMenu() {
    if (!toggle || !lista) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú de navegación");
    lista.setAttribute("data-abierto", "false");
  }

  if (toggle && lista) {
    toggle.addEventListener("click", function () {
      var abierto = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!abierto));
      toggle.setAttribute(
        "aria-label",
        abierto ? "Abrir menú de navegación" : "Cerrar menú de navegación"
      );
      lista.setAttribute("data-abierto", String(!abierto));
    });

    lista.addEventListener("click", function (e) {
      if (e.target.closest("a")) cerrarMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") cerrarMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) cerrarMenu();
    });
  }

  /* ------------------- Offset de anclas (header sticky) ------------------- */
  var secciones = Array.prototype.slice.call(
    document.querySelectorAll("main section[id]")
  );

  function ajustarOffset() {
    var nav = document.querySelector(".nav");
    var altura = nav ? nav.offsetHeight : 84;
    secciones.forEach(function (s) {
      s.style.scrollMarginTop = altura + 8 + "px";
    });
  }

  ajustarOffset();
  window.addEventListener("resize", ajustarOffset);

  /* ------------------- Sección activa en la navegación ------------------- */
  var links = Array.prototype.slice.call(
    document.querySelectorAll(".nav__link")
  );

  function marcarActiva(id) {
    links.forEach(function (link) {
      var coincide = link.getAttribute("href") === "#" + id;
      if (coincide) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && secciones.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) marcarActiva(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    secciones.forEach(function (s) {
      observer.observe(s);
    });
  }

  /* --------------------------- Carrusel galería --------------------------- */
  var pista = document.getElementById("carrusel-pista");
  var btnAnterior = document.getElementById("carrusel-anterior");
  var btnSiguiente = document.getElementById("carrusel-siguiente");
  var contador = document.getElementById("carrusel-actual");
  var barra = document.getElementById("carrusel-progreso-barra");

  if (pista) {
    var slides = Array.prototype.slice.call(pista.querySelectorAll(".slide"));
    var indice = 0;

    function comportamientoScroll() {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
    }

    function paso() {
      if (slides.length < 2) return pista.clientWidth;
      return slides[1].offsetLeft - slides[0].offsetLeft;
    }

    // Posición del slide dentro del contenido scrolleable de la pista
    function inicioSlide(el) {
      return el.getBoundingClientRect().left - pista.getBoundingClientRect().left + pista.scrollLeft;
    }

    function indiceDesdeScroll() {
      var p = paso();
      if (p <= 0) return 0;
      return Math.max(0, Math.min(slides.length - 1, Math.round(pista.scrollLeft / p)));
    }

    function actualizar() {
      indice = indiceDesdeScroll();
      if (contador) {
        contador.textContent = String(indice + 1).padStart(2, "0");
      }
      if (barra) {
        barra.style.width = ((indice + 1) / slides.length) * 100 + "%";
      }
      if (btnAnterior) btnAnterior.disabled = indice === 0;
      if (btnSiguiente) btnSiguiente.disabled = indice === slides.length - 1;
    }

    function irA(i) {
      indice = Math.max(0, Math.min(slides.length - 1, i));
      pista.scrollTo({ left: inicioSlide(slides[indice]), behavior: comportamientoScroll() });
      actualizar();
    }

    if (btnAnterior) {
      btnAnterior.addEventListener("click", function () {
        irA(indice - 1);
      });
    }

    if (btnSiguiente) {
      btnSiguiente.addEventListener("click", function () {
        irA(indice + 1);
      });
    }

    var programatico = false;
    pista.addEventListener("scroll", function () {
      if (programatico) return;
      actualizar();
    }, { passive: true });

    // Sincroniza el estado cuando el scroll lento termina
    pista.addEventListener("scrollend", function () {
      actualizar();
    });

    pista.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        irA(indice + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        irA(indice - 1);
      }
    });

    /* Arrastre con mouse/pointer (la rueda y el swipe táctil ya son nativos) */
    var arrastrando = false;
    var inicioX = 0;
    var inicioScroll = 0;

    pista.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      arrastrando = true;
      inicioX = e.clientX;
      inicioScroll = pista.scrollLeft;
      pista.classList.add("is-dragging");
      pista.setPointerCapture(e.pointerId);
    });

    pista.addEventListener("pointermove", function (e) {
      if (!arrastrando) return;
      pista.scrollLeft = inicioScroll - (e.clientX - inicioX);
    });

    function terminarArrastre() {
      if (!arrastrando) return;
      arrastrando = false;
      pista.classList.remove("is-dragging");
      // Tras soltar, se ancla al slide más cercano
      programatico = true;
      irA(indiceDesdeScroll());
      window.setTimeout(function () {
        programatico = false;
      }, 400);
    }

    pista.addEventListener("pointerup", terminarArrastre);
    pista.addEventListener("pointercancel", terminarArrastre);
    pista.addEventListener("pointerleave", terminarArrastre);

    window.addEventListener("resize", actualizar);
    actualizar();
  }

  /* ---------------- CTA aplicación complementaria ---------------- */
  var cta = document.getElementById("cta-aplicacion");
  var nota = document.getElementById("cta-nota");

  if (cta) {
    if (URL_APLICACION) {
      cta.setAttribute("href", URL_APLICACION);
      cta.setAttribute("rel", "noopener noreferrer");
      if (nota) nota.setAttribute("data-oculto", "true");
    } else {
      // Sin URL configurada: el botón no navega a ningún lado.
      cta.setAttribute("aria-disabled", "true");
      cta.addEventListener("click", function (e) {
        e.preventDefault();
      });
    }
  }
})();
