# Activa Startup con IA · landing

Convocatoria del Ministerio de Ciencia y ElevenLabs: hasta 100 startups y EBCT chilenas reciben, sin costo, una licencia de la plataforma de IA de voz de ElevenLabs por 12 meses.

Este directorio reemplaza la propuesta hecha en Lovable (https://tomorrow-workshop-compass.lovable.app/). Toma la estructura y el movimiento de la landing de Reglamentos TT y los módulos del repositorio. Los colores, la tipografía (Poppins) y el logo vienen del design system MINCTCI 2026 (Figma), y los logos de ElevenLabs, de su kit oficial (https://elevenlabs.io/brand).

**Versión final:** `final/activa-startup-ia.html`. Es la propuesta 2 en un solo archivo, con estilos, scripts, imágenes y las bases en PDF incluidos, para publicar o enviar. Se rearma con `python armar_final.py` después de cada cambio.

**Para ver las propuestas:** abre `index.html`, que compara las 3 propuestas y enlaza a cada una. Sirve abrirlo directo desde el disco o con un servidor local:

```
python -m http.server 8791
```

Después entra a http://127.0.0.1:8791/proyectos/activa-startup-ia/

## Contenido

```
bases/                          ← bases del 2-11-2026 (Word original, PDF para descargar y texto en Markdown)
final/                          ← versión final en un solo archivo (la arma armar_final.py)
revision-formulario.md          ← formulario Lovable vs. bases, y puntos de las bases para revisar
comun/
  convocatoria.js               ← TODOS los datos: fechas, etapas, criterios, ámbitos, requisitos y FAQ
                                  + componentes: ¿Puedo postular?, simulador y tabla de puntaje, «Escuchar»
  postulacion.js                ← formulario de postulación en 6 pasos, armado desde las bases
  activa.css                    ← paleta MINCTCI 2026 (navy, azul #3053F9, lima #CDEDC9, lila #97A9FC), Poppins y componentes
  graficos.js                   ← gráficos en código: patrón de Chladni, orbe de voz y grilla de cuadros
propuesta-1-institucional/      ← la más cercana a Reglamentos
propuesta-2-voz/                ← la más expresiva
propuesta-3-panel/              ← la más útil para quien postula
audio/                          ← MP3 generados en ElevenLabs para «Escuchar» (ver audio/LEEME.md)
apps-script/                    ← backend: Sheets + Drive (subcarpeta por postulación) + folio + acuse de recibo
img/                            ← logos MinCiencia y ElevenLabs, fotos (fotos/) y sus créditos (CREDITOS.md)
```

## Si cambian las bases

Casi todo se cambia en `comun/convocatoria.js`:

- **Fechas.** Están en `abre`, `consultas`, `cierre`, `resultados` y `etapas`. Las barras de aviso (`data-abre`, `data-cierra`), las cuentas regresivas (`data-cuenta`) y las agendas de las propuestas 1 y 3 tienen sus propias fechas en el HTML.
- **Criterios de puntaje.** Están en `criterios` y alimentan la tabla, el simulador y el formulario.
- **Requisitos, ámbitos, alianza y preguntas frecuentes.** Están en `elegibilidad`, `ambitos` (con su foto y texto corto), `colaboracion` y `faq`.
- **Campos del formulario.** Están en `PASOS`, al inicio de `comun/postulacion.js`. Cada campo dice si es obligatorio y cuándo se muestra.

## El formulario de postulación

Es común a las 3 propuestas. Lo que cambió respecto de Lovable está detallado en `revision-formulario.md`.

1. **Empresa.** RUT con dígito verificador, inicio de actividades validado (6 meses a 10 años), tipo, región, trabajadores (0 a 25), ámbito y correo para la licencia.
2. **Personas.** Representante legal, responsable técnico (obligatorio por bases) y contacto opcional.
3. **Puntaje.** Los criterios con sus niveles y puntos visibles, y el respaldo solo cuando corresponde. Muestra el puntaje declarado en vivo.
4. **Propuesta.** Las 3 preguntas de las bases, de hasta 1.000 caracteres y obligatorias, más el enlace a la demo.
5. **Documentos.** Un casillero por PDF, que aparece solo si aplica (cotizaciones si hay trabajadores, presentación si no hay sitio web). Genera el **Anexo N° 1 con los datos ya ingresados**.
6. **Enviar.** Resumen con «Editar» por sección, 4 aceptaciones y bloqueo después del 16-11-2026 a las 15:00.

Además, guarda un borrador en el navegador (sin los archivos), descarga una copia en Word y entrega un folio al enviar. Sin `data-endpoint` funciona en modo demostración y no envía nada.

## Pendientes

- **Propuesta elegida: la 2 (La voz).** No lleva muestras de audio: los casos muestran el ejemplo de uso como texto.

- SVG oficial del logo «Ministerio CTCI» desde la página Logos del Figma (hoy es el PNG de la propuesta Lovable).
- Fotos propias de startups chilenas para reemplazar las de Unsplash.
- Corregir el numeral 10 de las bases: dice 15 días hábiles para activar la licencia y el plazo confirmado es 10 (numeral 3), que es el que usa la página.
- Publicar el Apps Script y pegar la URL en `data-endpoint` de las 3 propuestas.
- Revisión jurídica de las aceptaciones y del aviso de datos personales.
- Elegir propuesta (o mezcla) y generar la versión de un solo archivo para publicar.
