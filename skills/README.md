# Skills externas, ordenadas por especialidad

Copia completa de 12 skills y 1 biblioteca de referencia de 7 repositorios públicos. Quedan guardadas aquí, con su licencia, para no depender de que los originales sigan existiendo. El origen exacto (repositorio, commit y fecha) está en `FUENTES.md`.

```
skills/
├── 1-diseno-ui-ux/          → diseñar, construir y revisar interfaces
│   ├── ui-ux-pro-max/       (7 skills)
│   ├── impeccable/          (1 skill)
│   └── taste-skill/         (1 skill: design-taste-frontend)
├── 2-sistemas-de-diseno/    → biblioteca de referencia (no es skill)
│   └── awesome-design-md/   (84 DESIGN.md de marcas reales)
├── 3-diagramas/
│   └── diagram-design/      (1 skill + comandos)
└── 4-escritura/             → que los textos no suenen a IA
    ├── humanizer/           (1 skill)
    └── stop-slop/           (1 skill)
```

Cada skill es la carpeta que contiene un `SKILL.md`. Esa carpeta es la que se instala.

---

## 1 · Diseño UI/UX

### `ui-ux-pro-max`: la enciclopedia de diseño
Repositorio: nextlevelbuilder/ui-ux-pro-max-skill · MIT

| Skill | Especialidad | Cuándo usarla |
|---|---|---|
| `ui-ux-pro-max` | **Inteligencia UI/UX con base de datos.** Trae CSV con estilos, paletas, tipografías (Google Fonts), patrones de landing, gráficos, íconos, movimiento y guías UX, más scripts de búsqueda. | Partir un diseño. Preguntas del tipo «qué paleta y tipografía para un sitio institucional de ciencia» o «qué estructura de landing para una convocatoria». |
| `design-system` | Tokens en tres capas (primitivo → semántico → componente), escalas de espaciado y tipografía, especificación de componentes. | Definir la paleta y los tokens nuevos de `base/tokens.css`. |
| `ui-styling` | Interfaces con shadcn/ui, Tailwind y Radix, accesibles. | Proyectos en React o Next.js con Tailwind. |
| `design` | Paraguas: identidad de marca, logos, programa de identidad corporativa y presentaciones HTML. | Identidad visual completa de un programa. |
| `brand` | Voz de marca, identidad, mensajes y guías de estilo. | Definir tono y mensajes de una iniciativa. |
| `banner-design` | Banners para redes, anuncios, portadas web e impresos, con varias direcciones de arte. | Piezas de difusión: portadas de RRSS, banners de convocatoria. |
| `slides` | Presentaciones HTML estratégicas con Chart.js y tokens. | Presentaciones web con datos. |

### `impeccable`: el auditor y pulidor
Repositorio: pbakaus/impeccable · **Apache 2.0** (conservar `LICENSE` y `NOTICE.md`)

**Especialidad:**

- Diseñar, rediseñar, criticar, auditar, pulir, simplificar, endurecer y animar interfaces.
- Cubre jerarquía, tipografía, color, movimiento, textos de UX, accesibilidad, responsive y casos borde.
- Documenta sistemas de diseño en DESIGN.md.
- Tiene modos según la tarea; ver la sección «Modes» de su `SKILL.md`.

**Cuándo usarla:** cuando una landing ya existe y hay que **revisarla y dejarla impecable**. También para pedir «hazla más audaz» o «bájale el ruido».

### `taste-skill` (`design-taste-frontend`): el director de arte
Repositorio: Leonxlnx/taste-skill · MIT

**Especialidad:**

- Dirección de arte «anti-plantilla», a partir del estudio de 247 sitios premiados (Awwwards, One Page Love).
- Propone direcciones completas: idea, composición, tipografía, paleta, fotografía y secciones.
- Aplica un estilo estricto y revisa capturas en un bucle de mirar y corregir.

**Cuándo usarla:** cuando una página **se ve genérica o «hecha por IA»** y se quiere que parezca diseñada, premium o de nivel premio. También sirve para dashboards.

---

## 2 · Sistemas de diseño de referencia

### `awesome-design-md`: 84 sistemas de diseño reales en DESIGN.md
Repositorio: VoltAgent/awesome-design-md · MIT

**No es una skill: es material de consulta.** Cada carpeta de `design-md/` documenta el sistema de diseño de una marca (colores, tipografía, componentes, espaciado): Apple, Stripe, Linear, Notion, Airbnb, Vercel, IBM, Spotify, Figma, Supabase y otras.

**Cómo usarla:**

- Para inspirarte o fijar una dirección visual: «quiero algo con la sobriedad de IBM y la claridad de Stripe».
- Para entregarle a otra skill (`impeccable` o `design-system`) un DESIGN.md como punto de partida para los tokens de una landing.

---

## 3 · Diagramas

### `diagram-design`
Repositorio: cathrynlavery/diagram-design · MIT

**Especialidad:** diagramas con marca propia, en más de 40 tipos:

- Arquitectura y flujos: flujogramas, secuencia, máquinas de estado, modelos de datos.
- Tiempo y procesos: líneas de tiempo, swimlanes, carta Gantt.
- Comparación: cuadrantes, radar, Venn, pirámides y embudos.
- Estructura: árbol, organigramas, capas, axonométricos.
- Gráficos: treemaps, mapas de calor, cascadas y pendientes.

La carpeta `commands/` trae utilidades para importar desde Mermaid, draw.io y Excalidraw, y para exportar.

**Cuándo usarla:**

- Diagramas de procesos (como el ciclo del agente o la ruta EBCT).
- Organigramas de gobernanza y modelos de datos.
- Gráficos editoriales para informes y landings.

---

## 4 · Escritura

| Skill | Repositorio | Especialidad | Cuándo usarla |
|---|---|---|---|
| `humanizer` | blader/humanizer · MIT | **Reescribe** un texto que suena a IA para que suene a quien escribe, sin cambiar lo que dice. Se basa en «Signs of AI writing» de Wikipedia. | Textos ya escritos que hay que corregir: bajadas de landing, correos, informes. |
| `stop-slop` | hardikpandya/stop-slop · MIT | **Previene** los patrones de IA mientras se escribe o revisa. Trae listas de frases, estructuras y ejemplos en `references/`. | Al redactar desde cero. Funciona como checklist de estilo. |

Las dos se complementan: `stop-slop` al escribir y `humanizer` al revisar.

---

## Combinación recomendada para una landing nueva

1. **Dirección visual:** `ui-ux-pro-max` (paleta, tipografía, estructura) y un DESIGN.md de `awesome-design-md` como referencia.
2. **Tokens:** `design-system` para llevar la paleta a `base/tokens.css`.
3. **Construcción:** los módulos de este repositorio, con `taste-skill` para que no se vea genérica.
4. **Textos:** `stop-slop` al escribir y `humanizer` al revisar.
5. **Diagramas** del proceso o la gobernanza: `diagram-design`.
6. **Cierre:** `impeccable` para auditar y pulir (accesibilidad, responsive, casos borde) antes de publicar.

---

## Cómo instalarlas

- **Claude Code:** copia la carpeta de la skill (la que contiene `SKILL.md`) a una de estas ubicaciones:
  - `~/.claude/skills/` para tenerla en todos los proyectos.
  - `.claude/skills/` dentro de un proyecto.
- **claude.ai o la app de Claude:**
  1. Comprime la carpeta de la skill en un `.zip`.
  2. Súbela en *Configuración → Capacidades → Skills*.
  En el Escritorio, en `Portafolio UX y Desarrollo\04_Skills\4_Externas`, ya están los .zip listos para subir.

**Nombres repetidos:** `ui-ux-pro-max` trae skills con nombres genéricos (`design`, `brand`, `slides`). Si chocan con otra skill que ya tengas, renombra el campo `name:` en su `SKILL.md`, por ejemplo a `uupm-design`.

**Actualizar:** para traer una versión nueva, reemplaza la carpeta por la del repositorio original y actualiza el commit en `FUENTES.md`.
