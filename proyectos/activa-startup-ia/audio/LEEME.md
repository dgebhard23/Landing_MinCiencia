# Audios de los ejemplos

Los botones «Escuchar» buscan aquí un MP3 por ámbito. Si el archivo no existe, el botón no aparece.

Para que suene con ElevenLabs, genera cada frase en ElevenLabs (Text to Speech, una voz en español de Chile) y guárdala con este nombre:

| Archivo | Frase |
|---|---|
| `accesibilidad.mp3` | Hola. Este documento tiene tres páginas. ¿Quieres que lo lea completo o solo el resumen? |
| `salud.mp3` | Buenos días. Le recuerdo que hoy a las ocho le toca su control de presión. ¿Lo pudo registrar? |
| `educacion.mp3` | Retomemos la unidad tres. Antes de seguir, ¿me cuentas con tus palabras qué es una tasa de interés? |
| `servicios.mp3` | Gracias por llamar. Ya encontré su pedido: llega mañana entre las diez y las dos. ¿Necesita algo más? |
| `creativas.mp3` | Capítulo uno. En el extremo sur del mundo, donde el viento no se detiene, comienza esta historia. |

Las frases están en `comun/convocatoria.js` (campo `frase` de cada ámbito). Si cambias una, vuelve a generar su audio.

## Muestras del beneficio (propuesta 2)

Las tarjetas de «La plataforma de ElevenLabs» muestran el botón «Escuchar una muestra» solo si existe su archivo:

| Archivo | Qué grabar en ElevenLabs |
|---|---|
| `muestra-voz.mp3` | Una frase de bienvenida con Text to Speech, por ejemplo: «Hola, soy la voz de tu producto. Puedo leer, narrar y explicar en español de Chile.» |
| `muestra-agente.mp3` | Un intercambio corto de ElevenAgents atendiendo una consulta. |
| `muestra-musica.mp3` | Un fragmento de 15 a 20 segundos generado con ElevenMusic. |

Sin estos archivos los botones no aparecen: la página no usa la voz del navegador para no confundirla con ElevenLabs.
