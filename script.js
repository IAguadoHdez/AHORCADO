document.addEventListener("DOMContentLoaded", () => {
  const palabraOculta = document.querySelector(".palabraOculta");
  const letras = document.querySelectorAll(".letra");
  const intentosSpan = document.querySelector(".intentos span");
  const erroresSpan = document.querySelector(".erroresCometidos span"); 

  const palabra = "PACO";

  let progreso = Array(palabra.length).fill("_"); // crea un guion por cada letra
  let errores = 0; 
  const intentosMaximos = 6; 

  // Mostrar la palabra en pantalla
  function mostrarProgreso() {
    let texto = "";
    progreso.forEach((letra) => {
      texto += letra + " "; 
    });
    palabraOculta.innerText = texto.trim();
  }

  // Actualizar contadores de errores e intentos
  function actualizarContadores() {
    // evitar que los errores o intentos restantes sean negativos
    if (errores < 0) errores = 0;
    const intentosRestantes = intentosMaximos - errores >= 0 ? intentosMaximos - errores : 0;

    intentosSpan.innerText = intentosRestantes; 
    erroresSpan.innerText = errores;
  }

  mostrarProgreso();
  actualizarContadores();

  // Eventos 

  letras.forEach((letra) => {
    letra.addEventListener("click", () => {
      const letraSeleccionada = letra.innerText;

      // Si la letra ya fue seleccionada o bloqueada, no hacer nada
      if (letra.classList.contains("seleccionado") || letra.classList.contains("bloqueado")) return;

      if (palabra.includes(letraSeleccionada)) {
        letra.classList.add("seleccionado"); // letra correcta

        // Reemplazar los guiones por la letra correcta
        for (let i = 0; i < palabra.length; i++) {
          if (palabra[i] === letraSeleccionada) progreso[i] = letraSeleccionada;
        }

        mostrarProgreso();

        // Verificar si he ganado
        if (!progreso.includes("_")) console.log("Has ganado!");
      } else {
        letra.classList.add("bloqueado"); // letra incorrecta

        // Solo sumamos error si aún no llegó al máximo
        if (errores < intentosMaximos) errores++;

        actualizarContadores();

        // Verificar si he perdido
        if (errores >= intentosMaximos) console.log(`Has perdido, la palabra era: ${palabra}`);
      }
    });
  });
});
