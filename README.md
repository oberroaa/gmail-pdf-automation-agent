📄 Gmail PDF Automation Agent

Automatización que lee correos de Gmail, extrae información estructurada desde PDFs y envía resultados automáticamente por WhatsApp y Email.

Diseñado para procesos empresariales donde los datos llegan en documentos PDF y deben procesarse sin intervención humana.

🚀 ¿Qué hace este agente?

✔️ Monitorea Gmail automáticamente (cada hora)
✔️ Detecta correos con PDFs de un remitente específico
✔️ Extrae datos clave desde el PDF (Part Number, Qty, UOM = FT)
✔️ Agrupa y calcula totales de forma determinista
✔️ Envía el resultado:

📧 por Email

📱 por WhatsApp
✔️ Marca el correo como PROCESSED para evitar reprocesos

Todo el flujo es 100% automático.

🧠 ¿Por qué este enfoque es potente?

❌ Sin IA “inestable”

❌ Sin costos por tokens

❌ Sin resultados variables

✅ Parsing determinista
✅ Resultados reproducibles
✅ Ideal para producción
✅ Escalable a miles de documentos

Este sistema es perfecto para:

Manufactura

Logística

Compras

Inventarios

Finanzas

Operaciones

🛠️ Tecnologías usadas

Node.js

Gmail API (OAuth2)

pdfjs-dist

Twilio WhatsApp API

GitHub Actions (cloud gratis)

Regex-based data extraction

📦 Flujo del sistema

Llega un correo con PDF

El agente lo detecta

Descarga el PDF

Extrae datos relevantes

Agrupa y calcula totales

Envía el resultado

Marca el correo como procesado

🔐 Seguridad

Secrets gestionados con GitHub Secrets

No se suben credenciales al repositorio

OAuth seguro con Google

📈 Casos de uso reales

Procesar órdenes de compra

Extraer materiales y cantidades

Automatizar reportes

Reducir trabajo manual

Eliminar errores humanos

👨‍💻 Autor

Otoniel Berroa
Automatización · Backend · Integraciones · Procesos empresariales
