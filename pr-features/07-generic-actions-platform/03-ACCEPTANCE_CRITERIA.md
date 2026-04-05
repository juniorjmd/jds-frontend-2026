# Acceptance Criteria

- Los servicios migrados no reconstruyen wrappers legacy para acciones genericas cerradas.
- Las pantallas migradas funcionan leyendo el contrato estandar del backend.
- `ng build` pasa.
- Las specs de `usuarioService` y `cajasServices` pasan.
- La spec de `CntContablesService` pasa.
- El barrido sobre compras/ventas/notas credito/contadores ya no encuentra `numdata` ni `error == 'ok'` para el frente generico.
- Queda listo el PR del frente generico sin incluir `config.json` local ni borrados accidentales del directorio `backend/`.
