import { Injectable } from '@angular/core'; 
import { caja } from '../interfaces/caja.interface';
import { actions } from '../models/app.db.actions';
import { httpOptions, url } from '../models/app.db.url';
import { vistas } from '../models/app.db.view';
import { HttpClient } from '@angular/common/http';
import { PROCEDURE, TABLA } from '../models/app.db.tables';

import { loading } from 'src/app/models/app.loading'; 
import { cajaModel } from '../models/ventas/cajas.model';
import { establecimientoModel } from '../models/ventas/establecimientos.model';
import { TiposEstablecimientosModel } from '../models/ventas/tipos-establecimientos.model';
import { Establecimientos } from '../interfaces/establecimientos.interface';
import { Contador } from '../interfaces/contador';
import { MediosDePagoModel } from '../models/ventas/medios-de-pago.model';
import { DocpagosModel } from '../models/ventas/pagos.model';
import { BodegasModule } from '../models/bodegas/bodegas.module';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { DocumentoCierreRequest } from '../interfaces/producto-request';
import { DocumentosModel } from '../models/ventas/documento.model';
import { ConfigService } from './config.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import {
    CarwashBoxSummaryData,
    CarwashCloseBoxData,
    CarwashOpenBoxData,
} from '../interfaces/carwash-response.interface';
import { GenericMultiRecordsPayload, GenericMutationPayload, GenericRecordsPayload } from '../interfaces/generic-response.interface';


@Injectable({
    providedIn: 'root'
})
export class cajasServices { 
    urlVentas = this.configService.url.action + "ventas/";

    private cajaSource = new BehaviorSubject<any>(null);
    currentCaja = this.cajaSource.asObservable();
    private establecimientosSource = new BehaviorSubject<establecimientoModel[]|null>(null);
    currentArrEsta = this.establecimientosSource.asObservable(); 
constructor(private http: HttpClient ,private configService :ConfigService,
        private loading : loading ){ 
    }

    asignarEstablecimientos(caja:establecimientoModel[]){
        this.establecimientosSource.next(caja);
    }
    asignarCaja(caja:cajaModel){
        this.cajaSource.next( caja) 
    }


    abrirCaja(caja : cajaModel,  valorIngresar : number){
        let datos = {"action": actions.actionAbrirCaja ,
                     "_parametro" : {"idCaja" : caja.id } , 
                     "_valorIngresar" : valorIngresar
                    };
        return this.http
          .post<ApiResponse<CarwashOpenBoxData>>(this.configService.url.action , datos, httpOptions());
    }

    
    resumenCaja(caja : cajaModel){
        let datos = {"action": actions.actionResumenCaja ,
                     "_parametro" : {"idCaja" : caja.id }  
                    };
        return this.http
          .post<ApiResponse<CarwashBoxSummaryData>>(this.configService.url.action , datos, httpOptions());
    }
    cerrarCaja(caja : cajaModel){
        let datos = {"action": actions.actionCerarCaja ,
                     "_parametro" : {"idCaja" : caja.id } 
                    };
        return this.http
          .post<ApiResponse<CarwashCloseBoxData>>(this.configService.url.actionVentas , datos, httpOptions());
    }

    getCuentasContablesEstablecimientoUsuario():Observable<ApiResponse<{ records: cajaModel[]; count: number }>>{
       
        let datos = {"action": actions.actionSelectPorUsuario ,
            "_tabla" : vistas.cajasActivas,
            "_columnaUsuario": 'usuarioEstadoCaja'  
           };
return this.http
  .post<ApiResponse<{ records: cajaModel[]; count: number }>>(this.configService.url.action , datos, httpOptions()) ;
    }
 cerrarCajaParcial(caja : cajaModel){
        let datos = {"action": actions.actionCerarCajaParcial ,
                     "_parametro" : {"idCaja" : caja.id } 
                    };
        return this.http
          .post<ApiResponse<CarwashCloseBoxData>>(this.configService.url.actionVentas , datos, httpOptions());
    }

    getErrorMessage(error: any): string {
        const rawApiError = error?.error?.error;
        const apiMessage = typeof rawApiError === 'string'
          ? rawApiError
          : rawApiError?.message;
        const fallbackMessage = error?.error?.message;
        const textMessage = error?.message;

        return apiMessage || fallbackMessage || textMessage || 'Error inesperado';
    }
    
    getTiposDocumentosConContadores(){
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.tipos_documentos_con_cont,
                     "_where" : [{columna : 'estado' , tipocomp : '=' , dato : 1}]
                    };
        return this.http.post<ApiResponse<GenericRecordsPayload<unknown>>>(this.configService.url.action , datos, httpOptions()) ;
    }

    getEstablecimientos():Observable<ApiResponse<GenericRecordsPayload<establecimientoModel>>>{
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.establecimiento,
                     "_where" : [{columna : 'estado' , tipocomp : '=' , dato : 1}]
                    };
        return this.http.post<ApiResponse<GenericRecordsPayload<establecimientoModel>>>(this.configService.url.action , datos, httpOptions()) ;
    }

     getEstablecimientosCompras():Observable<ApiResponse<GenericRecordsPayload<establecimientoModel>>>{
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.establecimiento,
                     "_where" : [{columna : 'estado' , tipocomp : '=' , dato : 1},
                        {columna : 'idCCntCPagar' , tipocomp : '>' , dato : 0},
{columna : 'idCCntIvaCompra' , tipocomp : '>' , dato : 0} ,
{columna : 'idCCntCajaGeneral' , tipocomp : '>' , dato : 0}, 
{columna : 'idRetefuenteCompra ' , tipocomp : '>' , dato : 0} ,
{columna : 'idBodegaStock' , tipocomp : '>' , dato : 0} ]
                    };
        return this.http.post<ApiResponse<GenericRecordsPayload<establecimientoModel>>>(this.configService.url.action , datos, httpOptions()) ;
    }

    getAllEstablecimientos():Observable<ApiResponse<GenericRecordsPayload<establecimientoModel>>>{
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.establecimiento
                    };
        return this.http.post<ApiResponse<GenericRecordsPayload<establecimientoModel>>>(this.configService.url.action , datos, httpOptions()) ;
    }
    
    getAllTiposEstablecimientos(){
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.tipo_establecimiento 
                    };
        return this.http.post<ApiResponse<GenericRecordsPayload<TiposEstablecimientosModel>>>(this.configService.url.action , datos, httpOptions()) ;
    }

    getLocacionesExternas(){
        let datos = {"action": actions.actionBuscarLocacionesExternas  };
        return this.http.post<ApiResponse<{ locations: unknown[]; count: number }>>(this.configService.url.action , datos, httpOptions()) ;
    }
    getLocacionesPrincipales(){
        let datos = {"action": actions.actionBuscarLocacionesExternas  ,
        "_principal" : true
                    };
        return this.http.post<ApiResponse<{ locations: unknown[]; count: number }>>(this.configService.url.action , datos, httpOptions()) ;
    }
    getLocacionesVirtuales(){
        let datos = {"action": actions.actionBuscarLocacionesExternas  ,
        "_virtual" : true
                    };
        return this.http.post<ApiResponse<{ locations: unknown[]; count: number }>>(this.configService.url.action , datos, httpOptions()) ;
    }


    getBodegasDisponibles(){ 
         let datos = {"action": actions.actionSelect ,
                        "_tabla" : vistas.prd_bodegas_inventario, 
                        "_columnas": ['obj'],
                        "_obj": ['obj'],
                        "_where" : [{columna : 'estado' , tipocomp : '=' , dato : 1}]
                       };
           return this.http
             .post<ApiResponse<GenericRecordsPayload<BodegasModule>>>(this.configService.url.action , datos, httpOptions())
             .pipe(map((response) => this.normalizeWrappedRecords(response))) ;
    }
    getLocacionesFisicas(){
        let datos = {"action": actions.actionBuscarLocacionesExternas  ,
        "_fisicas" : true
                    };
        return this.http.post<ApiResponse<{ locations: unknown[]; count: number }>>(this.configService.url.action , datos, httpOptions()) ;
    }
    getLocacionesExistencias(id:number){
        let datos = {"action": actions.actionBuscarLocacionesExternas  ,
        "_principal" : false,"_fisicas" : false,"_existencia" : true,
             "_id_principal" : id
             };
        return this.http.post<ApiResponse<{ locations: unknown[]; count: number }>>(this.configService.url.action , datos, httpOptions()) ;
    }
    getLocacionesSecundarias(id:number){
        let datos = {"action": actions.actionBuscarLocacionesExternas  ,
        "_principal" : false,"_fisicas" : false,
             "_id_principal" : id
             };
        return this.http.post<ApiResponse<{ locations: unknown[]; count: number }>>(this.configService.url.action , datos, httpOptions()) ;
    }
    getTiposEstablecimientos(){
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.tipo_establecimiento,
                     "_where" : [{columna : 'estado' , tipocomp : '=' , dato : 1}]
                    };
                    
        return this.http.post<ApiResponse<GenericRecordsPayload<TiposEstablecimientosModel>>>(this.configService.url.action , datos, httpOptions()) ;
    }
    getCaja(id:number):Observable<ApiResponse<GenericRecordsPayload<cajaModel>>>{
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.cajas , 
                     "_where" : [{columna : 'id' , tipocomp : '=' , dato : id}]
                    }; 
                    return this.http.post<ApiResponse<GenericRecordsPayload<cajaModel>>>(this.configService.url.action , datos, httpOptions()) ;
    }
    getCajas():Observable<ApiResponse<GenericRecordsPayload<cajaModel>>>{
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.cajas
                    }; 
        return this.http.post<ApiResponse<GenericRecordsPayload<cajaModel>>>(this.configService.url.action , datos, httpOptions()) ;
    } 
    getCajasTraslados():Observable<ApiResponse<GenericRecordsPayload<cajaModel>>>{
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.cajas,
                     "_where" : [{columna : 'cuentaContableEfectivo' , tipocomp : '>' , dato : 0}]
                    }; 
        return this.http.post<ApiResponse<GenericRecordsPayload<cajaModel>>>(this.configService.url.action , datos, httpOptions()) ;
    } 
    getMediosCajaActiva(){
        let datos = {"action": actions.actionSelectPorUsuario ,
                     "_tabla" : vistas.mediosPorCajaActiva,
                     "_columnaUsuario": 'usuarioCaja' , 
                     "_orderBy" : [['nombre', 'DESC']]
                    }; 
        return this.http.post<ApiResponse<GenericRecordsPayload<unknown>>>(this.configService.url.action , datos, httpOptions()) ;
    } 
    getMedios(){
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.medios
                    }; 
        return this.http.post<ApiResponse<GenericRecordsPayload<MediosDePagoModel>>>(this.configService.url.action , datos, httpOptions()) ;
    } 

    getMediosByEstablecimiento( idEsta : number){
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.medios ,
                     "_where" : [{columna : 'establecimiento' , tipocomp : '=' , dato : idEsta},
                        {columna : 'nombre' , tipocomp : '<>' , dato : 'BONOS'} , 
                        {columna : 'estado' , tipocomp : '=f' , dato : `getEstado('a')`} , 

                      ]
                    }; 
        return this.http.post<ApiResponse<GenericRecordsPayload<MediosDePagoModel>>>(this.configService.url.action , datos, httpOptions()) ;
    } 
    getContadores(){
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.contadores
                    }; 
        return this.http.post<ApiResponse<GenericRecordsPayload<Contador>>>(this.configService.url.action , datos, httpOptions()) ;
    } 



  
    getCajasActivasUsuarioActivo():Observable<ApiResponse<{ records: cajaModel[]; count: number }>>{ 
        let datos = {"action": actions.actionSelectPorUsuario ,
            "_tabla" : vistas.cajasActivas,
            "_columnaUsuario": 'usuarioEstadoCaja' 
           }; 
     return this.http
       .post<ApiResponse<{ records: cajaModel[]; count: number }>>(this.configService.url.action , datos, httpOptions()) ;
    } 
    
    getCajasActivas():Observable<ApiResponse<{ records: cajaModel[]; count: number }>>{
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.cajasActivas                    
                    }; 
        return this.http
          .post<ApiResponse<{ records: cajaModel[]; count: number }>>(this.configService.url.action , datos, httpOptions());
    } 
    
 
    getCajasActivasYparametros():Observable<ApiResponse<GenericMultiRecordsPayload<unknown>>>{
        let datos = {"action": actions.actionSelects  ,
                    // "_tabla" : vistas.cajasActivas       
                     "_tablas" : [vistas.cajasActivas , TABLA.PARAMETROS]             
                    }; 
        return this.http
          .post<ApiResponse<GenericMultiRecordsPayload<unknown>>>(this.configService.url.action , datos, httpOptions());
    } 
    
    getCajasUsuario():Observable<ApiResponse<{ records: cajaModel[]; count: number }>>{
        let datos = {"action": actions.actionSelectPorUsuario ,
                     "_tabla" : vistas.cajas_por_usuario,
                     "_columnaUsuario": 'idUsuario',
                     "_where" : [{columna : 'estadoGeneral' , tipocomp : '=' , dato : 1}]
                    }; 
        return this.http
          .post<ApiResponse<{ records: cajaModel[]; count: number }>>(this.configService.url.action , datos, httpOptions());
    } 
    
    getCajasUsuarioActivas():Observable<ApiResponse<{ records: cajaModel[]; count: number }>>{
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.cajas_por_usuario, 
                     "_where" : [{columna : 'estadoGeneral' , tipocomp : '=' , dato : 1}]
                    }; 
        return this.http
          .post<ApiResponse<{ records: cajaModel[]; count: number }>>(this.configService.url.action , datos, httpOptions());
    } 

    getCajasPorUsuario(usuario:number):Observable<ApiResponse<{ boxes: cajaModel[]; count: number }>>{
        let datos = {"action": actions.actionSelCajaXuser ,
                     "_usuario" :usuario
                    }; 
        return this.http
          .post<ApiResponse<{ boxes: cajaModel[]; count: number }>>(this.configService.url.action , datos, httpOptions());
    } 

    setPagoDocumento(idDocumento:number , pagos:DocpagosModel[] ){
        let datos = {"action": actions.actionAsignarDocumentosPagos ,
        "_ordenDocumento" : idDocumento, 
         "_pagos" : pagos
       }; 
        return this.http.post(this.urlVentas  , datos, httpOptions()) ;
    }
    setPagoDocumentoCredito(origen:string, idDocumento:number  , pagos:DocpagosModel[], _numCuotas = 1 ,  _numDiasCuotas = 30 ):Observable<DocumentoCierreRequest>{
        
        let datos = {"action": actions.actionAsignarNewCredito ,
        "_ordenDocumento" : idDocumento, 
         "_pagos" : pagos , _numCuotas , _numDiasCuotas , _remision : (origen == 'remision')?true:undefined 
       }; 
        return this.http.post<DocumentoCierreRequest>(this.urlVentas  , datos, httpOptions()) ;
    }
      setPagoDocumentoCompraCredito(origen:string, idDocumento:number  , pagos:DocpagosModel[], _numCuotas = 1 ,  _numDiasCuotas = 30 ):Observable<DocumentoCierreRequest>{
        
        let datos = {"action": actions.actionAsignarNewCompraCredito ,
        "_ordenDocumento" : idDocumento, 
         "_pagos" : pagos , _numCuotas , _numDiasCuotas , _remision : (origen == 'remision')?true:undefined 
       }; 
        return this.http.post<DocumentoCierreRequest>(this.urlVentas  , datos, httpOptions()) ;
    } 
     setPagoDocumentoCompraCreditoEdit(origen:string,   pagos:DocpagosModel[], _numCuotas = 1 ,  _numDiasCuotas = 30 , 
        doc:DocumentosModel):Observable<DocumentoCierreRequest>{
        
        let datos = {"action": actions.actionAsignarNewCompraCreditoEdicion ,
        "_ordenDocumento" : doc.orden, 
        "_fecha":doc.fecha , "_establecimiento" : doc.establecimiento , "_proveedor":doc.cliente,
        "_facturaExterna": doc.campo_info_3 ,
         "_pagos" : pagos , _numCuotas , _numDiasCuotas , _remision : (origen == 'remision')?true:undefined 
       }; 
        return this.http.post<DocumentoCierreRequest>(this.urlVentas  , datos, httpOptions()) ;
    } 

    private normalizeWrappedRecords<T>(response: ApiResponse<GenericRecordsPayload<T>>): ApiResponse<GenericRecordsPayload<T>> {
        return {
            ...response,
            data: {
                ...response.data,
                records: (response.data.records ?? []).map((item: any) => item?.obj ?? item),
                count: response.data.count ?? 0,
            },
        };
    }
    setCajasAUsuarios(idUsuario:number , cajas:number[] ):Observable<ApiResponse<{ message: string; assignedBoxIds: number[]; inserted: number; deleted: number }>>{
        let datos = {"action": actions.actionAsignarCajas ,
        "_idUsuario" : idUsuario, 
         "_cajas" : cajas
       }; 
        return this.http
          .post<ApiResponse<{ message: string; assignedBoxIds: number[]; inserted: number; deleted: number }>>(this.configService.url.action , datos, httpOptions());
    }
    setCaja(caja:cajaModel){
        let datos ;
        let  arraydatos ;
        if (caja.id != undefined &&  caja.id  > 0 ){
            let where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : caja.id }]
            arraydatos =  {  "nombre" : caja.nombre  ,
            "descripcion" : caja.descripcion,
            "estadoGeneral" : caja.estadoGeneral,
            "estadoCaja" : caja.estadoCaja ,
            "fechaEstadoGeneral" : caja.fechaEstadoGeneral,
            "fechaEstadoCaja" : caja.fechaEstadoCaja ,
            "usuarioEstadoCaja" : caja.usuarioEstadoCaja,
            "usuarioEstadoGeneral" : caja.usuarioEstadoGeneral,
            "cuentaContableGastos" : caja.cuentaContableGastos,
            "cuentaContableEfectivo" : caja.cuentaContableEfectivo,
            "establecimiento" : caja.establecimiento};
            
            datos = {"action": actions.actionUpdate ,
            "_tabla" : TABLA.caja, "_where" : where ,
            "_arraydatos" : arraydatos
           };
        }
        else{
            arraydatos =  { "id" : caja.id  ,
            "nombre" : caja.nombre  ,
            "descripcion" : caja.descripcion,
            "estadoGeneral" : caja.estadoGeneral,
            "estadoCaja" : caja.estadoCaja ,
            "fechaEstadoGeneral" : caja.fechaEstadoGeneral,
            "fechaEstadoCaja" : caja.fechaEstadoCaja ,
            "usuarioEstadoCaja" : caja.usuarioEstadoCaja,
            "cuentaContableGastos" : caja.cuentaContableGastos,
            "cuentaContableEfectivo" : caja.cuentaContableEfectivo,
            "usuarioEstadoGeneral" : caja.usuarioEstadoGeneral}
            datos = {"action": actions.actionInsert ,
            "_tabla" : TABLA.caja,
            "_arraydatos" : arraydatos
           };
        }  
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
        

        
    }
    setConsecutivo(contador:Contador){
        let datos ;
        let reso = (contador.resolucion != undefined)? contador.resolucion: '';
        let fecha1  = new Date();
        let fecha2  = new Date()
        if (reso != ''){
              fecha1 = contador.fechaInicioResolucion!;
              fecha2 = contador.fechaFinResolucion!;
        }
        let  arraydatos ;  
            arraydatos =  {  
            "codContador" : contador.codContador  ,
            "establecimiento" : contador.establecimiento,
            "tipoContador" : contador.tipoContador ,
            "desde" : contador.desde ,
            "hasta" : contador.hasta ,
            "resolucion":reso,
            "fechaInicio":fecha1,
            "fechaFin":fecha2,
            "USUARIO_LOGUEADO" : '0',
        }
            datos = {"action": actions.actionProcedure ,
            "_procedure" : PROCEDURE.insertaContador,
            "_arraydatos" : arraydatos
           }; 
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
        

        
    }

    
    setTipoEstablecimiento(newEsta:TiposEstablecimientosModel){
        let datos ;
        let  arraydatos ;
        if (newEsta.estado === 0) newEsta.estado = 1;
        //id, nombre, descripcion, tipo, fecha_creacion, usuario_creacion, estado
        if (newEsta.id > 0 ){
            let where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : newEsta.id }]
            arraydatos =  {  "nombre" : newEsta.nombre  ,
            "descripcion" : newEsta.descripcion,
            "estado" : newEsta.estado ,
            "usuario_creador" : 'USUARIO_LOGUEADO' };
            
            datos = {"action": actions.actionUpdate ,
            "_tabla" : TABLA.tipoEstablecimiento, "_where" : where ,
            "_arraydatos" : arraydatos
           };
        }
        else{
            arraydatos =  { "id" : newEsta.id  , 
			"nombre" : newEsta.nombre  ,
            "descripcion" : newEsta.descripcion,
            "estado" : newEsta.estado ,
            "usuario_creador" : 'USUARIO_LOGUEADO' }
            datos = {"action": actions.actionInsert ,
            "_tabla" : TABLA.tipoEstablecimiento,
            "_arraydatos" : arraydatos
           };
        }  
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
        

        
    }
    setEstablecimiento(newEsta:establecimientoModel){
        let datos ;
        let  arraydatos ;
        //id, nombre, descripcion, tipo, fecha_creacion, usuario_creacion, estado
        if (newEsta.id > 0 ){
            let where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : newEsta.id }]
            arraydatos =  {  "nombre" : newEsta.nombre  ,
            "descripcion" : newEsta.descripcion,
            "tipo" : newEsta.tipo,
            "estado" : newEsta.estado ,
            "idAuxiliar" : newEsta.idAuxiliar ,
            "idBodegaStock" : newEsta.idBodegaStock ,
            "idBodegaVitual" : newEsta.idBodegaVitual ,
            "nombreAuxiliar" : newEsta.nombreAuxiliar ,
            "NameBodegaStock" : newEsta.NameBodegaStock ,
            "NameBodegaVirtual" : newEsta.NameBodegaVirtual ,
            "idRetefuenteCompra" : newEsta.idRetefuenteCompra ,
            "idCCntCCobrar" : newEsta.idCCntCCobrar ,
            "idCCntCPagar" : newEsta.idCCntCPagar , 
            "idCCntIvaCompra" :newEsta.idCCntIvaCompra,
            "idCCnttIvaVenta" :newEsta.idCCnttIvaVenta,
            "idCCntCostoVenta" :newEsta.idCCntCostoVenta,
            idRetefuenteVenta: newEsta.idRetefuenteVenta, 
            idDescuentoCompra : newEsta.idDescuentoCompra, 
            idDescuentoVenta :newEsta.idDescuentoVenta ,
            'idCCntVenta':newEsta.idCCntVenta,
            'idCCntIngDifBonoRegalo':newEsta.idCCntIngDifBonoRegalo,
            'idCCntCajaGeneral':newEsta.idCCntCajaGeneral,
            tel1: newEsta.tel1 ,
            tel2: newEsta.tel2 ,
            direccion: newEsta.direccion  ,
            pais: newEsta.pais ,
            departamento: newEsta.departamento  ,
            ciudad: newEsta.ciudad  ,
            nit: newEsta.nit  ,
            logo: newEsta.logo   , 
            "usuario_creacion" : 'USUARIO_LOGUEADO' };
        
            
            datos = {"action": actions.actionUpdate ,
            "_tabla" : TABLA.establecimiento, "_where" : where ,
            "_arraydatos" : arraydatos
           };
        }
        else{
            arraydatos =  {  
			"nombre" : newEsta.nombre  ,
            "descripcion" : newEsta.descripcion,
            "idAuxiliar" : newEsta.idBodegaStock ,
            "idBodegaStock" : newEsta.idBodegaStock ,
            "idBodegaVitual" :newEsta.idBodegaStock ,
            "idRetefuenteCompra" : newEsta.idRetefuenteCompra ,
            "idCCntCCobrar" : newEsta.idCCntCCobrar ,
            "idCCntCPagar" : newEsta.idCCntCPagar ,  
            "idCCntIvaCompra" :newEsta.idCCntIvaCompra,
            "idCCnttIvaVenta" :newEsta.idCCnttIvaVenta,
            "idCCntCostoVenta" :newEsta.idCCntCostoVenta,
            'idCCntIngDifBonoRegalo':newEsta.idCCntIngDifBonoRegalo,
            'idCCntCajaGeneral':newEsta.idCCntCajaGeneral, 
            idRetefuenteVenta: newEsta.idRetefuenteVenta, idDescuentoCompra : newEsta.idDescuentoCompra, idDescuentoVenta :newEsta.idDescuentoVenta ,
            'idCCntVenta':newEsta.idCCntVenta,
            "tipo" : newEsta.tipo,
            "estado" : newEsta.estado ,
            tel1: newEsta.tel1 ,
            tel2: newEsta.tel2 ,
            direccion: newEsta.direccion  ,
            pais: newEsta.pais ,
            departamento: newEsta.departamento  ,
            ciudad: newEsta.ciudad  ,
            nit: newEsta.nit  ,
            logo: newEsta.logo   , 
            "usuario_creacion" : 'USUARIO_LOGUEADO' }
            datos = {"action": actions.actionInsert ,
            "_tabla" : TABLA.establecimiento,
            "_arraydatos" : arraydatos
           };
        } 
        
       // (datos);
       
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
        

        
    }

/////////////////////////////////////////////////
setMedioDePago(newMedio:MediosDePagoModel){
    let datos ;
    let  arraydatos ;
    let  action ;
    let where = null;
    //id, nombre, descripcion, tipo, fecha_creacion, usuario_creacion, estado
    if (newMedio.id > 0 ){
          where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : newMedio.id }] ;
        action = actions.actionUpdate ;
    }
    else{ 
        action =  actions.actionInsert;
    } 
    arraydatos =  {  "nombre" : newMedio.nombre  ,
    "descripcion" : newMedio.descripcion, 
    "estado" : newMedio.estado , 
    "cuentaContable" : newMedio.cuentaContable ,
    "establecimiento" : newMedio.establecimiento  ,
    "usuario_creacion" : 'USUARIO_LOGUEADO' };
    datos = {"action":action ,
    "_tabla" : TABLA.medios, "_where" : where,
    "_arraydatos" : arraydatos
   };
   return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
    

    
}
////////////////////////////////////////////////////////////

 PadLeft(value:any, length:number):string {
    return (value.toString().length < length) ? this.PadLeft("0" + value, length) : 
    value;
}
  
 
      
}
 
