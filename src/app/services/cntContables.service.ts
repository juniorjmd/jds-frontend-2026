import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core'; 

import { httpOptions, url } from '../models/app.db.url';
import { BehaviorSubject, map, Observable } from 'rxjs';
import {  cntClaseRequest, cntCuentaMayorRequest, cntDocOperacionesRequest, cntGrupoRequest, cntMovCuentasRequest, cntOperacionesRequest,  cntSubCuentaRequest, cntSubCuentaVwRequest, cntTipDocOperacionesRequest, cntTransaccionesRequest, cntTrasladosRequest, ejecucionTrasladosRequest, soporteMovimientoCntRequest, trasladosCntRequest } from '../interfaces/producto-request';
import { actions } from '../models/app.db.actions';
import { vistas } from '../models/app.db.view';
import { CntGruposModel } from '../models/cnt-grupos/cnt-grupos.module';
import { CntClasesModel } from '../models/cnt-clases/cnt-clases.module';
import { CntCuentaMModel } from '../models/cnt-cuenta-m/cnt-cuenta-m.module';
import { vwCntSubCuentaModel } from '../models/cnt-sub-cuenta/cnt-sub-cuenta.module';
import { CntOperacionesModel } from '../models/cnt-operaciones/cnt-operaciones.module';
import { TABLA } from '../models/app.db.tables';
import { TransaccionesModel } from '../models/transacciones/transacciones.module';
import { TrasladosCuentasModel } from '../models/trasladosCuentas.';
import { CustomConsole } from '../models/CustomConsole';
import { ConfigService } from './config.service';
import { AdminOperationResponse } from '../interfaces/admin-response.interface';

@Injectable({
  providedIn: 'root'
})
export class CntContablesService {

  urlVentas = this.configService.url.action + "ventas/";


  private grupoSource = new BehaviorSubject<CntGruposModel[]|null>(null);
  currentCntGrupo = this.grupoSource.asObservable();
  private claseSource = new BehaviorSubject<CntClasesModel[]|null>(null);
  currentCntClase = this.claseSource.asObservable();
  private cuentaMSource = new BehaviorSubject<CntCuentaMModel[]|null>(null);
  currentCntcuentaM = this.cuentaMSource.asObservable(); 
  private subcuentaSource = new BehaviorSubject<vwCntSubCuentaModel[]|null>(null);
  currentsubcuenta = this.subcuentaSource.asObservable();  
  private operacionSource = new BehaviorSubject<CntOperacionesModel|null>(null);
  currentoperacion = this.operacionSource.asObservable();
 
constructor(private http: HttpClient, private configService :ConfigService, ) {  
    CustomConsole.log('servicios cuentas contables inicializado');  
  }

  getTrasladoByType(tipo:string){ 
    
    let datos = {"action": actions.actionSelect , 
      "_tabla" : TABLA.operaPrestablecidas,
      "_where" : [{"columna" : "tipo" , "tipocomp" : "=" , "dato" : tipo } ]
     }; 
     return this.http.post<trasladosCntRequest>(this.configService.url.action , datos, httpOptions()) ;
  }

  

  setNewOperacion(_operacion:CntOperacionesModel){ 
    let datos = {"action": actions.action_generar_nueva_operacion ,
      _operacion
   };
   CustomConsole.log('setNewOperacion' ,this.configService.url.actionAdmin , datos, httpOptions());
   return this.http.post<AdminOperationResponse>(this.configService.url.actionAdmin , datos, httpOptions()).pipe(
    map((response) => ({
      error: 'ok',
      message: response.data.message,
      operationId: response.data.operationId,
      operation: response.data.operation,
    }))
   );
  }

  deleteItemListadoOprPre(dato:any){ 
    let where =   [{"columna" : "id" , "tipocomp" : "=" , dato}   ];
    let datos = {"action": actions.actionDelete ,
    "_tabla" : TABLA.operaPrestablecidas,
    "_where" : where  
   };
   CustomConsole.log('borrar tablas operaPrestablecidas ' ,this.configService.url.action , datos, httpOptions());
   return this.http.post(this.configService.url.action , datos, httpOptions()) ;
  }
  
  deleteListadoOprTmp(){ 
    let where =   [{"columna" : "usuario" , "tipocomp" : "=" , "dato" : 'USUARIO_LOGUEADO'}   ];
    let datos = {"action": actions.actionDelete ,
    "_tabla" : TABLA.transacciones_tmp,
    "_where" : where  
   };
   CustomConsole.log('borrar tablas temporales por usuario ' ,this.configService.url.action , datos, httpOptions());
   return this.http.post(this.configService.url.action , datos, httpOptions()) ;
  }

  deleteItemListadoOprTmp(dato:any){ 
    let where =   [{"columna" : "cod_transaccion" , "tipocomp" : "=" , dato}   ];
    let datos = {"action": actions.actionDelete ,
    "_tabla" : TABLA.transacciones_tmp,
    "_where" : where  
   };
   CustomConsole.log('borrar tablas temporales por id ' ,this.configService.url.action , datos, httpOptions());
   return this.http.post(this.configService.url.action , datos, httpOptions()) ;
  }

  changeOperacion(operacion: CntOperacionesModel) {
    this.operacionSource.next(operacion);
  }
  changeClase(clase: any) {
    this.claseSource.next(clase);
  }
  changeGrupo(grupo: any) {
    this.grupoSource.next(grupo);
  }
  changeCuentasM(cuenta: any) {
    this.cuentaMSource.next(cuenta);
  }
  changeSubCuenta(clase: any) {
    this.subcuentaSource.next(clase);
  }
  
  getMediosCajaActiva(){
    let datos = {"action": actions.actionSelectPorUsuario ,
                 "_tabla" : vistas.mediosPorCajaActiva,
                 "_columnaUsuario": 'usuarioCaja'
                };
    CustomConsole.log('servicios de cajas activo ' ,this.configService.url.action , datos, httpOptions());
    return this.http.post(this.configService.url.action , datos, httpOptions()) ;
} 
getCntTransaccionesTmp():Observable<cntTransaccionesRequest>{
  let datos = {"action": actions.actionSelectPorUsuario , 
    "_tabla" : vistas.vw_transacciones_tmp,
    "_columnaUsuario": 'usuario'
   }; 
   
   CustomConsole.log('getCntTransaccionesTmp',this.configService.url.action , datos, httpOptions()) ;
   return this.http.post<cntTransaccionesRequest>(this.configService.url.action , datos, httpOptions()) ;
}



setCntTransaccionesTmp(data:TransaccionesModel):Observable<any>{
  
  let datos ;
  let  arraydatos ; 
  if (data.cod_transaccion !== undefined &&  data.cod_transaccion > 0 ){ 

    let where =   [{"columna" : "cod_transaccion" , "tipocomp" : "=" , "dato" : data.cod_transaccion }]
    arraydatos =  { 
      "id_cuenta" : data.id_cuenta  ,
      "valor_credito" : data.valor_credito,
      "valor_debito" : data.valor_debito,};
    datos = {"action": actions.actionUpdate ,
      "_tabla" : TABLA.transacciones_tmp, "_where" : where ,
      "_arraydatos" : arraydatos
     };
  }else{
    arraydatos =  {  
      "id_cuenta" : data.id_cuenta  ,
      "valor_credito" : data.valor_credito,
      "valor_debito" : data.valor_debito,
      "fecha_transaccion" : data.fecha_transaccion ,
      "relacion_tabla" : data.relacion_tabla,
      "usuario" : 'USUARIO_LOGUEADO'}
    datos = {"action": actions.actionInsert ,
      "_tabla" : TABLA.transacciones_tmp,
      "_arraydatos" : arraydatos
     };
  } 
  CustomConsole.log('setCntTransaccionesTmp',this.configService.url.action , datos);
  
   return this.http.post<any>(this.configService.url.action , datos, httpOptions()) ;
}

 setTraslado(data:TrasladosCuentasModel):Observable<any>{
 let datos = {"action": actions.crearTraslados ,
    "_tabla" : TABLA.transacciones_tmp,
    "_arraydatos" : data
   };
 
CustomConsole.log('setCntTransaccionesTmp',this.configService.url.actionAdmin , datos);

 return this.http.post<AdminOperationResponse>(this.configService.url.actionAdmin , datos, httpOptions()).pipe(
  map((response) => ({
    error: 'ok',
    message: response.data.message,
    objeto: response.data.objeto,
  }))
 ) ;
 }
 


  getCuentasTrasladosPree(idTraslado:number):Observable<cntTrasladosRequest>{
    let _where =  [{"columna" : "id_opp" , "tipocomp" : "=" , "dato" :idTraslado}]  ; 
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.operaPrestablecidasCuentas,
       _where 
     }; 
     return this.http.post<cntTrasladosRequest>(this.configService.url.action , datos, httpOptions()) ;
  }

  getCuentasTrasladosPreeEjecucion(idTraslado:number):Observable<cntTrasladosRequest>{
    let _where =  [{"columna" : "id_opp" , "tipocomp" : "=" , "dato" :idTraslado}]  ; 
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.operaPrestablecidasCuentasConSaldo,
       _where 
     }; 
     return this.http.post<cntTrasladosRequest>(this.configService.url.action , datos, httpOptions()) ;
  }

  ejecutarTrasladosCuentas(idTraslado:TrasladosCuentasModel):Observable<ejecucionTrasladosRequest>{
     let datos = {"action": actions.ejecutarTraslados , 
      "_arraydatos" : idTraslado
     }; 
     CustomConsole.log('ejecutarTrasladosCuentas' , this.configService.url.actionAdmin , datos, httpOptions())
     return this.http.post<AdminOperationResponse>(this.configService.url.actionAdmin , datos, httpOptions()).pipe(
      map((response) => ({
        error: 'ok',
        objeto: response.data.objeto as any,
      }))
     );
  }
  bucarSoporteMovimiento(idTraslado:number):Observable<soporteMovimientoCntRequest>{
    let where = [{"columna" : "cod_comprobante" , "tipocomp" : '=' , "dato" :  idTraslado } ]
    let datos = {"action": actions.actionSelect ,
      "_tabla" : vistas.vw_operaciones_obj,
      "_where" : where , 
      "_obj" : ['obj'],  
      "_columnas": ['obj'],           
     };
    CustomConsole.log('bucarSoporteMovimiento' , this.configService.url.action , datos, httpOptions())
    return this.http.post<soporteMovimientoCntRequest>(this.configService.url.action , datos, httpOptions()) ;
 }
/**
 * 
getEmpleadosAcumulados( id:number|string , fechas:fechaBusqueda){
  let where = [{"columna" : "cod_empleado" , "tipocomp" : '=' , "dato" :  id },
  {"columna" : "fecha" , "tipocomp" : '>=' , "dato" :  fechas.fechaInicio },
  {"columna" : "fecha" , "tipocomp" : '<=' , "dato" :  fechas.fechaFin }
]
  let datos = {"action": actions.actionSelect ,
               "_tabla" : vistas.acumulados_por_empleado,
               "_where" : where , 
               "_obj" : ['obj'],             
              };
  CustomConsole.log('servicios de empleados - getEmpleadosAcumulados' ,this.configService.url.action , datos, httpOptions());
  return this.http.post(this.configService.url.action , datos, httpOptions()) ;
} 

 * 
*/





  getCntGrupos():Observable<cntGrupoRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_grupos,
      "_where" : []
     }; 
     return this.http.post<cntGrupoRequest>(this.configService.url.action , datos, httpOptions()) ;
  }
  getCntClases():Observable<cntClaseRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_clase,
      "_where" :[]
     }; 
     return this.http.post<cntClaseRequest>(this.configService.url.action , datos, httpOptions()) ;
  }
  getCntCuentasMayores():Observable<cntCuentaMayorRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_cuenta_mayores
     }; 

    CustomConsole.log('getCntCuentasMayores' , this.configService.url.action , datos, httpOptions())
     return this.http.post<cntCuentaMayorRequest>(this.configService.url.action , datos, httpOptions()) ;
  }
  setNewSubCuenta(subCnt:vwCntSubCuentaModel){
    let datos ;
    
    let  arraydatos ;
    
    if (subCnt.id_scuenta != undefined && subCnt.id_scuenta  > 0 ){
      
        let where =   [{"columna" : "id_cuenta" , "tipocomp" : "=" , "dato" : subCnt.id_scuenta }]
        arraydatos =
            { "nro_cuenta": `${subCnt.cod_cuenta}${subCnt.digitoShow}`, 
              "nombre_cuenta":   subCnt.nombre_scuenta        }
        
        datos = {"action": actions.actionUpdate ,
        "_tabla" : TABLA.subCuentasContables, "_where" : where ,
        "_arraydatos" : arraydatos
       };
    }
    else{
      arraydatos =
      { 
        "cod_cuenta": subCnt.cod_cuenta,
        "modificar": "S",   
        "nro_cuenta": `${subCnt.cod_cuenta}${subCnt.digitoShow}`, 
        "nombre_cuenta":   subCnt.nombre_scuenta   
    }
        datos = {"action": actions.actionInsert ,
        "_tabla" : TABLA.subCuentasContables,
        "_arraydatos" : arraydatos
       };

    } 
    
   CustomConsole.log(datos);
   
    return this.http.post(this.configService.url.action , datos, httpOptions()) ;
  }
  getCntCuentas():Observable<cntSubCuentaRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_scuentas,
       _limit: 300,  
      "_where" : [{columna : 'digito' , tipocomp : '>' , dato : 0 }]
     }; 
     return this.http.post<cntSubCuentaRequest>(this.configService.url.action , datos, httpOptions()) ;
  }

  
  getResumenCuentasPorFecha( _idPrd:any[] ,   _fechaInicio: string, _fechaFin: string): Observable<cntMovCuentasRequest> { 
    let datos = {
      "action": actions.resumenCuentas, _fechaInicio,_fechaFin, _idPrd
    };
    CustomConsole.log('servicios de documentos - getResumenVentas', this.configService.url.actionDocumentos, datos, httpOptions());
    return this.http.post<cntMovCuentasRequest>(this.configService.url.actionDocumentos, datos, httpOptions());
  }  
  getCntCuentasCajasAsignadas():Observable<cntSubCuentaRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_cajas_asignadas 
     }; 
     return this.http.post<cntSubCuentaRequest>(this.configService.url.action , datos, httpOptions()) ;
  }
  getCntCuentasGastosAsignadas():Observable<cntSubCuentaRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_gasto_asignadas 
     }; 
     return this.http.post<cntSubCuentaRequest>(this.configService.url.action , datos, httpOptions()) ;
  }
  getCntCuentasConMovimientos():Observable<cntSubCuentaRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_con_movimientos 
     }; 
     return this.http.post<cntSubCuentaRequest>(this.configService.url.action , datos, httpOptions()) ;
  }

  getCntCuentasByIdGrupo(id:number):Observable<cntSubCuentaRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_scuentas, 
      "_where" : [{columna : 'cod_grupo' , tipocomp : '=' , dato : id }
                ,{columna : 'digito' , tipocomp : '>' , dato : 0 }]
     }; 

     return this.http.post<cntSubCuentaRequest>(this.configService.url.action , datos, httpOptions()) ;
  }

  getCntCuentasByIdClase(id:number):Observable<cntSubCuentaRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_scuentas, 
      "_where" : [{columna : 'cod_clase' , tipocomp : '=' , dato : id }
                ,{columna : 'digito' , tipocomp : '>' , dato : 0 }]
     }; 

     return this.http.post<cntSubCuentaRequest>(this.configService.url.action , datos, httpOptions()) ;
  }


  getCntCuentasByIdCM(id:number):Observable<cntSubCuentaVwRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_scuentas, 
      "_where" : [{columna : 'cod_cuenta' , tipocomp : '=' , dato : id }
                ,{columna : 'digito' , tipocomp : '>' , dato : 0 }]
     }; 

     return this.http.post<cntSubCuentaVwRequest>(this.configService.url.action , datos, httpOptions()) ;
  }
  getCntCuentasById(id:number):Observable<cntSubCuentaVwRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_scuentas, 
      "_where" : [{columna : 'id_scuenta' , tipocomp : '=' , dato : id }
                ,{columna : 'digito' , tipocomp : '>' , dato : 0 }]
     }; 

     return this.http.post<cntSubCuentaVwRequest>(this.configService.url.action , datos, httpOptions()) ;
  }
  getCntCuentasByName(id:string):Observable<cntSubCuentaRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_scuentas, 
      "_where" : [{columna : 'nombre_scuenta' , tipocomp : 'like' , dato : id }
                ,{columna : 'digito' , tipocomp : '>' , dato : 0 }]
     }; 

     return this.http.post<cntSubCuentaRequest>(this.configService.url.action , datos, httpOptions()) ;
  }
  getCntOperaciones():Observable<cntOperacionesRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_operaciones 
     }; 
     return this.http.post<cntOperacionesRequest>(this.configService.url.action , datos, httpOptions()) ;
  }
  getCntOperacionesManuales():Observable<cntOperacionesRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_oper_manuales 
     }; 
     return this.http.post<cntOperacionesRequest>(this.configService.url.action , datos, httpOptions()) ;
  }
  getCntOperacionesAuto():Observable<cntOperacionesRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_oper_auto 
     }; 
     return this.http.post<cntOperacionesRequest>(this.configService.url.action , datos, httpOptions()) ;
  } 

 
  getCntOperacionesAutoTipoDocumento( tipdoc:number):Observable<cntOperacionesRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_oper_auto ,
      "_where" : [{columna : 'tipoDocumentoFinal' , tipocomp : '=' , dato : tipdoc }]   
     }; 
     return this.http.post<cntOperacionesRequest>(this.configService.url.action , datos, httpOptions()) ;
  } 
  getCntOperacionesAutoIdDocumento( tipdoc:number):Observable<cntOperacionesRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_cnt_oper_auto ,
      "_where" : [{columna : 'idDocumento' , tipocomp : '=' , dato : tipdoc }]   
     }; 
     return this.http.post<cntOperacionesRequest>(this.configService.url.action , datos, httpOptions()) ;
  } 
  getTipDocOperacionesAuto():Observable<cntTipDocOperacionesRequest>{
    let datos = {"action": actions.actionSelect ,  
      "_tabla": "vw_documento_operaciones",
      "_columnas": ["tipoDocumentoFinal" , "nombreTipoDocumentoFinal"]  ,
      "_groupby": ["tipoDocumentoFinal" , "nombreTipoDocumentoFinal"]  ,
      "_orderby": [["tipoDocumentoFinal" , "DESC"]] 
     }; 
     return this.http.post<cntTipDocOperacionesRequest>(this.configService.url.action , datos, httpOptions()) ;
  }
 getDocumentosOperacionesAuto():Observable<cntDocOperacionesRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla": "vw_documento_operaciones",
 
      "_columnas": ["idDocumento" , "idDocumentoFinal"]  ,
      "_groupby": ["idDocumento" , "idDocumentoFinal"]  ,
      "_orderby": [["idDocumento" , "DESC"]] 
     }; 
     CustomConsole.log('getDocumentosOperacionesAuto',datos);
     
     return this.http.post<cntDocOperacionesRequest>(this.configService.url.action , datos, httpOptions()) ;
  }
  getCntTransacciones( idOperacion:number):Observable<cntTransaccionesRequest>{
    let datos = {"action": actions.actionSelect , 
      "_tabla" : vistas.vw_transacciones ,
    "_where" : [{columna : 'cod_comprobante' , tipocomp : '=' , dato : idOperacion }]     }; 
    CustomConsole.log("getCntTransacciones" , this.configService.url.action , datos, httpOptions())
     return this.http.post<cntTransaccionesRequest>(this.configService.url.action , datos, httpOptions()) ;
  }

  getErrorMessage(error: any): string {
    return error?.error?.error?.message
      ?? error?.error?.error
      ?? error?.message
      ?? 'Error inesperado';
  }
}
