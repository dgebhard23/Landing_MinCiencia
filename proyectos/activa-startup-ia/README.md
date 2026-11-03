# Activa Startup con IA · landing

Convocatoria del Ministerio de Ciencia y ElevenLabs: hasta 100 startups y EBCT chilenas reciben, sin costo, una licencia de la plataforma de IA de voz de ElevenLabs por 12 meses.

Este directorio reemplaza la propuesta hecha en Lovable (https://tomorrow-workshop-compass.lovable.app/). Usa como base la landing de Reglamentos TT y los módulos del repositorio.

**Para verlo:** abre `index.html`, que compara las 3 propuestas y enlaza a cada una. Sirve abrirlo directo desde el disco o con un servidor local:

```
python -m http.server 8791
```

Después entra a http://127.0.0.1:8791/proyectos/activa-startup-ia/

## Contenido

```
bases/                          ← bases del 2-11-2026 (Word original + texto en Markdown)
revision-formulario.md          ← formulario Lovable vs. bases, y puntos de las bases para revisar
comun/
  convocatoria.js               ← TODOS los datos: fechas, etapas, criterios, ámbitos, requisitos y FAQ
                                  + componentes: ¿Puedo postular?, simulador y tabla de puntaje, «Escuchar»
  postulacion.js                ← formulario de postulación en 6 pasos, armado desde las bases
  activa.css                    ← identidad de Reglamentos (navy, azul gob.cl, rojo) sobre base/tokens.css
propuesta-1-institucional/      ← la más cercana a Reglamentos
propuesta-2-voz/                ← la más expresiva
propuesta-3-panel/              ← la más útil para quien postula
apps-script/                    ← backend: Sheets + Drive (subcarpeta por postulación) + folio + acuse de recibo
img/                            ← logos MinCiencia
```

## Si cambian las bases

Casi todo se cambia en `comun/convocatoria.js`:

- **Fechas.** Están en `abre`, `consultas`, `cierre`, `resultados` y `etapas`. Las barras de aviso (`data-abre`, `data-cierra`), las cuentas regresivas (`data-cuenta`) y la Gantt de la propuesta 1 tienen sus propias fechas en el HTML.
- **Criterios de puntaje.** Están en `criterios` y alimentan la tabla, el simulador y el formulario.
- **Requisitos, ámbitos y preguntas frecuentes.** Están en `elegibilidad`, `ambitos` y `faq`.
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

- Logo oficial de ElevenLabs.
- Plazo de activación: 10 o 15 días hábiles (las bases se contradicen).
- Publicar el Apps Script y pegar la URL en `data-endpoint` de las 3 propuestas.
- Revisión jurídica de las aceptaciones y del aviso de datos personales.
- Elegir propuesta (o mezcla) y generar la versión de un solo archivo para publicar.
