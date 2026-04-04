# Specs: Auth Response Alignment

## Objetivo

Alinear el consumo del modulo `Auth` del frontend con el contrato estandar del backend nuevo.

## Alcance

- `login`
- `validatekey`
- `me`
- `resetpassword`
- `setpassword`

## Regla principal

El frontend no debe depender de payloads legacy como:

- `error === 'ok'`
- `e.error.error`
- `datos.data.usuario` cuando el servicio puede normalizar esa lectura

## Archivos objetivo

- `src/app/services/login.services.ts`
- `src/app/modules/login/pages/login/login.component.ts`
- `src/app/modules/login/pages/forgotPassWord/forgotPassWord.component.ts`
- `src/app/components/home/home.component.ts`
- `src/app/components/mi-usuario/mi-usuario.component.ts`
- consumidores adicionales de `getUsuarioLogeado()`

## Resultado esperado

- servicios de `Auth` tipados
- lectura centralizada del envelope `ok/data/error`
- componentes del modulo sin dependencia del contrato legacy crudo
