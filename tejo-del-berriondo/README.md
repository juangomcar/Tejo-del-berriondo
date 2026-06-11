# Tejo del Berriondo
**Jugar ahora:** https://tejo-del-berriondo.vercel.app/
 
Juego mobile-first basado en el deporte más colombiano que existe. Lanzas un tejo metálico contra unas dianas, acumulas puntos, y si tienes suerte puedes llevarte premios reales del restaurante.

## ¿Qué es esto en realidad?

No es un juego para jugar todos los días. Es una experiencia de ~30 minutos diseñada para mantenerte con la adrenalina arriba y en ese estado tomar decisiones de compra sin pensarlo dos veces. Gamificación del restaurante.

## Cómo se juega

Arrastra el tejo hacia abajo como una resortera y suéltalo. El tejo sale disparado, rebota en las paredes, y si le pega a la diana roja sumas puntos. Si le pega a la diana azul pierdes 500 y el nivel se resetea. Acumula aciertos consecutivos para subir de nivel y activar el combo multiplicador.

## Mecánicas principales

- **9 niveles** por ciclo, agrupados en 3 bloques de dificultad. Al completar el ciclo vuelve al nivel 1 con más viento.
- **Jackpot:** barra oculta que se llena con golpes afortunados. Al llenarse lanza la slot machine.
- **Slot machine:** 40% de probabilidad de ganar un premio del restaurante.
- **Ofertas:** cada 9000 puntos aparece una oferta (descuento en un producto) a cambio de un tejo especial.
- **Tejos especiales:** Fuego (más velocidad), Hielo (inmune al viento), Explosivo (doble puntos). 3 lanzamientos cada uno.
- **Combo:** 3 aciertos seguidos → x2, 5 → x3, 8 → x4, 12 → x5.
- **Personajes:** El Campesino, La Abuela y El Minero — cada uno con su color de tejo.

## Stack

- **Phaser 3** — motor del juego
- **Matter.js** — física
- **Capacitor** — empaquetado como app Android nativa
- **Web Audio API** — sonidos generados en código
- **Vite** — bundler

## Correr el proyecto

```bash
cd tejo-del-berriondo
npm install
npm run dev        # http://localhost:5173
```

Para probar en móvil: abre `http://<tu-ip>:5173` desde el celular en la misma red.

## Correr en Android (Android Studio)

Requiere Android Studio instalado con el SDK de Android.

```bash
# Primera vez — genera el proyecto Android
npm run android

# Siguientes veces — rebuild y sincronizar, luego Run ▶ en Android Studio
npm run android:sync
```

El proyecto Android vive en `android/`. Si ya está generado, ábrelo directamente con **File → Open** en Android Studio.

> Cada vez que cambies código del juego hay que correr `npm run android:sync` antes de volver a lanzar desde el emulador.
 restaurante, personajes, multijugador.restaurante, personajes, multijugador.