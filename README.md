# TrazaCargo

TrazaCargo es una app Expo para empresas colombianas de transporte de carga, despachadores, administradores y conductores. La fase 4 mantiene el flujo móvil del conductor y la consola de empresa dentro de la misma app Expo, y agrega gestión documental real con Convex Storage.

## Stack

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- Convex
- Convex Auth
- Convex Storage
- npm

## Qué Incluye La Fase 4

- Consola de empresa para roles `DISPATCHER` y `ADMIN`
- Dashboard básico de viajes, conductores y ofertas
- Listado y creación de conductores
- Generación de códigos de acceso para conductores
- Listado de códigos de acceso de la empresa
- Creación de códigos `DISPATCHER` y `ADMIN` desde un perfil `ADMIN`
- Listado y creación de viajes
- Oferta de viajes a uno o varios conductores
- Detalle de viaje desde el lado empresa
- Subida real de documentos del viaje con Convex Storage
- Documentos de empresa para conductor: manifiesto, remesa, anticipo, orden de cargue y otro
- Documentos del conductor para empresa: ticket de descargue, cuenta de cobro, foto soporte, cumplido y otro
- Visualización y apertura de archivos reales desde el detalle del viaje
- Documentos demo históricos sin archivo cuando vienen de seed
- Aprobación y rechazo de documentos enviados por conductor
- Motivo visible de rechazo para el conductor
- Reenvío simple de documentos rechazados
- Visualización de documentos y eventos del viaje
- Cambio de estado cuando un conductor acepta una oferta
- Permisos backend por empresa, rol, conductor y viaje
- Flujo existente del conductor con Convex Auth

## Instalar

```bash
npm install
```

Si estás actualizando una instalación anterior, instala las dependencias de esta fase:

```bash
npx expo install expo-document-picker expo-image-picker expo-file-system
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

Para crear empresa demo, conductores, viajes, ofertas, documentos demo sin archivo, eventos y códigos:

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

## Probar Flujo Dispatcher Y Documentos De Empresa

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
13. En `Documentos para el conductor`, sube un manifiesto real.
14. Sube una remesa real.
15. Abre los archivos subidos desde el detalle del viaje.

## Probar Aceptación Y Documentos Desde Conductor

1. Cierra sesión desde la cuenta dispatcher/admin.
2. Crea una cuenta nueva para conductor.
3. Redime el código generado para ese conductor.
4. Confirma que el conductor ve la oferta en `Ofertas`.
5. Acepta el viaje.
6. Abre el detalle del viaje.
7. Confirma que aparecen los documentos subidos por dispatcher/admin.
8. Abre el manifiesto o la remesa.
9. Registra un evento operativo.
10. En `Enviar documento`, sube un ticket de descargue.
11. Sube una cuenta de cobro o foto soporte.
12. Confirma que tus documentos quedan en `En revisión`.

## Probar Revisión Documental

1. Cierra sesión como conductor.
2. Ingresa otra vez como dispatcher/admin.
3. Abre el detalle del viaje.
4. En `Documentos recibidos del conductor`, abre un archivo enviado por el conductor.
5. Aprueba uno de los documentos.
6. Rechaza otro documento con motivo.
7. Cierra sesión como dispatcher/admin.
8. Ingresa otra vez como conductor.
9. Abre el detalle del viaje.
10. Confirma que ves un documento aprobado, uno rechazado y el motivo de rechazo.
11. Sube nuevamente el tipo de documento rechazado.

## Seguridad Y Permisos De Esta Fase

- El frontend no envía `companyId`.
- El frontend no envía `driverId` para funciones protegidas del conductor.
- Las funciones de empresa derivan `companyId` desde el perfil autenticado.
- `DRIVER` no puede usar funciones de dispatcher/admin.
- `DRIVER` no puede subir documentos de empresa a conductor.
- `DRIVER` no puede aprobar ni rechazar documentos.
- `DISPATCHER` y `ADMIN` no pueden subir documentos como conductor.
- `DISPATCHER` y `ADMIN` solo operan datos de su empresa.
- Los viajes, conductores, vehículos, documentos, eventos y códigos se validan por empresa.
- Las URL de archivos se generan desde Convex Storage después de validar permisos.
- La base de datos guarda `storageId` y metadata, no URL permanentes.
- Los códigos se muestran en UI porque esta fase es MVP/dev. En producción deben endurecerse los flujos de emisión, visibilidad y expiración.

## No Incluye Esta Fase

- GPS
- Push notifications
- OCR o IA
- Escaneo avanzado de documentos
- Compresión avanzada de imágenes
- Firma digital
- Panel web con Next.js
- Monorepo
- Pagos
- Marketplace público
- Integración RNDC
- Tracking en vivo
- Facturación
- Borrado físico avanzado de archivos
- HTTP actions para serving avanzado
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

## Limitaciones Técnicas

- La apertura de archivos usa la URL temporal generada por Convex para el usuario autorizado.
- Los archivos reales no se borran físicamente de storage en esta fase.
- Los documentos demo sembrados no tienen `storageId`, por eso aparecen como documento demo sin archivo.
- La subida usa un archivo por acción, sin multiarchivo por lote.
- La cámara y el selector dependen de permisos y comportamiento de Expo Go en cada plataforma.

## Fase 5 Sugerida

Control operativo avanzado del cierre documental: requerimientos por tipo de documento, indicadores de pendientes por viaje, vencimientos, historial de reenvíos más completo y endurecimiento de seguridad para preparación productiva.
