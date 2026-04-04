# Feature-04: DatosIniciales Response Alignment - SPECS

## Objetivo

Alinear el servicio `DatosInicialesService` para leer el envelope estandar del backend nuevo sin romper a los consumidores que esperan `vwsucursal[]`.

## Alcance

- `src/app/services/DatosIniciales.services.ts`
- `src/app/modules/login/pages/login/login.component.ts`
- `src/app/modules/login/pages/forgotPassWord/forgotPassWord.component.ts`
