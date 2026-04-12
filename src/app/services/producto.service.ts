import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { loading } from 'src/app/models/app.loading';
import { DocumentoListado } from '../interfaces/documento.interface';
import { OdooPrd } from '../interfaces/odoo-prd';
import { Usuarios } from '../interfaces/usuario.interface';
import { actions } from '../models/app.db.actions';
import { PROCEDURE, TABLA } from '../models/app.db.tables';
import { httpOptions, url } from '../models/app.db.url';
import { vistas } from '../models/app.db.view';
import { AuxIngresoInventarioModule } from '../models/aux-ingreso-inventario/aux-ingreso-inventario.module';
import { DocumentosModel } from '../models/ventas/documento.model';
import { ProductoModel } from '../models/producto/producto.module';
import { UsuarioModel } from '../models/usuario.model';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { DocumentoCierreRequest, DocumentoRequest, ProductoExitenciaRequest, ProductoRequest } from '../interfaces/producto-request';
import { PrdPreciosModule } from '../models/prd-precios/prd-precios.module';
import { CategoriasModel } from '../models/categorias.model';
import { MarcasModel } from '../models/marcas/marcas.module';
import { DescuentoModule } from '../models/descuento/descuento.model';
import { BodegasModule } from '../models/bodegas/bodegas.module';
import { CustomConsole } from '../models/CustomConsole';
import { ConfigService } from './config.service';
import { InventarioCategoriesResponse, InventarioExistenceResponse, InventarioPrechartResponse, InventarioProductMutationResponse, InventarioProductResponse, InventarioProductsResponse, InventarioReturnResponse, InventarioWarehousesResponse } from '../interfaces/inventario-response.interface';
import { ApiResponse } from '../interfaces/api-response.interface';
import { GenericMultiRecordsPayload, GenericMutationPayload, GenericRecordsPayload } from '../interfaces/generic-response.interface';
import { PresentacionPrdModel } from '../models/presentacionPrdModel';
import { PrdExistenciasModule } from '../models/prd-existencias/prd-existencias.module';
import { CategoriasVendidasModel } from '../models/categorias.model';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {
 
private http = inject(HttpClient); 
private loading = inject(loading);  
private readonly baseUrl:string = this.configService.url.action ;
private readonly   urlInventario =  `${this.baseUrl}inventario/`;
private readonly   urlVentas =  `${this.baseUrl}ventas/`;

private categoriasSource = new BehaviorSubject<CategoriasModel[]|null>(null);
currentCategorias = this.categoriasSource.asObservable();
private marcasSource = new BehaviorSubject<MarcasModel[]|null>(null);
currentMarcas = this.marcasSource.asObservable();

  // private _configService = inject(configService); 
constructor(  private configService:ConfigService ){ 
    CustomConsole.log('servicios productos inicializado');  
}

getErrorMessage(error: any): string {
  const rawApiError = error?.error?.error;
  const apiMessage = typeof rawApiError === 'string' ? rawApiError : rawApiError?.message;
  const fallbackMessage = error?.error?.message;
  const textMessage = error?.message;

  return apiMessage || fallbackMessage || textMessage || 'Error inesperado';
}

private normalizeWrappedRecords<T>(response: ApiResponse<GenericRecordsPayload<T>>): ApiResponse<GenericRecordsPayload<T>> {
  return {
    ...response,
    data: {
      ...response.data,
      records: (response.data.records ?? []).map((item: any) => item?.obj ?? item),
      count: response.data.count ?? 0
    }
  };
}



asignarMarcas(marcas:MarcasModel[]){
    this.marcasSource.next( marcas) 
}

asignarCategorias(categoria:CategoriasModel[]){
    this.categoriasSource.next( categoria) 
}
deleteDescuento(desc:DescuentoModule){ 
    let where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : desc.id }];
    let datos = {"action": actions.actionDelete ,
    "_tabla" : TABLA.inv_descuentos,
    "_where" : where  
   };
    return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
} 
setDescuento(desc:DescuentoModule){
  let datos:any  = {"action": actions.actionInsert ,
      "_tabla" : TABLA.inv_descuentos,
     };

     let idaux = ( typeof(desc.id) == 'string' )? parseInt(desc.id):desc.id
     desc.usuario_creacion = 'USUARIO_LOGUEADO';
     desc.name_usuario_creacion = undefined;
     desc.name_usuario_edicion = undefined; 
     if (idaux != undefined &&  idaux > 0 ){
      datos = {
        ...datos,
        _where: [{ columna: "id", tipocomp: "=", dato: idaux }]
      }; 
      desc.id =  undefined;
       desc.usuario_creacion =   undefined;
       desc.usuario_edicion = 'USUARIO_LOGUEADO';
      
     datos.action=actions.actionUpdate                 
     } 
     desc.NombreTipo =  undefined;
     desc.nombre_estado =  undefined;
      desc.obj  =  undefined ; 
     datos = {
      ...datos, 
       _arraydatos  : desc 
    }; 

     CustomConsole.log(datos);
     
      return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
      

       
}

getDescuentos():Observable<ApiResponse<GenericRecordsPayload<DescuentoModule>>>{
  let datos:any  = {"action": actions.actionSelect ,
      "_tabla" : vistas.inv_descuentos,
     };
 
     CustomConsole.log(datos);
     
      return this.http.post<ApiResponse<GenericRecordsPayload<DescuentoModule>>>(this.configService.url.action , datos, httpOptions()) ;
       
}
getInventariosAplicados():Observable<ApiResponse<GenericRecordsPayload<any>>>{
  let datos:any  = {"action": actions.actionSelect ,
      "_tabla" : TABLA.inventario,
     };
 
     CustomConsole.log(datos);
     return this.http.post<ApiResponse<GenericRecordsPayload<any>>>(this.configService.url.action , datos, httpOptions()) ;
       
}
getInventariosAplicadosDetalle( idInventario:any ):Observable<ApiResponse<GenericRecordsPayload<any>>>{
  
  let _where = [{"columna" : "idInventario" , "tipocomp" : '=' , "dato" : idInventario   } ] 
  let datos:any  = {"action": actions.actionSelect ,
      "_tabla" : vistas.inv_inventario_ingreso_aplicado,_where
     };
 
     CustomConsole.log(datos);
     return this.http.post<ApiResponse<GenericRecordsPayload<any>>>(this.configService.url.action , datos, httpOptions()) ;
       
}
setCategorias(CATEGORIA:CategoriasModel){
  CATEGORIA.nombre_estado = undefined;
  let datos  = {"action": actions.actionInsert ,
      "_tabla" : TABLA.categorias,
      "_arraydatos" : CATEGORIA
     };
     
 CustomConsole.log('crear nueva categoria' , this.configService.url.action , datos, httpOptions());
 
  return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ; 
}


// #region Métodos con selects genericos en el codigo

getProductosExistencia(codPrd:ProductoModel):Observable<ApiResponse<GenericRecordsPayload<PrdExistenciasModule>>>{
  let where = [{"columna" : "id_producto" , "tipocomp" : '=' , "dato" : codPrd.id    } ]
  let datos = {"action": actions.actionSelect , "_tabla" : vistas.prd_inventario,  "_where" : where  
              };
  CustomConsole.log('servicios getProductosExistencia' ,this.baseUrl, datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<PrdExistenciasModule>>>(this.baseUrl, datos, httpOptions()) ;
} 

get_producto_simple(): Observable<ApiResponse<GenericRecordsPayload<ProductoModel>>>{ 
  let datos = {"action": actions.actionSelect , "_tabla" : vistas.inv_mst_producto ,  _limit: 300
              };
  CustomConsole.log('servicios getProductosExistencia' ,this.baseUrl, datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<ProductoModel>>>(this.baseUrl, datos, httpOptions()) ;
}


get_producto_simple_by_marca(marca:any): Observable<ApiResponse<GenericRecordsPayload<ProductoModel>>>{  
  let _where =  [{"columna" : "idMarca" , "tipocomp" : '=' , "dato" : marca   } ]
  let datos = {"action": actions.actionSelect , "_tabla" : vistas.inv_mst_producto ,  _limit: 300 , _where
              };
  CustomConsole.log('servicios getProductosExistencia' ,this.baseUrl, datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<ProductoModel>>>(this.baseUrl, datos, httpOptions()) ;
}


get_producto_simple_by_nombre(name:any): Observable<ApiResponse<GenericRecordsPayload<ProductoModel>>>{  
  let _where =  [  {columna : 'nombre' , tipocomp : 'like' , dato : name , 'relacion' : 'or'},
    {columna : 'nombre2' , tipocomp : 'like' , dato : name , 'relacion' : 'or'},
    {columna : 'nombre3' , tipocomp : 'like' , dato : name, 'relacion' : 'or'} ,  
    {columna : 'upper(cod_prd_externo)' , tipocomp : '=f' , dato : `upper('${name}')` } 
     ]
  let datos = {"action": actions.actionSelect , "_tabla" : vistas.inv_mst_producto ,  _limit: 300 , _where
              };
  CustomConsole.log('servicios getProductosExistencia' ,this.baseUrl, datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<ProductoModel>>>(this.baseUrl, datos, httpOptions()) ;
} 
get_producto_simple_by_categoria(categoria:any): Observable<ApiResponse<GenericRecordsPayload<ProductoModel>>>{ 
  let _where =  [{"columna" : "idCategoria" , "tipocomp" : '=' , "dato" : categoria   } ]
  let datos = {"action": actions.actionSelect , "_tabla" : vistas.inv_mst_producto ,  _limit: 300 , _where
              };
  CustomConsole.log('servicios getProductosExistencia' ,this.baseUrl, datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<ProductoModel>>>(this.baseUrl, datos, httpOptions()) ;
}

getTiposDeDocumentos(): Observable<ApiResponse<GenericRecordsPayload<any>>>{
  let datos = {"action": actions.actionSelect ,
               "_tabla" : vistas.tiposDeDocumentos
              };
  CustomConsole.log('servicios de usuarios activo - getCategorias' ,this.baseUrl, datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<any>>>(this.baseUrl, datos, httpOptions()) ;
}  
getbodegas(){
  let datos = {"action": 'GET_BODEGAS'};
  CustomConsole.log('servicios de usuarios activo - getbodegas' ,this.baseUrl, datos, httpOptions());
  return this.http.post<InventarioWarehousesResponse>(this.urlInventario, datos, httpOptions());
} 

setBodega(bodega: BodegasModule): Observable<ApiResponse<GenericMutationPayload>> {
  const payload: any = {
    nombre: (bodega.nombre || '').trim(),
    descripcion: (bodega.descripcion || '').trim(),
    tipo: Number(bodega.tipo || 1),
    estado: Number(bodega.estado || 1)
  };

  let datos: any = {
    action: actions.actionInsert,
    _tabla: TABLA.inv_bodegas,
    _arraydatos: {
      ...payload,
      usuario_creacion: 'USUARIO_LOGUEADO'
    }
  };

  const id = Number(bodega.id || 0);
  if (id > 0) {
    datos = {
      action: actions.actionUpdate,
      _tabla: TABLA.inv_bodegas,
      _where: [{ columna: 'id', tipocomp: '=', dato: id }],
      _arraydatos: {
        ...payload,
        usuario_edicion: 'USUARIO_LOGUEADO'
      }
    };
  }

  return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action, datos, httpOptions());
}

getCategorias():Observable<InventarioCategoriesResponse>{
  let datos = {"action": actions.get_categorias};
  CustomConsole.log('servicios de usuarios activo - getCategorias' ,this.baseUrl, datos, httpOptions());
  return this.http.post<InventarioCategoriesResponse>(this.urlInventario, datos, httpOptions());
} 
getCategoriasVendidas():Observable<ApiResponse<GenericRecordsPayload<CategoriasVendidasModel>>>{
  let datos = {"action": actions.actionSelect ,
               "_tabla" : vistas.categoriasVendidas,
              "_columnas": ['obj'],
              "_obj": ['obj'],
              };
  CustomConsole.log('servicios de usuarios activo - getCategorias' ,this.baseUrl, datos, httpOptions());
  return this.http
    .post<ApiResponse<GenericRecordsPayload<CategoriasVendidasModel>>>(this.baseUrl, datos, httpOptions())
    .pipe(map((response) => this.normalizeWrappedRecords(response))) ;
} 
getMarcas():Observable<ApiResponse<GenericRecordsPayload<MarcasModel>>>{
  let datos = {"action": actions.actionSelect ,
               "_tabla" : vistas.marcas 
              };
  CustomConsole.log('servicios de usuarios activo - getCategorias' ,this.baseUrl, datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<MarcasModel>>>(this.baseUrl, datos, httpOptions()) ;
} 

getProductosCodBarras(codPrd:any):Observable<ApiResponse<GenericRecordsPayload<ProductoModel>>>{
  let where = [{"columna" : "barcode" , "tipocomp" : '=' , "dato" : codPrd , "relacion" : 'or'  },
  {"columna" : "id" , "tipocomp" : '=' , "dato" : codPrd , "relacion" : 'or' },
  {"columna" : "idProducto" , "tipocomp" : '=' , "dato" : codPrd , "relacion" : 'or' }  
]
  let datos = {"action": actions.actionSelect , "_tabla" : vistas.productos,  "_where" : where  
              };
  CustomConsole.log('servicios getProductosCodBarrasVCnt' ,this.baseUrl, datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<ProductoModel>>>(this.baseUrl, datos, httpOptions()) ;
} 

getProductosById(codPrd:any):Observable<ApiResponse<GenericRecordsPayload<ProductoModel>>>{
  let _where = [ {"columna" : "id" , "tipocomp" : '=' , "dato" : codPrd   }]
  let datos = {"action": actions.actionSelect , "_tabla" : vistas.productos_con_existencia,  _where   , 
    "_columnas": ['obj'],
    "_obj": ['obj'],
     };
  CustomConsole.log('servicios getProductosById' ,this.baseUrl, datos, httpOptions());
  return this.http
    .post<ApiResponse<GenericRecordsPayload<ProductoModel>>>(this.baseUrl, datos, httpOptions())
    .pipe(map((response) => this.normalizeWrappedRecords(response))) ;
} 


getPresentacioProducto():Observable<ApiResponse<GenericRecordsPayload<PresentacionPrdModel>>>{
  let datos = {"action": actions.actionSelect , "_tabla" : TABLA.presentacionProducto  }
  CustomConsole.log('getPresentacioProducto  ' ,this.configService.url.action , datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<PresentacionPrdModel>>>(this.configService.url.action , datos, httpOptions()) ;
}
// #endregion

// #region Métodos con multi-selects genericos en el codigo 
getCategorias_marcas():Observable<ApiResponse<GenericMultiRecordsPayload<any>>>{
  let datos = {"action": actions.actionSelects ,
               "_tablas" : [vistas.categorias , vistas.marcas]
              };
  CustomConsole.log('servicios de productos activo - getCategorias_marcas' ,this.baseUrl, datos, httpOptions());
  return this.http.post<ApiResponse<GenericMultiRecordsPayload<any>>>(this.baseUrl, datos, httpOptions()) ;
} 
// #endregion
 
// #region Métodos con procedimientos genericos en el codigo 

CERRAR_INVENTARIO(bodega:number , nombre:string , desc:string, tipo:number):Observable<ApiResponse<GenericMutationPayload>>{
  let arraydatos =  {  
     "USUARIO_LOGUEADO" : '0',
     "_BODEGA" :bodega  ,
     "_NOMBRE" : nombre,
     "_DESCRIPCION" : desc,
     "_tipo_inventario" : tipo
    
 }
   let  datos = {"action": actions.actionProcedure ,
   "_procedure" : PROCEDURE.sp_cerrar_inventario,
   "_arraydatos" : arraydatos
  };
   CustomConsole.log('servicios CERRAR_INVENTARIO' ,this.baseUrl, datos, httpOptions());
   return this.http.post<ApiResponse<GenericMutationPayload>>(this.baseUrl, datos, httpOptions()) ;
 } 

/*buscar producto por codigo de barra validando la existencia */

getProductosCodBarrasVCnt(codPrd:string , caja:number):Observable<ApiResponse<GenericRecordsPayload<ProductoModel>>>{
 
  let arraydatos =  {      
    "_id_producto" : codPrd  ,
    "_id_caja" : caja,
    '_obj' : ['obj']
}
  let  datos = {"action": actions.actionProcedure ,
    "_procedure" : PROCEDURE.getProductoConExistencia,
    "_arraydatos" : arraydatos
   };

  CustomConsole.log('servicios getProductosCodBarrasVCnt' ,this.baseUrl, datos, httpOptions());
  return this.http
    .post<ApiResponse<GenericRecordsPayload<ProductoModel>>>(this.baseUrl, datos, httpOptions())
    .pipe(map((response) => this.normalizeWrappedRecords(response))) ;
} 
 
// #endregion

//#region Metodos con selects genericos por usuario logueado


getPrecarguePorBodega(bodega:number):Observable<ApiResponse<GenericRecordsPayload<AuxIngresoInventarioModule>>>{
  let where = [{"columna" : "bodega" , "tipocomp" : '=' , "dato" : bodega   } ]
  let datos = {"action": actions.actionSelectPorUsuario ,
   "_tabla" : vistas.aux_ingreso_inventario,  "_where" : where , "_columnaUsuario": 'cod_usuario' };  
  CustomConsole.log('servicios getProductosExistencia' ,`${this.baseUrl}`, datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<AuxIngresoInventarioModule>>>(this.baseUrl, datos, httpOptions()) ;
} 
 
//#endregion

// #region metodos delete genericos
eliminaritemIngresoInventario(idDato:string | number | undefined){ 
  let where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : idDato }];
  let datos = {"action": actions.actionDelete ,
  "_tabla" : TABLA.inv_inventario_ingreso_auxiliar,
  "_where" : where  
 };
  return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
}
//#endregion
// #region metodos de inventarioController

 

borrarPrecarguePorBodega(bodega:number){
  let datos = {"action": actions.action_cancelar_inventario , "_bodega_ingreso" : bodega };
  CustomConsole.log('servicios getProductosExistencia' ,this.urlInventario, datos, httpOptions());
  return this.http.post<InventarioPrechartResponse>(this.urlInventario, datos, httpOptions());
} 



//actionStockMoveDevolucion

guardarPrdVentas(producto :ProductoModel , documentoActivo:DocumentosModel , precioVenta : PrdPreciosModule , _validarExistencia:boolean = true ){

  let datos = {"action": actions.action_insertar_producto_venta , 
  "_producto_enviado" : producto.id , 
  "_cantidadVenta" : producto.cantidadVendida ,
  '_documento' : documentoActivo.orden,
  '_precioVenta' : precioVenta , _validarExistencia
};
  CustomConsole.log('servicios guardarPrdCompra' ,this.urlVentas, datos, httpOptions());
  return this.http.post(this.urlVentas, datos, httpOptions()) ;
}
guardarNuevoProducto(producto :ProductoModel  ){

  let datos = {"action": actions.action_insertar_new_producto , 
  "_producto_enviado" : producto  
};
  CustomConsole.log('servicios guardarPrdCompra' ,this.urlInventario, datos, httpOptions());
  return this.http.post<InventarioProductMutationResponse>(this.urlInventario, datos, httpOptions());
}

updateProducto(producto :ProductoModel  ){

  let datos = {"action": actions.action_update_producto , 
  "_producto_enviado" : producto  
};
  CustomConsole.log('servicios guardarPrdCompra' ,this.urlInventario, datos, httpOptions());
  return this.http.post<InventarioProductMutationResponse>(this.urlInventario, datos, httpOptions());
}

updateDocumento(documento :DocumentosModel  ){
  let _where =   [{"columna" : "orden" , "tipocomp" : "=" , "dato" : documento.orden }]
       let  _arraydatos =  {
         "establecimiento" : documento.establecimiento,
         "id_cliente" :  documento.cliente,
         "cliente" :  documento.cliente,
         "fecha" :  documento.fecha,
         "campo_info_3" :  documento.campo_info_3,
         vendedor :   documento.cod_vendedor,
         cod_vendedor :   documento.cod_vendedor,
         cod_orden_compra :   documento.cod_orden_compra,
        };
            
           let datos = {"action": actions.actionUpdate ,
            "_tabla" : TABLA.documentos,
            _where ,
           _arraydatos
           };
  CustomConsole.log('servicios updateDocumento' ,this.configService.url.action, datos, httpOptions());
  return this.http.post<DocumentoRequest>(this.configService.url.action, datos, httpOptions()) ;
}
guardarNuevoProductoPrecargue( precargue :AuxIngresoInventarioModule ){

  let datos = {"action": actions.action_ingreso_precargue , 
  "_ingreso" : precargue  
};
  CustomConsole.log('servicios guardarNuevoProductoPrecargue' ,this.urlInventario, datos, httpOptions());
  return this.http.post<InventarioPrechartResponse>(this.urlInventario, datos, httpOptions());
}

devolverPrdCompra(producto : DocumentoListado  ){

  let datos = {"action": actions.devolver_producto_venta , 
  "_producto_enviado" : producto  
};
  CustomConsole.log('servicios getProductosCodBarrasVCnt' ,this.urlInventario, datos, httpOptions());
  return this.http.post<InventarioReturnResponse>(this.urlInventario, datos, httpOptions());
}


 
getProductosGeneral(limit?:any): Observable<InventarioProductsResponse>  {
  let datos;
  if( limit.length > 0 ){
      datos   = {"action": actions.get_all_products , 
  "_limit" : limit  
          };}else{
      datos = {"action": actions.get_all_products ,  
              };
  }
  
  CustomConsole.log('servicios getProductosPorMarca' ,this.urlInventario, datos, httpOptions());
  return this.http.post<InventarioProductsResponse>(this.urlInventario, datos, httpOptions());
} 

getProductosPorCategoria(codCategoria:any): Observable<InventarioProductsResponse>{ 
  let datos = {"action": actions.get_all_products_by_category , "_id_cate" : codCategoria,
      "_limit" : [0,100]   
              };
  CustomConsole.log('servicios getProductosPorCategoria' ,this.urlInventario, datos, httpOptions());
  return this.http.post<InventarioProductsResponse>(this.urlInventario, datos, httpOptions());
} 

getProductosPorNombre(texto:string , limit?:any): Observable<InventarioProductsResponse>{
  let datos  = {"action": actions.get_all_products_by_name ,"_dato_busqueda" : texto ,
    "_limit" : limit
  }; 
  CustomConsole.log('servicios getProductosPorMarca' ,this.urlInventario, datos, httpOptions());
  return this.http.post<InventarioProductsResponse>(this.urlInventario, datos, httpOptions());
} 

getProductosPorMarca(codMarca : any): Observable<InventarioProductsResponse>{ 
  let datos = {"action": actions.get_all_products_by_brand , "_id_brand" :codMarca,
      "_limit" : [0,100] 
              };
  CustomConsole.log('servicios getProductosPorMarca' ,this.urlInventario, datos, httpOptions());
  return this.http.post<InventarioProductsResponse>(this.urlInventario, datos, httpOptions());
} 

getProductoById(idprd:any):Observable<InventarioProductResponse>{ 
  
  let  datos = {"action": actions.buscarProducto ,
    "_id_producto" : idprd 
   };

  CustomConsole.log('servicios getProductosCodBarrasVCnt' ,this.urlInventario, datos, httpOptions());
  return this.http.post<InventarioProductResponse>(this.urlInventario, datos, httpOptions());
}


getProductoExtistenciaDocById(idprd:any , orden:number):Observable<InventarioExistenceResponse>{ 
  
  let  datos = {"action": actions.buscarExistenciaProducto ,
    "_id_producto" : idprd ,
    "_orden_documento" : orden 
   };

  CustomConsole.log('servicios getProductosCodBarrasVCnt' ,this.urlInventario, datos, httpOptions());
  return this.http.post<InventarioExistenceResponse>(this.urlInventario, datos, httpOptions());
}
 
getProductoByIdOrCodBarra(idprd:any):Observable<InventarioProductResponse>{ 
  
  let  datos = {"action": actions.buscarProductoCodBarras ,
    "_id_producto" : idprd 
   };

  CustomConsole.log('servicios getProductosCodBarrasVCnt' ,this.urlInventario, datos, httpOptions());
  return this.http.post<InventarioProductResponse>(this.urlInventario, datos, httpOptions());
}
// #endregion
 
}

