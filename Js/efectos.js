/* EFECTOS - Syntax Error */

/* 0. Tema claro/oscuro: se aplica ya mismo para evitar parpadeos */
(function () {
    let guardado = null;
    try { guardado = localStorage.getItem("tema"); } catch (e) {}
    const prefiereClaro = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches;
    const tema = guardado || (prefiereClaro ? "claro" : "oscuro");
    document.documentElement.setAttribute("data-tema", tema);
})();

document.addEventListener("DOMContentLoaded", () => {

    /* 0b. Botón para cambiar de tema */
    const raiz = document.documentElement;
    const btnTema = document.createElement("button");
    btnTema.id = "btn-tema";
    btnTema.type = "button";
    document.body.appendChild(btnTema);

    const pintarBoton = () => {
        const claro = raiz.getAttribute("data-tema") === "claro";
        btnTema.textContent = claro ? "🌙" : "☀️";
        btnTema.setAttribute("aria-label", claro ? "Activar modo oscuro" : "Activar modo claro");
        btnTema.title = claro ? "Modo oscuro" : "Modo claro";
    };
    pintarBoton();

    btnTema.addEventListener("click", () => {
        const nuevo = raiz.getAttribute("data-tema") === "claro" ? "oscuro" : "claro";
        raiz.classList.add("cambiando-tema");
        raiz.setAttribute("data-tema", nuevo);
        try { localStorage.setItem("tema", nuevo); } catch (e) {}
        pintarBoton();
        setTimeout(() => raiz.classList.remove("cambiando-tema"), 500);
    });

    /* 1. Aparición al hacer scroll */
    const objetivos = document.querySelectorAll(
        ".container-sobrenosotros, .container-experiencia, .container-estudios, " +
        ".proyecto, .container-contacto, .integrante, section > h2"
    );
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add("visible");
                observador.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    objetivos.forEach((el, i) => {
        el.classList.add("reveal");
        el.style.transitionDelay = (i % 3) * 0.08 + "s"; // pequeño escalonado
        observador.observe(el);
    });

    /* 2. Barra de progreso + botón subir */
    const barra = document.createElement("div");
    barra.id = "barra-progreso";
    document.body.appendChild(barra);

    const btn = document.createElement("button");
    btn.id = "btn-subir";
    btn.type = "button";
    btn.setAttribute("aria-label", "Volver arriba");
    btn.textContent = "↑";
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    document.body.appendChild(btn);

    window.addEventListener("scroll", () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        barra.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
        btn.classList.toggle("mostrar", window.scrollY > 400);
    }, { passive: true });

    /* 3. Marcar en el menú la sección actual */
    const links = document.querySelectorAll(".navigation a");
    const secciones = [...links]
        .map((a) => document.querySelector(a.getAttribute("href")))
        .filter(Boolean);
    const obsNav = new IntersectionObserver((entradas) => {
        entradas.forEach((e) => {
            if (e.isIntersecting) {
                links.forEach((a) =>
                    a.classList.toggle("activo", a.getAttribute("href") === "#" + e.target.id));
            }
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secciones.forEach((s) => obsNav.observe(s));

    /* 4. Luz que sigue al mouse en las tarjetas */
    document.querySelectorAll(".proyecto, .integrante").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty("--mx", e.clientX - r.left + "px");
            card.style.setProperty("--my", e.clientY - r.top + "px");
        });
    });

    /* 5. Avatar con iniciales para cada integrante */
    document.querySelectorAll(".integrante").forEach((card) => {
        const nombre = card.querySelector("h3");
        if (!nombre) return;
        const partes = nombre.textContent.trim().split(/\s+/);
        const iniciales = (partes[0][0] + (partes[1] ? partes[1][0] : "")).toUpperCase();
        const av = document.createElement("div");
        av.className = "avatar-iniciales";
        av.textContent = iniciales;
        card.insertBefore(av, nombre);
    });

    /* 6. Reemplaza las iniciales por la foto del integrante */
    function ponerFotoIntegrante(nombre, src) {
        document.querySelectorAll(".integrante").forEach((card) => {
            const h3 = card.querySelector("h3");
            if (!h3 || h3.textContent.trim() !== nombre) return;
            const av = card.querySelector(".avatar-iniciales");
            if (!av) return;
            const img = document.createElement("img");
            img.src = src;
            img.alt = `Foto de ${nombre}`;
            av.textContent = "";
            av.classList.add("con-foto");
            av.appendChild(img);
        });
    }

    ponerFotoIntegrante("Rodrigo Sanchez", "./Assets/rodrigo.jpg");
    ponerFotoIntegrante("Matias Lopez", "./Assets/matias.jpg");
    ponerFotoIntegrante("Gustavo Alaniz", "./Assets/gustavo.jpg");
    ponerFotoIntegrante("Cristian Vidal", "./Assets/cristian.jpg");
    ponerFotoIntegrante("Emanuel Nuñez", "./Assets/emanuel.jpg");
    ponerFotoIntegrante("Bruno Sosa", "./Assets/brunoSosa.jpeg");
    ponerFotoIntegrante("Jesus D. Perez", "./Assets/jesus.jpeg");
    ponerFotoIntegrante("Juan Sosa", "./Assets/juan.jpg");
    ponerFotoIntegrante("Luciano Morcillo", "./Assets/LucianoMorcillo.jpeg");
});
