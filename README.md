Gmail Automation Agent – PDF Processing & Notifications

Agente automatizado en Node.js que monitorea Gmail, procesa correos con PDF adjuntos, extrae información estructurada y envía resultados automáticamente por WhatsApp y Email, asegurando que cada correo se procese una sola vez.

🚀 Funcionalidades

📬 Monitorea Gmail automáticamente

📎 Detecta correos con PDFs de un remitente específico

📥 Descarga y guarda archivos PDF

🧠 Analiza el contenido del PDF (parser determinista)

📊 Genera resultados estructurados

📱 Envía resultados por WhatsApp (Twilio)

📧 Envía resultados por Email

🏷️ Marca correos como PROCESSED para evitar reprocesos

🔁 Ejecución automática cada hora

🟢 Listo para producción con PM2

🧠 Casos de uso

Procesamiento automático de órdenes de compra

Extracción de datos desde PDFs operativos

Automatización de flujos por correo

Reducción de trabajo manual repetitivo

Integración entre Email → Documentos → Notificaciones

🏗️ Flujo del sistema
Gmail → PDF → Análisis → Resultado
                     ↳ WhatsApp
                     ↳ Email
                     ↳ Etiqueta PROCESSED

🧩 Tecnologías

Node.js (ES Modules)

Google Gmail API (OAuth2)

PDF.js

Twilio WhatsApp API

PM2

dotenv

📁 Estructura del proyecto
.
├── agent.js
├── analyze-pdf.js
├── whatsapp.js
├── ecosystem.config.cjs
├── processed_pdfs/
├── package.json
└── .gitignore

⚙️ Configuración

Crear un archivo .env:

# Gmail OAuth2
CLIENT_ID=xxxx.apps.googleusercontent.com
CLIENT_SECRET=xxxx
REDIRECT_URI=http://localhost
REFRESH_TOKEN=1//xxxx

# WhatsApp (Twilio)
ACCOUNT_SID=ACxxxxxxxx
AUTH_TOKEN=xxxxxxxx
WHATSAPP_FROM=whatsapp:+14155238886
WHATSAPP_TO=whatsapp:+1XXXXXXXXXX

# Output
PDF_OUTPUT_DIR=./processed_pdfs


⚠️ El archivo .env no debe subirse a GitHub.

▶️ Ejecución
npm install
node agent.js

🔁 Ejecución automática (producción)
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save

🔒 Seguridad

Autenticación OAuth2 (sin contraseñas)

Control de reprocesamiento mediante etiquetas Gmail

PDFs almacenados con ID único

Proceso persistente con PM2

📈 Escalabilidad

El agente puede extenderse para:

Dashboard web

Bases de datos

APIs REST

Webhooks

Múltiples clientes

Integración con IA

👨‍💻 Autor

Otoniel Berroa
Automation & Backend Developer

📜 Licencia

MIT