# Recepción de fichas en una Google Sheet

Cómo dejar funcionando el envío del formulario de la ficha de insumos (botón «Participa» de la landing). Cada ficha enviada queda como una fila de una Google Sheet del Ministerio y, si trae un documento adjunto, este se guarda en una carpeta de Drive.

Archivos de esta carpeta:

- `Codigo.gs`: el script que se pega en Apps Script.
- `INSTRUCCIONES.md`: este documento.

Tiempo estimado: 15 minutos.

## Antes de empezar

- **Usa una cuenta institucional (@minciencia.gob.cl) que vaya a seguir existiendo.** Lo ideal es una cuenta del equipo, no una personal. La aplicación funciona con los permisos de esa cuenta, y la hoja y los adjuntos quedan a su nombre. Si se elimina la cuenta, el formulario deja de recibir fichas.
- **La aplicación tiene que poder publicarse con acceso «Cualquier usuario».** Algunos dominios de Google Workspace lo bloquean. Si en el paso 5 no aparece esa opción, hay que pedirle a TI (administración de Google Workspace) que lo permita para esta aplicación.
- **La hoja guardará datos personales** (nombre y correo de contacto). Compártela sólo con el equipo que sistematiza las fichas.

## 1. Crear la hoja

1. En Google Drive, crea una hoja de cálculo nueva, idealmente en una unidad compartida del equipo. Por ejemplo: «Fichas de insumos · Reglamentos Ley 21.838».
2. Ábrela y entra a **Extensiones → Apps Script**. Se abre el editor con un proyecto vinculado a la hoja.
3. Ponle nombre al proyecto (arriba a la izquierda), por ejemplo «Recepción fichas Ley 21.838».

## 2. Pegar el script

1. En el editor, borra lo que aparece en `Código.gs` y pega el contenido completo de `Codigo.gs`.
2. Opcional: si quieres que llegue un correo por cada ficha, escribe la dirección en `NOTIFICAR` (al inicio del script, en `CONFIG`).
3. Guarda con el ícono del disquete o Ctrl + S.

## 3. Configurar la hoja (una sola vez)

1. En la barra superior del editor, elige la función **`configurar`** y presiona **Ejecutar**.
2. Google pide autorización: **Revisar permisos**, elige la cuenta y presiona **Permitir**. Pide acceso a Sheets, a Drive y a enviar correos (este último sólo se usa si completas `NOTIFICAR`). Si aparece «Google no verificó esta aplicación», entra a **Configuración avanzada → Ir a … (no seguro)**: es normal en scripts propios.
3. Al terminar, la hoja tiene una pestaña **«Fichas»** con 19 columnas, y en Drive aparece la carpeta **«Fichas Ley 21.838 · Adjuntos»**. El registro de ejecución muestra los enlaces a ambas.

## 4. Probar sin publicar

1. Elige la función **`probarRecepcion`** y presiona **Ejecutar**.
2. En «Fichas» debe aparecer una fila que dice «PRUEBA · borrar esta fila». En la columna del problema el texto debe empezar con `=` sin convertirse en fórmula. **Borra la fila.**

## 5. Publicar como aplicación web

1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. En el engranaje de «Seleccionar tipo», elige **Aplicación web**.
3. Completa:
   - **Descripción:** «Recepción de fichas v1».
   - **Ejecutar como:** **Yo** (la cuenta que publica).
   - **Quién tiene acceso:** **Cualquier usuario** («Anyone»). Sin esto, el público no puede enviar fichas.
4. Presiona **Implementar** y copia la **URL de la aplicación web**. Termina en `/exec`.
5. Para comprobar que funciona, abre esa URL en una ventana de incógnito. Debe decir «Recepción de fichas de la Ley N° 21.838: activa.».

## 6. Conectar la página

Desde la carpeta `Trabajo_Claude/scripts`, ejecuta este comando con la URL del paso 5 y el correo del proceso:

```bash
python configurar_envio.py --endpoint "https://script.google.com/macros/s/PEGAR-AQUI/exec" --correo "correo-del-proceso@minciencia.gob.cl"
```

El comando escribe la URL en el formulario y rearma la página. El resultado queda en `Final/261027_landing-final-autonomo.html`, que es la página que se publica.

El correo es opcional. La página lo usa sólo si el envío falla o no está configurado, para que la persona mande la ficha descargada.

## 7. Probar el envío completo

El formulario de la página sólo permite enviar desde el 2 de noviembre. Para probar antes, manda una ficha de prueba directamente a la URL (reemplaza `PEGAR-AQUI`):

```bash
curl -L -d "reglamento=1&reglamento_nombre=PRUEBA&institucion=PRUEBA%20borrar&tipo_actor=Universidad&region=Valparaiso&contacto=Prueba&correo=prueba%40ejemplo.cl&presenta=A%20nombre%20propio&problema=Prueba%20de%20envio&acepta_aviso=s%C3%AD" "https://script.google.com/macros/s/PEGAR-AQUI/exec"
```

Debe responder `{"ok":true}` y aparecer una fila en «Fichas». Bórrala después.

Desde el 2 de noviembre conviene enviar una ficha real de prueba desde la página publicada, con un PDF adjunto, y revisar que:

- la fila aparezca en la hoja;
- el adjunto quede en la carpeta;
- la página muestre «¡Gracias! Recibimos tu ficha».

## Cambios posteriores al script

Si editas `Codigo.gs`, **no crees una implementación nueva**, porque eso cambia la URL. Entra a **Implementar → Administrar implementaciones**, presiona el lápiz, elige **Versión: Nueva versión** y luego **Implementar**. La URL se mantiene.

## Qué hace el script

- Agrega una fila por ficha con la fecha de recepción, el reglamento, las secciones A a I y el enlace al adjunto.
- Las fichas que llegan **desde el 12 de diciembre de 2026 a las 00:00** (la recepción cierra el 11 de diciembre) se guardan igual, con «Fuera de plazo» en la última columna («Plazo») y el aviso por correo marcado «[Fuera de plazo]».
- **Rechaza** las fichas que no traen los datos obligatorios (A, reglamento, problema y aceptación del aviso).
- **Descarta en silencio** los envíos de robots: el formulario tiene un campo oculto que las personas no ven.
- Guarda adjuntos PDF, Word, Excel, PowerPoint u ODT de hasta 10 MB. Si un archivo no cumple, la ficha se guarda igual y la columna del adjunto indica por qué no se guardó.
- Antepone un apóstrofo a los textos que empiezan con `=`, `+`, `-` o `@`, para que la hoja no los ejecute como fórmulas.
- Usa un bloqueo para que dos envíos simultáneos no se pisen.

Los adjuntos quedan privados en la carpeta. Compártela con el equipo igual que la hoja.

## Si algo falla

| Síntoma | Causa probable |
|---|---|
| La página muestra «No pudimos enviar tu ficha» | La URL no es la de `/exec`, la implementación no tiene acceso «Cualquier usuario», o falta ejecutar `configurar`. |
| Abrir la URL pide iniciar sesión | El acceso quedó como «Cualquier usuario de minciencia.gob.cl» en vez de «Cualquier usuario». |
| Error «Falta HOJA_ID» en las ejecuciones | No se ejecutó `configurar()` (paso 3). |
| No llegan correos de aviso | `NOTIFICAR` vacío, o se completó después de publicar sin crear una nueva versión (ver «Cambios posteriores al script»). |

Los errores quedan registrados en **Ejecuciones**, en el menú izquierdo del editor.
