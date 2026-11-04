# Revisión: formulario de la propuesta Lovable vs. bases

**Propuesta revisada:** https://tomorrow-workshop-compass.lovable.app/ (formulario de 4 pasos)
**Bases de referencia:** `bases/Bases_Activa_Startup_EBCT_con_IA.pdf`, versión de noviembre de 2026 con el calendario del 11 de noviembre (copia legible en `bases/bases.md`)
**Fecha de revisión:** 3 de noviembre de 2026

## Conclusión

El formulario de Lovable **no se ajusta a las bases**. Se armó a partir de la propuesta de contenidos V2, no de las bases. Tal como está:

1. **No recoge ningún atributo de puntaje**, salvo la región. Faltan producto en el mercado, financiamiento público previo, equipo técnico, ventas y liderazgo femenino. Con lo que pide, no se puede ordenar el ranking.
2. **No permite adjuntar documentos.** Las bases (numeral 7) declaran inadmisible la postulación que no adjunte sus medios de verificación. Con este formulario, todas las postulaciones serían inadmisibles.
3. **Las preguntas de la propuesta de uso no son las de las bases.** Cambian el texto, el límite de caracteres y la obligatoriedad, y las bases dicen que dejar una pregunta sin responder es causal de inadmisibilidad.

El formulario nuevo (`comun/postulacion.js`), común a las 3 propuestas, se armó campo por campo desde los numerales 4, 6 y 8 de las bases. La tabla de abajo indica qué se corrigió en cada punto.

## 1. Datos de la empresa (numeral 6.1)

| Lo que piden las bases | Lovable | Formulario nuevo |
|---|---|---|
| Razón social | ✅ | ✅ |
| RUT | ✅ (valida el dígito verificador) | ✅ (valida el dígito verificador) |
| **Fecha de inicio de actividades** | ❌ Pide «año de constitución». Con eso no se puede revisar el requisito de 6 meses a 10 años, que además se cuenta desde el inicio de actividades ante el SII, no desde la constitución. | ✅ Fecha completa. Avisa en el momento si queda fuera del rango (entre el 16-11-2016 y el 16-05-2026). |
| Región de la casa matriz | ✅ (dice «Región», sin aclarar que es la de la casa matriz) | ✅ Con la aclaración, porque da 10 puntos |
| Sitio web | ✅ opcional | ✅ Opcional, pero si falta se exige la presentación en PDF (numeral 4) |
| Número de trabajadores | ⚠️ El mínimo es 1. Las bases admiten empresas sin trabajadores contratados (tabla del numeral 4). | ✅ De 0 a 25. Con 0 no se pide la planilla de cotizaciones. |
| **Tipo: startup o EBCT** | ❌ | ✅ Con la definición de cada una |
| Ámbito de aplicación | ⚠️ Con nombres distintos a los de las bases («Educación Dinámica», «Servicios Complejos…») | ✅ Los 5 ámbitos prioritarios con el nombre de las bases, más «Otro». Se usa en el desempate. |
| **Correo corporativo para la licencia** | ❌ | ✅ |
| **Datos del representante legal** | ⚠️ Mezcla representante y contacto («representante o contacto principal») y no pide RUT | ✅ Nombre, RUT, correo y teléfono del representante legal, y contacto opcional si es otra persona |

## 2. Persona responsable de la implementación técnica (requisito del numeral 4)

Las bases exigen **nombre, cargo y enlace al perfil profesional o CV breve**. Lovable solo pide un correo, y opcional.
→ El formulario nuevo pide los cuatro datos y todos son obligatorios.

## 3. Atributos para el puntaje (numerales 6.2 y 8)

| Criterio (máx.) | Lovable | Formulario nuevo |
|---|---|---|
| Producto en el mercado o piloto (20) | ⚠️ Pregunta «MVP / prototipo / software en operación», que no distingue los niveles de puntaje (sin usuarios / piloto con 1 cliente / clientes que pagan) | ✅ Los 3 niveles de la tabla, con su respaldo (carta, factura o enlace) |
| Financiamiento público previo (20) | ❌ | ✅ Los 3 niveles, el detalle del instrumento y la resolución o convenio |
| Equipo técnico propio (15) | ❌ | ✅ Filas con nombre, rol y enlace de cada persona técnica adicional. El nivel se calcula solo. |
| Ventas del último año tributario (15) | ❌ | ✅ Los 3 tramos (se acredita con la Carpeta Tributaria, que ya es obligatoria) |
| Calidad de la propuesta (10) | No aplica | Se informa que la evalúa el Ministerio con las 3 respuestas |
| Liderazgo femenino (10) | ❌ | ✅ Representante legal mujer **o** ≥ 50 % de la propiedad en manos de mujeres, con su respaldo |
| Casa matriz fuera de la RM (10) | (Solo la región) | ✅ Se calcula con la región de la casa matriz |

Además, el formulario muestra en vivo el **puntaje declarado** (de 0 a 90, más la calidad que asigna el Ministerio) y avisa que es referencial hasta la verificación.

## 4. Propuesta de uso (numeral 6.3)

Las bases piden 3 preguntas fijas de hasta **1.000 caracteres** cada una, y todas son obligatorias (numeral 7).

| Bases | Lovable |
|---|---|
| ¿Qué problema u oportunidad abordarán con IA de voz? | «Descripción del producto y problema que resuelve» (1.200 caracteres) |
| ¿Qué harán con ElevenLabs y cómo lo integrarán a su producto u operación? | «¿Cómo integrarán la voz/audio…?» (1.200 caracteres) |
| ¿Qué resultado esperan y con qué indicador se medirán? | ❌ Falta. Lo más cercano es «Impacto esperado», que es **opcional** y tiene 600 caracteres. |

→ El formulario nuevo usa el texto exacto de las bases, con contador de 1.000 caracteres, y las tres preguntas son obligatorias. La tercera explica que el indicador debe ser cuantificable, porque eso define si la calidad obtiene 5 o 10 puntos.

Lovable también pide «minutos mensuales estimados», que las bases no piden. Se eliminó.

## 5. Documentos adjuntos (numerales 4 y 6.4)

Lovable **no tiene ningún campo de adjuntos**. El formulario nuevo tiene un casillero por documento (PDF, hasta 5 MB cada uno):

| Documento | Obligatorio |
|---|---|
| Certificado de vigencia (emitido hasta 60 días antes) | Siempre |
| Carpeta Tributaria Electrónica del SII (generada hasta 30 días antes, sin modificar) | Siempre |
| Certificado F30 de la Dirección del Trabajo | Siempre |
| Planilla de cotizaciones del último mes (Previred) | Si tiene trabajadores |
| Anexo N° 1, declaración jurada firmada | Siempre. El formulario **genera el Anexo con los datos ya ingresados**, listo para firmar. |
| Presentación de la empresa (máx. 10 láminas) | Si no informó sitio web |
| Enlace a demo o video de hasta 2 minutos (MVP) | Siempre |
| Carta del cliente o socio, o factura | Si declara piloto o producto en el mercado |
| Resolución o convenio de adjudicación | Si declara financiamiento público |
| Estatutos o certificado de socios | Si declara ≥ 50 % de propiedad de mujeres |

## 6. Declaraciones

Las casillas de Lovable **no equivalen al Anexo N° 1**, que exige una declaración jurada **firmada** por el representante legal. Además:

- Incluye un compromiso que las bases no piden: «entregar reportes periódicos de uso». Las obligaciones del numeral 10 son activar la licencia, usarla conforme a la propuesta, participar en el acompañamiento y colaborar en difusión.
- Describe mal las exclusiones. Dice «agencias de publicidad o marketing tradicional», y las bases dicen «agencia, consultora o pyme sin desarrollo tecnológico propio». Además, faltan dos exclusiones: «productos que compitan con ElevenLabs» y «cliente enterprise vigente o grant previo de ElevenLabs».
- No informa que algunos datos se comunican a ElevenLabs y pueden ser objeto de transferencia internacional (numeral 12).

→ El formulario nuevo pide el Anexo N° 1 firmado y deja 4 casillas de aceptación: leí las bases, cumplo los requisitos y no estoy en las exclusiones, uso responsable y aviso de datos personales (con sus destinatarios).

## 7. Plazo y envío

- Lovable no controla el cierre. El formulario nuevo deja de recibir postulaciones el **16 de noviembre de 2026 a las 15:00** (hora de Chile) y registra la fecha y hora de envío, que es el último criterio de desempate.
- Lovable muestra «[FECHA POR CONFIRMAR]» y «[COMPLETAR]» en la agenda, y su FAQ dice que las fechas «se informarán en las bases». Las fechas ya están en el numeral 11.
- El formulario nuevo advierte, antes de enviar, que **la postulación no se puede modificar** una vez enviada (numeral 7) y que se admite **una por empresa**.

## 8. Puntos de las bases para revisar con el equipo

Aparecieron al cruzar las bases con la landing. Conviene resolverlos antes de publicar:

1. **Plazo de activación contradictorio. Resuelto: 10 días hábiles.** El numeral 3 dice **10 días hábiles** y el numeral 10 dice **15**. El equipo confirmó 10, que es lo que usa la landing. Falta corregir el numeral 10 en las bases.
2. **Nombre de la convocatoria.** El título de las bases dice «ACTIVA STARTUP/EBCT CON IA», y el resto del documento y el Anexo dicen «Activa Startup con IA». La landing usa «Activa Startup con IA».
3. **Créditos y minutos.** Las bases dicen «44.000.000 créditos (54.000 minutos)». La propuesta de contenidos y Lovable hablan solo de minutos. La landing usa ambos.
4. **Educación como ámbito prioritario.** Educación es prioritaria, pero se excluyen los productos para menores de 18 años, «incluidos los del ámbito educativo» (Anexo 1, punto 10). La landing lo aclara en el ámbito y en las preguntas frecuentes.
5. **Fecha de publicación.** La carta Gantt dice 2 de noviembre y las bases, 3 de noviembre. La landing usa la de las bases.
6. **«Calidad» en el numeral 6.2.** Aparece como un atributo que declara la empresa, pero la evalúa el Ministerio a partir de las respuestas. El formulario no la pide.
7. **Errata en el numeral 9:** dice «startups/EBC» en vez de «startups/EBCT».
8. **Párrafo resaltado en el numeral 5** (sanciones por falsedad o mal uso): tiene el resaltado de revisión jurídica pendiente.
