# TrazaCargo

TrazaCargo es una app Expo para empresas colombianas de transporte de carga, despachadores, administradores y conductores.

Promesa del producto:

> Del viaje asignado al viaje cerrado, sin perder documentos en WhatsApp.

## Stack

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- Convex
- Convex Auth
- Convex Storage
- npm

## Qué incluye la fase 7

- Plantillas documentales por empresa
- Copia automática de plantillas activas al checklist de cada viaje nuevo
- Fallback a requisitos documentales base cuando una empresa no tiene plantillas activas
- Pantalla `Configuración` para ver la empresa y gestionar plantillas
- Creación, edición y desactivación de plantillas documentales
- Conductores editables desde la consola
- Desactivación y reactivación simple de conductores
- Bloqueo para no ofertar viajes nuevos a conductores desactivados
- Preparación básica para builds internas con EAS
- Checklist de piloto en `docs/pilot-checklist.md`
- Pruebas automatizadas para plantillas, aislamiento entre empresas y ofertas a conductores

## Instalar

```bash
npm install
```

## Variables locales

Crea `.env.local` desde `.env.example` y usa los valores locales de Convex:

```bash
EXPO_PUBLIC_CONVEX_URL=https://scintillating-bulldog-845.convex.cloud
CONVEX_DEPLOYMENT=dev:scintillating-bulldog-845
```

Las llaves JWT de Convex Auth viven en el entorno del despliegue de Convex. No se agregan a `.env.example`.

## Correr el proyecto

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

## Datos demo

Para limpiar datos demo del dominio sin borrar internals delicados de Convex Auth:

```bash
npx convex run dev:clearDemoData
```

Para crear empresa demo, conductores, viajes, ofertas, plantillas documentales, requisitos, documentos demo sin archivo, eventos y códigos:

```bash
npx convex run dev:seedDemoData
```

Códigos demo actuales:

- Conductor Carlos Rueda: `TC-CARLOS-2026`
- Conductor Julian Mendoza: `TC-JULIAN-2026`
- Despachador: `TC-DESPACHO-2026`
- Administrador: `TC-ADMIN-2026`

La pantalla temporal `/(dev)/seed` también permite crear o limpiar datos demo desde la app.

## Configurar plantillas documentales

1. Entra como dispatcher/admin.
2. Abre `Configuración`.
3. Revisa la información básica de la empresa.
4. Presiona `Crear plantillas base` si la empresa no tiene plantillas activas.
5. Presiona `Crear plantilla` para agregar una plantilla personalizada.
6. Define flujo, tipo de documento, nombre visible, si es obligatorio y horas límite por defecto.
7. Usa `Editar` para cambiar nombre visible, obligatoriedad u horas límite.
8. Usa `Desactivar` para sacar una plantilla de viajes futuros sin borrarla.

Las plantillas activas se copian automáticamente al checklist de cada viaje nuevo. Las plantillas desactivadas no se copian.

## Crear viajes usando plantillas

1. Entra como dispatcher/admin.
2. Asegura que la empresa tenga plantillas activas en `Configuración`.
3. Crea un viaje desde `Dashboard` o `Viajes`.
4. Abre el detalle del viaje.
5. Entra a `Documentos`.
6. Confirma que el checklist fue creado desde las plantillas activas.

Si una empresa no tiene plantillas activas, TrazaCargo usa los requisitos base:

- Manifiesto
- Remesa
- Anticipo
- Ticket de descargue
- Cuenta de cobro
- Cumplido

## Administrar conductores

1. Entra como dispatcher/admin.
2. Abre `Conductores`.
3. Crea un conductor o edita nombre, teléfono y documento.
4. Usa `Desactivar conductor` para impedir nuevas ofertas.
5. Usa `Reactivar conductor` para volver a dejarlo disponible.
6. Los viajes históricos del conductor siguen visibles.
7. Los conductores desactivados no aparecen como opción principal para ofertar viajes nuevos.

## Flujo documental principal

1. Crea un viaje.
2. Oferta el viaje a un conductor activo.
3. Entra como conductor y acepta la oferta.
4. Entra como dispatcher/admin y sube documentos requeridos de empresa.
5. Entra como conductor y sube documentos requeridos de cierre.
6. Entra como dispatcher/admin y aprueba o rechaza los documentos.
7. Si un documento fue rechazado, reenvíalo desde el conductor.
8. Cierra el viaje cuando los documentos obligatorios estén cumplidos o eximidos.

## Pruebas automatizadas

Para correr las pruebas una vez:

```bash
npm run test:once
```

Para correrlas en modo watch:

```bash
npm run test
```

Las pruebas cubren:

- Requisitos por defecto al crear viajes
- Plantillas documentales copiadas a viajes nuevos
- Fallback base cuando no hay plantillas activas
- Plantillas desactivadas no copiadas
- Aislamiento de plantillas entre empresas
- Bloqueo de cierre con documentos obligatorios pendientes
- Cierre permitido con requisitos cumplidos o eximidos
- Permisos de conductor y dispatcher/admin
- Cambios de estado de requisitos al subir, aprobar y rechazar documentos
- Filtros documentales de dispatcher/admin y conductor
- Actualización de fecha límite
- Historial documental
- Bloqueo de ofertas a conductores desactivados
- Ofertas permitidas a conductores activos

## Verificación antes de reportar

```bash
npm install
npx convex dev --once
npm run typecheck
npm run lint
npm run test:once
```

Para cambios visuales o de navegación, abre la app en Expo Go, simulador o web preview y recorre el flujo afectado.

## Preparación para builds internas

Expo Go sigue funcionando para desarrollo y validación rápida.

EAS Build queda preparado para generar un APK Android o builds internas cuando se quiera probar con usuarios reales. No se ejecutó ningún build como parte de esta fase.

Perfiles disponibles:

- `development`: build interno con development client
- `preview`: build interno, Android en APK
- `production`: perfil base para configurar más adelante

Comandos preparados:

```bash
npm run build:android:preview
npm run build:ios:preview
npm run build:all:preview
```

Para ejecutar builds necesitas una cuenta Expo/EAS. iOS puede requerir Apple Developer según el tipo de distribución.

## Seguridad y permisos

- El frontend no envía `companyId`.
- El frontend no envía `driverId` para funciones protegidas del conductor.
- Las funciones de empresa derivan `companyId` desde el perfil autenticado.
- `DRIVER` no puede usar funciones de dispatcher/admin.
- `DRIVER` no puede cerrar viajes.
- `DRIVER` no puede subir documentos de empresa a conductor.
- `DRIVER` no puede crear, eximir, reactivar ni editar requisitos.
- `DRIVER` no puede aprobar ni rechazar documentos.
- `DISPATCHER` y `ADMIN` no pueden subir documentos como conductor.
- `DISPATCHER` y `ADMIN` solo operan datos de su empresa.
- Cada `requirementId` se valida en backend contra empresa, viaje, dirección y tipo de documento.
- Las URL de archivos se generan desde Convex Storage después de validar permisos.

## No incluye esta fase

- GPS
- Tracking en vivo
- Push notifications
- OCR o IA
- Firma digital
- Facturación electrónica
- Integración RNDC
- Pagos
- Marketplace público
- Next.js
- Monorepo
- Chat
- Comentarios
- Analítica avanzada
- Soporte offline
- Producción hardening final
- App store submission
- CI/CD complejo
- Migraciones o backfill de viajes antiguos

## Limitaciones técnicas

- No se implementan migraciones ni backfill para viajes antiguos.
- Si hay datos demo viejos o incompatibles, usa `dev:clearDemoData` y luego `dev:seedDemoData`.
- Las plantillas solo afectan viajes nuevos.
- Las plantillas se desactivan, no se borran físicamente.
- La apertura de archivos usa la URL temporal generada por Convex para el usuario autorizado.
- Los archivos reales no se borran físicamente de storage en esta fase.
- Los documentos demo sembrados no tienen `storageId`, por eso aparecen como documento demo sin archivo.
- La subida usa un archivo por acción, sin multiarchivo por lote.
- La cámara y el selector dependen de permisos y comportamiento de Expo Go en cada plataforma.
- La validación de tipo de archivo usa metadata de la plataforma, no inspección binaria.
- EAS queda configurado, pero los builds internos requieren login y configuración de cuenta.

## Fase 8 sugerida

Preparar el piloto operativo con endurecimiento controlado: roles de soporte, auditoría de acciones críticas, guías de onboarding para la empresa piloto, manejo más claro de archivos pesados, revisión de errores reales del piloto y mejoras pequeñas basadas en uso observado.
