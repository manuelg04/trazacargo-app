# Checklist de piloto TrazaCargo

## Objetivo

Validar con una empresa real si TrazaCargo reduce la pérdida de documentos entre el viaje asignado y el viaje cerrado, sin agregar GPS, notificaciones ni integraciones externas.

## Alcance recomendado

- 1 empresa
- 1 dispatcher/admin
- 2 a 5 conductores
- 10 a 20 viajes de prueba

## Qué probar

- Crear conductor
- Generar código de acceso
- Activar cuenta con código
- Crear viaje
- Ofertar viaje
- Aceptar viaje
- Subir documentos de empresa
- Subir documentos del conductor
- Aprobar documentos
- Rechazar documentos con motivo
- Reenviar documentos rechazados
- Cerrar viaje cuando el checklist esté completo

## Métricas sugeridas

- Tiempo desde descargue hasta documentos completos
- Número de documentos rechazados
- Viajes cerrados con checklist completo
- Conductores activos
- Documentos faltantes por viaje

## Riesgos a observar

- Conductores no suben documentos
- Errores de permisos
- Archivos muy pesados
- Mala conectividad
- Confusión con códigos de acceso

## Qué no incluye el piloto

- GPS en vivo
- Push notifications
- RNDC
- Pagos
- Facturación
- OCR
- Offline
