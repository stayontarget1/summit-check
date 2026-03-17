import { useRef, useEffect, useState, useCallback } from "react";

function getCondition(weatherCode, temp, windSpeed, isNight) {
  if (weatherCode === 0 && windSpeed < 10 && temp >= 40 && temp <= 80) return "bluebird";
  if (temp > 95) return "heat";
  if ([95, 96, 99].includes(weatherCode)) return "thunderstorm";
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return "snow";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) return "rain";
  if ([45, 48].includes(weatherCode)) return "fog";
  if ([1, 2, 3].includes(weatherCode)) return "cloudy";
  if (weatherCode === 0 && isNight) return "clearNight";
  if (weatherCode === 0) return "clearDay";
  return "clearDay";
}

const GRADIENTS = {
  clearDay: ["#1a1a2e", "#16213e", "#0f3460"],
  clearNight: ["#0a0a0f", "#0d0d1a", "#111122"],
  cloudy: ["#0e0e18", "#141425", "#1a1a30"],
  fog: ["#0f0f17", "#151520", "#1a1a28"],
  rain: ["#08080f", "#0c0c18", "#101020"],
  snow: ["#0e0f14", "#14151e", "#1a1c28"],
  thunderstorm: ["#050508", "#08080e", "#0a0a14"],
  bluebird: ["#0a1628", "#0e2040", "#123060"],
  heat: ["#1a0f08", "#201408", "#281a0a"],
};

function createParticles(condition, width, height) {
  const count = condition === "rain" ? 60 : condition === "snow" ? 50 : 0;
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: condition === "rain"
      ? 4 + Math.random() * 6
      : 0.3 + Math.random() * 1.2,
    size: condition === "rain"
      ? 1 + Math.random() * 1.5
      : 1.5 + Math.random() * 3,
    opacity: 0.15 + Math.random() * 0.35,
    drift: condition === "snow" ? (Math.random() - 0.5) * 0.6 : 0,
    wobblePhase: Math.random() * Math.PI * 2,
  }));
}

function createStars(width, height) {
  return Array.from({ length: 60 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 0.5 + Math.random() * 1.5,
    baseOpacity: 0.2 + Math.random() * 0.5,
    twinkleSpeed: 0.005 + Math.random() * 0.015,
    phase: Math.random() * Math.PI * 2,
  }));
}

function createWisps(count, width, height) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height,
    width: 100 + Math.random() * 250,
    height: 20 + Math.random() * 50,
    speed: 0.15 + Math.random() * 0.35,
    opacity: 0.02 + Math.random() * 0.04,
  }));
}

export default function WeatherAnimation({ weatherCode = 0, temp = 60, windSpeed = 5, isNight = false }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    particles: [],
    stars: [],
    wisps: [],
    condition: null,
    flashTimer: 0,
    flashOpacity: 0,
    frame: 0,
  });
  const rafRef = useRef(null);
  const [gradient, setGradient] = useState(GRADIENTS.clearDay);

  const condition = getCondition(weatherCode, temp, windSpeed, isNight);

  const initScene = useCallback((canvas) => {
    const { width, height } = canvas;
    const s = stateRef.current;
    s.condition = condition;
    s.frame = 0;
    s.flashTimer = 0;
    s.flashOpacity = 0;

    if (condition === "rain" || condition === "snow") {
      s.particles = createParticles(condition, width, height);
    } else {
      s.particles = [];
    }

    if (condition === "clearNight") {
      s.stars = createStars(width, height);
    } else {
      s.stars = [];
    }

    if (condition === "fog") {
      s.wisps = createWisps(8, width, height);
    } else if (condition === "cloudy") {
      s.wisps = createWisps(5, width, height);
    } else {
      s.wisps = [];
    }
  }, [condition]);

  useEffect(() => {
    setGradient(GRADIENTS[condition] || GRADIENTS.clearDay);
  }, [condition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initScene(canvas);
    }

    resize();
    window.addEventListener("resize", resize);

    function drawRain(s) {
      for (const p of s.particles) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(170, 200, 255, ${p.opacity})`;
        ctx.lineWidth = p.size * 0.5;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 0.5, p.y + p.speed * 2.5);
        ctx.stroke();

        p.y += p.speed;
        p.x -= 0.3;
        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }
      }
    }

    function drawSnow(s) {
      for (const p of s.particles) {
        p.wobblePhase += 0.02;
        const wobble = Math.sin(p.wobblePhase) * 0.5;

        ctx.beginPath();
        ctx.fillStyle = `rgba(220, 230, 255, ${p.opacity})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speed;
        p.x += p.drift + wobble;
        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
      }
    }

    function drawStars(s) {
      for (const star of s.stars) {
        star.phase += star.twinkleSpeed;
        const opacity = star.baseOpacity + Math.sin(star.phase) * 0.2;
        ctx.beginPath();
        ctx.fillStyle = `rgba(200, 210, 255, ${Math.max(0, opacity)})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawWisps(s) {
      for (const w of s.wisps) {
        ctx.beginPath();
        const grad = ctx.createRadialGradient(
          w.x + w.width / 2, w.y, 0,
          w.x + w.width / 2, w.y, w.width / 2
        );
        grad.addColorStop(0, `rgba(180, 190, 210, ${w.opacity})`);
        grad.addColorStop(1, "rgba(180, 190, 210, 0)");
        ctx.fillStyle = grad;
        ctx.ellipse(w.x + w.width / 2, w.y, w.width / 2, w.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        w.x += w.speed;
        if (w.x > width + 100) {
          w.x = -w.width - 50;
          w.y = Math.random() * height;
        }
      }
    }

    function drawClearDay(s) {
      const rayCount = 4;
      for (let i = 0; i < rayCount; i++) {
        const angle = (s.frame * 0.0003 + (i / rayCount) * Math.PI * 2);
        const x = width * 0.7 + Math.cos(angle) * 100;
        const y = -50;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, height * 0.6);
        grad.addColorStop(0, "rgba(255, 220, 150, 0.015)");
        grad.addColorStop(1, "rgba(255, 220, 150, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    }

    function drawThunderstorm(s) {
      s.flashTimer++;
      if (s.flashTimer > 200 + Math.random() * 400) {
        s.flashOpacity = 0.04 + Math.random() * 0.03;
        s.flashTimer = 0;
      }
      if (s.flashOpacity > 0) {
        ctx.fillStyle = `rgba(200, 210, 255, ${s.flashOpacity})`;
        ctx.fillRect(0, 0, width, height);
        s.flashOpacity *= 0.85;
        if (s.flashOpacity < 0.002) s.flashOpacity = 0;
      }
      // Also draw rain during thunderstorms
      if (s.particles.length === 0) {
        s.particles = createParticles("rain", width, height);
      }
      drawRain(s);
    }

    function drawHeat(s) {
      const pulse = Math.sin(s.frame * 0.015) * 0.5 + 0.5;
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) * 0.6
      );
      grad.addColorStop(0, `rgba(255, 160, 50, ${0.01 + pulse * 0.02})`);
      grad.addColorStop(1, "rgba(255, 100, 20, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    function drawBluebird(s) {
      const shimmer = Math.sin(s.frame * 0.008) * 0.5 + 0.5;
      const grad = ctx.createRadialGradient(
        width * 0.6, height * 0.2, 0,
        width * 0.6, height * 0.2, height * 0.7
      );
      grad.addColorStop(0, `rgba(100, 180, 255, ${0.01 + shimmer * 0.015})`);
      grad.addColorStop(1, "rgba(60, 120, 200, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    function animate() {
      const s = stateRef.current;
      s.frame++;

      ctx.clearRect(0, 0, width, height);

      switch (s.condition) {
        case "rain":
          drawRain(s);
          break;
        case "snow":
          drawSnow(s);
          break;
        case "clearNight":
          drawStars(s);
          break;
        case "clearDay":
          drawClearDay(s);
          break;
        case "cloudy":
        case "fog":
          drawWisps(s);
          break;
        case "thunderstorm":
          drawThunderstorm(s);
          break;
        case "heat":
          drawHeat(s);
          break;
        case "bluebird":
          drawBluebird(s);
          break;
        default:
          break;
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [condition, initScene]);

  // Re-init particles when condition changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      stateRef.current.condition = condition;
      initScene(canvas);
    }
  }, [condition, initScene]);

  const gradientStyle = {
    background: `linear-gradient(180deg, ${gradient[0]} 0%, ${gradient[1]} 50%, ${gradient[2]} 100%)`,
    transition: "background 1.5s ease-in-out",
  };

  return (
    <>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={gradientStyle}
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
}
