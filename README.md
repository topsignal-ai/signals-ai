# TopSignal AI

Aplicación web móvil en español con acceso por ID y señales demostrativas para Aviator y Mines.

## Funciones

- Acceso con cualquier ID no vacío.
- Menú móvil para elegir Aviator o Mines.
- Generador visual de multiplicadores demo.
- Tablero Mines con selección de riesgo y casillas sugeridas.
- Diseño adaptable, instalable como PWA y disponible sin conexión.
- Sin servidor, base de datos ni recopilación de datos personales.

> Las señales son aleatorias, solo para entretenimiento y no predicen resultados reales. Uso exclusivo para mayores de 18 años.

## Abrir localmente

```bash
python3 -m http.server 8000
```

Después abre `http://localhost:8000`.

## Publicar en GitHub Pages

El flujo de GitHub Actions incluido publica automáticamente cada cambio enviado a `main`.

1. Abre `Settings → Pages` en el repositorio.
2. En `Build and deployment`, selecciona `GitHub Actions`.
3. Envía los cambios a la rama `main`.
4. La aplicación aparecerá en `https://topsignal-ai.github.io/signals-ai/`.
