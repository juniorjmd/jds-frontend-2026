# Carwash Response Alignment

## Objetivo

Alinear el consumo frontend del modulo de caja con el contrato estandar del backend nuevo.

## Alcance

- `ABRIR_CAJA_ACTIVA`
- `CERRAR_CAJA_ACTIVA`
- `CERRAR_CAJA_PARCIAL`
- `OBTENER_RESUMEN_CAJA`

## Archivos afectados previstos

- `src/app/services/Cajas.services.ts`
- `src/app/modules/pos/pages/abrir-caja/abrir-caja.component.ts`
- `src/app/modules/pos/pages/cerrar-caja/cerrar-caja.component.ts`
- `src/app/modules/pos/modals/definir-base-caja/definir-base-caja.component.ts`
- `src/app/services/Cajas.services.spec.ts`

## Cambio esperado

- dejar de leer `error`, `numdata`, `data` y `datos[0].msg` como contrato principal
- leer `response.data.message`, `response.data.box` y `response.data.summary`
- centralizar lectura de errores del envelope estandar
