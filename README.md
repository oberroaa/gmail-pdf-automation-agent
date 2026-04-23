# 🤖 Gmail PDF Automation Agent (Cloud Version)

Agente inteligente que automatiza la lectura de correos de Gmail con adjuntos PDF, los analiza utilizando Inteligencia Artificial (Google Gemini) y envía los resultados tanto por email como por WhatsApp (Meta Cloud API). 

Esta versión ha sido modernizada para funcionar en una infraestructura **Cloud Serverless**, separando la ejecución del agente de la administración.

---

El proyecto está dividido en tres componentes principales:

1.  **Agente (GitHub Actions)**: Se ejecuta de forma programada para descargar y analizar PDFs.
2.  **Base de Datos (MongoDB Atlas)**: Almacena reglas, items, inventario de Canopy y reportes.
3.  **Panel de Administración (Vercel)**: Interfaz para gestionar reglas, usuarios y visualizar el inventario en tiempo real.

---

## 🛠️ Módulos Principales

El sistema se organiza en dos módulos principales para el procesamiento de documentos:

### 1. Material Handler (Gestión de Materiales)
*   **Alcance**: Incluye el **Manejo de Grúa** (protocolos de seguridad), la configuración de reglas de IA, el catálogo de materiales (items), el historial de análisis y la herramienta de procesamiento manual.
*   **IA (Google Gemini)**: Utilizada para la generación dinámica de reglas de extracción basadas en lenguaje natural.
*   **Propósito**: Automatizar la identificación de materiales generales y pedidos de stock.

### 2. Canopy (Análisis de Producción)
*   **Alcance**: Gestión del inventario de yardas de tela y análisis de PDFs de producción específicos.
*   **Motor de Precisión**: Utiliza un motor determinista (sin IA) basado en coordenadas exactas para garantizar un 0% de error en la extracción del *Canopy Profile* y materiales asociados.
*   **Propósito**: Control crítico del stock de telas vs requerimientos de producción.

---

---

## 🚀 Funcionalidades Principales

*   **Análisis Dual**: Sistema híbrido que combina IA para flexibilidad en materiales y código determinista para precisión en Canopy.
*   **WhatsApp Meta API**: Notificaciones robustas gestionando la ventana de 24h.
*   **IA-Powered Rules**: Generador de reglas mediante lenguaje natural para el módulo de materiales.
*   **Gestión de Stock Canopy**: Control en tiempo real de yardas disponibles vs requeridas en PDF.

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
