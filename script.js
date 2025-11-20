document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const palabraOculta = document.querySelector(".palabraOculta"); // Pillar el div de la palabra oculta
  const letras = document.querySelectorAll(".letra") // Pillar todas los div con la clase letra
  const intentosSpan = document.querySelector(".intentos span") // Pillamos el span que hay dentro de la clase intentos
  const erroresSpan = document.querySelector(".errores-cometidos span") // Agarramos el span del div de errores cometidos
  const tiempoSpan = document.getElementById("tiempo"); // Agarramos el div que contiene el tiempo
  const PopUpUsuario = document.querySelector(".contenedor-sesion"); // Agarramos el div que contiene el inicio de sesión 
  const formUsuario = document.getElementById("formUsuario"); // El form para "iniciar sesión"
  const nombreUsuarioInput = formUsuario.querySelector("input"); // Para recoger el nombre introducido
  const errorUsuario = document.querySelector(".error-usuario"); // Para poder mostrar la validación del nombre
  const mensajeGanadoPerdido = document.getElementById("win-lose");
  const urlPalabrasEndPoint = "http://localhost:3000/palabras";

  // Inicialización de las variables del juego
  let palabra = ""; // La dejamos en blanco
  let progreso = []; // Creamos un array vacío
  let errores = 0; // Errores en 0 para inicializarlo
  const intentosMaximos = 6; // Damos un máximo de intentos para adivinar la palabra
  let usuario = null;
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];  // Pilla los usuarios que hayan creados en el localStorage solo si hay , si no hay crea un array de estos

  // Inicialización del contador del juego
  let segundos = 0;
  let minutos = 0;
  let intervalo = null;
  let iniciado = false;

  // Inicialización de cuenta atras que resta vidas
  let tiempoRestante = 10;
  let cuentaAtrasIntervalo = null;


   // ------------- FUNCIONES -----------------

  // Función para mostrar progreso de la palabra en el juego
  function mostrarProgreso() {
    palabraOculta.innerText = progreso.join(" "); // Esta función actualiza en pantalla el progreso del jugador, toma el array "progreso", une sus elementos con espacios
  }

  // Función para actualizar los intentos y errores de la pantalla
  function actualizarContadores() {
    if(errores < 0 ) {
      errores = 0;
    }
    const intentosRestantes = intentosMaximos - errores >=0 ? intentosMaximos - errores : 0; //  Si la resta (intentosMaximos - errores) es mayor o igual a 0, usa ese valor; de lo contrario, devuelve 0 para evitar números negativos.
    intentosSpan.innerText = intentosRestantes;
    erroresSpan.innerText = errores;
  }

  // Función para actualizar el tiempo de la partida
  function actualizarTiempo() {
    // Si los minutos o segundos son menores a 10, les agrega un 0 delante.
    const seg = segundos < 10 ? "0" + segundos : segundos;
    const min = minutos < 10 ? "0" + minutos : minutos;
    tiempoSpan.innerText = `${min}:${seg}`;
  }

  // Función para iniciar el cronometro del juego

  function iniciarCronometro() {
    if(iniciado) return;
    iniciado = true;
    intervalo = setInterval(()=> {
      segundos++;
      if(segundos == 60){ // Si los segundos llegan a 60 pues segundos se vuelve a 0 y se suma un minuto
        segundos = 0;
        minutos++;
      }
      actualizarTiempo();
    },1000);
  }

  // Función que hace que se detenga el cronometro
  function detenerCrono(){
    clearInterval(intervalo);
  }

  // Función que inicia la cuenta atras que resta vidas
  function iniciarCuentaAtras(){
    cuentaAtrasIntervalo = setInterval(() => {
      tiempoRestante--;
      if(tiempoRestante <= 0){
        errores++;
        actualizarContadores();
        tiempoRestante = 10;
      }
      if(errores >= intentosMaximos) { // Si los errores cometidos son mayores a los intentos máximos dados ocurre eso
        detenerCrono();
        detenerCuentaAtras();
        guardarUsuario();
        mostrarPerdido();
      }
    },1000);
  }

  // Función que reinicia el intervalo de la cuenta atras
  function reiniciarCuentaAtrasInterno(){
    tiempoRestante = 10;
  }

  // Función que detiene la cuenta atras
  function detenerCuentaAtras(){
    clearInterval(cuentaAtrasIntervalo);
    cuentaAtrasIntervalo = null;
  }

  // Función para la validación del nombre del usuario
  function usuarioValido(nombre){
    const valido = nombre && nombre.trim().length >= 3;
    if(!valido){
      errorUsuario.innerText = "El usuario debe tener al menos 3 caractéres";
      errorUsuario.style.display = "block";
    } else {
      errorUsuario.style.display = "none";
    }
    return valido;
  }

  // Función para guardar el usuario en el localStorage
  function guardarUsuario(){
    const tiempoFinal = `${minutos < 10 ? "0" + minutos : minutos}:${segundos < 10 ? "0" + segundos : segundos}`;
    const datosUsuario = {
      nombre: usuario,
      palabra: palabra,
      tiempo: tiempoFinal,
      errores: errores
    };
    usuarios.push(datosUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }

  // Función para mostrar el leaderboard del juego
  function mostrarLeaderboard(){
    const mostrarUsuarioRank = document.querySelector(".leaderboard-user");
    if(usuarios.length === 0){
      mostrarUsuarioRank.innerHTML = "<p>No hay partidas registradas.";
      return;
    }

    let usuariosTotales = "";
    usuarios.forEach(element => {
      usuariosTotales +=`Usuario: <span>${element.nombre}</span> - Palabra: <span>${element.palabra}</span> - Tiempo: <span>${element.tiempo}</span> - Errores: <span>${element.errores}</span><br>`;
    });
    mostrarUsuarioRank.innerHTML = usuariosTotales;
  }

  // Función para elegir la temática del juego
  async function escogerTematica(tematica){
  try {
    // Fetch al endpoint con filtro por temática
    const response = await fetch(`${urlPalabrasEndPoint}?tematica=${tematica}`);
    const palabras = await response.json();

    if(palabras.length === 0){
      console.error("No hay palabras para esta temática");
      return;
    }

    // Elegir palabra aleatoria
    palabra = palabras[Math.floor(Math.random() * palabras.length)].texto.toUpperCase();
    progreso = Array(palabra.length).fill("_");

    mostrarProgreso();
    actualizarContadores();
  } catch (error) {
    console.error("Error al obtener palabras:", error);
  }
}

    // Mostrar mensaje perdido
  function mostrarPerdido() {
    mensajeGanadoPerdido.style.color = "red";
    mensajeGanadoPerdido.innerHTML = `¡Has perdido! La palabra era <span>${palabra}</span>`;
  }

  // Mostrar mensaje ganado
  function mostrarGanado() {
    mensajeGanadoPerdido.style.color = "green";
    mensajeGanadoPerdido.innerHTML = "¡Has Ganado!";
  }

  // ------------------ EVENTOS -----------------

  // Evento en el formulario que hace el submit para ingresar el nombre y tambien se escoge la temática
  formUsuario.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const nombreIngreasdo = nombreUsuarioInput.value.trim();
    const tematica = document.getElementById("selector-tematica").value;

    if(usuarioValido(nombreIngreasdo)){
      usuario = nombreIngreasdo;
      escogerTematica(tematica);
      PopUpUsuario.style.display = "none";
    }
  })

  // Eveneto para iniciar el juego
  let juegoIniciado = false;

  letras.forEach((letra) => {
    letra.addEventListener("click", () => {
      if(!juegoIniciado){
        iniciarCronometro();
        iniciarCuentaAtras();
        juegoIniciado = true;
      }
      const letraSeleccionada = letra.innerText;

      if(letra.classList.contains("selecionado") || letra.classList.contains("bloqueado")) {
        return;
      }

      if(palabra.includes(letraSeleccionada)){
        letra.classList.add("seleccionado");
        reiniciarCuentaAtrasInterno();

        for(let i = 0; i < palabra.length; i++){
          if(palabra[i] === letraSeleccionada) progreso[i] = letraSeleccionada;
        }

        mostrarProgreso();

        if(!progreso.includes("_")){
          detenerCrono();
          detenerCuentaAtras();
          guardarUsuario();
          mostrarGanado();
        } 
      } else {
        letra.classList.add("bloqueado");
        errores++;
        actualizarContadores();
      }

        if(errores >= intentosMaximos){
          detenerCrono();
          detenerCuentaAtras();
          mostrarPerdido();
        }
    })
  });

  // Inicialización leaderboard 
    mostrarLeaderboard();
    actualizarTiempo();
    actualizarContadores();
});
