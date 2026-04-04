# Feature-03: Admin Response Alignment - SPECS

## Objetivo

Alinear el frontend del modulo `Admin` para consumir el envelope estandar del backend nuevo sin seguir leyendo respuestas HTTP legacy crudas.

## Alcance

- `usuarioService`
- `CntContablesService`
- componentes de permisos
- componentes de operaciones contables
- modales de traslados contables

## Regla de implementacion

Los componentes no deben leer directamente:

- `e.error.error`
- envelopes HTTP legacy

La normalizacion debe vivir en servicios.
