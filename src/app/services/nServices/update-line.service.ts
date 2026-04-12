import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ambiente } from 'src/app/modules/shared/shared.module';

import { httpOptions } from 'src/app/models/app.db.url';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ConfigService } from '../config.service';
@Injectable({
  providedIn: 'root'
})
export class UpdateLineService {
  configService =  inject(ConfigService)

  requestOptions:any;
  //urlBase = ambiente.urlBaseBack;

private readonly urlBase:string = this.configService.url.action ;
/*private readonly   urlInventario =  `${this.baseUrl}inventario/`;
private readonly   urlVentas =  `${this.baseUrl}ventas/`;*/

  optHeader = httpOptions()

  constructor(private http: HttpClient) {
    CustomConsole.log('clientes actualizar linea tabla inicializado');

  }



editRegistro(id:number, modelo:any , origen:string){
  let urlBack = `${this.urlBase}${origen}/${id}`  ;
  return this.http.put(urlBack, modelo);
}


deleteRegistro(id:number, origen:string){
  let urlBack = `${this.urlBase}${origen}/${id}`  ;
  return this.http.delete(urlBack);
}
}
