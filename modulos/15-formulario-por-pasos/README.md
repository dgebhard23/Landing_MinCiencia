# Formulario por pasos (ficha en línea)

**Categoría:** Formularios
**Viene de:** Landing Reglamentos TT (ronda 13–15) + Buzón EBCT

## Qué hace
El formulario completo de la ficha de Reglamentos, generalizado: ventana con pasos numerados y barra de avance; validación por paso con mensajes que se borran al corregir; campos condicionales; filas que se agregan y quitan; contador de palabras; borrador automático en el navegador; resumen final con «Editar» por sección; descarga de una copia en Word; envío a Google Apps Script (Sheets + Drive + aviso por correo) o, sin endpoint, modo de respaldo por correo; campo trampa anti-spam; y «enviar otra» conservando los datos de contacto.

## Cuándo usarlo
Postulaciones, fichas de insumos, inscripciones, encuestas largas, consultas ciudadanas.

## Cómo agregarlo a una landing
1. Copia `modulo.css` y `modulo.js` a tu proyecto (o enlázalos).
2. Copia el marcado HTML desde `index.html` (todo lo que está entre el `<header class="demo-cab">` y el `<script>`).
3. Asegúrate de cargar antes `base/tokens.css` y `base/base.css`: los colores salen de ahí.

Abre `index.html` en el navegador para verlo funcionando.
