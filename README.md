# CitySights Admin

Panel de administración para CitySights — React 18 + Vite + Tailwind CSS.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # ajusta VITE_API_URL
npm run dev
```

Variable de entorno requerida:

| Variable       | Ejemplo                           | Descripción                          |
|----------------|-----------------------------------|--------------------------------------|
| `VITE_API_URL` | `http://localhost:3000/api/v1`    | URL base de la API (sin barra final) |

## Deploy en Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com) → **Add New Project**.
2. Seleccionar el directorio `citysights-admin` como **Root Directory** (si el repo es un monorepo).
3. Framework: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Agregar la variable de entorno `VITE_API_URL` con la URL de producción de la API (ej. `https://citysights-api.up.railway.app/api/v1`).
7. Click **Deploy**.

El archivo `vercel.json` en la raíz ya contiene la regla de rewrite necesaria para que React Router funcione correctamente en producción.
