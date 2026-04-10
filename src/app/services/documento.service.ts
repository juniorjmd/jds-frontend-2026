import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { actions } from '../models/app.db.actions';
import { httpOptions, url } from '../models/app.db.url';
import { vistas } from '../models/app.db.view';
import { loading } from 'src/app/models/app.loading';
import { cajaModel } from '../models/ventas/cajas.model';
import { ValuesFormuGasto } from '../interfaces/valuesFormularios';
import { CarteraRequest, CreditosResumenRequest, DocumentoCierreRequest, DocumentoRequest } from '../interfaces/producto-request'; 
import { documentoDev, DocumentosModel } from '../models/ventas/documento.model';
import { TABLA } from '../models/app.db.tables';
import { EmpleadoModel } from '../models/empleados/empleados.module';
import { DocumentoListado } from '../interfaces/documento.interface';
import { CustomConsole } from '../models/CustomConsole';
import { ConfigService } from './config.service';
import { ApiResponse, ApiErrorResponse } from '../interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from '../interfaces/generic-response.interface';

export interface DocumentoRecordsPayload {
  records: DocumentosModel[];
  count: number;
}

export interface DocumentoMutationPayload extends DocumentoRecordsPayload {
  message: string;
  documentId: number | null;
}

export interface DocumentoActionPayload extends GenericMutationPayload {
  documentoFinal?: DocumentosModel;
  documentId?: number | null;
}

export interface CarteraRecordsPayload {
  records: any[];
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
 
constructor(private http: HttpClient, private loading: loading , private configService:ConfigService) {
    CustomConsole.log('servicio documentos');
  }

  private postObjectRecords<T>(datos: any): Observable<ApiResponse<GenericRecordsPayload<T>>> {
    return this.http
      .post<ApiResponse<GenericRecordsPayload<any>>>(this.configService.url.action, datos, httpOptions())
      .pipe(
        map((response) => ({
          ...response,
          data: {
            records: (response.data.records ?? []).map((item: any) => item.objeto ?? item.obj ?? item),
            count: response.data.count ?? 0,
          },
        }))
      );
  }

  private postGenericRecords<T>(datos: any): Observable<ApiResponse<GenericRecordsPayload<T>>> {
    return this.http.post<ApiResponse<GenericRecordsPayload<T>>>(this.configService.url.action, datos, httpOptions());
  }

  


  getDocumentoActivo(): Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>> {
    let datos = {
      "action": actions.actionSelectPorUsuario,
      "_tabla": vistas.documento,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_columnaUsuario": 'usuario',
      "_where": [{"columna": 'estado', "tipocomp": '=', "dato": 1}]
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentoActivo', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }

   getCompras(): Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>> {
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.documentosCompra, 
      "_obj": ['objeto'],
      "_columnas": ['objeto'] 
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentoActivo', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }
  getPagosCPP(): Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>> {
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.documentosPagosCPP, 
      "_obj": ['objeto'],
      "_columnas": ['objeto'] 
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentoActivo', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }

  getPlazoCreditoPorDocumentoBase(orden:number): Observable<any> {
    
    
    let _where = [{"columna": 'idFacturaVenta', "tipocomp": '=', "dato": orden}];
    let datos = {
      "action": actions.actionSelect,
      "_tabla": TABLA.mst_mov_credito, _where , 
      "_columnas": ['cuotas','plazos'] 
    };
    CustomConsole.log('getPlazoCreditoPorDocumentoBase', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }
  getCxPProveedores(): Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>> {
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.documentosCuentasPorPagar, 
      "_obj": ['objeto'],
      "_columnas": ['objeto'] 
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentoActivo', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }
  getDevoluciones(): Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>> {
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.documentoDev, 
      "_obj": ['objeto'],
      "_columnas": ['objeto'] 
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentoActivo', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }

  
  getDevolucionesSinUso(): Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>> {
    
    let _where = [{"columna": 'uso_del_bono', "tipocomp": '=', "dato": 'SinUso'}];
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.documentoDev, 
      "_obj": ['objeto'],
      "_columnas": ['objeto'] , _where
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentoActivo', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }

  getCuentasXCobrarByPersona( idPersona :number): Observable<ApiResponse<CarteraRecordsPayload>> {
    let where = [{"columna": 'idTercero', "tipocomp": '=', "dato": idPersona}];
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.cartera, 
      "_where": where
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentos', this.configService.url.action, datos, httpOptions());
    return this.postGenericRecords<any>(datos) as Observable<ApiResponse<CarteraRecordsPayload>>;
  }

  getCuentasXCobrarByfecha(_fechaInicio:string, _fechaFin:string): Observable<CreditosResumenRequest> { 
    let datos = {
      "action": actions.resumenCuentaporCobra, 
      _fechaInicio , _fechaFin
    };
    CustomConsole.log('servicios de getCuentasXCobrarByfecha', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<CreditosResumenRequest>(this.configService.url.actionDocumentos, datos, httpOptions());
  }
getCuentasXPagarByfecha(_fechaInicio:string, _fechaFin:string): Observable<CreditosResumenRequest> { 
    let datos = {
      "action": actions.resumenCuentaporPagar, 
      _fechaInicio , _fechaFin
    };
    CustomConsole.log('servicios de getCuentasXCobrarByfecha', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<CreditosResumenRequest>(this.configService.url.actionDocumentos, datos, httpOptions());
  } 
  
  
  getCuentasXPagarProveedorByfecha(_proveedor:number , _fechaInicio:string, _fechaFin:string): Observable<CreditosResumenRequest> { 
    let datos = {
      "action": actions.resumenCuentaporPagarProveedor, 
      _fechaInicio , _fechaFin , _proveedor
    };
    CustomConsole.log('servicios de getCuentasXCobrarByfecha', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<CreditosResumenRequest>(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  getCuentasXCobrarClienteByfecha(_cliente:number , _fechaInicio:string, _fechaFin:string): Observable<CreditosResumenRequest> { 
    let datos = {
      "action": actions.resumenCuentaporCobrarCliente, 
      _fechaInicio , _fechaFin , _cliente
    };
    CustomConsole.log('servicios de getCuentasXCobrarByfecha', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<CreditosResumenRequest>(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  getCuentasXCobrarByPersonaAbonos( idPersona :number): Observable<ApiResponse<CarteraRecordsPayload>> {
    let where = [{"columna": 'idTercero', "tipocomp": '=', "dato": idPersona},
      {"columna": 'totalActual', "tipocomp": '>', "dato": 0}];
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.cartera, 
      "_where": where
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentos', this.configService.url.action, datos, httpOptions());
    return this.postGenericRecords<any>(datos) as Observable<ApiResponse<CarteraRecordsPayload>>;
  }
  getCuentasXPagarByPersonaAbonos( idPersona :number , idEstablecimiento:any): Observable<ApiResponse<CarteraRecordsPayload>> {
    let where = [{"columna": 'idTercero', "tipocomp": '=', "dato": idPersona},
      {"columna": 'establecimiento', "tipocomp": '=', "dato": idEstablecimiento},
      {"columna": 'totalActual', "tipocomp": '>', "dato": 0}];
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.credito, 
      "_where": where
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentos', this.configService.url.action, datos, httpOptions());
    return this.postGenericRecords<any>(datos) as Observable<ApiResponse<CarteraRecordsPayload>>;
  }

  getCuentasXCobrar(): Observable<ApiResponse<CarteraRecordsPayload>> { 
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.cartera  ,
      "_limit" : 300
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentos', this.configService.url.action, datos, httpOptions());
    return this.postGenericRecords<any>(datos) as Observable<ApiResponse<CarteraRecordsPayload>>;
  }


  getDocumentos(): Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>> {
    let where = [{"columna": 'tipoDocumentoFinal', "tipocomp": '=', "dato": 1}];
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.documento,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_columnaUsuario": 'usuario',
      "_where": where
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentos', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }

  
  getDocumentosByOrden(orden:number): Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>> {
    let where = [{"columna": 'orden', "tipocomp": '=', "dato": orden}];
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.documento,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_columnaUsuario": 'usuario',
      "_where": where
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentosByOrden', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }

  getDocumentosByNumFactura( codFactura : string): Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>> {
    let where = [{"columna": 'idDocumentoFinal', "tipocomp": '=', "dato": codFactura}];
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.documento,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_columnaUsuario": 'usuario',
      "_where": where
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentos', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  } 
  getVentasByNumFactura( codFactura : string): Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>> {
    let where = [{"columna": 'idDocumentoFinal', "tipocomp": '=', "dato": codFactura}];
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.ventasCerradas,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_columnaUsuario": 'usuario',
      "_where": where
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentos', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  } 
   getDocComprasByNumFactura( codFactura : string): Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>> {
    let where = [{"columna": 'idDocumentoFinal', "tipocomp": '=', "dato": codFactura}];
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.documentosCompra,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_columnaUsuario": 'usuario',
      "_where": where
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentos', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }
  getDocumentosUsuario(): Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>> {
    let where = [{"columna": 'tipoDocumentoFinal', "tipocomp": '=', "dato": 1}];
    let datos = {
      "action": actions.actionSelectPorUsuario,
      "_tabla": vistas.documento,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_columnaUsuario": 'usuario',
      "_where": where
    };
    CustomConsole.log('servicios de usuarios activo - getDocumentos', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }

  getCajasActivas(establecimiento: number): Observable<ApiResponse<GenericRecordsPayload<cajaModel>>> {
    let where = [{"columna": 'establecimiento', "tipocomp": '=', "dato": establecimiento}];
    let datos = {
      "action": actions.actionSelect,
      "_tabla": vistas.cajasActivas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getCajasActivas', this.configService.url.action, datos, httpOptions());
    return this.postGenericRecords<cajaModel>(datos);
  }
 

  getDocumentosCaja():Observable<ApiResponse<DocumentoRecordsPayload>>{
    let datos = { 
            "action": actions.action_get_documentos_caja  
          }
          CustomConsole.log('servicios de documentos - getDocumentosCaja', this.configService.url.actionDocumentos, datos, httpOptions());
 
      return this.http.post<ApiResponse<DocumentoRecordsPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }

  getDocumentosCompraBlanco():Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>>{
    let _where = [{"columna": 'tipoDocumentoFinal', "tipocomp": '=f', "dato": "getIdTipoDocumentoPorNombre('compra_activa') "}];
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.documentos_por_tip_documento , _where
    };
    CustomConsole.log('servicios de documentos - getCajasActivas', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }

  getDocumentosCompra( idCliente?:any):Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>>{
    let _tabla = vistas.documentos_por_tip_documento;
    let _where = [{"columna": 'tipoDocumentoFinal', "tipocomp": '=f', "dato": "getIdTipoDocumentoPorNombre('comprobante_compras') " }];
    if(idCliente !=undefined){
      _where.push({"columna": 'cliente', "tipocomp": '=', "dato": idCliente})
      _tabla = vistas.vw_obj_documentos_por_cliente
    }
    //vw_obj_documentos_por_usuario
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],_tabla ,  _where
    };
    CustomConsole.log('servicios de documentos - getCajasActivas', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }

  getDocumentosCompraById( idDocumentoFinal?:any):Observable<ApiResponse<GenericRecordsPayload<DocumentosModel>>>{
    let _tabla = vistas.documento;
    let _where = [{"columna": 'tipoDocumentoFinal', "tipocomp": '=f', "dato": "getIdTipoDocumentoPorNombre('comprobante_compras') " } ,
                 {"columna": 'idDocumentoFinal', "tipocomp": '=', "dato": idDocumentoFinal}]
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],_tabla ,  _where
    };
    CustomConsole.log('servicios de documentos - getCajasActivas', this.configService.url.action, datos, httpOptions());
    return this.postObjectRecords<DocumentosModel>(datos);
  }

  getVentasFinalizadas(codVenta: string = ''): Observable<any> {
    let where = [{"columna": 'idDocumentoFinal', "tipocomp": 'like', "dato": codVenta}];
    if (codVenta.trim() === '') {
      where = [];
    }
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.ventasCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getVentasFinalizadas', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }

  getVentasFinalizadasPorCliente(codVenta: string): Observable<any> {
    let where = [
      {"columna": 'identificacionCliente', "tipocomp": 'like', "dato": codVenta, "relacion": 'OR'},
      {"columna": 'clienteNombre', "tipocomp": 'like', "dato": codVenta, "relacion": 'OR'}
    ];
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.ventasCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getVentasFinalizadasPorCliente', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }
  getVentasFinalizadasPorClienteFecha(codVenta: string, fecha1: string, fecha2: string): Observable<any> {
    let where = [
      {"columna": 'fecha', "tipocomp": '>=', "dato": fecha1},
      {"columna": 'fecha', "tipocomp": '<=', "dato": fecha2},
      {"columna": 'identificacionCliente', "tipocomp": 'like', "dato": codVenta, "relacion": 'OR'},
      {"columna": 'clienteNombre', "tipocomp": 'like', "dato": codVenta, },
    ];
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.ventasCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getVentasFinalizadasPorCliente', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }
  getVentasFinalizadasPorFecha(fecha1: string, fecha2: string): Observable<any> {
    let where = [
      {"columna": 'fecha', "tipocomp": '>=', "dato": fecha1},
      {"columna": 'fecha', "tipocomp": '<=', "dato": fecha2}
    ];
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.ventasCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getVentasFinalizadasPorFecha', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }

  
  getDevolucionesPorFecha(fecha1: string, fecha2: string): Observable<any> {
    let where = [
      {"columna": 'fecha', "tipocomp": '>=', "dato": fecha1},
      {"columna": 'fecha', "tipocomp": '<=', "dato": fecha2}
    ];
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla":vistas.documentoDev, 
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getDevolucionesPorFecha', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }

  getVentasFinalizadasPorFechaHora(fecha1: string, fecha2: string , 
    horaIni: string, horaFin: string  ): Observable<any> {
    let where = [
      {"columna": 'fecha', "tipocomp": '>=', "dato": fecha1},
      {"columna": 'fecha', "tipocomp": '<=', "dato": fecha2},
      {"columna": 'hora', "tipocomp": '>=', "dato": horaIni},
      {"columna": 'hora', "tipocomp": '<=', "dato": horaFin}
    ];
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.ventasCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getVentasFinalizadasPorFecha', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }

  getVentasFinalizadasPorProductoFecha(idProducto:string , fecha1: string, fecha2: string): Observable<any> {
    /* $_dato = "( Select {$valor['dato']['columna']} from {$valor['dato']['tabla']} WHERE "
                 . " {$valor['dato']['colValidacion']} =  {$valor['dato']['datoValidacion']} )"; */
    let where = [
      {"columna": 'fecha', "tipocomp": '>=', "dato": fecha1},
      {"columna": 'fecha', "tipocomp": '<=', "dato": fecha2},
      {"columna": 'orden', "tipocomp": 'inS', "dato": {
        columna: 'orden',
        tabla: 'vw_documentos_listado_productos_ventas',
        colValidacion: 'idProducto',
        datoValidacion : `'${idProducto}'`
      } }
    ];
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.ventasCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getVentasFinalizadasPorProductoFecha', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }

  getVentasFinalizadasPorCarteraFecha( fecha1: string, fecha2: string): Observable<any> {
    /* $_dato = "( Select {$valor['dato']['columna']} from {$valor['dato']['tabla']} WHERE "
                 . " {$valor['dato']['colValidacion']} =  {$valor['dato']['datoValidacion']} )"; */
    let where = [
      {"columna": 'date(fecha_creacion)', "tipocomp": '>=', "dato": fecha1},
      {"columna": 'date(fecha_creacion)', "tipocomp": '<=', "dato": fecha2} ]
    ;
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.ventasACreditoCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getVentasFinalizadasPorProductoFecha', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }

  
  getVentasFinalizadasPorCarteraFechaPorCliente( id:number ,   fecha1: string, fecha2: string): Observable<any> {
    /* $_dato = "( Select {$valor['dato']['columna']} from {$valor['dato']['tabla']} WHERE "
                 . " {$valor['dato']['colValidacion']} =  {$valor['dato']['datoValidacion']} )"; */
    let where = [
      {"columna": 'date(fecha_creacion)', "tipocomp": '>=', "dato": fecha1},
      {"columna": 'date(fecha_creacion)', "tipocomp": '<=', "dato": fecha2} , 
      {"columna": 'cliente', "tipocomp": '=', "dato": id} ]
    ;
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.ventasACreditoCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getVentasFinalizadasPorProductoFecha', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }

  getComprasFinalizadasPorCreditoFechaPorProveedor( id:number ,  fecha1: string, fecha2: string): Observable<any> {
    /* $_dato = "( Select {$valor['dato']['columna']} from {$valor['dato']['tabla']} WHERE "
                 . " {$valor['dato']['colValidacion']} =  {$valor['dato']['datoValidacion']} )"; */
    let where = [
      {"columna": 'date(fecha_creacion)', "tipocomp": '>=', "dato": fecha1},
      {"columna": 'date(fecha_creacion)', "tipocomp": '<=', "dato": fecha2} ,
      {"columna": 'cliente', "tipocomp": '=', "dato": id} ]
    ;
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.comprasACreditoCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getComprasFinalizadasPorCreditoFecha', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }
  
  getComprasFinalizadasPorCreditoFecha( fecha1: string, fecha2: string): Observable<any> {
    /* $_dato = "( Select {$valor['dato']['columna']} from {$valor['dato']['tabla']} WHERE "
                 . " {$valor['dato']['colValidacion']} =  {$valor['dato']['datoValidacion']} )"; */
    let where = [
      {"columna": 'date(fecha_creacion)', "tipocomp": '>=', "dato": fecha1},
      {"columna": 'date(fecha_creacion)', "tipocomp": '<=', "dato": fecha2} ]
    ;
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.comprasACreditoCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getComprasFinalizadasPorCreditoFecha', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }
  getResumenCategoriaVentas(_idPrd:any , _fechaInicio: string, _fechaFin: string): Observable<any> { 
    let datos = {
      "action": actions.resumenVentaCategoria, _idPrd,_fechaInicio,_fechaFin
    };
    CustomConsole.log('servicios de documentos - getResumenCategoriaVentas', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post(this.configService.url.actionDocumentos, datos, httpOptions());
  }

  getResumenUsuarioVentas(_idPrd:any , _fechaInicio: string, _fechaFin: string): Observable<any> { 
    let datos = {
      "action": actions.resumenVentaUsuarioCajero, _idPrd,_fechaInicio,_fechaFin
    };
    CustomConsole.log('servicios de documentos - getResumenUsuarioVentas', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  getResumenVendedorVentas(_idPrd:any , _fechaInicio: string, _fechaFin: string): Observable<any> { 
    let datos = {
      "action": actions.resumenVentaVendedor, _idPrd,_fechaInicio,_fechaFin
    };
    CustomConsole.log('servicios de documentos - getResumenVendedorVentas', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post(this.configService.url.actionDocumentos, datos, httpOptions());
  }

  getResumenVendedorCliente(_idPrd:any , _fechaInicio: string, _fechaFin: string): Observable<any> { 
    let datos = {
      "action": actions.resumenVentaCliente, _idPrd,_fechaInicio,_fechaFin
    };
    CustomConsole.log('servicios de documentos - getResumenVendedorVentas', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  getResumenVentas(  _fechaInicio: string, _fechaFin: string): Observable<any> { 
    let datos = {
      "action": actions.resumenVentas, _fechaInicio,_fechaFin
    };
    CustomConsole.log('servicios de documentos - getResumenVentas', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post(this.configService.url.actionDocumentos, datos, httpOptions());
  }

  
  getResumenDevoluciones(  _fechaInicio: string, _fechaFin: string): Observable<any> { 
    let datos = {
      "action": actions.resumenDevolucion, _fechaInicio,_fechaFin
    };
    CustomConsole.log('servicios de documentos - getResumenVentas', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  getResumenVentasPorHora(  _fechaInicio: string, _fechaFin: string , _horaInicio: string, _horaFin: string  ): Observable<any> { 
    let datos = {
      "action": actions.resumenVentas, _fechaInicio,_fechaFin, _horaInicio, _horaFin
    };
    CustomConsole.log('servicios de documentos - getResumenVentasPorHora', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  getResumenProductosVentas(_idPrd:string , _fechaInicio: string, _fechaFin: string): Observable<any> {
    /* $_dato = "( Select {$valor['dato']['columna']} from {$valor['dato']['tabla']} WHERE "
                 . " {$valor['dato']['colValidacion']} =  {$valor['dato']['datoValidacion']} )"; */
    
    let datos = {
      "action": actions.resumenVentaProducto, _idPrd,_fechaInicio,_fechaFin
    };
    CustomConsole.log('servicios de documentos - getResumenProductosVentas', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post(this.configService.url.actionDocumentos, datos, httpOptions());
  }

  getVentasFinalizadasPorCategoriasFecha(categoriaId:any , fecha1: string, fecha2: string): Observable<any> {
    /* $_dato = "( Select {$valor['dato']['columna']} from {$valor['dato']['tabla']} WHERE "
                 . " {$valor['dato']['colValidacion']} =  {$valor['dato']['datoValidacion']} )"; */
    let where = [
      {"columna": 'fecha', "tipocomp": '>=', "dato": fecha1},
      {"columna": 'fecha', "tipocomp": '<=', "dato": fecha2},
      {"columna": 'orden', "tipocomp": 'inS', "dato": {
        columna: 'orden',
        tabla: 'vw_documentos_listado_productos_ventas',
        colValidacion: 'idCategoria',
        datoValidacion :  categoriaId 
      } }
    ];
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.ventasCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getVentasFinalizadasPorFecha', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }


  getVentasFinalizadasPorVendedorFecha(id:any , fecha1: string, fecha2: string): Observable<any> {
    /* $_dato = "( Select {$valor['dato']['columna']} from {$valor['dato']['tabla']} WHERE "
                 . " {$valor['dato']['colValidacion']} =  {$valor['dato']['datoValidacion']} )"; */
    let where = [
      {"columna": 'fecha', "tipocomp": '>=', "dato": fecha1},
      {"columna": 'fecha', "tipocomp": '<=', "dato": fecha2},
      {"columna": 'cod_vendedor', "tipocomp": '=', "dato": id  }
    ];
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.ventasCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getVentasFinalizadasPorFecha', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }

  getVentasFinalizadasPorUsuarioFecha(id:any , fecha1: string, fecha2: string): Observable<any> {
    /* $_dato = "( Select {$valor['dato']['columna']} from {$valor['dato']['tabla']} WHERE "
                 . " {$valor['dato']['colValidacion']} =  {$valor['dato']['datoValidacion']} )"; */
    let where = [
      {"columna": 'fecha', "tipocomp": '>=', "dato": fecha1},
      {"columna": 'fecha', "tipocomp": '<=', "dato": fecha2},
      {"columna": 'usuario', "tipocomp": '=', "dato": id } 
    ];
    let datos = {
      "action": actions.actionSelect,
      "_columnas": ['objeto'],
      "_obj": ['objeto'],
      "_tabla": vistas.ventasCerradas,
      "_where": where
    };
    CustomConsole.log('servicios de documentos - getVentasFinalizadasPorFecha', this.configService.url.action, datos, httpOptions());
    return this.http.post(this.configService.url.action, datos, httpOptions());
  }
  cambiarDocumento(documento: number): Observable<ApiResponse<{ message: string; documentId: number }>> {
    let datos = {"action": actions.actionChangeDocumentos, "_docActual": documento};
    CustomConsole.log('cambiarDocumento activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<{ message: string; documentId: number }>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }

  cambiarDocumentoCompra(documento: number): Observable<ApiResponse<{ message: string; documentId: number }>> {
    let datos = {"action": actions.actionChangeCompraDocumentos, "_docActual": documento};
    CustomConsole.log('cambiarDocumento activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<{ message: string; documentId: number }>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }

  
  editarLineaDocumento(item:DocumentoListado): Observable<ApiResponse<GenericMutationPayload>> {
   
    let where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : item.id }]
    
     let arraydatos:any =  {  
      "tipoDescuento" :item.tipoDescuento , 
      "descuento"  :item.descuento ,  
      "descuentoAplicado"  :item.descuentoAplicado , 
      "nombreActividadDescuento"  :item.nombreActividadDescuento , 
      "IVA"  :item.IVA , 
      "valorTotal"  :item.valorTotal , 
      "presioVenta"  :item.presioVenta , 
      "presioSinIVa"  :item.presioSinIVa , 
      "nombreProducto"  :item.nombreProducto , 
      "cant_real_descontada"  :item.cant_real_descontada , 
      "cantidadVendida"  :item.cant_real_descontada , 
      val_aux_1 : item.val_aux_1,
      val_aux_2 : item.val_aux_2 
    }
    let    datos = {"action": actions.actionUpdate ,
      "_tabla" : TABLA.documentosListado, 
      "_where" : where ,
      "_arraydatos" : arraydatos
     };
     if((item.id||0) == 0 ){
      item.cant_devuelta = undefined;
      item.idDocumento = item.orden;
      item.usuario = 'USUARIO_LOGUEADO';
      datos.action = actions.actionInsert ;
      datos._where = [] ; 
      datos._arraydatos = item ;

    }
    CustomConsole.log('editarLineaDocumento activo', this.configService.url.action, datos, httpOptions());
    return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action, datos, httpOptions());
  }
  cambiarVendedorDocumento(documento: number , vendedor : EmpleadoModel): Observable<ApiResponse<GenericMutationPayload>> {
    let where =   [{"columna" : "orden" , "tipocomp" : "=" , "dato" : documento }]
    let arraydatos =  {  "cod_vendedor" : vendedor.id ,

      "vendedor" :  vendedor.id 
    }
    let    datos = {"action": actions.actionUpdate ,
      "_tabla" : TABLA.documentos, "_where" : where ,
      "_arraydatos" : arraydatos
     };
    CustomConsole.log('cambiarDocumento activo', this.configService.url.action, datos, httpOptions());
    return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action, datos, httpOptions());
  }

  cancelarDocumento(documento: number): Observable<ApiResponse<GenericMutationPayload>> {
    let datos = {"action": actions.actionCancelarDocumentos, "_documento": documento};
    CustomConsole.log('cancelarDocumento activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http
      .post<ApiResponse<GenericMutationPayload> | any>(this.configService.url.actionDocumentos, datos, httpOptions())
      .pipe(map((response) => this.normalizeLegacyMutationResponse(response)));
  }

  convertirDocumentoEnCotizacion(documento: number): Observable<ApiResponse<DocumentoActionPayload>> {
    let datos = {"action": actions.actionCambiarDocumentosACotizacion, "_documento": documento};
    CustomConsole.log('generar cotizacion activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<DocumentoActionPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  generarDomicilioDocumento(documento: number): Observable<ApiResponse<GenericMutationPayload>> {
    let datos = {"action": actions.actionCambiarDocADomicilio, "_documento": documento};
    CustomConsole.log('actionCambiarDocADomicilio', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }

  cerrarDocumento(documento: number): Observable<ApiResponse<GenericMutationPayload>> {
    let datos = {"action": actions.actionCerarDocumentos, "_documento": documento};
    CustomConsole.log('crearDocumento activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }

  cerrarDocumentoRemision(documento: number): Observable<ApiResponse<GenericMutationPayload>> {
    let datos = {"action": actions.actionCerarDocumentosRemision, "_documento": documento};
    CustomConsole.log('crearDocumento activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  cambiarDocumentoDeCaja(caja: cajaModel): Observable<ApiResponse<GenericMutationPayload>> {
    let datos = {"action": actions.actionCambioCajaDocumento, "datos": caja};
    CustomConsole.log('crearDocumento activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }

  crearDocumento(): Observable<ApiResponse<DocumentoMutationPayload>> {
    let datos = {"action": actions.actionCrearDocumentos};
    CustomConsole.log('crearDocumento activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<DocumentoMutationPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  crearDocumentoCompraEnBlanco(_establecimiento:number): Observable<ApiResponse<DocumentoMutationPayload>> {
    let datos = {"action": actions.actionCrearDocumentosCompraBlank , _establecimiento};
    CustomConsole.log('crearDocumento activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<DocumentoMutationPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }
   crearDocumentoGasto(nuevoGasto:ValuesFormuGasto): Observable<ApiResponse<GenericMutationPayload>> {
    let datos = {"action": actions.actionCrearNewGasto ,"_arraydatos" : nuevoGasto};
    CustomConsole.log('crearDocumentoGasto activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  crearDocumentoAbono(nuevoGasto:DocumentosModel): Observable<ApiResponse<GenericMutationPayload>> {
    let datos = {"action": actions.actionCrearNewAbono ,"_documentoAbono" : nuevoGasto};
    CustomConsole.log('crearDocumentoGasto activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  crearDocumentoAbonoCredito(nuevoGasto:DocumentosModel): Observable<ApiResponse<DocumentoActionPayload>> {
    let datos = {"action": actions.actionCrearNewAbonoCredito ,"_documentoAbono" : nuevoGasto};
    CustomConsole.log('crearDocumentoGasto activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<DocumentoActionPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  crearDocumentoDevolucion(nuevoGasto:DocumentosModel): Observable<ApiResponse<DocumentoActionPayload>> {
    let datos = {"action": actions.actionCrearNewDevolucion ,"_documentoAbono" : nuevoGasto};
    CustomConsole.log('crearDocumentoGasto activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<DocumentoActionPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }
  
  crearNotaDebito(nuevoGasto:documentoDev): Observable<ApiResponse<DocumentoActionPayload>> {
    let datos = {"action": actions.actionCrearNewNotaDebito ,"_documentoAbono" : nuevoGasto};
    CustomConsole.log('crearDocumentoGasto activo', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<ApiResponse<DocumentoActionPayload>>(this.configService.url.actionDocumentos, datos, httpOptions());
  }

  getErrorMessage(error: any): string {
    const apiError = error?.error?.error as ApiErrorResponse | string | undefined;

    if (typeof apiError === 'string' && apiError.trim() !== '') {
      return apiError;
    }

    if (apiError && typeof apiError === 'object' && 'message' in apiError) {
      return String(apiError.message);
    }

    if (typeof error?.message === 'string' && error.message.trim() !== '') {
      return error.message;
    }

    return 'Error interno del servidor';
  }

  private normalizeLegacyMutationResponse(response: any): ApiResponse<GenericMutationPayload> {
    if (typeof response?.ok === 'boolean' && 'data' in (response ?? {})) {
      return response as ApiResponse<GenericMutationPayload>;
    }

    const legacyError = typeof response?.error === 'string' ? response.error.trim() : '';
    const legacyMessage =
      response?.data?.message ??
      response?.datos?.[0]?.msg ??
      response?.msg ??
      '';

    if (legacyError === 'ok') {
      return {
        ok: true,
        data: {
          message: legacyMessage || 'Operacion completada correctamente',
          affected: 1,
        },
        error: null,
      };
    }

    return {
      ok: false,
      data: {
        message: legacyMessage || undefined,
        affected: 0,
      },
      error: {
        code: 'LEGACY_ERROR',
        message: legacyError || 'Error interno del servidor',
      },
    };
  }
}
