# Implementacion

## Cambios realizados

- se agregaron tipos del modulo en `src/app/interfaces/admin-response.interface.ts`
- `usuario.services.ts` ahora desempaqueta `response.data` para:
  - `GET_ALL_RECURSOS`
  - `GET_ALL_RECURSOS_BY_PERFIL`
  - `SET_PERFIL_RECURSO`
  - `CREAR_USUARIO`
- `cntContables.service.ts` ahora desempaqueta `response.data` para:
  - `CREAR_OPERACION_MANUAL`
  - `CREAR_OPERACIONES_PREESTABLECIDAS`
  - `EJECUTAR_OPERACIONES_PREESTABLECIDAS`
- ambos servicios agregan `getErrorMessage()` para leer errores del envelope estandar
- se actualizaron consumidores directos de `Admin` para dejar de depender de `e.error.error`
- se agregaron pruebas:
  - `src/app/services/usuario.services.spec.ts`
  - `src/app/services/cntContables.service.spec.ts`

## Nota importante

La adaptacion del frontend conserva temporalmente respuestas de servicio con forma legacy interna como `error`, `data` y `numdata` para reducir regresiones en componentes existentes. El punto importante es que esa adaptacion ya no depende del contrato HTTP legacy del backend.
