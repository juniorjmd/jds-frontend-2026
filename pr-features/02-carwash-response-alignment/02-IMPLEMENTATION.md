# Implementacion

## Cambios realizados

- se agregaron tipos de respuesta para caja en `src/app/interfaces/carwash-response.interface.ts`
- `Cajas.services.ts` ahora desempaqueta `response.data` para las acciones de caja revisadas
- `Cajas.services.ts` agrega `getErrorMessage()` para leer el envelope estandar de errores
- `abrir-caja.component.ts` y `cerrar-caja.component.ts` dejaron de depender de `error == 'ok'`, `numdata` y arrays legacy
- `definir-base-caja.component.ts` ahora toma el mensaje desde `response.message`
- se agrego prueba unitaria de servicio en `src/app/services/Cajas.services.spec.ts`

## Nota importante

El backend de `Carwash` sigue con logica transitoria para caja. Esta alineacion cierra contrato y consumo frontend, pero no reemplaza todavia la implementacion legacy real de procedimientos.
