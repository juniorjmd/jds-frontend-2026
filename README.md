# JDS Frontend 2026

Frontend Angular del proyecto JDS Carwash POS e Inventario.

Este repositorio es el destino de los cambios del frontend alineados con el backend nuevo `jds-backend-app-2026`.

## Objetivo actual

El proyecto está en una transición controlada:

- el backend nuevo mantiene compatibilidad de entradas legacy
- las respuestas del backend deben converger a un contrato estándar
- el frontend debe dejar de depender de payloads legacy crudos
- la migración se está haciendo por módulo, con documentación y PRs separados por repo

## Contrato estándar esperado del backend

Hoy el backend nuevo responde exitosamente con un envelope estándar desde `public/index.php`:

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

Y en error:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje legible",
    "meta": null
  }
}
```

## Regla de frontend

Los componentes no deben depender directamente de patrones legacy como:

- `respuesta.error === 'ok'`
- `e.error.error`
- `respuesta.data.usuario` cuando el servicio puede normalizar la salida

La lectura del envelope debe centralizarse en los servicios.

## Modulo Auth: trabajo reciente

Se inició la alineación del módulo `Auth` entre backend y frontend.

### Cambios aplicados

- se agregaron tipos del envelope estándar:
  - `src/app/interfaces/api-response.interface.ts`
  - `src/app/interfaces/auth-response.interface.ts`
- se actualizó `src/app/services/login.services.ts` para:
  - desempaquetar `response.data`
  - tipar respuestas del módulo
  - centralizar lectura de errores con `getErrorMessage()`
- se adaptaron consumidores principales de `Auth`:
  - `src/app/modules/login/pages/login/login.component.ts`
  - `src/app/modules/login/pages/forgotPassWord/forgotPassWord.component.ts`
  - `src/app/components/home/home.component.ts`
  - `src/app/components/mi-usuario/mi-usuario.component.ts`
  - `src/app/modules/pos/pages/ventas/ventas.component.ts`
  - `src/app/modules/compras/pages/crear/crearCompra.component.ts`
  - `src/app/modules/compras/pages/editar/editarCompra.component.ts`
- se agregó prueba inicial de servicio:
  - `src/app/services/login.services.spec.ts`

### Resultado esperado

- `LoginService` se convierte en la capa de adaptación del módulo `Auth`
- los componentes consumen datos normalizados
- el frontend deja de acoplarse al contrato legacy crudo en este módulo

## Modulo Carwash: trabajo reciente

Se inició la alineación del módulo `Carwash` para las acciones de caja:

- `ABRIR_CAJA_ACTIVA`
- `CERRAR_CAJA_ACTIVA`
- `CERRAR_CAJA_PARCIAL`
- `OBTENER_RESUMEN_CAJA`

### Cambios aplicados

- se agregaron tipos del módulo:
  - `src/app/interfaces/carwash-response.interface.ts`
- se actualizó `src/app/services/Cajas.services.ts` para:
  - desempaquetar `response.data`
  - tipar `message`, `box` y `summary`
  - centralizar lectura de errores con `getErrorMessage()`
- se adaptaron consumidores directos de caja:
  - `src/app/modules/pos/pages/abrir-caja/abrir-caja.component.ts`
  - `src/app/modules/pos/pages/cerrar-caja/cerrar-caja.component.ts`
  - `src/app/modules/pos/modals/definir-base-caja/definir-base-caja.component.ts`
- se agregó prueba inicial de servicio:
  - `src/app/services/Cajas.services.spec.ts`

### Resultado esperado

- la UI de caja deja de depender de `error === 'ok'`, `numdata` y `datos[0].msg`
- el módulo consume el envelope estándar del backend nuevo
- la adaptación del contrato queda aislada en `Cajas.services`

## Modulo Admin: trabajo reciente

Se alineó `Admin` entre backend y frontend para cubrir recursos, permisos, creación de usuario y operaciones contables.

### Cambios aplicados

- se agregaron tipos del módulo:
  - `src/app/interfaces/admin-response.interface.ts`
- se actualizó `src/app/services/usuario.services.ts` para:
  - desempaquetar `GET_ALL_RECURSOS`, `GET_ALL_RECURSOS_BY_PERFIL`, `SET_PERFIL_RECURSO` y `CREAR_USUARIO`
  - centralizar errores con `getErrorMessage()`
- se actualizó `src/app/services/cntContables.service.ts` para:
  - desempaquetar `CREAR_OPERACION_MANUAL`, `CREAR_OPERACIONES_PREESTABLECIDAS` y `EJECUTAR_OPERACIONES_PREESTABLECIDAS`
  - centralizar errores con `getErrorMessage()`
- se adaptaron consumidores directos del módulo:
  - permisos
  - creación de usuario
  - operaciones contables
  - modales de traslados contables
- se agregaron pruebas:
  - `src/app/services/usuario.services.spec.ts`
  - `src/app/services/cntContables.service.spec.ts`

### Resultado esperado

- `Admin` deja de depender del contrato HTTP legacy
- los servicios se convierten en la capa de adaptación del módulo
- los componentes ya no leen `e.error.error` en los flujos principales revisados

## Modulo DatosIniciales: trabajo reciente

Se alineó `DatosIniciales` para la lectura de sucursal principal desde el contrato estándar del backend nuevo.

### Cambios aplicados

- se agregaron tipos del módulo:
  - `src/app/interfaces/datos-iniciales-response.interface.ts`
- se actualizó `src/app/services/DatosIniciales.services.ts` para:
  - desempaquetar `data.branches`
  - centralizar errores con `getErrorMessage()`
- se adaptaron consumidores directos del login:
  - `src/app/modules/login/pages/login/login.component.ts`
  - `src/app/modules/login/pages/forgotPassWord/forgotPassWord.component.ts`
- se agregó prueba:
  - `src/app/services/DatosIniciales.services.spec.ts`

## Modulo Inventario: trabajo reciente

Se alineó `Inventario` para que `ProductoService` consuma el contrato estándar del backend nuevo.

### Cambios aplicados

- se agregaron tipos del módulo:
  - `src/app/interfaces/inventario-response.interface.ts`
- se actualizó `src/app/services/producto.service.ts` para:
  - desempaquetar `ok/data/error`
  - centralizar errores con `getErrorMessage()`
  - adaptar productos, producto individual, existencias, precargue, categorias y bodegas
- se agregó prueba:
  - `src/app/services/producto.service.spec.ts`

### Resultado esperado

- el frontend deja de depender del payload HTTP legacy de `inventario`
- la compatibilidad transitoria con `error/numdata/data` queda encapsulada en `ProductoService`
- el backend puede mantener una sola forma de respuesta estándar
- en entorno Apache local las llamadas autenticadas del módulo también envían `X-Session-Token` además de `Authorization`

## Documentación por feature

Cada cambio importante debe quedar documentado en `pr-features`.

Ejemplo actual:

- `pr-features/01-auth-response-alignment/01-SPECS.md`
- `pr-features/01-auth-response-alignment/02-IMPLEMENTATION.md`
- `pr-features/01-auth-response-alignment/03-ACCEPTANCE_CRITERIA.md`
- `pr-features/02-carwash-response-alignment/01-SPECS.md`
- `pr-features/02-carwash-response-alignment/02-IMPLEMENTATION.md`
- `pr-features/02-carwash-response-alignment/03-ACCEPTANCE_CRITERIA.md`
- `pr-features/03-admin-response-alignment/01-SPECS.md`
- `pr-features/03-admin-response-alignment/02-IMPLEMENTATION.md`
- `pr-features/03-admin-response-alignment/03-ACCEPTANCE_CRITERIA.md`
- `pr-features/04-datosiniciales-response-alignment/01-SPECS.md`
- `pr-features/04-datosiniciales-response-alignment/02-IMPLEMENTATION.md`
- `pr-features/04-datosiniciales-response-alignment/03-ACCEPTANCE_CRITERIA.md`
- `pr-features/05-inventario-response-alignment/01-SPECS.md`
- `pr-features/05-inventario-response-alignment/02-IMPLEMENTATION.md`
- `pr-features/05-inventario-response-alignment/03-ACCEPTANCE_CRITERIA.md`

## Desarrollo local

### Instalar dependencias

```bash
npm install
```

### Levantar el proyecto

```bash
ng serve
```

### Build

```bash
ng build
```

### Tests

Suite completa:

```bash
ng test
```

Prueba puntual del módulo `Auth`:

```bash
ng test jds_carwash --watch=false --browsers ChromeHeadless --include src/app/services/login.services.spec.ts
```

Prueba puntual del módulo `Carwash`:

```bash
ng test jds_carwash --watch=false --browsers ChromeHeadless --include src/app/services/Cajas.services.spec.ts
```

Pruebas puntuales del módulo `Admin`:

```bash
ng test jds_carwash --watch=false --browsers ChromeHeadless --include src/app/services/usuario.services.spec.ts
ng test jds_carwash --watch=false --browsers ChromeHeadless --include src/app/services/cntContables.service.spec.ts
```

Prueba puntual del módulo `DatosIniciales`:

```bash
ng test jds_carwash --watch=false --browsers ChromeHeadless --include src/app/services/DatosIniciales.services.spec.ts
```

Prueba puntual del módulo `Inventario`:

```bash
ng test jds_carwash --watch=false --browsers ChromeHeadless --include src/app/services/producto.service.spec.ts
```

Nota:

- si falta `node_modules`, Angular/Karma no podrá correr
- en ese caso ejecutar primero `npm install`

## Relación con backend

Repositorio backend relacionado:

- `jds-backend-app-2026`

La regla de trabajo entre ambos repos es:

- backend y frontend se documentan por separado
- backend y frontend se envían en PRs separados
- cada revisión modular debe incluir:
  - contrato backend
  - consumidores frontend
  - archivos afectados
  - criterios de aceptación

## Estado de la migración

El frontend aún contiene bastante consumo legacy en otros módulos. La limpieza se está haciendo por orden de revisión modular, no por reemplazos masivos.

El siguiente enfoque recomendado es continuar módulo por módulo:

1. cerrar contrato backend
2. normalizar servicio frontend
3. adaptar consumidores directos
4. agregar pruebas
5. documentar el feature
