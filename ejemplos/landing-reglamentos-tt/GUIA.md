# Esqueleto base: landing de Reglamentos TT (Ley N° 21.838)

Esta landing es la base para las páginas de los próximos proyectos. Mantiene los visuales y las funcionalidades que desarrollamos en las 19 rondas (21 al 28 de octubre de 2026).

## Qué archivo usar

| Carpeta | Archivo | Para qué |
|---|---|---|
| `1_Pagina_final/` | `261028_landing-final-autonomo.html` | La página publicada (versión corta, ronda 19). Los logos van incrustados, así que se abre o se envía tal cual. **No se toca.** |
| `2_Esqueleto_editable/` | `plantilla_esqueleto.html` | **Punto de partida para un proyecto nuevo.** Es la misma página, pero con el envío desconectado: no manda nada a la planilla real de MinCiencia. Necesita la carpeta `img/` al lado. |
| `2_Esqueleto_editable/` | `landing-final.html` | La fuente editable original, todavía conectada al Apps Script real. Solo sirve para seguir trabajando la landing de Reglamentos. |
| `3_Propuestas_originales/` | `propuesta-1/2/3` | Las tres propuestas de diseño. La final parte de la 1 (institucional). |
| `4_Scripts/` | `armar_landing.py` + `ronda*.py` | Arman la página aplicando los cambios por rondas, de forma que cada cambio queda registrado. |
| `5_Recepcion_fichas_AppsScript/` | `Codigo.gs` + `INSTRUCCIONES.md` | El backend del formulario: guarda una fila por ficha en una Google Sheet, los adjuntos en Drive y manda un aviso por correo. |
| `6_Textos_y_ficha/` | Excel de textos v5 + ficha .docx | El Excel tiene la trazabilidad de cada texto de la página (fijo, automático o dato del calendario). |

## Identidad visual (tokens en `:root`)

- **Azul marino** (fondos oscuros): `--navy-950 #040a1c` · `--navy-900 #071330` · `--navy-800 #0c1d45`
- **Azul** (acentos): `--blue-500 #0f69b4` · `--blue-400 #5aa2e6` · `--blue-200 #d3e5f7`
- **Rojo** (llamados a la acción y barra de aviso): `--red-500 #d7323c` · `--red-400 #ff6e76`
- **Texto y papel**: `--ink #0a1430` · `--ink-soft #44506e` · `--paper #f2f6fc`
- **Tipografías** (Google Fonts): *Hanken Grotesk* para títulos y *Inter* para el texto.
- **Medidas**: contenedor de 1320 px, `--radius 20px`, secciones con padding fluido (`clamp`), títulos de hasta 66 px y texto de 17–18 px.

Para usar la paleta de otra institución, basta con cambiar los valores de `:root`. El resto de la página toma los colores desde ahí.

## Componentes reutilizables

1. **Barra de aviso fija.** Es roja y cambia su texto según la fecha. Lee las fechas del objeto `CALL`.
2. **Encabezado.** Lleva el logo y un menú en pastilla con el botón «Participa», y se adapta al celular.
3. **Portada animada.** Título en líneas escalonadas (`.line`, `.line--indent`), palabra destacada en `<em>` y fondo de líneas de luz.
4. **Cifras clave.** Incluye un contador de días hasta un plazo, que se calcula solo.
5. **La ruta (bloque oscuro).** Tiene un bloque «dos momentos» y una carta Gantt por meses con bandera de hito.
6. **Hoja de ruta interactiva en forma de U.** Al hacer clic en una parada, el detalle aparece dentro de la curva. En celular, el camino queda a la izquierda.
7. **Estados de fase.** Se fijan a mano con `data-state="done|live|next"` en la lista `timeline`. La línea de tiempo, la hoja de ruta y «Fase en curso» los leen de ahí.
8. **Participa.** Tres pasos y el botón «Completar la ficha».
9. **Formulario en ventana (`<dialog id="ficha">`), en 5 pasos.**
   - Pasos: datos, tema, aporte, alcance y envío.
   - Tiene una barra de avance, valida los campos obligatorios y guarda un borrador en el navegador (localStorage).
   - Permite descargar la ficha en Word y adjuntar un archivo, que se envía en base64.
   - También se abre con `#ficha` en la URL.
10. **Quiénes.** Logos agrupados en Lidera, Cofirman y Colaboran.
11. **Pie mínimo.** Logo, contacto, ley y aviso de datos personales.
12. **Ventanas de detalle animadas** (`.rdlg`).

## Cómo adaptar la plantilla a un proyecto nuevo

1. **Copia la carpeta.** Copia `2_Esqueleto_editable/` completa, porque `plantilla_esqueleto.html` necesita la carpeta `img/` al lado.
2. **Cambia los textos.** Edita el `<title>`, la portada, las secciones y el pie. Los `id` de las secciones son `top`, `ruta`, `fases`, `participa` e `instituciones`, y el menú apunta a ellos.
3. **Fija las fechas.** Busca `CALL = { open, close, consult, legal }` y pon las del proyecto nuevo. La barra de aviso, los contadores y la habilitación del envío dependen de esas fechas.
4. **Actualiza las fases.** Edita la lista `timeline`, con sus fechas y su `data-state`.
5. **Cambia los logos.** Reemplaza los PNG de `img/`. Si les cambias el nombre, actualiza también los `src` en el HTML.
6. **Conecta el formulario.**
   - Publica una copia de `Codigo.gs` como aplicación web en tu propia cuenta, siguiendo `INSTRUCCIONES.md`.
   - Pega la URL en `data-endpoint` y tu correo en `data-correo`, dentro de `<form … data-ficha-form>`.
   - Mientras `data-endpoint` esté vacío, el formulario funciona igual, pero al final ofrece descargar la ficha y mandarla por correo.
7. **Revisa en computador y celular.** Usa `4_Scripts/captura.py`, que toma capturas a 1440 y 390 px y avisa si hay desborde horizontal.
8. **Genera la versión autónoma con los logos incrustados.** Usa el fragmento que está al final de `LEEME_Trabajo_Landing_original.md`.

## Rearmar la landing de Reglamentos con los scripts

Los scripts esperan tener la propuesta 1 y la carpeta `img/` en la misma carpeta, con los scripts en `../scripts/`. Para rearmarla:

1. Copia `3_Propuestas_originales/propuesta-1-institucional.html` dentro de `2_Esqueleto_editable/`.
2. Renombra `4_Scripts` a `scripts` y déjala al lado de esa carpeta.
3. Ejecuta:

```
python ../scripts/armar_landing.py propuesta-1-institucional.html landing-final.html
```

Los cambios nuevos se agregan al final de `ronda19.py` con `sub(texto_antiguo, texto_nuevo)`.

Requisitos: Python 3 con `openpyxl`, `beautifulsoup4`, `playwright` y `Pillow`.

## Lo que quedó fuera de esta copia

Todo esto sigue en `Escritorio\Reglamentos TT\1. REGLAMENTOS\5. Landing\`:

- Los logos originales en .ai, .eps y .pdf (`Trabajo_Claude/fuentes/LOGOS`, más de 100 MB). La carpeta `img/` ya tiene las versiones preparadas para la web.
- Los respaldos del Excel de cada ronda (`Trabajo_Claude/respaldos_excel`).
- Las versiones anteriores de la página (`Final/Anteriores`).
