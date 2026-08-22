# MarketIA

MarketIA es una aplicación web inteligente para minimercados, con inteligencia artificial integrada para generar combos, contenido promocional y análisis de negocio.

## Tecnologías

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React (iconos)
- React Hot Toast (notificaciones)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (cookies HTTP-only)
- bcrypt
- Google Gemini AI
- ExcelJS + PDFKit (reportes)
- n8n (automatizaciones)

## Instalación

### Prerrequisitos
- Node.js >= 18
- MongoDB corriendo localmente o en la nube
- API Key de Google Gemini

### Backend

```bash
cd backend
cp .env.example .env   # Configurar variables de entorno
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Variables de Entorno

### Backend (`.env`)

| Variable | Descripción |
|----------|-------------|
| `MONGODB_URI` | URI de conexión a MongoDB |
| `JWT_SECRET` | Secreto para firmar JWT |
| `GEMINI_API_KEY` | API Key de Google Gemini |
| `PORT` | Puerto del servidor (default: 5000) |
| `FRONTEND_URL` | URL del frontend para CORS |
| `N8N_BASE_URL` | URL de tu instancia n8n |
| `N8N_WEBHOOK_SECRET` | Secreto para webhooks de n8n |

### Frontend (`.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base de la API backend |

## Funcionalidades

### Módulos
- **Dashboard** - Estadísticas del negocio
- **Productos** - CRUD, control de stock, búsqueda por código de barras/SKU
- **Categorías** - Organización de productos
- **Ventas** - Registro con escáner, ticket con logo
- **Combos** - Crear y gestionar combos de productos
- **Publicaciones** - Contenido promocional generado con IA
- **Recomendaciones IA** - Alertas de reposición, análisis de márgenes, sugerencias de precios, tendencias semanales
- **Asistente** - Chat con IA para consultas del negocio

### Integraciones
- **Google Gemini** - Generación de contenido, combos, análisis
- **n8n** - Webhooks y automatizaciones
- **Canvas** - Generación de imágenes promocionales
- **Reportes** - Exportar productos y ventas a PDF

## Arquitectura del Backend

```
backend/src/
├── config/          # Configuración (DB)
├── controllers/     # Manejo de requests/responses
├── dao/             # Operaciones directas con Mongoose
├── integrations/    # Gemini, n8n
├── middlewares/      # Auth, autorización, errores
├── models/          # Schemas de Mongoose
├── repositories/    # Abstracción de acceso a datos
├── routes/          # Definición de endpoints
├── services/        # Lógica de negocio
├── utils/           # Funciones reutilizables
└── app.js           # Entry point
```

**Flujo de datos:**
Route → Controller → Service → Repository → DAO → Model → MongoDB

## Usuarios de Prueba

Para crear un usuario administrador, registrá un usuario normal y luego cambiate el rol directamente en MongoDB:

```javascript
db.users.updateOne({ email: "admin@marketia.com" }, { $set: { role: "admin" } })
```

## Licencia

Proyecto privado.
