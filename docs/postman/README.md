# Postman Ventas

Archivos:

- `ventas-module.postman_collection.json`
- `ventas-module.postman_environment.json`

Uso recomendado:

1. Importa ambos archivos en Postman.
2. Selecciona el environment `JDS Carwash Local`.
3. Llena `usuario`, `password` y `productoId`.
4. Ejecuta en orden:
   - `01. Login`
   - `02. Validar sesion`
   - `03. Documentos del usuario por caja activa`
   - `04. Crear documento en blanco`
   - `05. Cambiar documento activo`
   - `06. Insertar producto en venta`
   - `07. Asignar pagos a documento`
5. Luego usa según el caso:
   - `08. Cerrar documento factura`
   - `09. Cancelar documento`
   - `10. Cambiar documento a envio`
   - `11. Convertir documento en cotizacion`

Notas:

- La colección guarda automáticamente `token` y `documentoId` cuando la respuesta los trae.
- `productoId` debe ser un producto real existente en la bodega de la caja activa.
- Los valores de precio en la inserción de producto deben ser consistentes con el producto que pruebes.
- `09. Cancelar documento` está útil tanto para humo funcional como para depurar respuestas controladas del backend.
