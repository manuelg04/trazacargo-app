# Document UX Audit

## Pantallas inspeccionadas

- `app/(dispatcher)/trip/[tripId].tsx`
- `app/(driver)/trip/[tripId].tsx`
- `app/(dispatcher)/create-trip.tsx`
- Web preview en `http://localhost:8085`

## Componentes relacionados con documentos

- `src/features/documents/DocumentRequirementCard.tsx`
- `src/features/documents/DocumentRequirementList.tsx`
- `src/features/documents/DocumentRequirementForm.tsx`
- `src/features/documents/DocumentSummaryBadge.tsx`
- `src/features/documents/DocumentSummaryPanel.tsx`
- `src/features/documents/RequirementUploadPanel.tsx`
- `src/features/documents/DocumentCard.tsx`
- `src/features/documents/DocumentUploadForm.tsx`
- `src/features/documents/DocumentReviewPanel.tsx`
- `src/features/documents/DriverDocumentUploadPanel.tsx`
- `src/features/documents/CompanyDocumentUploadPanel.tsx`
- `src/features/documents/DocumentReviewHistory.tsx`
- `src/features/documents/documentLabels.ts`
- `src/features/documents/documentRequirementTypes.ts`
- `src/features/trips/TripDocumentList.tsx`

## Problemas detectados

- La pestaña documental del dispatcher empieza con checklist, pero el cierre aparece después de dos listas de requisitos y del formulario de crear requisito. Esto hace que la acción más importante del cierre quede enterrada.
- En dispatcher, la subida de documentos de empresa aparece como bloque separado después del cierre, aunque los requisitos de empresa ya permiten subir documentos asociados desde cada requisito.
- En conductor, los documentos aparecen dos veces: dentro del checklist cuando están asociados a un requisito y otra vez en listas separadas de archivos de empresa o archivos enviados.
- En conductor, la subida libre aparece como una acción principal después de las listas, aunque la acción recomendada es subir desde el requisito cuando existe checklist.
- El historial documental es visible como otro bloque completo al final, sin separación clara entre flujo principal y consulta secundaria.
- Las etiquetas actuales mezclan "Checklist documental", "Archivos de la empresa", "Mis archivos enviados" y "Archivos del conductor"; eso obliga al usuario a entender la relación entre requisitos y documentos reales.
- Las acciones secundarias del dispatcher, como crear requisito, eximir, reactivar o editar fecha límite, compiten visualmente con revisar, subir y cerrar.

## Componentes redundantes o solapados

- `DocumentRequirementCard` y `DocumentCard` pueden mostrar el mismo documento cuando `requirementId` existe.
- `CompanyDocumentUploadPanel` se solapa con la subida asociada a requisitos de empresa en `RequirementUploadPanel`.
- `DriverDocumentUploadPanel` se solapa con la subida asociada a requisitos del conductor en `RequirementUploadPanel`.
- `DocumentReviewPanel` revisa documentos de conductor en lista plana, mientras `DocumentRequirementCard` ya muestra el documento asociado al requisito. La revisión plana sigue siendo útil para aprobar o rechazar, pero debe enfocarse en documentos recibidos, no duplicar todo el flujo principal.
- `DocumentRequirementForm` es necesario, pero debe bajar de prioridad porque crear requisitos no es la acción principal del detalle.

## Propuesta de reorganización

### Dispatcher/admin

1. Renombrar la sección a "Documentos y cierre".
2. Mantener el resumen documental arriba.
3. Mover el cierre a un callout inmediatamente debajo del resumen.
4. Separar el contenido en grupos claros:
   - "Documentos para el conductor"
   - "Documentos recibidos del conductor"
   - "Otros documentos"
   - "Historial documental"
5. Mantener la carga asociada a requisitos como acción principal dentro del requisito.
6. Dejar la subida libre de empresa como acción secundaria para documentos sin requisito.
7. Dejar crear requisito como acción secundaria al final del flujo principal.

### Conductor

1. Renombrar la sección a "Documentos".
2. Mantener el resumen documental arriba.
3. Separar el contenido en grupos claros:
   - "Documentos de la empresa"
   - "Documentos que debo enviar"
   - "Otros documentos"
   - "Historial documental"
4. Mantener subir y reenviar desde el requisito como acción principal.
5. Dejar la subida libre como acción secundaria para documentos sin requisito.
6. Evitar listas principales que vuelvan a mostrar documentos ya asociados al checklist.

## Cambios aplicados

- Se creó una sección dispatcher/admin `Documentos y cierre`.
- El resumen documental quedó arriba de la sección documental.
- El cierre del viaje quedó junto al resumen, con mensaje de bloqueo cuando faltan documentos.
- Los documentos dispatcher/admin quedaron agrupados como `Documentos para el conductor`, `Documentos recibidos del conductor`, `Otros documentos` e `Historial documental`.
- Los documentos del conductor quedaron agrupados como `Documentos de la empresa`, `Documentos que debo enviar`, `Otros documentos` e `Historial documental`.
- La subida libre quedó como acción secundaria y colapsada dentro de `Otros documentos`.
- La creación de requisitos adicionales quedó como acción secundaria y colapsada.
- Aprobar y rechazar documentos en revisión ahora aparece dentro del documento asociado al requisito cuando aplica.
- Los documentos con `requirementId` ya no se muestran de nuevo en listas principales planas.
- Se ajustó microcopy para pendiente, revisión, rechazo, reenvío, documentos de empresa y cierre.
- Se verificó en web preview la creación de viaje con flete `3.200.000`, anticipo `800.000`, fecha/hora de cargue y la sección dispatcher `Documentos y cierre`.

## Cambios que NO se aplicaron

- No se rediseñó toda la app.
- No se cambió el sistema visual global.
- No se eliminaron carga, apertura, aprobación, rechazo, reenvío, historial, requisitos, filtros ni cierre.
- No se agregaron GPS, push notifications, RNDC, pagos, OCR ni offline.
- No se agregaron librerías de UI.
