# Tejo del Berriondo

Jugar ahora:** https://tejo-del-berriondo.vercel.app/

Juego web mobile-first basado en el deporte más colombiano que existe. La idea es simple: lanzas un tejo metálico contra unas dianas, acumulas puntos, y si tienes suerte — o la física te ayuda — puedes llevarte un jackpot.

## ¿Qué es esto en realidad?

No es un juego para jugar todos los días. Es una experiencia de ~30 minutos diseñada para mantenerte con la adrenalina arriba, jugando con otras personas, y en ese estado tomar decisiones de compra sin pensarlo dos veces. Gamificación del retail, básicamente.

## Cómo se juega

Arrastra el tejo hacia abajo como una resortera y suéltalo. El tejo sale disparado, rebota en las paredes, y si le pega a la diana roja sumas puntos. Si le pegas a la diana azul... pierdes 500 y vuelves a empezar el nivel desde cero. El jackpot es invisible — no sabes qué tan cerca estás, solo la música te da pistas.

## Niveles

- **Nivel 1:** Una diana. Sin complicaciones. Aprende a apuntar.
- **Nivel 2:** Dos dianas (una buena, una trampa) + viento que desvía el tejo.
- **Nivel 3:** Lo mismo pero con un obstáculo que se mueve de lado a lado.

Para subir de nivel necesitas 3 aciertos seguidos en el nivel 1, y 5 en el nivel 2. Si fallas, el contador se resetea.

## Stack

- **Phaser.js 3** — motor del juego
- **Matter.js** — física
- **Web Audio API** — sonidos generados en código
- **Vite** — bundler

## Correr el proyecto
```bash
npm install
npm run dev
```

Abre `http://localhost:5173` desde el celular en la misma red para probarlo en móvil.

## Estado actual

MVP funcional con mecánica de lanzamiento, 3 niveles, sistema de jackpot, sonidos de casino y música de fondo. Pendiente: recompensas mock atadas a productos del restaurante, personajes, multijugador.