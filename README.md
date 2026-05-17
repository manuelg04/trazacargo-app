# TrazaCargo

TrazaCargo es una app Expo para empresas colombianas de transporte de carga, despachadores, administradores y conductores. La fase 6 estabiliza el flujo documental existente: checklist, requisitos, aprobación, rechazo, reenvío, cierre de viaje, filtros operativos, fechas límite e historial documental.

## Stack

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- Convex
- Convex Auth
- Convex Storage
- npm

## Qué Incluye La Fase 6

- Filtros documentales en viajes de dispatcher/admin: todos, pendientes, en revisión, rechazados, listos para cerrar y completos
- Filtros documentales en viajes del conductor: todos, pendientes, en revisión, rechazados y completos
- Fechas límite simples por requisito documental con `dueAt`
- Indicadores de requisitos vencidos y próximos a vencer
- Edición y limpieza de fecha límite desde el checklist del dispatcher/admin
- Historial documental por viaje
- Registro de envíos, aprobaciones, rechazos, reenvíos, archivo, exenciones, reactivaciones y cambios de fecha límite
- Resumen documental más claro cuando no hay requisitos
- Badge `Listo para cerrar` cuando la documentación obligatoria está completa y el viaje sigue abierto
- Confirmación antes de cerrar un viaje
- Mensaje claro cuando el cierre falla por documentos pendientes, en revisión o rechazados
- Pruebas automatizadas mínimas para permisos, requisitos, cierre, filtros, fechas límite e historial
- Limpieza demo extendida para `tripDocumentReviewEvents`

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

Para limpiar datos demo del dominio sin borrar internals delicados de Convex Auth:

```bash
npx convex run dev:clearDemoData
```

Para crear empresa demo, conductores, viajes, ofertas, requisitos documentales, documentos demo sin archivo, eventos y códigos:

```bash
npx convex run dev:seedDemoData
```

Códigos demo actuales:

- Conductor Carlos Rueda: `TC-CARLOS-2026`
- Conductor Julian Mendoza: `TC-JULIAN-2026`
- Despachador: `TC-DESPACHO-2026`
- Administrador: `TC-ADMIN-2026`

La pantalla temporal `/(dev)/seed` también permite crear o limpiar datos demo desde la app.

## Usar Filtros Documentales

1. Entra como dispatcher/admin.
2. Abre `Viajes`.
3. Usa `Estado del viaje` para filtrar por estado operativo.
4. Usa `Estado documental` para ver pendientes, en revisión, rechazados, listos para cerrar o completos.
5. Entra como conductor.
6. Abre `Mis viajes`.
7. Usa `Estado documental` para filtrar tus viajes por avance documental.

## Usar Fechas Límite

1. Entra como dispatcher/admin.
2. Abre el detalle de un viaje.
3. En `Documentos`, crea un requisito adicional con fecha límite o edita la fecha desde un requisito existente.
4. Confirma que el dispatcher/admin ve la fecha en el checklist.
5. Entra como conductor y abre el mismo viaje.
6. Confirma que el conductor ve la fecha límite.
7. Si la fecha ya pasó y el requisito no está cumplido ni eximido, se muestra `Vencido`.
8. Si vence dentro de 48 horas y el requisito no está cumplido ni eximido, se muestra `Vence pronto`.

## Revisar Historial Documental

1. Entra como conductor.
2. Sube un documento requerido.
3. Entra como dispatcher/admin.
4. Rechaza el documento con motivo.
5. Vuelve como conductor y reenvía el documento corregido.
6. Vuelve como dispatcher/admin y apruébalo.
7. En el detalle del viaje, abre `Documentos`.
8. Revisa `Historial documental` para ver envío, rechazo, reenvío y aprobación.

## Probar Cierre De Viaje

1. Entra como dispatcher/admin.
2. Abre un viaje con documentos obligatorios pendientes.
3. Presiona `Cerrar viaje`.
4. Confirma que aparece el bloqueo por documentos pendientes, en revisión o rechazados.
5. Aprueba o exime los requisitos obligatorios.
6. Confirma que el badge muestra `Listo para cerrar`.
7. Presiona `Cerrar viaje`.
8. Confirma el cierre.
9. Verifica que aparece `Viaje cerrado correctamente.` y que el estado queda `Cerrado`.

## Pruebas Automatizadas

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
- Bloqueo de cierre con documentos obligatorios pendientes
- Cierre permitido con requisitos cumplidos o eximidos
- Conductor sin permiso para cerrar viajes
- Conductor sin permiso para crear documentos de empresa
- Dispatcher/admin sin permiso para crear documentos del conductor
- Cambios de estado de requisitos al subir, aprobar y rechazar documentos
- Aislamiento entre empresas
- Filtros documentales de dispatcher/admin y conductor
- Actualización de fecha límite
- Historial documental

## Verificación Antes De Reportar

```bash
npm install
npx convex dev --once
npm run typecheck
npm run lint
npm run test:once
```

Para cambios visuales o de navegación, abre la app en Expo Go, simulador o web preview y recorre el flujo afectado.

## Seguridad Y Permisos

- El frontend no envía `companyId`.
- El frontend no envía `driverId` para funciones protegidas del conductor.
- Las funciones de empresa derivan `companyId` desde el perfil autenticado.
- `DRIVER` no puede usar funciones de dispatcher/admin.
- `DRIVER` no puede cerrar viajes.
- `DRIVER` no puede subir documentos de empresa a conductor.
- `DRIVER` no puede crear, eximir, reactivar ni editar requisitos.
- `DRIVER` no puede aprobar ni rechazar documentos.
- `DISPATCHER` y `ADMIN` no pueden subir documentos como conductor.
- `DISPATCHER` y `ADMIN` no pueden asociar documentos a requisitos de otra empresa o de otro viaje.
- `DISPATCHER` y `ADMIN` solo operan datos de su empresa.
- Cada `requirementId` se valida en backend contra empresa, viaje, dirección y tipo de documento.
- Las URL de archivos se generan desde Convex Storage después de validar permisos.

## No Incluye Esta Fase

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
- Producción hardening
- Migraciones o backfill de viajes antiguos

## Limitaciones Técnicas

- No se implementan migraciones ni backfill porque el proyecto sigue en desarrollo y no hay datos reales que preservar.
- Si hay datos demo viejos o incompatibles, usa `dev:clearDemoData` y luego `dev:seedDemoData`.
- La apertura de archivos usa la URL temporal generada por Convex para el usuario autorizado.
- Los archivos reales no se borran físicamente de storage en esta fase.
- Los documentos demo sembrados no tienen `storageId`, por eso aparecen como documento demo sin archivo.
- La subida usa un archivo por acción, sin multiarchivo por lote.
- La cámara y el selector dependen de permisos y comportamiento de Expo Go en cada plataforma.
- La validación de tipo de archivo usa metadata de la plataforma, no inspección binaria.

## Fase 7 Sugerida

Preparar operación real sin saltar a integraciones grandes: estados documentales más configurables por empresa, plantillas de requisitos por tipo de viaje, auditoría más completa para soporte, mejores datos de prueba por rol y endurecimiento gradual para despliegue piloto.
