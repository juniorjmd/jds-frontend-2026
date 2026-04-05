import { inject, Injectable } from '@angular/core'; 
import { ciudad, datosMaestros, departamento, maestros, maestroSelect, pais } from '../interfaces/maestros.interface';
import { actions } from '../models/app.db.actions';
import { httpOptions, url } from '../models/app.db.url';
import { vistas } from '../models/app.db.view';
import { HttpClient } from '@angular/common/http';
import { TABLA } from '../models/app.db.tables'; 
import { CustomConsole } from '../models/CustomConsole';
import { ConfigService } from './config.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { GenericRecordsPayload } from '../interfaces/generic-response.interface';
import { ParametrosModel } from '../models/parametros/parametros.model';
import { select } from '../interfaces/generales.interface';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {


  // private _configService = inject(configService); 
constructor(private http: HttpClient,  private configService:ConfigService){ 
    CustomConsole.log('servicios parametros inicializado');        
}

getParametros(){
  let datos = {"action": actions.actionSelect , "_tabla" : TABLA.PARAMETROS,  }
  CustomConsole.log('getParametros  ' ,this.configService.url.action , datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<ParametrosModel>>>(this.configService.url.action , datos, httpOptions()) ;
}


getDatosParametrosTabla(tabla:any , col1:string, col2:string){
  let datos = {"action": actions.actionSelect , "_tabla" : tabla, "_columnas": [col1 , col2] }
  CustomConsole.log('getParametros  ' ,this.configService.url.action , datos, httpOptions());
  return this.http.post<ApiResponse<GenericRecordsPayload<select>>>(this.configService.url.action , datos, httpOptions()) ;
}

getErrorMessage(error: any): string {
  const rawApiError = error?.error?.error;
  const apiMessage = typeof rawApiError === 'string' ? rawApiError : rawApiError?.message;
  return apiMessage || error?.error?.message || error?.message || 'Error inesperado';
}

}
