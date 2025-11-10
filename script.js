document.addEventListener("DOMContentLoaded", () => {
  const palabraOculta = document.querySelector(".palabraOculta");
  const letras = document.querySelectorAll(".letra");
  const intentosSpan = document.querySelector(".intentos span");
  const erroresSpan = document.querySelector(".erroresCometidos span"); 
  const tiempoSpan = document.getElementById("tiempo");
  const PopupUsuario = document.querySelector(".contenedor-sesion");
  const btnUsuario = document.querySelector(".sesion-usuario button");
  const nombreUsuarioInput = document.querySelector(".sesion-usuario input");
  const errorUsuario = document.querySelector(".error-usuario");

  // Datos del juego
  const palabra = "PAPER";
  let progreso = Array(palabra.length).fill("_"); // crea un guion por cada letra
  let errores = 0; 
  const intentosMaximos = 6; 

  // Datos usuario 
  let usuario = null;
  let usuarios = JSON.parse(localStorage.getItem("usuarios"))|| []; // Esto recupera el almacenamiento del local storage y si no hay nada dentro crea el array

  // Mostrar la palabra en pantalla
  function mostrarProgreso() {
    let texto = ""; // Inicializo el texto
    progreso.forEach((letra) => { 
      texto += letra + " "; 
    });
    palabraOculta.innerText = texto.trim();
  }

  // Actualizar contadores de errores e intentos
  function actualizarContadores() {
    // evitar que los errores o intentos restantes sean negativos
    if (errores < 0) errores = 0;
    const intentosRestantes = intentosMaximos - errores >= 0 ? intentosMaximos - errores : 0; // calcula los intentos restantes, pero si el resultado llegase a ser negativo usa 0 en vez de dejarlo en negativo

    intentosSpan.innerText = intentosRestantes; 
    erroresSpan.innerText = errores;
  }

  // Datos contador 
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

  function UsuarioValido(nombre){
    const valido = nombre && nombre.trim().length >= 3;
    if(!valido) {
      errorUsuario.innerText = "El usuario debe tener al menos 3 caracteres";
      errorUsuario.style.display = "block";
    } 

    return valido;
  }

  function guardarUsuario() {
    const tiempoFinal = `${minutos < 10 ? "0" + minutos : minutos}:${segundos < 10 ? "0" + segundos : segundos}`; // formatear tiempo
    const datoUsuario = {
      nombre: usuario, // nombre del jugador
      palabra: palabra, // palabra jugada
      tiempo: tiempoFinal, // tiempo de la partida
      errores: errores // errores cometidos
    };
    usuarios.push(datoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    console.log(usuarios); 
  }
  
  mostrarProgreso();
  actualizarContadores();
  actualizarTiempo();
  
  // Eventos 

  btnUsuario.addEventListener("click", () => {
    const nombreIngresado = nombreUsuarioInput.value.trim(); // obtener valor input
    // validar el nombre ingresado y mostrar error en el modal si corresponde
    if (UsuarioValido(nombreIngresado)) {
      usuario = nombreIngresado; // asignar usuario actual
      PopupUsuario.style.display = "none"; 
    }
  });


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
        if (!progreso.includes("_")) { // Si no hay más guiones que añadir pues has adivinado la palabra
          detenerCrono();
          guardarUsuario();
        }
      } else {
        letra.classList.add("bloqueado"); // Si hay errores pues sigue dando error en la letra

        if (errores < intentosMaximos) errores++; // Aumenta el contador de errores
        actualizarContadores(); // Actualiza  para mostrar los valores por pantalla

        if (errores >= intentosMaximos) {
          detenerCrono();
          guardarUsuario();
        }
      }
    });
  });
});
