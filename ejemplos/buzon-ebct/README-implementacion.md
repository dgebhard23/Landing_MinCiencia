# Buzón de Desafíos Regulatorios para EBCT · v2.0
## Guía de implementación y operación

**Equipo:** Asuntos Regulatorios — MinCiencia
**Última actualización:** 11-06-2026
**Arquitectura (Fase 1):** HTML nativo (CMS MinCiencia) → Google Apps Script → Google Sheets + Drive + Gmail

---

## 1. Despliegue paso a paso (Fase 1)

### 1.1 Crear la infraestructura Google (10 min)
1. **Planilla:** crea una Google Sheet llamada `Buzón EBCT — Casos` en el Drive institucional (idealmente una unidad compartida del equipo, no un Drive personal). Copia su ID (el texto entre `/d/` y `/edit` en la URL).
2. **Carpeta Drive:** crea una carpeta `Buzón EBCT — Respaldos`. Copia su ID (lo que sigue a `/folders/`). **No la compartas públicamente**: los respaldos pueden contener información comercial sensible.

### 1.2 Instalar el backend (10 min)
1. En la planilla: **Extensiones → Apps Script**.
2. Borra el contenido y pega [Code.gs](apps-script/Code.gs).
3. Completa el bloque `CONFIG` al inicio: `SPREADSHEET_ID`, `DRIVE_FOLDER_ID`, `EMAIL_EQUIPO` (puede ser una casilla compartida del equipo).
4. Ejecuta una vez la función **`configurar`** (menú Ejecutar). Autoriza los permisos cuando lo pida. Esto crea los encabezados de la hoja.
5. Ejecuta **`probarRegistro`**: debe aparecer una fila de prueba en la hoja y llegar los dos correos. Borra la fila después.

### 1.3 Publicar el Web App (5 min)
1. **Implementar → Nueva implementación → Tipo: Aplicación web.**
2. *Ejecutar como:* **Yo** (la cuenta institucional dueña de la planilla).
3. *Quién tiene acceso:* **Cualquier persona** (necesario para recibir envíos anónimos del sitio web; nadie puede leer la planilla por esta vía, solo enviar).
4. Copia la **URL que termina en `/exec`**.
5. Verifica en el navegador: al abrir esa URL debe responder `{"ok":true,"servicio":"buzon-ebct",...}`.

> ⚠️ Si después modificas Code.gs, usa **Implementar → Administrar implementaciones → editar (lápiz) → Nueva versión**. Si creas una implementación nueva, la URL cambia y hay que actualizar el HTML.

### 1.4 Conectar y subir el HTML (5 min)
1. Abre [buzon-interactivo.html](buzon-interactivo.html) y pega la URL `/exec` en `CONFIG.APPS_SCRIPT_URL` (dentro del `<script>` final).
2. Prueba localmente: abre el archivo en el navegador, completa un caso real de prueba con adjunto, verifica fila + carpeta Drive + correos.
3. Copia al CMS **solo el bloque** entre `INICIO SNIPPET CMS` y `FIN SNIPPET CMS`. Reemplaza al snippet anterior del buzón (`home-1-buzon.snippet.html`), que enlazaba al Google Form.

### 1.5 Límites de la plataforma que conviene conocer
| Recurso | Límite | Mitigación |
|---|---|---|
| Correos/día (MailApp) | 100/día cuenta gmail · 1.500/día Workspace | Suficiente para el volumen esperado |
| Tamaño POST a Apps Script | ~50 MB | El HTML limita adjuntos a 10 MB total |
| Tiempo de ejecución por solicitud | 6 min | Holgado; los adjuntos se procesan en segundos |
| CORS | Apps Script no soporta preflight | El HTML envía `text/plain` (ya resuelto) |

---

## 2. Diccionario de datos (hoja "Casos")

Una fila = un caso. Columnas A–AD las llena el formulario; **columnas de gestión AE–AL las llena el equipo** (y en Fase 2, el agente de triaje con supervisión humana).

| Grupo | Columnas | Notas |
|---|---|---|
| Registro | Marca temporal, Folio, Estado | Folio correlativo `EBCT-AAAA-####`, generado por el servidor |
| Identificación | Empresa, RUT, Nombre contacto, Email, Teléfono, Región | **Datos personales: tratamiento según Ley 19.628 / 21.719** |
| Caso | Tipo de consulta, Título, Descripción del desafío, Impacto | Campos multi-opción separados por `;` |
| Producto | Descripción producto, País, Etapa TRL, Naturaleza, Uso previsto, Docs. referencia | |
| Contexto | Contacto previo, Detalle, Instituciones vinculadas, Orientación esperada | |
| Respaldo | Tiene respaldo, Archivos adjuntos (URLs), Carpeta Drive | Carpeta privada por folio |
| Metadatos | Consentimientos, Tiempo llenado, Página origen, Posible spam | Tiempo < 8 s ⇒ marcado spam |
| **Gestión** | Clasificación temática, Prioridad, Derivado a, Resumen ejecutivo, Responsable, Fecha mesa, Acuerdo/resolución, Publicado | Ciclo de vida del caso |

**Ciclo de vida (columna Estado):**
`Recibido → En depuración → Clasificado → Derivado → En mesa → Con acuerdo → Comunicado` (+ `Descartado (spam)` / `Duplicado` / `Fuera de alcance`).

### Hoja "Analítica" — medición de abandono (anónima)

El formulario envía eventos **sin datos personales ni contenido del formulario**: solo un ID de sesión aleatorio, el evento (`apertura`, `paso`, `enviado`) y el número de paso alcanzado. Con eso se construye el embudo: cuántas personas abren el buzón, hasta qué paso llegan y cuántas envían. Si un paso concentra el abandono, ese paso se rediseña.

- Lectura rápida: tabla dinámica con Sesión (filas) y MÁX de Paso → distribución del último paso alcanzado.
- Para desactivar la medición: `ANALITICA: false` en el CONFIG del HTML.

### Hoja "Incompletos" — formularios a medio llenar (separada de "Casos")

Decisión del equipo (12-06-2026): además del embudo anónimo, se guarda el **contenido** de los formularios no enviados, en una hoja aparte para que la hoja "Casos" reciba exclusivamente envíos completos.

- **Cuándo se guarda:** solo desde el paso 3 en adelante — es decir, después de que la persona aceptó los 3 consentimientos (paso 1) y se identificó (paso 2). El formulario lo advierte de forma visible en el paso 2.
- **Una fila por sesión**, que se actualiza con cada avance (columna "Paso alcanzado"). Si la persona finalmente envía, la fila pasa a `Completado (folio)`; si no, queda `En curso`.
- **Retención limitada:** las filas `En curso` se **eliminan automáticamente a los 30 días** (`DIAS_RETENCION_INCOMPLETOS` en Code.gs), en línea con la Ley 21.719.
- **Uso previsto:** detectar en qué se traban las personas y, caso a caso, decidir si corresponde un contacto de cortesía ("vimos que no alcanzaste a enviar tu caso, ¿necesitas ayuda?"). Ese contacto debe ser excepcional y amable, nunca masivo.
- La misma persona puede aparecer en más de una sesión (abrió el buzón dos veces): deduplicar por email al analizar.
- Para desactivar: `GUARDAR_INCOMPLETOS: false` en el CONFIG del HTML.
- ⚠️ Punto a validar con jurídica junto al resto de los textos (ver [criterios-anonimizacion-limpieza.md](criterios-anonimizacion-limpieza.md) §7).

---

## 3. Procedimiento de normalización y depuración de datos

Responsable sugerido: 1 analista del equipo, **frecuencia semanal** (día fijo, p. ej. lunes AM). Tiempo estimado: 30–60 min según volumen.

### Paso 1 — Recepción y filtrado (al llegar cada caso)
- El correo interno avisa cada caso nuevo. No requiere acción inmediata salvo casos urgentes evidentes.
- Casos marcados `Posible spam = SÍ` se revisan rápidamente y se confirma o revierte el estado.

### Paso 2 — Depuración semanal
1. **Duplicados:** buscar misma empresa + mismo desafío (o mismo correo en < 7 días). El más completo se conserva; el resto pasa a estado `Duplicado` con nota del folio principal. *Nunca borrar filas* (trazabilidad).
2. **Alcance:** verificar que el caso corresponde a una EBCT y a un desafío regulatorio de comercio exterior / I+D. Si no: estado `Fuera de alcance` + correo amable indicando el canal correcto (OIRS, ChileAtiende, etc.).
3. **Completitud:** si falta información clave (qué normativa, qué trámite, cuándo), responder el correo de confirmación solicitando el dato puntual, citando el folio. Estado queda `En depuración` hasta recibirla.

### Paso 3 — Normalización
1. **Campos de texto libre:** corregir mayúsculas/espacios en Empresa y País (p. ej. "eeuu", "USA", "Estados unidos" → `Estados Unidos`). Mantener una pestaña `Vocabularios` en la misma planilla con las formas canónicas.
2. **Clasificación temática:** asignar 1 categoría principal del vocabulario controlado (partir con: *Aduanas y aranceles · Permisos sanitarios (ISP) · Permisos agrícolas/pecuarios (SAG) · Tributario (SII) · Certificaciones y homologación · Financiamiento/fomento · Otro*). El vocabulario se revisa trimestralmente; si "Otro" supera el 15%, falta una categoría.
3. **Prioridad:** Alta (proyecto detenido / pérdida de mercado / afecta a varias empresas), Media (sobrecostos o retrasos), Baja (consulta de orientación). 
4. **Resumen ejecutivo:** 2–3 líneas neutras y anonimizables (sin nombre de empresa) — es el texto que viaja a la mesa y, eventualmente, al reporte público.
5. Estado pasa a `Clasificado` y se asigna `Responsable seguimiento`.

### Paso 4 — Protección de datos (transversal)
- La planilla y la carpeta Drive se comparten **solo** con el equipo y con permiso de lectura nominal (no "cualquiera con el enlace").
- Lo que se comparte con la mesa y con el público es la versión **anonimizada y agregada** (consistente con el disclaimer del formulario).
- **Importante:** la Ley 21.719 entra en vigencia el **1 de diciembre de 2026**. Antes de esa fecha, revisar con la división jurídica: texto de consentimiento, plazo de conservación de los datos (definir, p. ej., 24 meses), y procedimiento para ejercicio de derechos de acceso/supresión. El diseño actual (consentimiento expreso, finalidad específica, minimización) ya apunta a ese estándar.

---

## 4. Fase 2 — Agente de triaje con IA (diseño propuesto)

**Principio rector: la IA clasifica y resume; las personas deciden y derivan.**

### Arquitectura mínima (sin servidores nuevos)
```
Google Sheet (casos nuevos, estado = Recibido)
        │  activador de Apps Script cada hora / al llegar fila
        ▼
Llamada a la API de Claude (claude-fable-5 o claude-haiku-4-5 para costos mínimos)
  entrada:  título + descripción + tipo + instituciones (SIN datos de contacto)
  salida JSON: {clasificacion, prioridad_sugerida, instituciones_sugeridas,
                resumen_ejecutivo_anonimo, confianza}
        ▼
El script escribe las sugerencias en las columnas de gestión
(con prefijo "🤖 sugerido") y el Estado pasa a "Clasificado (por validar)"
        ▼
El analista valida/corrige en su pasada semanal → quita el prefijo → deriva
```

### Reglas de diseño
1. **Minimización:** a la API se envía solo el contenido del caso, nunca empresa/RUT/correo/teléfono. Así el triaje no expone datos personales a terceros.
2. **Confianza:** si el modelo reporta confianza < 0,7 o clasifica "Otro", el caso queda para revisión humana sin sugerencia.
3. **Sin respuestas automáticas a empresas.** El agente jamás responde al ciudadano; solo prepara trabajo interno. (Esto además es coherente con el disclaimer legal del buzón.)
4. **Trazabilidad:** columna que registre `modelo + fecha` de cada sugerencia.
5. Cuando haya >40–50 casos, agregar un segundo uso: **clustering temático** para detectar problemas sistémicos ("8 casos de retención de reactivos biológicos en Aduana") — ese es el insumo de oro para la mesa.

### Entregable del agente para cada mesa
La mesa sesiona **trimestralmente**, por lo que el dossier se genera una vez por trimestre (con corte de datos ~1 semana antes de la sesión). Un **dossier automático** (Doc generado por script + Claude) con: casos nuevos del período, distribución por categoría/institución, clusters detectados, casos de alta prioridad con resumen anonimizado, y borrador de agenda. El equipo lo edita antes de enviarlo.

---

## 5. Fase 3 — De la mesa al público

1. **Acta interna:** plantilla fija (asistentes, casos agregados tratados, acuerdos, responsables, plazos). Puede redactarse con apoyo de IA a partir de la grabación/notas, con revisión humana obligatoria.
2. **Reporte público trimestral** (recomendado sobre newsletter como primer paso): una sección "Avances" en la misma página del buzón con lenguaje ciudadano: *N casos recibidos, top 3 barreras detectadas, qué acordó la mesa, qué cambió*. Cierra el círculo con quien reportó (ve que su caso movió la aguja) sin comprometer resoluciones individuales.
3. **Newsletter:** reutiliza el contenido del reporte. El sitio ya tiene snippet de suscripción (`home-8-suscripcion`); el mismo Apps Script puede gestionar la lista y el envío. Sumarlo cuando el reporte trimestral ya funcione.
4. KPI del ciclo completo: % de casos que llegan a la mesa, tiempo Recibido→Derivado, % de casos reflejados en reportes públicos.

---

## 6. Checklist de salida a producción

- [ ] Planilla y carpeta en unidad compartida institucional (no Drive personal)
- [ ] `CONFIG` completado en Code.gs y `configurar()` ejecutado
- [ ] `probarRegistro()` exitoso (fila + 2 correos)
- [ ] Web App publicado (Ejecutar como: yo · Acceso: cualquier persona)
- [ ] URL `/exec` pegada en el HTML y prueba end-to-end con adjunto real
- [ ] Texto legal validado por jurídica (incl. preparación Ley 21.719)
- [ ] Casilla `EMAIL_EQUIPO` definida (idealmente compartida, no personal)
- [ ] Snippet subido al CMS reemplazando el enlace a Google Forms
- [ ] Prueba desde el sitio público en escritorio y móvil
- [ ] Definido el responsable y el día de la depuración semanal (sección 3)
