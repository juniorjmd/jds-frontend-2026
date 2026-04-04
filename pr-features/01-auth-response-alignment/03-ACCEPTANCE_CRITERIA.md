# Criterios De Aceptacion: Auth Response Alignment

- `LoginService` debe leer el envelope estandar del backend.
- `login.component.ts` no debe depender de `datos.data.usuario`.
- `forgotPassWord.component.ts` no debe depender de `datos.error === 'ok'`.
- `mi-usuario.component.ts` no debe depender de `val.error === 'ok'`.
- `home.component.ts`, `ventas.component.ts`, `crearCompra.component.ts` y `editarCompra.component.ts` deben leer `usuario` desde el servicio ya normalizado.
- los errores deben presentarse usando el mensaje del contrato estandar cuando exista.
