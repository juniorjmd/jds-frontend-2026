 export const TABLA = {
  actividad_det_tmp :'inv_descuentos_actividad_detalle_tmp',
  actividad_det_producto_excluido:'inv_descuentos_actividad_detalle_excluidos',
  actividad_descuento:'inv_descuentos_actividad',
  categorias : 'inv_categorias',
   subCuentasContables : 'cnt_cuentas',
  empleados_pagos_anticipos : 'mov_empleado_pagos_anticipos',
  empleados_acumulados : 'mov_empleado_acumulados',
  presentacionProducto : 'inv_mst_producto_presentacion',
   PARAMETROS:'parametros',
   empleados:'mst_per_empleados',
   personas:'mst_per_clientes',
   mst_mov_credito:'mst_mov_credito',
   vehiculos_servicios_costos:'inv_mst_servicios_costos',
   TiposServicios : 'inv_mst_tipos_servicios',// vehiculos_servicios_tipos
   vehiculos_servicios :'inv_mst_servicios',
    SUCURSAL : 'vw_estudiante',
    ciudades : "mst_per_clientes_ciudades" ,
    departamento: "mst_per_clientes_deptos" ,
    pais : "mst_per_clientes_paises",
    caja : "cajas",
    usuarios:"usuarios",
    perfiles:"perfiles",
    establecimiento:"establecimiento",
    medios:"establecimiento_medios_de_pago",
    documentos:"documentos",
    documentosListado:"documentos_listado_productos",
    tipoEstablecimiento:"tipo_establecimiento",
    contador:"contadores" , 
    tiposVehiculos:"inv_mst_tipos_vehiculos",
    inv_bodegas:"inv_bodegas",
    inv_descuentos:"inv_descuentos",
    inventario:"inv_inventario",
    inv_inventario_ingreso_aplicado : 'inv_inventario_ingreso_aplicado' ,
    inv_inventario_ingreso_auxiliar:'inv_inventario_ingreso_auxiliar',
    transacciones_tmp:'cnt_transacciones_tmp', 
    operaPrestablecidas:'cnt_operacion_prestablecidas', 
    operaPrestablecidasCuentas:'cnt_operacion_prestablecidas_cuentas'

 }

 export const PROCEDURE = { 
   insertaContador : 'sp_inserta_nuevo_contador',
   getProductoConExistencia : 'getProductoCompletoExistencia',
   sp_cerrar_inventario : 'sp_cerrar_inventario'

}
