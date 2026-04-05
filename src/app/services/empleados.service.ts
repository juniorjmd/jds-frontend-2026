import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { fechaBusqueda } from '../interfaces/generales.interface';
import { actions } from '../models/app.db.actions';
import { TABLA } from '../models/app.db.tables';
import { httpOptions, url } from '../models/app.db.url';
import { vistas } from '../models/app.db.view';
import { EmpleadoModel } from '../models/empleados/empleados.module';
import { TiposEmpleadoModule } from '../models/tipos-empleado/tipos-empleado.module';
import { CustomConsole } from '../models/CustomConsole';
import { ConfigService } from './config.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { GenericRecordsPayload, GenericMutationPayload } from '../interfaces/generic-response.interface';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {

  // private _configService = inject(configService); 
constructor(private readonly http: HttpClient ,  private configService:ConfigService) { }
  
  getTiposEmpleados(){
    let datos = {"action": actions.actionSelect ,
                 "_tabla" : vistas.empleados_tipo ,   
                };
    CustomConsole.log('servicios de empleados - getTiposEmpleados' ,this.configService.url.action , datos, httpOptions());
    return this.http.post<ApiResponse<GenericRecordsPayload<TiposEmpleadoModule>>>(this.configService.url.action , datos, httpOptions()) ;
} 

getEmpleados(){
  let datos = {"action": actions.actionSelect ,
               "_tabla" : vistas.empleados,
               "_columnas" : ['objeto']   ,
               "_obj" : ['objeto'],             
              };
  CustomConsole.log('servicios de empleados - getEmpleados' ,this.configService.url.action , datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<{ objeto: EmpleadoModel }>>>(this.configService.url.action , datos, httpOptions()) ;
}


  getEmpleadosLavador(){
  let where = [{"columna" : "tipo" , "tipocomp" : '=f' , "dato" :  "getIdEmpleadoPorTipNombre('operario')" ,"relacion" : 'or'  },
    {"columna" : "tipo" , "tipocomp" : '=f' , "dato" :  "getIdEmpleadoPorTipNombre('operario vendedor')" 
      }
  ]
  let datos = {"action": actions.actionSelect ,
               "_tabla" : vistas.empleados,
               "_where" : where , 
               "_columnas" : ['objeto']   ,
               "_obj" : ['objeto'],             
              };
  CustomConsole.log('servicios de empleados - getEmpleados' ,this.configService.url.action , datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<EmpleadoModel>>>(this.configService.url.action , datos, httpOptions()) ;
} 



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
  return this.http.post<ApiResponse<GenericRecordsPayload<{ obj: any; valor: string; porcDescMaximo: number }>>>(this.configService.url.action , datos, httpOptions()) ;
} 




guardarAnticipoEmpleado(nuevoTipo:EmpleadoModel , valor:any , descripcion:string ){  
   let arrayDatos:any=new Object()  
  //id, cod_servicio, cod_tipo_vehiculo, valor, estado
  /* arraydatos =  {  "nombre" : newEsta.nombre  ,
  "descripcion" : newEsta.descripcion,
  "estado" : newEsta.estado ,
  "usuario_creador" : 'USUARIO_LOGUEADO' };
   codEmpleado, idUsuario, descripcion,  porConceptoDe,
 totalParcial,  totalPagado
  */
  arrayDatos['codEmpleado'] = nuevoTipo.id; 
  arrayDatos['idUsuario'] =  'USUARIO_LOGUEADO'; 
  arrayDatos['descripcion'] = descripcion; 
  arrayDatos['porConceptoDe'] = 'Anticipo Generado Desde la aplicacion';
  arrayDatos['totalParcial'] = valor; 
  arrayDatos['totalPagado'] = valor;  

  let datos = {"action": actions.actionInsert ,
    "_tabla" : TABLA.empleados_pagos_anticipos,
    "_arraydatos" : arrayDatos,
    "_where":null
   }; 
  
  CustomConsole.log('servicios de creacion anticipos empleados' ,this.configService.url.action , datos, httpOptions());
  return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
 }

guardarEmpleado(nuevoTipo:EmpleadoModel){ 
  let arrayDatos:any=new Object() 
  let where:any[] = [] 
  arrayDatos['idPersona'] = nuevoTipo.idPersona;
  arrayDatos['estado'] = nuevoTipo.estado; 
  arrayDatos['monto_dia'] = nuevoTipo.monto_dia; 
  arrayDatos['porcentaje_servicio'] = nuevoTipo.porcentaje_servicio ; 
  arrayDatos['porcentaje_productos'] = nuevoTipo.porcentaje_productos; 
  arrayDatos['tipo'] = nuevoTipo.tipo; 

  let datos:any = {"action": actions.actionInsert ,
    "_tabla" : TABLA.empleados,
    "_arraydatos" : arrayDatos,
    "_where":null
   };
  if ( typeof( nuevoTipo.id )!== 'undefined' ){//actualiza
    where = [{"columna" : "id" , "tipocomp" : '=' , "dato" : nuevoTipo.id}]
    datos._arraydatos.idPersona = null; 
    datos._where = where;
    datos.action = actions.actionUpdate
  }
  
  CustomConsole.log('servicios de creacion servicios de vehiculos activo' ,this.configService.url.action , datos, httpOptions());
  return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
 }


guardarPagoEmpleado(empleado:EmpleadoModel , fechas:fechaBusqueda){ 

  /** "fecha1"=>$_FECHA_1 , 
 * "fecha2" =>  $_FECHA_2, 
 *  "empleadoId" =>  $_EMPLEADO_ID, 
 * "total_pago" =>  $_TOTAL_PAGO, 
 *  "total_descuento" =>  $_TOTAL_DESCUENTO*/

//INSERTAR_PAGO_EMPLEADO
  let arrayDatos=new Object() 
  let where:any[] = []
  //id, cod_servicio, cod_tipo_vehiculo, valor, estado 

  let datos = {"action": actions.action_insertar_pagos , 
  "_FECHA_1" : fechas.fechaInicio, 
  "_FECHA_2" : fechas.fechaFin,
  "_EMPLEADO_ID" : empleado.id , 
  "_TOTAL_PAGO" : empleado.TotalAcumuladoPendientes , 
  "_TOTAL_DESCUENTO" : empleado.valorADescontarEnPago  
   };
  
  
  CustomConsole.log('servicios de creacion de pagos a empleados' ,this.configService.url.action , datos, httpOptions());
  return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
 }

 getErrorMessage(error: any): string {
  const rawApiError = error?.error?.error;
  const apiMessage = typeof rawApiError === 'string' ? rawApiError : rawApiError?.message;
  return apiMessage || error?.error?.message || error?.message || 'Error inesperado';
 }


}
