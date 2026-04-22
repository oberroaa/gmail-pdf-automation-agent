# 🤖 Gmail PDF Automation Agent (Cloud Version)

Agente inteligente que automatiza la lectura de correos de Gmail con adjuntos PDF, los analiza utilizando Inteligencia Artificial (Google Gemini) y envía los resultados tanto por email como por WhatsApp (Meta Cloud API). 

Esta versión ha sido modernizada para funcionar en una infraestructura **Cloud Serverless**, separando la ejecución del agente de la administración.

---

El proyecto está dividido en tres componentes principales:

1.  **Agente (GitHub Actions)**: Se ejecuta de forma programada para descargar y analizar PDFs.
2.  **Base de Datos (MongoDB Atlas)**: Almacena reglas, items, inventario de Canopy y reportes.
3.  **Panel de Administración (Vercel)**: Interfaz para gestionar reglas, usuarios y visualizar el inventario en tiempo real.

---

## 🛠️ Módulos de Análisis

El sistema opera bajo dos filosofías de extracción distintas según el tipo de documento:

### 1. Material Handling (Asistido por IA)
*   **Propósito**: Análisis de pedidos generales y materiales de stock.
*   **Tecnología**: Usa **Google Gemini** para generar reglas de extracción (JSON) basadas en lenguaje natural.
*   **Funcionamiento**: El usuario define qué materiales buscar, y la IA configura los filtros de unidades (UOM) y prefijos. La extracción final se ejecuta mediante un motor de reglas flexible.

### 2. Canopy (Motor de Precisión Programático)
*   **Propósito**: Análisis de PDFs de producción de Canopy para verificación de stock de telas.
*   **Tecnología**: **No utiliza IA para la extracción.** Utiliza un motor basado en coordenadas exactas y lógica de grilla.
*   **Razón**: Debido a la rigidez y criticidad de los datos de Canopy (especialmente el *Canopy Profile*), se utiliza extracción por coordenadas para garantizar un **0% de error** por interpretación (alucinación), algo vital para el manejo de inventario físico.

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
