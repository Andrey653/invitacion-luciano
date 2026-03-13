import { useState, useEffect, useRef, useCallback } from "react";
import "@/App.css";

const InvitacionLuciano = () => {
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [nombre, setNombre] = useState("");
  const [mostrarContenido, setMostrarContenido] = useState(false);
  const [countdown, setCountdown] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  const canvasRef = useRef(null);
  const particulasRef = useRef([]);
  const animationRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    const fechaEvento = new Date("May 17, 2026 12:00:00").getTime();
    
    const interval = setInterval(() => {
      const ahora = new Date().getTime();
      const distancia = fechaEvento - ahora;
      
      if (distancia > 0) {
        setCountdown({
          dias: Math.floor(distancia / (1000 * 60 * 60 * 24)),
          horas: Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutos: Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60)),
          segundos: Math.floor((distancia % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Canvas setup and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const animar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particulasRef.current = particulasRef.current.filter(p => p.vida > 0);
      
      particulasRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravedad
        p.vida--;
        p.size *= 0.99;
        
        // Gradiente de color basado en vida
        const alpha = p.vida / p.maxVida;
        ctx.globalAlpha = alpha;
        
        // Efecto de brillo
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(0.5, p.color2);
        gradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Partícula central más brillante
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animar);
    };

    animar();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const lanzarFuegos = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const colores = [
      ["#ff0000", "#ff6b6b"],
      ["#ffd700", "#ffed4a"],
      ["#00ff00", "#4ade80"],
      ["#00bfff", "#60a5fa"],
      ["#ff1493", "#f472b6"],
      ["#ff8c00", "#fb923c"],
      ["#9400d3", "#a855f7"],
    ];
    
    // Lanzar múltiples explosiones
    const numExplosiones = 5;
    for (let e = 0; e < numExplosiones; e++) {
      setTimeout(() => {
        const colorPar = colores[Math.floor(Math.random() * colores.length)];
        const centerX = Math.random() * canvas.width * 0.6 + canvas.width * 0.2;
        const centerY = Math.random() * canvas.height * 0.4 + canvas.height * 0.1;
        
        // Crear explosión principal
        for (let i = 0; i < 80; i++) {
          const angulo = (Math.PI * 2 / 80) * i + Math.random() * 0.3;
          const velocidad = 3 + Math.random() * 5;
          
          particulasRef.current.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angulo) * velocidad,
            vy: Math.sin(angulo) * velocidad,
            vida: 80 + Math.random() * 40,
            maxVida: 120,
            size: 3 + Math.random() * 3,
            color: colorPar[0],
            color2: colorPar[1]
          });
        }
        
        // Crear chispas secundarias
        for (let i = 0; i < 30; i++) {
          const angulo = Math.random() * Math.PI * 2;
          const velocidad = 1 + Math.random() * 3;
          
          particulasRef.current.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angulo) * velocidad,
            vy: Math.sin(angulo) * velocidad,
            vida: 50 + Math.random() * 30,
            maxVida: 80,
            size: 1 + Math.random() * 2,
            color: "#ffffff",
            color2: colorPar[0]
          });
        }
      }, e * 300);
    }
  }, []);

  const abrirSobre = () => {
    setMostrarPanel(true);
  };

  const mostrarInvitacion = () => {
    if (!nombre.trim()) {
      alert("Escribe tu nombre");
      return;
    }
    setMostrarContenido(true);
    lanzarFuegos();
    
    // Lanzar fuegos cada 3 segundos mientras está visible
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        lanzarFuegos();
      }
    }, 4000);
    
    return () => clearInterval(interval);
  };

  const whatsappLink = `https://wa.me/50687388936?text=${encodeURIComponent(`¡Hola! Soy ${nombre || 'invitado'} y confirmo mi asistencia al cumpleaños de Luciano 🎉`)}`;
  const mapsLink = "https://maps.google.com/?q=Salón+comunal+Zapote+Quesada+Durán";

  return (
    <div className="invitacion-container" data-testid="invitacion-container">
      <canvas ref={canvasRef} className="canvas-fuegos" data-testid="canvas-fuegos" />
      
      {/* Estrellas de fondo */}
      <div className="estrellas"></div>
      <div className="estrellas2"></div>
      
      {!mostrarPanel && (
        <div className="sobre-container" data-testid="sobre-container">
          <h1 className="titulo-principal">¡Estás Invitado!</h1>
          <img 
            data-testid="sobre-img"
            className="sobre-img" 
            src="https://cdn-icons-png.flaticon.com/512/561/561127.png" 
            alt="Sobre de invitación"
            onClick={abrirSobre}
          />
          <p className="texto-sobre">Toca el sobre para abrir</p>
        </div>
      )}

      {mostrarPanel && (
        <div className="panel" data-testid="panel-invitacion">
          {!mostrarContenido ? (
            <div className="formulario-nombre" data-testid="formulario-nombre">
              <h2>✨ Escribe tu nombre ✨</h2>
              <input 
                data-testid="input-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                onKeyPress={(e) => e.key === 'Enter' && mostrarInvitacion()}
              />
              <button 
                data-testid="btn-abrir-invitacion"
                onClick={mostrarInvitacion}
                className="btn-abrir"
              >
                Abrir invitación
              </button>
            </div>
          ) : (
            <div className="contenido-invitacion" data-testid="contenido-invitacion">
              <div className="saludo-container">
                <h1 className="saludo" data-testid="saludo-texto">
                  ¡Hola {nombre}! 👋
                </h1>
                <p className="mensaje-invitacion">
                  Quiero invitarte a mi cumpleaños número <span className="numero-dos">2</span> 🎉
                </p>
              </div>

              <div className="info-evento" data-testid="info-evento">
                <div className="info-item">
                  <span className="info-icon">📅</span>
                  <span>17 de Mayo, 2026</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">⏰</span>
                  <span>12:00 md</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <span>Salón comunal Zapote, Quesada Durán</span>
                </div>
              </div>

              <div className="contador" data-testid="contador">
                <h3>⏳ Faltan</h3>
                <div className="contador-items">
                  <div className="contador-item">
                    <span className="contador-numero">{countdown.dias}</span>
                    <span className="contador-label">días</span>
                  </div>
                  <div className="contador-item">
                    <span className="contador-numero">{countdown.horas}</span>
                    <span className="contador-label">horas</span>
                  </div>
                  <div className="contador-item">
                    <span className="contador-numero">{countdown.minutos}</span>
                    <span className="contador-label">min</span>
                  </div>
                  <div className="contador-item">
                    <span className="contador-numero">{countdown.segundos}</span>
                    <span className="contador-label">seg</span>
                  </div>
                </div>
              </div>

              <div className="botones-accion">
                <a 
                  data-testid="btn-confirmar"
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton boton-confirmar"
                >
                  ✅ Confirmar asistencia
                </a>
                <a 
                  data-testid="btn-ubicacion"
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton boton-ubicacion"
                >
                  📍 Ver ubicación
                </a>
              </div>

              <div className="luciano-img-container">
                <div className="globos">
                  🎈🎈🎈
                </div>
                <p className="firma">Con cariño, Luciano 💕</p>
              </div>
            </div>
          )}
        </div>
      )}

      <audio autoPlay loop>
        <source src="https://cdn.pixabay.com/audio/2022/03/15/audio_6d3c1f7a33.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

function App() {
  return <InvitacionLuciano />;
}

export default App;
