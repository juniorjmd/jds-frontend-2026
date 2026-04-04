# Feature-05: Inventario Response Alignment - IMPLEMENTATION

## Cambios

- se agrego `src/app/interfaces/inventario-response.interface.ts`
- `src/app/services/producto.service.ts` ahora desempaqueta el envelope estándar del backend
- se centralizo `getErrorMessage()`
- se adaptaron en el servicio las respuestas de:
  - productos
  - producto por id o codigo
  - existencia por documento
  - precargue
  - creacion y actualizacion de producto
  - devolucion de linea
  - categorias
  - bodegas

## Nota

La compatibilidad con `error/numdata/data` sigue viva solo como adaptacion interna del servicio para no romper masivamente los componentes actuales del modulo.

## Ajuste de autenticacion local

En entorno Apache local se detecto que la cabecera `Authorization` no siempre llegaba al backend nuevo. Para estabilizar los endpoints autenticados del modulo se agrego tambien:

- `X-Session-Token`

El backend ahora acepta cualquiera de estas vias:

- `_llaveSession`
- `Authorization: Bearer ...`
- `X-Session-Token`
