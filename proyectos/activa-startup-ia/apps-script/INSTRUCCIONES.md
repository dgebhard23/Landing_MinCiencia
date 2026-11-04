# Conectar el formulario de postulación

Mientras `data-endpoint` esté vacío, el formulario funciona en **modo demostración**: valida todo, genera el Anexo N° 1 y la copia en Word, pero no envía nada.

## Instalar

1. Crea una Google Sheet nueva con la cuenta institucional que va a administrar la convocatoria.
2. Ve a *Extensiones → Apps Script* y pega el contenido de `Codigo.gs`.
3. Edita `CONFIG`:
   - `CORREO_AVISO`: el correo del equipo que recibe el aviso de cada postulación.
   - `AVISAR_POSTULANTE`: con `true`, el representante legal recibe un acuse de recibo con su folio.
4. Ejecuta `configurar` una vez y acepta los permisos (Sheets, Drive y correo).
5. Publica en *Implementar → Nueva implementación → Aplicación web*:
   - Ejecutar como: **yo**.
   - Quién tiene acceso: **cualquier persona**.
6. Copia la URL que termina en `/exec` y pégala en cada propuesta, en:
   ```html
   <script src="../comun/postulacion.js" data-endpoint="https://script.google.com/macros/s/…/exec"></script>
   ```
7. Si cambias el código, publica con *Administrar implementaciones → editar → Nueva versión*. Así la URL se mantiene.

## Qué queda guardado

- **Una fila por postulación**, con el folio (`AS-2026-0001`…), la fecha y hora de recepción, «En plazo» o «Fuera de plazo» (según la hora de cierre, 30-11-2026 a las 15:00) y una columna por cada campo.
  - El formulario no calcula ni muestra puntaje: guarda los antecedentes que declara cada startup/EBCT (producto, financiamiento, equipo, ventas, liderazgo femenino y región) para que el equipo asigne el puntaje al evaluar.
- **Una subcarpeta en Drive por postulación**, con los PDF nombrados por documento. La fila guarda el enlace a la carpeta y a cada archivo.
- **Las declaraciones aceptadas**, en la columna «Declaraciones aceptadas».
- Lo que escribe el público se guarda como texto: una fórmula no se ejecuta y un teléfono con `+` no se vuelve número.

## Mientras la convocatoria esté abierta

- **No borres filas ni las reordenes.** El folio sale del número de filas: si borras una, se puede repetir un folio. Para trabajar con los datos, usa una copia o una hoja aparte.
- Una carpeta llamada «Sin folio · …» es un envío que no alcanzó a guardarse en la planilla. El postulante vio un error y puede haber reintentado: revisa si tiene otra postulación antes de borrarla.
- Si falla un correo, la postulación igual queda guardada. El detalle aparece en *Apps Script → Ejecuciones*.

## Límites

- 5 MB por archivo y 25 MB en total por postulación (lo controla el formulario). Apps Script acepta envíos de hasta unos 50 MB, y el base64 suma un tercio al tamaño.
- Las postulaciones fuera de plazo se guardan igual, marcadas, para dejar registro. El formulario ya no permite enviar después del cierre.

## Antes de publicar

- Prueba un envío completo con datos de prueba y revisa la fila, la carpeta y los dos correos.
- Revisa con jurídica el texto del aviso de datos personales (numeral 12), porque el acuse de recibo sale desde la cuenta que publica el script.
