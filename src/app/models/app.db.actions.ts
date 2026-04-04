
// actions para servicio crud

 const actionDelete = 'DATABASE_GENERIC_CONTRUCT_DELETE';
 const actionUpdate = 'DATABASE_GENERIC_CONTRUCT_UPDATE';
 const actionAsignarCajas = 'qwer12356yhn7ujm8ik';
 const actionInsert = 'DATABASE_GENERIC_CONTRUCT_INSERT';
 const actionInsertSelect = 'DATABASE_GENERIC_CONTRUCT_INSERT_SELECT';
 const actionProcedure = 'DATABASE_GENERIC_CONTRUCT_PROCEDURE';
 const actionSelect = 'DATABASE_GENERIC_CONTRUCT_SELECT';
 const actionSelects = 'e06c06e7e4ef58bdb0kieujfñ541b3017fdd35473';
 const actionSelectCajasPorUsuario = 'mnbvcxzxcxcxasdfewq15616'; 



 const actionlogin = 'ef2e1d89937fba9f888516293ab1e19e7ed789a5';
 const actionSelectPorUsuario = 'DATABASE_GENERIC_CONTRUCT_SELECT_BY_USER_LOGGED';
 const actionTipDocOdoo = 'BUSCAR_ODOO_TIPO_ID' ;
 const actionEmpresasOdoo = 'BUSCAR_ODOO_TIPO_COMPANIA';

 const actionAbrirCaja = 'ABRIR_CAJA_ACTIVA';
 const actionCerarCaja = 'CERRAR_CAJA_ACTIVA';
 
 const datosInicialesSucursal = 'GET_SUCURSAL_PRINCIPAL_DATA'
 const validarLlave = '16770d92a6a82ee846f7ff23b4c8ad05b69fba03';
 const getUsuarioLogeado = '16770d92a6a82ee8464f678f5f223b4c8ad05b69fba03';
 const actionResumenCaja = 'OBTENER_RESUMEN_CAJA';
 const actionInsertPerfilUsuario = 'INSERT_PERFIL_USUARIO'; 


 const actionCrearDocumentos = 'CREAR_DOCUMENTO_POR_USUARIO' ; 
 const actionCrearDocumentosCompraBlank = 'CREAR_DOCUMENTO_COMPRA_POR_USUARIO' ; 
 const actionCrearDocumentoGasto = 'CREAR_DOCUMENTO_GASTO_POR_USUARIO' ; 
 const actionCerarDocumentos = 'CERRAR_DOCUMENTO_FACTURA' ; 
 const actionCerarDocumentosRemision = 'CERRAR_DOCUMENTO_REMISION' ; 
 const actionChangeDocumentos = 'CAMBIAR_DOCUMENTO_ACTIVO_POR_USUARIO' ; 
 const actionChangeCompraDocumentos = 'CAMBIAR_DOCUMENTO_COMPRA_ACTIVO_POR_USUARIO' ; 
 const actionCancelarDocumentos = 'CANCELAR_DOCUMENTO_POR_USUARIO' ; 
 const actionCambioCajaDocumento = 'CAMBIAR_DOCUMENTO_POR_CAJA';
 const actionBuscarProducto = 'BUSCAR_PRODUCTO';
 const actionCategoriasdoo = 'BUSCAR_ODOO_CATEGORIAS';
 const actionCategoriasPrddoo = 'BUSCAR_ODOO_CATEGORIAS_PRD'
 const actionAsignarPagosDoc = 'ASIGNAR_PAGOS_DOCUMENTOS';
 const actionAsignarPagosDocCredito = 'ASIGNAR_PAGOS_DOCUMENTOS_CREDITO';
 const actionAsignarPagosDocCompraCredito = 'ASIGNAR_PAGOS_DOCUMENTOS_COMPRA_CREDITO';




 const STOCK_MOVE = 'STOCK_MOVE';
 const action_insertar_producto_venta = 'insertar_producto_venta';
 const STOCK_MOVE_DEVOLUCION = 'STOCK_MOVE_DEVOLUCION';
 const actionBuscarMarcas = 'BUSCAR_MARCAS';
 const actionCerarCajaParcial = 'CERRAR_CAJA_PARCIAL';
 const actionCambiarDocADomicilio = 'CAMBIAR_DOCUMENTO_A_ENVIO'; 
 const actionInsertarDocumentoPorServicioIngresado = 'CREAR_DOCUMENTO_POR_SERVICIO_VEHICULO';
 const actionInsertCostoServicio = 'INGRESAR_COSTO_SERVICIO';
 const devolver_producto_venta = 'devolver_producto_venta';
 const INSERTAR_PAGO_EMPLEADO = 'INSERTAR_PAGO_EMPLEADO';
 const action_update_producto = 'ACTULIZAR_PRODUCTO';
 const action_insertar_new_producto = 'INSERTAR_NUEVO_PRODUCTO';
 const action_cancelar_inventario = 'BORRAR_DATOS_INGRESO_AUX_INVENTARIO';
 const action_ingreso_precargue = 'INGRESO_DATOS_DATOS_AUX_INVENTARIO';


 export const actions = {
  'action_generar_nueva_operacion':'CREAR_OPERACION_MANUAL',
  'action_update_producto':action_update_producto,
  'get_categorias' : 'GET_CATEGORIAS',
  'set_actividad_descuento' : 'SET_ACTIVIDAD_DESCUENTO',
  'get_all_products_by_name' : 'BUSCAR_TODOS_LOS_PRODUCTOS_POR_NOMBRE',
  'get_all_products_by_brand' : 'BUSCAR_TODOS_LOS_PRODUCTOS_POR_MARCA',
  'get_all_products_by_category' : 'BUSCAR_TODOS_LOS_PRODUCTOS_POR_CATEGORIA',
  'get_all_products' : 'BUSCAR_TODOS_LOS_PRODUCTOS',
  'action_get_documentos_usuario':'GET_DOCUMENTOS_USUARIO_ACTUAL',
  'action_get_documentos_caja':'GET_DOCUMENTOS_USUARIO_ACTUAL_CAJA_ACTIVA',
  'action_insertar_pagos':INSERTAR_PAGO_EMPLEADO,
  'action_ingreso_precargue' : action_ingreso_precargue,
  'action_cancelar_inventario':action_cancelar_inventario,
  'devolver_producto_venta' : devolver_producto_venta,
  'action_insertar_producto_venta' : action_insertar_producto_venta,
  'action_insertar_new_producto' : action_insertar_new_producto,
  'actionInsertCostoServicio' :actionInsertCostoServicio,
    'actionCambiarDocADomicilio' : actionCambiarDocADomicilio,
    'actionInsertarDocumentoPorServicioIngresado' : actionInsertarDocumentoPorServicioIngresado,
  'actionCancelarDocumentos' : actionCancelarDocumentos,
  'actionCerarCajaParcial' : actionCerarCajaParcial,
  'actionCambiarDocumentosACotizacion' : 'CREAR_DOCUMENTO_COTIZACION_POR_USUARIO',
   'actionAbrirCaja': actionAbrirCaja,
   'actionCrearDocumentos' : actionCrearDocumentos,
   'actionCrearDocumentosCompraBlank' : actionCrearDocumentosCompraBlank,
   'actionCrearNewGasto' : actionCrearDocumentoGasto,
   'actionCrearNewAbono' : 'ASIGNAR_ABONO_DOCUMENTOS_CREDITO',
   'actionCrearNewAbonoCredito' : 'ASIGNAR_ABONO_DOCUMENTOS_CREDITO_POR_PAGAR',
   'actionCrearNewDevolucion' : 'GENERAR_DOCUMENTOS_DEVOLUCION',
   'actionCrearNewNotaDebito' : 'GENERAR_DOCUMENTOS_NOTA_DEBITO',
   'actionResumenCaja': actionResumenCaja,
    'actionCerarCaja': actionCerarCaja, 
    'actionCerarDocumentosRemision':actionCerarDocumentosRemision,
    'actionCerarDocumentos':actionCerarDocumentos,
    'datosInicialesSucursal' : datosInicialesSucursal,
    'actionAsignarDocumentosPagos':actionAsignarPagosDoc , 
    'actionAsignarNewCredito':actionAsignarPagosDocCredito , 
    'actionAsignarNewCompraCredito':actionAsignarPagosDocCompraCredito , 
    'actionAsignarNewCompraCreditoEdicion':'ASIGNAR_PAGOS_DOCUMENTOS_COMPRA_CREDITO_EDICION',
    'actionBuscarMarcas' : actionBuscarMarcas,
    'actionAsignarCajas':actionAsignarCajas,
    'actionDelete' :actionDelete ,
    'actionUpdate' :actionUpdate ,
    'actionInsert' :actionInsert ,
    'actionInsertUsuario' :'CREAR_USUARIO',
    'actionInsertSelect' :actionInsertSelect,
    'actionProcedure' :actionProcedure,
    'actionSelect' :actionSelect ,
    'actionSelects' :actionSelects ,
    'getAllRecursosArr' :'GET_ALL_RECURSOS' ,
    'getAllRecursosArrByPerfil' :'GET_ALL_RECURSOS_BY_PERFIL' ,
    'setAllRecursosArr' :'SET_PERFIL_RECURSO' ,
    'resumenVentaCliente' :'GET_RESUMEN_VENTA_CLIENTE' ,
    'resumenVentaProducto' :'GET_RESUMEN_VENTA_PRODUCTOS' ,
    'resumenVentaCategoria' :'GET_RESUMEN_VENTA_CATEGORIAS' ,
    'resumenVentaVendedor' :'GET_RESUMEN_VENTA_VENDEDOR' ,
    'resumenVentaUsuarioCajero' :'GET_RESUMEN_VENTA_CAJERO' ,
    'resumenVentas' :'GET_RESUMEN_VENTAS' , 
    'resumenCuentas' :'GET_RESUMEN_MOVIMIENTOS_CUENTAS' , 
    'resumenCuentaporCobra' :'GET_RESUMEN_CUENTAS_POR_COBRAR' , 
    'resumenCuentaporPagar' :'GET_RESUMEN_CUENTAS_POR_PAGAR' , 
    'resumenCuentaporPagarProveedor' :'GET_RESUMEN_CUENTAS_POR_PAGAR_POR_PROVEEDOR' , 
    'resumenCuentaporCobrarCliente' :'GET_RESUMEN_CUENTAS_POR_COBRAR_POR_CLIENTE' , 
    'resumenDevolucion' :'GET_RESUMEN_DEVOLUCIONES' ,
    'MAESTROS_CLIENTES' :'GET_MAESTROS_CLIENTES',
    'actionBuscarPaisesOdoo' : 'BUSCAR_ODOO_PAIS',
    'actionBuscarStatesOdoo' : 'BUSCAR_ODOO_DEP',
    'actionBuscarCiudadOdoo' : 'BUSCAR_ODOO_CIUDAD',
    'actionTipDoc' :actionTipDocOdoo,
    'actionCategoriasOdoo' :actionCategoriasdoo,
    'actionCategoriasPrdOdoo' :actionCategoriasPrddoo,
    'actionEmpresasOdoo' :actionEmpresasOdoo,
    'actionTitulosOdoo' :'BUSCAR_ODOO_TITULO_PERSONA',
    'actionBuscarLocacionesExternas' : 'BUSCAR_STOCK_LOCATION',
    'actionInsertPerfilUsuario' : actionInsertPerfilUsuario,
    'actionSelectPorUsuario' :actionSelectPorUsuario,
    'actionlogin' :actionlogin ,
    'actionValidarKeylogin' :validarLlave,
    'actionResetearPass' :'RESETEAR_USUARIO_PASS',
    'actionGetUsuarioActual' :getUsuarioLogeado,
    'actionSetPass' :'HIJODELAGRANCHINGADA',
    'actionSelCajaXuser' :actionSelectCajasPorUsuario, 
    'actionCambioCajaDocumento' :actionCambioCajaDocumento, 
    'buscarProducto' :actionBuscarProducto    ,
    'buscarExistenciaProducto' :'BUSCAR_EXISTENCIA_PRODUCTO'    ,
    'buscarProductoCodBarras' :'BUSCAR_PRODUCTO_COD_BARRAS'    ,
    'actionChangeDocumentos' : actionChangeDocumentos , 
    'actionChangeCompraDocumentos' : actionChangeCompraDocumentos , 
    'actionStockMove' : STOCK_MOVE ,
    'actionStockMoveDevolucion' : STOCK_MOVE_DEVOLUCION ,





    'actionSelectClienteOdoo' : 'BUSCAR_ODOO_CLIENTES' ,
    'actionCrearClienteOdoo' : 'CREAR_CLIENTE_NUEVO_ODOO',
    'actionCrearClienteOdooPlusDoc' : 'CREAR_CLIENTE_NUEVO_ODOO_PLUS_DOC',
    'actionActualizarClienteOdoo' : 'ACTUALIZAR_CLIENTE_ODOO',
    'actionPasarClienteAControl' : 'CREAR_CLIENTE_ODOO_A_CONTROL',
    'crearTraslados':'CREAR_OPERACIONES_PREESTABLECIDAS',
    'ejecutarTraslados':'EJECUTAR_OPERACIONES_PREESTABLECIDAS'
    }
