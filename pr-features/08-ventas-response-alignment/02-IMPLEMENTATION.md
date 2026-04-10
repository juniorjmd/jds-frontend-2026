# Implementacion

## Consumidores activos verificados

- `src/app/services/Cajas.services.ts`
- `src/app/services/producto.service.ts`
- `src/app/modules/pos/modals/pagos-venta/pagos-venta.component.ts`
- `src/app/modules/pos/modals/generar-cnt-por-cobrar/generar-cnt-por-cobrar.component.ts`
- `src/app/modules/pos/modals/ingresar-producto-venta/ingresar-producto-venta.component.ts`
- `src/app/modules/compras/modals/pagos-CPP/pagos-CPP.component.ts`
- `src/app/modules/compras/modals/generar-cnt-por-pagar/generar-cnt-por-pagar.component.ts`

## Contrato esperado por el frontend

- Exito:
  - `error === 'ok'`
  - `data.documentoFinal` cuando aplica
- Error:
  - `error.error.error` o mensaje legacy equivalente en raiz

## Decisión

En esta pasada no fue necesario reescribir consumidores frontend de `Ventas`.
El cierre del modulo se concentró en hacer que el backend nuevo respete el contrato que esas pantallas ya esperan.
