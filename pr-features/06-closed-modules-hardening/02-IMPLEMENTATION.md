# Implementacion

- `usuarioService.guardarUsuarioPerfil()` ahora desempaqueta `response.data`.
- `cajasServices.getCajasPorUsuario()` y `setCajasAUsuarios()` ahora consumen payload estandar.
- `cajasServices.getCajasActivasYparametros()` adapta `selectMany` para no romper el flujo de `Vehiculos` mientras se termina la limpieza global del modulo.
- `VehiculosService.guardarCostoServicio()` ahora desempaqueta la respuesta estandar.
- `usuario-detalle`, `usuario-perfil` y `servicioscostos` dejaron de depender de `respuesta.error === 'ok'`.
