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

## Qué incluye la fase 8

- Inputs monetarios con puntos de miles en creación de viajes
- Envío de valores monetarios al backend como números limpios
- Selector de fecha y hora de cargue compatible con Expo Go
- Fallback web para fecha y hora usando campos controlados
- Tipo de vehículo en creación, listado y detalle de viajes
- Tipo de vehículo obligatorio al crear y editar conductores
- Comparación visual entre vehículo requerido del viaje y vehículo del conductor
- Sección documental reorganizada en el detalle dispatcher/admin
- Sección documental reorganizada en el detalle conductor
- Cierre de viaje visible junto al resumen documental
- Subida libre movida a una acción secundaria para evitar duplicar el checklist
- Revisión de documentos del conductor dentro del requisito cuando aplica
- Diagnóstico documental en `docs/document-ux-audit.md`
- Pruebas unitarias para helpers de dinero y fecha/hora

## Qué incluye la fase push inicial

- Registro del Expo Push Token del usuario autenticado con perfil activo
- Guardado de tokens en Convex asociados al perfil actual
- Registro seguro en web como no-op
- Canal Android `viajes` para notificaciones
- Tokens duplicados evitados por perfil y token
- Tokens reasignados desactivando asociaciones anteriores del mismo token
- Logs en `notificationEvents` para eventos en cola, enviados, omitidos y fallidos
- Desactivación de tokens cuando Expo devuelve `DeviceNotRegistered`
- Receipts de Expo consultados después del envío cuando hay tickets
- Notificaciones para oferta nueva, viaje aceptado, documento subido, documento revisado y documentación completa
- Navegación segura al tocar notificaciones según tipo de evento y rol actual

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

## Probar inputs monetarios

1. Entra como dispatcher/admin.
2. Abre `Crear viaje`.
3. Escribe `3200000` en `Valor flete`.
4. Confirma que el campo muestra `3.200.000`.
5. Escribe `800000` en `Anticipo`.
6. Confirma que el campo muestra `800.000`.
7. Crea el viaje.
8. Abre el detalle y confirma que el flete aparece como `$ 3.200.000` y el anticipo como `$ 800.000`.

## Probar fecha y hora de cargue

1. Entra como dispatcher/admin.
2. Abre `Crear viaje`.
3. En iOS o Android, usa `Seleccionar fecha` y `Seleccionar hora`.
4. En web, usa los campos `YYYY-MM-DD` y `HH:mm`.
5. Crea el viaje.
6. Abre el detalle y confirma que la fecha de cargue muestra fecha y hora en español.

## Probar tipo de vehículo

1. Entra como dispatcher/admin.
2. Abre `Crear viaje`.
3. Escribe un `Tipo de vehículo`, por ejemplo `Tractomula`.
4. Crea el viaje y confirma que el detalle muestra el tipo requerido.
5. Abre `Conductores`.
6. Intenta crear un conductor sin `Tipo de vehículo` y confirma que no se guarda.
7. Crea un conductor con `Tipo de vehículo` y sin placa.
8. Abre un viaje y confirma que al ofertarlo puedes comparar el tipo requerido del viaje con el tipo de cada conductor.

## Probar nueva UX documental

1. Entra al detalle de un viaje como dispatcher/admin.
2. Abre `Documentos`.
3. Confirma que aparece `Documentos y cierre`.
4. Confirma que el resumen documental está arriba.
5. Confirma que `Cerrar viaje` aparece cerca del resumen y se bloquea si faltan documentos.
6. Revisa los grupos `Documentos para el conductor`, `Documentos recibidos del conductor`, `Otros documentos` e `Historial documental`.
7. Confirma que `Subir otro documento de empresa` está como acción secundaria.
8. Entra como conductor.
9. Abre el detalle del viaje y entra a `Documentos`.
10. Confirma que aparecen `Documentos de la empresa`, `Documentos que debo enviar`, `Otros documentos` e `Historial documental`.
11. Sube o reenvía documentos desde el requisito correspondiente.
12. Vuelve como dispatcher/admin y aprueba o rechaza desde el documento en revisión.

## Administrar conductores

1. Entra como dispatcher/admin.
2. Abre `Conductores`.
3. Crea un conductor con tipo de vehículo o edita nombre, teléfono, documento y tipo de vehículo.
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

## Probar push notifications

1. Ejecuta `npx convex dev`.
2. Ejecuta la app con una build interna o development build para Android. No uses Expo Go como prueba final de push remotas Android.
3. Inicia sesión como conductor y confirma que aparece un registro activo en `pushTokens`.
4. Inicia sesión como dispatcher/admin en otro usuario o dispositivo y confirma su token.
5. Desde dispatcher/admin, oferta un viaje al conductor.
6. Confirma que el conductor recibe `Nuevo viaje disponible`.
7. Desde conductor, acepta la oferta.
8. Confirma que dispatcher/admin recibe `Viaje aceptado`.
9. Desde conductor, sube un documento.
10. Confirma que dispatcher/admin recibe `Documento recibido`.
11. Desde dispatcher/admin, aprueba o rechaza el documento.
12. Confirma que el conductor recibe `Documento aprobado` o `Documento rechazado`.
13. Completa o exime todos los requisitos obligatorios.
14. Confirma que dispatcher/admin recibe `Documentación completa`.
15. Revisa `notificationEvents` en Convex para ver estados, tickets, errores y claves de evento.

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

- Formato de inputs monetarios
- Parseo de valores monetarios limpios
- Combinación y formato de fecha/hora de cargue
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
- Persistencia de tipo de vehículo en viajes
- Tipo de vehículo requerido al crear conductores
- Sincronización del tipo de vehículo con el vehículo asociado cuando existe
- Mensajes seguros de push notifications
- Claves de evento para evitar duplicados obvios
- Troceo de mensajes hacia Expo Push Service
- Sufijos de token para logs sin exponer el token completo

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
- Rediseño visual global
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
- El picker nativo de fecha/hora aplica a iOS y Android; web usa fallback controlado.
- No se cambia el flujo RNDC, pagos, OCR, GPS ni offline.
- La validación de tipo de archivo usa metadata de la plataforma, no inspección binaria.
- EAS queda configurado, pero los builds internos requieren login y configuración de cuenta.
- No hay migración ni backfill para tipo de vehículo. En desarrollo, limpia y vuelve a sembrar datos demo si necesitas registros consistentes.
- Push remotas Android deben validarse en build interna o development build, no solo en Expo Go.
- No hay preferencias de notificación por usuario en esta fase.
- No hay pantalla administrativa de logs; se revisan en Convex.

## Próxima fase sugerida

La siguiente fase recomendada es eventos operativos con ubicación opcional capturada por acción del conductor, sin tracking en vivo todavía.
