# Implementacion

- `usuarioService.guardarUsuarioPerfil()` ahora desempaqueta `response.data`.
- `cajasServices.getCajasPorUsuario()` y `setCajasAUsuarios()` ahora consumen payload estandar.
- `cajasServices.getCajasActivasYparametros()` adapta `selectMany` para no romper el flujo de `Vehiculos` mientras se termina la limpieza global del modulo.
- `VehiculosService.guardarCostoServicio()` ahora desempaqueta la respuesta estandar.
- `usuario-detalle`, `usuario-perfil` y `servicioscostos` dejaron de depender de `respuesta.error === 'ok'`.
- `DocumentoService.getDocumentosCaja()` ahora consume el contrato estandar de backend:
  - `ok`
  - `data.records`
  - `data.count`
  - `error`
- `ventas.component`, `crearCompra.component` y `editarCompra.component` dejaron de evaluar `respuesta.error === 'ok'` en los flujos de crear/cambiar documento.
- se agrego `documento.service.spec.ts` para cubrir el contrato nuevo del modulo `documentos`.
