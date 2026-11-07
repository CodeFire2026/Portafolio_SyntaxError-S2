const CONFIG = {
    // Endpoint del servicio de formularios
    endpoint: 'https://formspree.io/f/xgaogddr',

    // Tiempo máximo de espera de la respuesta (ms)
    tiempoLimite: 15000,

    // Trampa de tiempo anti-spam: si el form se envía antes de esto, es un bot (ms)
    tiempoMinimoEnPagina: 3000,

    // Cuánto tiempo queda visible cada aviso (ms). Debe coincidir con la animación del CSS
    duracionAlerta: 5000
};

/* Momento en que se cargó la página, para la trampa de tiempo */
const paginaCargadaEn = Date.now();

/* Muestra un aviso flotante (usa los estilos .alert del CSS).
   Al estar en position: fixed no empuja el contenido ni provoca saltos de scroll. */
function mostrarAlerta(texto, tipo) {
    let contenedor = document.getElementById('flas-messages');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'flas-messages';
        contenedor.setAttribute('aria-live', 'polite');
        contenedor.setAttribute('aria-atomic', 'true');
        document.body.appendChild(contenedor);
    }

    // Un aviso a la vez: el anterior se descarta para que no se apilen
    contenedor.replaceChildren();

    const alerta = document.createElement('div');
    alerta.className = 'alert ' + (tipo || 'success');
    alerta.setAttribute('role', tipo === 'danger' ? 'alert' : 'status');
    alerta.textContent = texto;
    contenedor.appendChild(alerta);

    const quitar = function () {
        alerta.remove();
    };

    // Se borra cuando termina la animación; el temporizador cubre el caso
    // de quienes tienen las animaciones desactivadas (prefers-reduced-motion)
    alerta.addEventListener('animationend', quitar);
    setTimeout(quitar, CONFIG.duracionAlerta);
}

/* Revisa que el endpoint esté configurado antes de intentar enviar*/
function endpointListo() {
    return CONFIG.endpoint && !/TU_ID_AQUI|tu@mail\.com/.test(CONFIG.endpoint);
}

/* El formulario terminal sigue el tema claro/oscuro global, así que no necesita un botón propio de color. */
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.contact-form');
    if (!form) {
        return;
    }

    const boton = form.querySelector('.submit-btn');

    // Tras un envío el formulario queda con la clase .sin-terminos (ver más abajo).
    // Al volver a tocar la casilla, el desplegable recupera su comportamiento normal.
    const casillaTerminos = form.querySelector('#contacto-terminos');
    if (casillaTerminos) {
        casillaTerminos.addEventListener('change', function () {
            form.classList.remove('sin-terminos');
        });
    }

    form.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        if (!endpointListo()) {
            mostrarAlerta('Falta configurar el endpoint del formulario en js/contacto.js', 'danger');
            return;
        }

        // Trampa de tiempo: los bots envían casi instantáneamente, las personas no
        if (Date.now() - paginaCargadaEn < CONFIG.tiempoMinimoEnPagina) {
            mostrarAlerta('Esperá un momento y volvé a intentar.', 'danger');
            return;
        }

        // Recoge los datos del formulario (incluye los campos trampa anti-spam)
        const datos = Object.fromEntries(new FormData(form));
        datos.terminos = form.terminos.checked;

        const textoOriginal = boton.textContent;
        boton.disabled = true;
        boton.textContent = 'Enviando...';

        // Corta la espera si el servidor no responde
        const controlador = new AbortController();
        const temporizador = setTimeout(function () {
            controlador.abort();
        }, CONFIG.tiempoLimite);

        try {
            const respuesta = await fetch(CONFIG.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(datos),
                signal: controlador.signal
            });

            const resultado = await respuesta.json().catch(function () {
                return {};
            });

            const envioOk = respuesta.ok && resultado.ok !== false && resultado.success !== false;

            if (!envioOk) {
                const mensaje = (resultado.errors && resultado.errors[0] && resultado.errors[0].message)
                    || resultado.error
                    || resultado.message
                    || 'No se pudo enviar el mensaje.';
                throw new Error(mensaje);
            }

            mostrarAlerta('Mensaje enviado. ¡Gracias por escribirme!', 'success');

            /*
             * No usamos form.reset() a secas: al desmarcar "términos" se volvería a abrir
             * el desplegable y el formulario crecería de golpe, empujando el contenido y
             * provocando el salto brusco. La clase .sin-terminos mantiene el desplegable
             * cerrado hasta que la persona vuelva a tocar la casilla.
             */
            form.reset();
            form.classList.add('sin-terminos');
        } catch (error) {
            const mensaje = error.name === 'AbortError'
                ? 'El servidor tardó demasiado. Probá de nuevo.'
                : (error.message || 'No se pudo enviar el mensaje.');
            mostrarAlerta(mensaje, 'danger');
        } finally {
            clearTimeout(temporizador);
            boton.disabled = false;
            boton.textContent = textoOriginal;
        }
    });
});
