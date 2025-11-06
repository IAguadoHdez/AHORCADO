document.addEventListener("DOMContentLoaded", () => {
  const palabraOculta = document.querySelector(".palabraOculta");
  const letras = document.querySelectorAll(".letra");
  const intentosSpan = document.querySelector(".intentos span");
  const erroresSpan = document.querySelector(".erroresCometidos span"); 
  const tiempoSpan = document.getElementById("tiempo");
  const PopupUsuario = document.querySelector(".contenedor-sesion");
  const btnUsuario = document.querySelector(".sesion-usuario button");
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

  // Contador 
  let segundos = 0;
  let minutos = 0;
  let intervalo = null;
  let iniciado = false;

  function actualizarTiempo() {
    let seg = segundos < 10 ? "0" + segundos : segundos; // Esto hace que si los segundos son menores a 10 se agregue el 0 delante del numero ejemplo si es 7 saldria "07"
    let min = minutos < 10 ? "0" + minutos : minutos; // Esto hace lo mismo pero con los minutos
    tiempoSpan.innerText = `${min}:${seg}`; 
  }

  function iniciarCronometro() {
    if(iniciado) return; // Si ya esta iniciado que no haga nada
    iniciado = true;
    //Crear el intervalo que se ejecuta cada segundo que pasa
    intervalo = setInterval(() => {
      segundos++;

      // Esto hace que cuando los segundos marcan 60 pues vuelve a 0 para poder seguir con el minuto que se suma
      if(segundos == 60) {  
        segundos = 0;
        minutos++;
      }
      actualizarTiempo();
    }, 1000);
  }

  function detenerCrono() {
    clearInterval(intervalo); // Elimina intervalo
  }


  
  mostrarProgreso();
  actualizarContadores();
  actualizarTiempo();
  
  // Eventos 

  btnUsuario.addEventListener("click", () => {
      PopupUsuario.style.display = "none";
  })

  letras.forEach((letra) => {
    letra.addEventListener("click", () => {
      iniciarCronometro();
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
        if (!progreso.includes("_")) {
          detenerCrono();
        }
      } else {
        letra.classList.add("bloqueado");

        if (errores < intentosMaximos) errores++;
        actualizarContadores();

        if (errores >= intentosMaximos) {
          detenerCrono();
        }
      }
    });
  });
});
