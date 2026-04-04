# Feature-05: Inventario Response Alignment - SPECS

## Objetivo

Alinear `ProductoService` al contrato estándar del backend nuevo para el módulo `Inventario`.

## Alcance

- leer `ok/data/error`
- adaptar respuestas de productos, precargue, categorias y bodegas
- mantener estable el consumo actual de componentes durante la transición

## Archivos principales

- `src/app/services/producto.service.ts`
- `src/app/interfaces/inventario-response.interface.ts`
- `src/app/services/producto.service.spec.ts`
