# Implementacion

## Cambios realizados

- se agregaron tipos del modulo en `src/app/interfaces/datos-iniciales-response.interface.ts`
- `DatosIniciales.services.ts` ahora desempaqueta `response.data.branches`
- `DatosIniciales.services.ts` agrega `getErrorMessage()` para leer errores del envelope estandar
- `login.component.ts` y `forgotPassWord.component.ts` dejaron de serializar el error HTTP completo
- se agrego prueba de servicio en `src/app/services/DatosIniciales.services.spec.ts`

## Nota importante

El servicio sigue exponiendo `vwsucursal[]` para mantener estables los consumidores actuales, pero la respuesta HTTP del backend ya no se consume como arreglo crudo.
