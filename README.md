# Landing MinCiencia: repositorio de funcionalidades

Funcionalidades probadas en las landings y plataformas que hemos construido: la landing de Reglamentos TT, la web EBCT, el Buzón EBCT y los tableros. Están separadas en **módulos independientes** para combinarlas en cada landing nueva según lo que pida el proyecto.

**Para ver el catálogo**, abre `index.html` en el navegador. Es una galería con buscador y filtros por categoría. Cada tarjeta lleva a su módulo funcionando.

## Skills de apoyo

En `skills/` están guardadas, con su licencia, las skills externas que se usan para diseñar y escribir estas landings:

- **Diseño UI/UX:** ui-ux-pro-max, impeccable y taste-skill.
- **Sistemas de diseño de referencia:** awesome-design-md.
- **Diagramas:** diagram-design.
- **Escritura:** humanizer y stop-slop.

El índice, con cuándo usar cada una, está en `skills/README.md`.

## Cómo está organizado

```
base/
  tokens.css     ← LA identidad visual: colores, tipografías, radios. Cambia solo este archivo.
  base.css       ← reset, botones, etiquetas, bloques oscuros (.tema-oscuro)
modulos/NN-nombre/
  index.html     ← demo funcionando
  modulo.css     ← estilos del módulo (solo usa variables de tokens.css)
  modulo.js      ← comportamiento, sin dependencias
  README.md      ← qué hace, cuándo usarlo y cómo agregarlo
backend/         ← Apps Script para recibir formularios en Google Sheets + Drive + correo
ejemplos/
  plantilla-landing/      ← landing base que ya combina 9 módulos
  landing-reglamentos-tt/ ← la landing original completa (envío desconectado)
  buzon-ebct/             ← el buzón interactivo original (endpoint e ID de planilla en blanco)
catalogo.json    ← listado de módulos (nombre, categoría, qué hace, cuándo usarlo, origen)
skills/          ← 12 skills externas de diseño, diagramas y escritura, ordenadas por especialidad (ver skills/README.md)
```

## Catálogo

| # | Módulo | Categoría | Viene de |
|---|---|---|---|
| 01 | Barra de aviso según la fecha | Navegación | Reglamentos TT |
| 02 | Encabezado inteligente y menú móvil | Navegación | Reglamentos TT |
| 03 | Portada con haces de luz animados | Portada | Reglamentos TT |
| 04 | Títulos que suben línea a línea | Movimiento | Reglamentos TT |
| 05 | Aparición escalonada al desplazar | Movimiento | Reglamentos TT |
| 06 | Cifras clave con conteo y días al plazo | Contenido | Reglamentos TT · Home EBCT |
| 07 | Cuenta regresiva con dígitos que ruedan | Contenido | Reglamentos TT |
| 08 | Carta Gantt con estados y marca de hoy | Calendario y proceso | Reglamentos TT |
| 09 | Hoja de ruta interactiva en forma de U | Calendario y proceso | Reglamentos TT |
| 10 | Hitos: completados y próximos | Calendario y proceso | Reglamentos TT |
| 11 | Ventana de detalle que nace desde la tarjeta | Interacción | Reglamentos TT |
| 12 | Preguntas frecuentes con buscador y filtros | Interacción | Reglamentos TT · FAQ EBCT |
| 13 | Pestañas accesibles | Interacción | Home EBCT · 3er registro EBCT |
| 14 | Carrusel liviano (sin jQuery) | Interacción | Home EBCT |
| 15 | Formulario por pasos (ficha en línea) | Formularios | Reglamentos TT · Buzón EBCT |
| 16 | Zona de adjuntos (arrastrar y soltar) | Formularios | Buzón EBCT |
| 17 | Contenido editable desde Google Sheets | Datos | Web EBCT (FAQ, Portal, Trámites) |
| 18 | Gráficos que toman los colores de la marca | Datos | Home EBCT · 3er registro EBCT |
| 19 | Tabla filtrable, ordenable y exportable | Datos | Back Office EBCT · EtMday |
| 20 | Instituciones con logos agrupados | Contenido | Reglamentos TT |
| 21 | Copiar, compartir y avisos breves | Utilidades | Buzón EBCT · Home EBCT |

## Para armar una landing nueva

1. **Copia la base.** Copia `ejemplos/plantilla-landing/`, o parte de una página vacía con `base/`.
2. **Ajusta la marca.** Cambia la paleta y las tipografías en `base/tokens.css`.
3. **Elige los módulos.** Revisa la galería y, por cada módulo que quieras:
   - Pega su HTML en la página.
   - Enlaza su `modulo.css` y su `modulo.js`.
4. **Configura con atributos `data-*`.** Fechas, textos, endpoints y columnas se configuran sin tocar el JavaScript. El README de cada módulo dice cuáles usa.
5. **Conecta los datos.**
   - Formularios: el Apps Script de `backend/`.
   - Contenido que cambia seguido (FAQ, oferta, noticias): una hoja publicada como CSV, con el módulo 17.
6. **Prueba en celular.** Todos los módulos están probados a 390 px, sin desborde horizontal.

## Principios que siguen todos los módulos

- **Sin dependencias.** Solo el módulo 18 usa Chart.js desde un CDN.
- **Un solo lugar para los colores.** Ningún módulo usa colores fijos: todos leen `tokens.css`, incluido lo que se dibuja en canvas y en los gráficos.
- **Accesibles.**
  - Funcionan con teclado y respetan `prefers-reduced-motion`.
  - Usan `<dialog>` nativo y roles ARIA en las pestañas.
  - Los errores de formulario se anuncian junto al campo.
- **Fechas en hora de Chile** (`America/Santiago`) y formato `es-CL`.
- **Datos personales:** los borradores quedan solo en el navegador del usuario. Ningún ejemplo trae endpoints ni IDs de planillas reales.
