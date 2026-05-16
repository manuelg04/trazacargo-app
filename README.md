# TrazaCargo

TrazaCargo es una app Expo para empresas colombianas de transporte de carga, despachadores, administradores y conductores. La fase 3 mantiene el flujo móvil del conductor y agrega una consola básica de empresa dentro de la misma app Expo.

## Stack

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- Convex
- Convex Auth
- npm

## Qué Incluye La Fase 3

- Consola de empresa para roles `DISPATCHER` y `ADMIN`
- Dashboard básico de viajes, conductores y ofertas
- Listado y creación de conductores
- Generación de códigos de acceso para conductores
- Listado de códigos de acceso de la empresa
- Creación de códigos `DISPATCHER` y `ADMIN` desde un perfil `ADMIN`
- Listado y creación de viajes
- Oferta de viajes a uno o varios conductores
- Detalle de viaje desde el lado empresa
- Visualización de documentos demo y eventos del viaje
- Cambio de estado cuando un conductor acepta una oferta
- Permisos backend por empresa y rol
- Flujo existente del conductor con Convex Auth

## Instalar

```bash
npm install
```

## Variables Locales

Crea `.env.local` desde `.env.example` y usa los valores locales de Convex:

```bash
EXPO_PUBLIC_CONVEX_URL=https://scintillating-bulldog-845.convex.cloud
CONVEX_DEPLOYMENT=dev:scintillating-bulldog-845
```

Las llaves JWT de Convex Auth viven en el entorno del despliegue de Convex. No se agregan a `.env.example`.

## Correr El Proyecto

En una terminal:

```bash
npx convex dev
```

En otra terminal:

```bash
npm run start
```

También puedes correr:

```bash
npm run ios
npm run android
npm run web
```

## Datos Demo

Para crear empresa demo, conductores, viajes, ofertas, documentos, eventos y códigos:

```bash
npx convex run dev:seedDemoData
```

Códigos demo actuales:

- Conductor Carlos Rueda: `TC-CARLOS-2026`
- Conductor Julian Mendoza: `TC-JULIAN-2026`
- Despachador: `TC-DESPACHO-2026`
- Administrador: `TC-ADMIN-2026`

La pantalla temporal `/(dev)/seed` también permite crear o limpiar datos demo desde la app.

Para limpiar datos demo del dominio sin borrar usuarios internos de Convex Auth:

```bash
npx convex run dev:clearDemoData
```

## Probar Flujo Dispatcher

1. Ejecuta `npx convex dev`.
2. Ejecuta `npm run start`.
3. Ejecuta `npx convex run dev:seedDemoData`.
4. Crea una cuenta nueva con email y contraseña.
5. Redime `TC-DESPACHO-2026` o `TC-ADMIN-2026`.
6. Confirma que entras al dashboard de empresa.
7. Ve a `Conductores` y crea un conductor.
8. Genera un código de acceso para ese conductor.
9. Ve a `Viajes` y crea un viaje.
10. Abre el detalle del viaje.
11. Selecciona uno o varios conductores.
12. Presiona `Ofertar viaje`.

## Probar Aceptación Desde Conductor

1. Cierra sesión desde la cuenta dispatcher/admin.
2. Crea una cuenta nueva para conductor.
3. Redime el código generado para ese conductor.
4. Confirma que el conductor ve la oferta en `Ofertas`.
5. Acepta el viaje.
6. Abre el detalle del viaje y registra un evento operativo.
7. Cierra sesión.
8. Ingresa otra vez como dispatcher/admin.
9. Abre el detalle del viaje.
10. Confirma que el estado está aceptado, que aparece el conductor y que el timeline muestra eventos.

## Seguridad Y Permisos De Esta Fase

- El frontend no envía `companyId`.
- Las funciones de empresa derivan `companyId` desde el perfil autenticado.
- `DRIVER` no puede usar funciones de dispatcher/admin.
- `DISPATCHER` y `ADMIN` solo operan datos de su empresa.
- Los viajes, conductores, vehículos, documentos, eventos y códigos se validan por empresa.
- Los códigos se muestran en UI porque esta fase es MVP/dev. En producción deben endurecerse los flujos de emisión, visibilidad y expiración.

## No Incluye Esta Fase

- Subida real de archivos
- Convex Storage
- GPS
- Push notifications
- Panel web con Next.js
- Monorepo
- Pagos
- Marketplace público
- Integración RNDC
- Tracking en vivo
- Aprobación o rechazo documental real
- OCR o IA
- Facturación
- Seguridad final de producción

## Verificación

Antes de reportar cambios como terminados:

```bash
npm install
npx convex dev --once
npm run typecheck
npm run lint
```

Para cambios visuales o de navegación, abre la app en Expo Go, simulador o web preview y recorre el flujo afectado.

## Fase 4 Sugerida

Gestión documental real con Convex Storage: carga de documentos por conductor, metadatos por tipo documental, revisión por empresa y estados de aprobación.
