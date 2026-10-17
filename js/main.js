/* ==========================================================================
   DISEÑÁ LO QUE VIENE — comportamiento
    Sin dependencias. Solo: menú mobile, resaltado de sección activa,
    desplazamiento con offset para el header sticky, muestrario de la
    galería, acordeón de la formación y configuración del CTA hacia la
    aplicación complementaria.
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

  /* --------------------------- Muestrario galería --------------------------- */
  var pila = document.getElementById("carrusel-pista");
  var btnAnterior = document.getElementById("carrusel-anterior");
  var btnSiguiente = document.getElementById("carrusel-siguiente");
  var contador = document.getElementById("carrusel-actual");
  var barra = document.getElementById("carrusel-progreso-barra");
  var tira = document.querySelector(".muestrario__tira");

  if (pila) {
    var diapos = Array.prototype.slice.call(pila.querySelectorAll(".diapo"));
    var miniaturas = tira
      ? Array.prototype.slice.call(tira.querySelectorAll(".miniatura"))
      : [];
    var total = diapos.length;
    var indice = 0;

    function mostrar(i) {
      if (!total) return;
      indice = (i + total) % total;

      diapos.forEach(function (d, n) {
        d.classList.toggle("is-activa", n === indice);
      });

      miniaturas.forEach(function (m, n) {
        var activa = n === indice;
        m.classList.toggle("is-activa", activa);
        if (activa) {
          m.setAttribute("aria-current", "true");
        } else {
          m.removeAttribute("aria-current");
        }
      });

      if (contador) contador.textContent = String(indice + 1).padStart(2, "0");
      if (barra) barra.style.width = ((indice + 1) / total) * 100 + "%";
    }

    if (btnAnterior) {
      btnAnterior.addEventListener("click", function () {
        mostrar(indice - 1);
      });
    }

    if (btnSiguiente) {
      btnSiguiente.addEventListener("click", function () {
        mostrar(indice + 1);
      });
    }

    miniaturas.forEach(function (m, n) {
      m.addEventListener("click", function () {
        mostrar(n);
      });
    });

    pila.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        mostrar(indice + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        mostrar(indice - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        mostrar(0);
      } else if (e.key === "End") {
        e.preventDefault();
        mostrar(total - 1);
      }
    });

    /* Deslizar con el dedo sobre el escenario */
    var toqueX = null;
    pila.addEventListener("touchstart", function (e) {
      toqueX = e.changedTouches[0].clientX;
    }, { passive: true });

    pila.addEventListener("touchend", function (e) {
      if (toqueX === null) return;
      var delta = e.changedTouches[0].clientX - toqueX;
      toqueX = null;
      if (Math.abs(delta) < 45) return;
      mostrar(delta < 0 ? indice + 1 : indice - 1);
    }, { passive: true });

    mostrar(0);
  }

  /* --------------------------- Acordeón formación --------------------------- */
  var botonesAcordeon = Array.prototype.slice.call(
    document.querySelectorAll(".acordeon__boton")
  );

  botonesAcordeon.forEach(function (boton) {
    boton.addEventListener("click", function () {
      var item = boton.closest(".acordeon__item");
      if (!item) return;
      var abierto = item.classList.toggle("is-abierto");
      boton.setAttribute("aria-expanded", String(abierto));
    });
  });

  /* ------------------- Aparición al hacer scroll ------------------- */
  var revelados = Array.prototype.slice.call(
    document.querySelectorAll("[data-revelar]")
  );
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (revelados.length) {
    if (!("IntersectionObserver" in window) || reduceMotion) {
      revelados.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
      );
      revelados.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* ------------------- Volver arriba ------------------- */
  var volver = document.getElementById("volver-arriba");

  if (volver) {
    function actualizarVolver() {
      if (window.scrollY > 600) {
        volver.removeAttribute("hidden");
      } else {
        volver.setAttribute("hidden", "");
      }
    }

    window.addEventListener("scroll", actualizarVolver, { passive: true });
    actualizarVolver();

    volver.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
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
