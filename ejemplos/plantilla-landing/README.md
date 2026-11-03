# Plantilla de landing

Página armada combinando 9 módulos:

- 01 Barra de aviso según la fecha.
- 02 Encabezado inteligente.
- 03 Portada con haces de luz.
- 06 Cifras clave.
- 08 Carta Gantt.
- 09 Hoja de ruta en U.
- 15 Formulario por pasos.
- 20 Logos agrupados.
- 21 Compartir.

Los textos entre corchetes `[…]` se reemplazan para cada proyecto.

Para una landing nueva:

1. **Copia la carpeta.** Copia esta carpeta junto con `base/` y los módulos que uses, o junta todo en un solo archivo.
2. **Ajusta la identidad.** Cambia los colores y tipografías en `base/tokens.css`.
3. **Fija las fechas.**
   - Barra de aviso: `data-abre` y `data-cierra`.
   - Carta Gantt: `data-desde`, `data-hasta` y `data-estado`.
   - Hoja de ruta: el JSON `fases-ruta`.
4. **Quita o agrega secciones.** Cada una es un `<section>` con `id`. Si quitas una, quita también su enlace del menú.
5. **Conecta el formulario.** Usa el backend de `backend/`, con `data-endpoint` en el `<form data-ficha>`.
