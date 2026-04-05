# Specs

- Este PR migra los consumidores frontend de la plataforma legacy compartida para que lean el contrato estandar del backend.
- Regla de este frente:
  - los servicios no deben reconstruir `error: 'ok'`, `numdata` ni `query` cuando la accion ya pertenece a `DATABASE_GENERIC_*` o a auxiliares compartidos cerrados.
- La migracion se hace por bloques de alto impacto:
  - permisos y usuarios
  - cajas y flujos de apertura/cierre
  - `selectMany` compartido usado por vehiculos
  - despues producto, contabilidad y consumidores restantes
