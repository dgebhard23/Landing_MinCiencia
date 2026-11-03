# Contenido editable desde Google Sheets

**Categoría:** Datos
**Viene de:** Web EBCT (FAQ, Portal y Trámites por institución leen hojas publicadas)

## Qué hace
La página lee una hoja de Google Sheets publicada como CSV y arma tarjetas con filtros por categoría (con contadores), buscador y paginación. Así cualquiera del equipo actualiza la landing editando la planilla, sin tocar código. Se refresca cada 5 minutos y convierte enlaces de Google Drive en imágenes.

## Cuándo usarlo
FAQ, oferta de instrumentos, trámites por institución, noticias, convocatorias abiertas, equipos: todo lo que cambia seguido.

## Cómo agregarlo a una landing
1. Copia `modulo.css` y `modulo.js` a tu proyecto (o enlázalos).
2. Copia el marcado HTML desde `index.html` (todo lo que está entre el `<header class="demo-cab">` y el `<script>`).
3. Asegúrate de cargar antes `base/tokens.css` y `base/base.css`: los colores salen de ahí.

Abre `index.html` en el navegador para verlo funcionando.
