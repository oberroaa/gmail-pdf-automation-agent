# 🤖 Gmail PDF Automation Agent (Cloud Version)

Agente inteligente que automatiza la lectura de correos de Gmail con adjuntos PDF, los analiza utilizando Inteligencia Artificial (Google Gemini) y envía los resultados tanto por email como por WhatsApp (Meta Cloud API). 

Esta versión ha sido modernizada para funcionar en una infraestructura **Cloud Serverless**, separando la ejecución del agente de la administración.

---

## 🏗️ Arquitectura del Sistema

El proyecto está dividido en tres componentes principales que trabajan de forma sincronizada:

1.  **Agente (GitHub Actions)**: 
    *   Se ejecuta de forma programada (CRON).
    *   Descarga PDFs de Gmail, los analiza y envía notificaciones.
    *   Consulta las reglas de análisis en tiempo real desde MongoDB.
2.  **Base de Datos (MongoDB Atlas)**:
    *   Almacena de forma centralizada todas las reglas de análisis y configuraciones.
    *   Permite que los cambios realizados en el panel de administración se reflejen instantáneamente en el agente.
3.  **Panel de Administración (Vercel)**:
    *   **Frontend**: Interfaz moderna desarrollada con React + Vite.
    *   **Backend (API)**: Funciones serverless que gestionan el CRUD de reglas en MongoDB.
    *   Incluye generación de reglas asistida por IA (Gemini).

---

## 🚀 Funcionalidades Principales

*   **Análisis Inteligente**: Extracción selectiva de datos de PDFs basada en prefijos de material, unidades de medida (UOM) y reglas personalizadas.
*   **WhatsApp Meta API**: Notificaciones robustas por WhatsApp gestionando la ventana de 24h (Templates + Free-form text).
*   **IA-Powered Admin**: Generador de reglas mediante lenguaje natural utilizando Google Gemini.
*   **Horario Laboral**: El agente respeta horarios específicos (7 AM - 3 PM) para no saturar de notificaciones fuera de tiempo.
*   **Cloud Ready**: Despliegue optimizado para Vercel y GitHub Actions con persistencia en MongoDB Atlas.

---

## 🛠️ Tecnologías Utilizadas

*   **Runtime**: Node.js (ESM)
*   **IA**: Google Gemini Pro (Generative AI)
*   **Database**: MongoDB Atlas
*   **Hosting**: Vercel (Admin) + GitHub Actions (Agent)
*   **Comunicaciones**: Meta WhatsApp Cloud API + Gmail API
*   **Frontend**: React, TypeScript, Tailwind CSS, Vite

---

## ⚙️ Configuración (.env)

El sistema requiere las siguientes variables de entorno tanto en local como en los Secrets de GitHub/Vercel:

```env
# Google Auth
CLIENT_ID=...
CLIENT_SECRET=...
REDIRECT_URI=...
REFRESH_TOKEN=...

# Google AI
GEMINI_API_KEY=...

# WhatsApp Meta API
WA_TOKEN=...
WA_PHONE_ID=...
WHATSAPP_TO=... (números separados por coma)

# MongoDB
MONGODB_URI=mongodb+srv://...

# Admin Config
ADMIN_PORT=3001
PDF_OUTPUT_DIR=./processed_pdfs
```

---

## 📁 Estructura del Proyecto

*   `/admin`: Servidor API de administración (Node.js/Express).
*   `/admin-frontend`: Código fuente del panel de control (React).
*   `/api`: Punto de entrada para el despliegue serverless en Vercel.
*   `agent.js`: Script principal del agente automatizado.
*   `db.js`: Módulo centralizado de conexión a MongoDB.
*   `rules-manager.js`: Gestor de reglas sincronizado con la nube.
*   `whatsapp.js`: Integración con la API oficial de Meta.
*   `analyze-pdf.js`: Lógica de extracción y análisis de contenido PDF.
*   `.github/workflows/agent.yml`: Programación de tareas en GitHub Actions.

---

## 📝 Licencia

MIT - Desarrollado para optimizar procesos industriales de análisis de pedidos internos.
