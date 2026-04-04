# Implementacion: Auth Response Alignment

## Cambios realizados

- se agregaron interfaces para el envelope estandar del backend
- `login.services.ts` ahora desempaqueta `response.data`
- se agrego helper para obtener mensajes de error desde el formato estandar del backend
- se actualizaron consumidores directos de `Auth` para leer datos normalizados
- se agrego `src/app/services/login.services.spec.ts` para validar el contrato estandar y errores del modulo

## Contrato esperado

Backend:

- `ok`
- `data`
- `error`

Frontend:

- los componentes consumen objetos ya normalizados desde `LoginService`
- el detalle del envelope queda centralizado en el servicio
