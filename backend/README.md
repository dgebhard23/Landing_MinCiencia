# Backend sin servidor: Google Sheets como base de datos

Las landings no necesitan un servidor. Para recibir datos y para editar contenido se usan dos piezas de Google.

## 1. Recibir formularios: `apps-script/Codigo.gs`

Cada envío del formulario (módulo 15) queda guardado así:

- Una fila nueva en una Google Sheet, con fecha y estado «En plazo» o «Fuera de plazo».
- El adjunto, si lo hay, en una carpeta de Drive. La fila guarda el enlace.
- Un aviso por correo al equipo.

El script crea solo las columnas que falten, así que sirve para cualquier formulario.

**Cómo instalarlo:**

1. Crea una Google Sheet nueva y ve a *Extensiones → Apps Script*.
2. Pega el contenido de `Codigo.gs` y edita `CONFIG` (correo de aviso, fecha de cierre y carpeta de adjuntos).
3. Ejecuta la función `configurar` una vez y acepta los permisos.
4. Publícalo en *Implementar → Nueva implementación → Aplicación web*:
   - Ejecutar como: **yo**.
   - Acceso: **cualquier persona**.
5. Copia la URL que termina en `/exec` y pégala en `data-endpoint="…"` del `<form data-ficha>`.
6. Si después cambias el código, publica con *Administrar implementaciones → Nueva versión*. Así la URL se mantiene.

Mientras `data-endpoint` esté vacío, el formulario funciona igual en modo respaldo: el usuario descarga la ficha en Word y la envía por correo.

Hay dos ejemplos reales:

- `ejemplos/landing-reglamentos-tt/apps_script/`: la versión que se usó en Reglamentos TT.
- `ejemplos/buzon-ebct/Code.gs`: el Buzón EBCT, con analítica anónima por paso.

## 2. Editar contenido sin tocar código: hoja publicada como CSV

Lo usa el módulo 17, igual que la FAQ, el Portal y los Trámites de la web EBCT.

1. En la Google Sheet, ve a *Archivo → Compartir → Publicar en la web*.
2. Elige la pestaña y el formato **CSV**, y publica.
3. Pega el enlace en `data-csv="…"` y ajusta los nombres de columna en los atributos `data-col-*`.
4. La página toma los cambios en un máximo de 5 minutos.
5. Para mostrar imágenes, pega en la celda el enlace de un archivo de Google Drive compartido como «Cualquier persona con el enlace».

> Lo que publiques así queda visible para cualquiera. No publiques la hoja donde llegan las respuestas, porque tiene datos personales. Usa una hoja aparte, solo con el contenido de la página.
