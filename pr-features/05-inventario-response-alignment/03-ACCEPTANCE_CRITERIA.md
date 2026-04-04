# Feature-05: Inventario Response Alignment - ACCEPTANCE CRITERIA

## Criterios

- `ProductoService` consume `ok/data/error`
- los componentes del módulo siguen funcionando con la adaptacion del servicio
- existe prueba dedicada:

```bash
npx ng test jds_carwash --watch=false --browsers ChromeHeadless --include src/app/services/producto.service.spec.ts
```
