import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { actions } from '../models/app.db.actions';
import { httpOptions, url } from '../models/app.db.url';
import { vistas } from '../models/app.db.view'; 
import { CustomConsole } from '../models/CustomConsole';
import { ConfigService } from './config.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { GenericRecordsPayload } from '../interfaces/generic-response.interface';
import { DomiciliosModel } from '../models/domicilios/domicilios.model';

@Injectable({
  providedIn: 'root'
})
export class DomiciliosService { 

  // private _configService = inject(configService); 
constructor(private http: HttpClient,  private configService:ConfigService ) {  
  }
  
  getListadosDomicilios(){
    let datos = {"action": actions.actionSelect ,
                 "_tabla" : vistas.domicilios ,                 
                 "_obj" : ['objetoDocumento'],  
                };
    CustomConsole.log('servicios de domicilios - getListadosDomicilios' ,this.configService.url.action , datos, httpOptions());
    return this.http.post<ApiResponse<GenericRecordsPayload<DomiciliosModel>>>(this.configService.url.action , datos, httpOptions()) ;
} 
}
