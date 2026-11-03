# Criterios de anonimización y limpieza de datos · Buzón EBCT
**Equipo:** Asuntos Regulatorios — MinCiencia · **Versión:** 0.1 (12-06-2026) · **Estado:** borrador para validación jurídica

Este documento define las reglas que aplica el equipo (y que en Fase 2 ejecutará el agente de IA **como propuesta, con aprobación humana**) antes de que un caso del buzón circule fuera del equipo. Complementa el procedimiento de depuración del [README §3](README-implementacion.md).

---

## 1. Marco y principios

- Hoy rige la **Ley 19.628**; desde el **1 de diciembre de 2026** rige la **Ley 21.719** (consentimiento, finalidad específica, minimización, retención limitada, derechos de acceso/supresión).
- Principio operativo del buzón: **el dato identificado solo existe donde es imprescindible** (gestión interna). Todo lo que sale del equipo viaja anonimizado o agregado, como ya declara el formulario ("de manera anonimizada y agregada").

## 2. Tres niveles de circulación

| Nivel | Quién lo ve | Qué contiene |
|---|---|---|
| **N0 · Interno** | Solo equipo MinCiencia (planilla + Drive) | Caso completo, con identificación y adjuntos |
| **N1 · Mesa** | Instituciones de la Mesa Interinstitucional | Resumen ejecutivo anonimizado + clasificación + cifras |
| **N2 · Público** | Sitio web / reporte de avances | Solo agregados y tendencias (nunca casos individuales) |

## 3. Tratamiento campo por campo

| Campo (hoja Casos) | N0 interno | N1 mesa | N2 público |
|---|---|---|---|
| Empresa, RUT, contacto, email, teléfono | ✔ completo | ✖ se elimina | ✖ |
| Región | ✔ | ✔ (generalizar a macrozona si el sector es muy pequeño) | Solo agregada |
| Tipo de consulta, clasificación, prioridad | ✔ | ✔ | Agregadas |
| Título y descripción del desafío | ✔ | Reescrito como resumen anonimizado (regla §4) | ✖ |
| Producto/tecnología | ✔ | Generalizado a categoría ("kit de diagnóstico molecular" → "insumo de diagnóstico") | ✖ |
| País origen/destino | ✔ | ✔ | Agregado o por bloque ("Norteamérica") |
| Etapa TRL, naturaleza, uso previsto | ✔ | ✔ | Agregadas |
| Instituciones vinculadas | ✔ | ✔ | ✔ (es información pública del proceso) |
| Detalle de contacto previo | ✔ | Sin nombres de funcionarios/as ni fechas exactas | ✖ |
| Adjuntos (Drive) | ✔ | ✖ **nunca salen de N0** | ✖ |
| Folio | ✔ | ✔ (permite trazar sin identificar) | ✖ |

## 4. Reglas de redacción del resumen anonimizado (N1)

1. **Sin nombres**: ni de empresa, personas, marcas ni productos comerciales. Usar el rol: "una EBCT biotecnológica de la zona centro".
2. **Producto → categoría**: lo específico identifica. "Reactivo X de la línea Y" → "reactivos de diagnóstico para investigación".
3. **Fechas exactas → períodos**: "el 14 de marzo" → "durante el primer trimestre".
4. **Cifras sensibles → rangos**: "USD 48.700 retenidos" → "sobrecosto del orden de decenas de miles de USD".
5. **Conservar lo accionable**: normativa, trámite, institución y punto exacto de fricción se mantienen — eso es lo que la mesa necesita.

> ✘ "BioAndes SpA lleva 35 días con sus kits qPCR retenidos en Aduana Valparaíso."
> ✔ "Una EBCT biotecnológica reporta más de un mes de retención en Aduana de insumos de diagnóstico para I+D, por falta de claridad sobre el certificado ISP aplicable a uso no clínico."

**Prueba final:** alguien del sector que lea el resumen, ¿podría adivinar qué empresa es? Si sí, generalizar más.

## 5. Regla k≥3 para cifras públicas (N2)

No publicar ningún cruce de categorías con **menos de 3 casos** (p. ej. "casos de nanotecnología en Aysén" con n=1 identifica). Si n<3: agrupar con otra categoría o subir un nivel de agregación.

## 6. Limpieza y normalización (resumen operativo)

- Vocabularios canónicos en la pestaña `Vocabularios` (país, naturaleza, categorías): "EEUU/USA/Estados unidos" → `Estados Unidos`.
- Duplicados → estado `Duplicado` con folio principal anotado; **nunca borrar filas** de Casos.
- Fuera de alcance → estado `Fuera de alcance` + correo indicando canal correcto.
- Detalle completo del flujo semanal: README §3.

## 7. Retención

| Dato | Plazo | Mecanismo |
|---|---|---|
| Hoja **Incompletos** (avances sin enviar) | **30 días** | Eliminación automática (Code.gs) |
| Hoja **Casos** + adjuntos | **24 meses desde el cierre del caso** (propuesta — validar con jurídica) | Revisión manual semestral |
| Hoja **Analítica** (eventos anónimos) | Sin restricción (no contiene datos personales) | — |

## 8. Quién aplica esto y cuándo

- **Hoy:** la/el analista, en la depuración semanal (README §3), llena "Resumen ejecutivo" siguiendo §4 antes de derivar.
- **Fase 2:** el agente de IA genera el borrador del resumen anonimizado y la clasificación; **una persona revisa y aprueba siempre** antes de que algo llegue a N1. Al agente nunca se le envían los campos de identificación (minimización desde el diseño).

## 9. Checklist antes de cada salida

**Antes de enviar el dossier a la mesa (N1):** sin nombres ni RUT ☐ · productos generalizados ☐ · sin adjuntos ☐ · resúmenes pasan la prueba del §4 ☐ · folios como única referencia ☐

**Antes de publicar avances (N2):** solo agregados ☐ · k≥3 en todos los cruces ☐ · sin citas textuales de casos ☐ · revisado por dos personas ☐
