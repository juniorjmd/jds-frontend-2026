# Closed Modules Hardening

## Objetivo

Alinear en frontend los flujos que aun dependian de acciones raiz legacy dentro del grupo de modulos ya revisados.

## Alcance frontend

- `usuarioService`
- `cajasServices`
- `VehiculosService`
- consumidores directos:
  - `usuario-detalle.component.ts`
  - `usuario-perfil.component.ts`
  - `servicioscostos.component.ts`

## Regla

El frontend debe leer el envelope estandar del backend nuevo y no depender de `error == 'ok'` como contrato primario.
