📧 Gmail PDF Automation Agent

Automatización profesional para procesar correos con PDFs, extraer información estructurada mediante reglas y distribuir resultados automáticamente por WhatsApp y Email.

Diseñado para empresas que reciben documentos PDF por correo y necesitan procesarlos de forma confiable, repetible y sin intervención humana.

🚀 Qué problema resuelve

Muchas empresas reciben diariamente PDFs con información crítica:

Releases

Órdenes

Listas de materiales

Reportes técnicos

Este sistema elimina:

Procesamiento manual

Errores humanos

Retrasos operativos

Y lo reemplaza por:

Automatización

Reglas claras

Resultados inmediatos

🧠 Qué hace el sistema

Lee correos entrantes desde Gmail

Detecta PDFs adjuntos

Analiza el contenido según reglas configurables

Genera un resumen estructurado

Envía el resultado automáticamente por:

📱 WhatsApp

📧 Email

Marca el correo como procesado para evitar duplicados

🧱 Arquitectura general

El sistema está dividido en dos procesos independientes que comparten una sola fuente de verdad:

/rules   ← Reglas JSON (fuente única de verdad)

🔁 Flujo completo (Diagrama visual)
┌──────────────┐
│   Gmail      │
│  (PDF Email) │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Automation Agent    │
│  (Node.js)           │
│                      │
│ • Lee correos        │
│ • Detecta PDFs       │
│ • Extrae texto       │
│ • Detecta regla      │
│ • Aplica reglas JSON │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  PDF Analysis Engine │
│  (Rule-based)        │
└──────┬───────────────┘
       │
       ▼
┌────────────────────────────┐
│ Resultado estructurado     │
│ (texto / resumen)          │
└──────┬───────────┬─────────┘
       │           │
       ▼           ▼
┌────────────┐   ┌────────────┐
│ WhatsApp   │   │ Email      │
│ (Twilio)   │   │ (Gmail)    │
└────────────┘   └────────────┘
       │
       ▼
┌──────────────────────┐
│ Correo marcado       │
│ como PROCESSED       │
└──────────────────────┘

📂 Reglas (/rules)

Archivos JSON versionables

Una regla = una forma de interpretar un PDF

default.json:

Siempre existe

Nunca se elimina

Se usa cuando el correo no especifica regla

📌 El correo puede indicar qué regla usar:

usar regla bda

🔒 Separación de responsabilidades
Agent (Producción)

Lee correos

Aplica reglas

Envía resultados

🚫 No:

Modifica reglas

Usa IA

Cambia configuraciones

Admin (Backoffice – local)

CRUD de reglas

Preview de resultados

Definir regla default

Validaciones y protección

👉 El Admin no corre en producción, solo lo usa el operador.

⏰ Horario de operación

El agent solo procesa correos en horario laboral:

🕖 7:00 AM

🕒 3:00 PM
(hora local del servidor)

Fuera de ese horario:

No se envían mensajes

No se procesan correos

🧪 Test Mode

Soporta modo de pruebas mediante .env:

TEST_MODE=true


Cuando está activo:

✔️ Analiza PDFs

✔️ Muestra resultados en consola

❌ No envía WhatsApp

❌ No envía Email

❌ No marca correos

Ideal para pruebas y validaciones sin impacto real.

☁️ Ejecución en producción

Corre en GitHub Actions

Sin servidores pagos

Ejecución programada o manual

Alta disponibilidad

📱 WhatsApp

Integración con WhatsApp API (Twilio):

Sandbox para pruebas

Número oficial recomendado para producción

Envío automático de resultados

🔐 Seguridad

OAuth2 con refresh token

Variables sensibles por .env / GitHub Secrets

Acceso mínimo necesario

Reglas versionadas y protegidas

🎯 Casos de uso ideales

Automatización de documentos PDF

Operaciones repetitivas por correo

Empresas con alto volumen de PDFs

Equipos que necesitan resultados inmediatos

Integración sin cambiar procesos existentes

🧠 Filosofía del sistema

Simple antes que complejo

Reglas como contrato de negocio

Producción estable

Administración controlada

Cambios pequeños y trazables