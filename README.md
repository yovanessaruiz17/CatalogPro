# CatalogPro

Software profesional para crear catálogos de productos en PDF.  
Funciona como **aplicación web** y como **programa instalable para Windows/Mac/Linux** (Electron).

---

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Modo web (Vite dev server)
npm run dev

# 3. Modo escritorio (Electron + Vite)
npm run electron:dev
```

---

## 1. Arquitectura

```
src/
├── components/
│   ├── layout/        # AppLayout, Sidebar
│   ├── ui/            # Button, Input, Modal, Badge, etc.
│   ├── products/      # ProductForm, ProductsTable, ProductsCards, ProductsToolbar
│   └── catalog/       # (extensible para futuras vistas previas)
├── pages/             # DashboardPage, ProductsPage, CategoriesPage, CatalogPage, SettingsPage
├── store/             # Zustand store (estado global)
├── hooks/             # usePdfGenerator, useImportExport, useFilteredProducts, useTheme, useKeyboardShortcuts
├── lib/               # db.ts (capa de persistencia — localStorage)
├── types/             # Tipos TypeScript de dominio
└── utils/             # cn, uid, formatPrice, compressImage, downloadBlob, etc.

electron/
├── main.cjs           # Proceso principal de Electron
└── preload.cjs        # Puente IPC seguro (contextBridge)
```

**Flujo de datos:**
```
UI Component
  → useStore() (Zustand)
    → DB layer (lib/db.ts)
      → localStorage
```

Cambiar de base de datos = solo reemplazar las funciones en `lib/db.ts`.

---

## 2. Compilar para Windows

```bash
# Compilar el frontend primero
npm run build

# Empaquetar con Electron Builder
npm run electron:build
```

El ejecutable `.exe` se genera en `dist-electron/`.

---

## 3. Generar instalador .exe

El archivo `package.json` ya tiene la configuración de `electron-builder`:

```json
"build": {
  "win": { "target": "nsis" },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true
  }
}
```

```bash
npm run electron:build
# → dist-electron/CatalogPro Setup 1.0.0.exe
```

Para firmar el instalador (recomendado para distribución):
```bash
CSC_LINK=certificado.p12 CSC_KEY_PASSWORD=clave npm run electron:build
```

---

## 4. Base de datos utilizada

**localStorage del navegador** (o del WebView de Electron).

- Sin servidor. Sin dependencias externas.
- Cada entidad tiene su propia clave: `catalogpro:products`, `catalogpro:categories`, etc.
- Los datos persisten entre sesiones automáticamente.
- La capa de datos está aislada en `src/lib/db.ts` — el resto de la app no sabe ni le importa dónde viven los datos.

---

## 5. Cómo funciona la capa de datos

```typescript
// src/lib/db.ts

export const ProductsDB = {
  getAll: (): Product[] => read<Product[]>('products', []),
  save: (products: Product[]): void => write('products', products),
}
```

El store de Zustand llama a `ProductsDB.save()` cada vez que modifica productos.  
Al iniciar la app, `init()` carga todo desde localStorage.

---

## 6. Migrar a PostgreSQL / MySQL / Firebase

Solo necesitas reemplazar las funciones en `src/lib/db.ts`.

### Opción A: API REST (Express + PostgreSQL/MySQL)

```typescript
// src/lib/db.ts — reemplazar con esto:

export const ProductsDB = {
  getAll: async (): Promise<Product[]> => {
    const res = await fetch('/api/products')
    return res.json()
  },
  save: async (products: Product[]): Promise<void> => {
    await fetch('/api/products', {
      method: 'PUT',
      body: JSON.stringify(products),
      headers: { 'Content-Type': 'application/json' },
    })
  },
}
```

### Opción B: Firebase Firestore

```typescript
import { collection, getDocs, setDoc, doc } from 'firebase/firestore'
import { db } from './firebase'

export const ProductsDB = {
  getAll: async (): Promise<Product[]> => {
    const snap = await getDocs(collection(db, 'products'))
    return snap.docs.map((d) => d.data() as Product)
  },
  save: async (products: Product[]): Promise<void> => {
    for (const p of products) {
      await setDoc(doc(db, 'products', p.id), p)
    }
  },
}
```

### Opción C: SQLite local con Electron (para datasets grandes)

```bash
npm install better-sqlite3
```

```typescript
// electron/db.cjs
const Database = require('better-sqlite3')
const db = new Database('catalogpro.db')

// Exponer vía IPC al renderer
ipcMain.handle('products:getAll', () => db.prepare('SELECT * FROM products').all())
ipcMain.handle('products:save', (_, products) => { /* INSERT OR REPLACE */ })
```

---

## 7. Actualizaciones automáticas

Usa `electron-updater` (incluido en electron-builder):

```bash
npm install electron-updater
```

```javascript
// electron/main.cjs
const { autoUpdater } = require('electron-updater')

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded')
  })
})
```

```javascript
// electron/preload.cjs
contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', cb),
  installUpdate: () => ipcRenderer.send('install-update'),
})
```

Publica en GitHub Releases y configura en `package.json`:
```json
"publish": [{ "provider": "github", "owner": "tu-usuario", "repo": "catalogpro" }]
```

---

## 8. Publicar la aplicación

### Web (Vercel / Netlify)

```bash
npm run build
# Subir la carpeta dist/ a Vercel, Netlify o cualquier CDN estático.

# Vercel
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir=dist
```

### Escritorio (GitHub Releases)

```bash
npm run electron:build
# Subir dist-electron/CatalogPro Setup 1.0.0.exe a GitHub Releases.
# Con electron-updater configurado, los usuarios recibirán actualizaciones automáticas.
```

---

## 9. Mejoras para producto comercial

| Área | Mejora |
|---|---|
| **Auth** | Añadir Clerk, Supabase Auth o Firebase Auth para multi-usuario |
| **Sync** | Reemplazar localStorage por PostgreSQL + API REST para sincronización entre dispositivos |
| **Catálogo** | Vista previa en tiempo real del PDF con `react-pdf` antes de exportar |
| **PDF avanzado** | Añadir plantillas con branding personalizable (fuentes, paletas de color) |
| **Multiidioma** | Integrar `react-i18next` para soporte ES/EN/PT |
| **Suscripciones** | Stripe + planes (Free: 50 productos, Pro: ilimitado) |
| **Analytics** | Posthog o Mixpanel para entender cómo usan el producto |
| **Auto-update** | `electron-updater` con canales `stable` / `beta` |
| **Onboarding** | Tour guiado con `react-joyride` para nuevos usuarios |
| **PWA** | Añadir `vite-plugin-pwa` para instalar desde el navegador sin Electron |
| **Drag & drop** | Reordenar categorías con `@dnd-kit` |
| **Templates de PDF** | Sistema de plantillas guardables por el usuario |
| **Impresión directa** | Enviar el PDF a impresora sin pasar por el navegador (via Electron shell) |
| **SQLite** | Migrar a `better-sqlite3` en Electron para soportar millones de productos |

---

## Atajos de teclado

| Atajo | Acción |
|---|---|
| `N` | Nuevo producto (en la página de productos) |
| `/` | Enfocar búsqueda |
| `Ctrl/⌘ + ,` | Ir a configuración |
| `Esc` | Cerrar modal activo |

---

## Stack tecnológico

| Tecnología | Rol |
|---|---|
| React 19 + Vite | UI framework + bundler |
| TypeScript | Tipado estático |
| TailwindCSS | Estilos utilitarios |
| Zustand | Estado global |
| React Hook Form + Zod | Formularios y validación |
| jsPDF | Generación de PDF |
| Framer Motion | Animaciones |
| Lucide Icons | Iconografía |
| Papa Parse | Import/Export CSV |
| SheetJS (xlsx) | Import/Export Excel |
| Electron | App de escritorio |
| electron-builder | Empaquetado e instaladores |
