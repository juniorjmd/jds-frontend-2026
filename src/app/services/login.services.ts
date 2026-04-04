import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RecursoDetalle, Usuario } from '../interfaces/usuario.interface';
import { actions } from '../models/app.db.actions';
import { httpOptions } from '../models/app.db.url';
import { map, Observable } from 'rxjs';
import { CustomConsole } from '../models/CustomConsole';
import { ConfigService } from './config.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import {
  AuthCurrentUserData,
  AuthLoginData,
  AuthPasswordResetData,
  AuthPasswordUpdateData,
  AuthSessionData,
} from '../interfaces/auth-response.interface';


@Injectable({
    providedIn: 'root'
})
export class LoginService {
 usuario!:Usuario;
    private permisosUsuario : RecursoDetalle[] = [];

    // private _configService = inject(configService); 
constructor(private http: HttpClient ,  private configService:ConfigService){ 
        CustomConsole.log('servicios loguin inicializado');        
    }

    async digestMessage(message:any) {
        const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
        const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
        return hashHex;
      }

    /*
    
    */  
    getLogin( L_usuario: string , L_contraseña: string): Observable<AuthLoginData> {
        const datos = {"action": actions.actionlogin ,
                    "_password" : L_contraseña,
                    "_usuario" : L_usuario
                };
        CustomConsole.log('servicios datos iniciales inicializado ' ,this.configService.url.login , datos, this.configService.url.httpOptionsSinAutorizacion);
        return this.http
          .post<ApiResponse<AuthLoginData>>(this.configService.url.login , datos, this.configService.url.httpOptionsSinAutorizacion)
          .pipe(map((response) => response.data));
    } 


    private getPermisos(idPerfil:number):RecursoDetalle[]{
        return this.permisosUsuario;
    }
    private getLlaveRegistro(){
        return this.usuario.key_registro;
    }
    getUsuarioLogeado(): Observable<AuthSessionData> {
        const datos = {"action": actions.actionValidarKeylogin ,
                    "_llaveSession" : localStorage.getItem('sis41254#2@')
                };
        CustomConsole.log('validar llave de session inicializado ' ,this.configService.url.login , datos,         this.configService.url.httpOptionsSinAutorizacion);
        return this.http
          .post<ApiResponse<AuthSessionData>>(this.configService.url.login , datos, httpOptions())
          .pipe(map((response) => response.data));
    }
    

    setRenovacionContrasena(_usuario:string):Observable<AuthPasswordResetData>{
      const datos = {"action": actions.actionResetearPass ,
                  _usuario
              };
      CustomConsole.log('setRenovacionContrasena inicializado ' ,this.configService.url.login , datos,         this.configService.url.httpOptionsSinAutorizacion);
      return this.http
        .post<ApiResponse<AuthPasswordResetData>>(this.configService.url.login , datos, httpOptions())
        .pipe(map((response) => response.data));
  }


    getUsuarioLogeadoObs(invoker: string = ''): Observable<AuthSessionData> {
        const datos = {
          "action": actions.actionValidarKeylogin,
          "_llaveSession": localStorage.getItem('sis41254#2@'),
          "_invoker": invoker
        };
        CustomConsole.log('validar llave de session <observable> inicializado', this.configService.url.login, datos, this.configService.url.httpOptionsSinAutorizacion);
        return this.http
          .post<ApiResponse<AuthSessionData>>(this.configService.url.login, datos, httpOptions())
          .pipe(map((response) => response.data));
      }

    // async  getUsuarioLogeadoAsync(invoker :string = '')
    // {       
    //     let datos = {"action": actions.actionValidarKeylogin ,
    //     "_llaveSession" : localStorage.getItem('sis41254#2@')  ,"_invoker": invoker };
    //     CustomConsole.log('validar llave de session inicializado ' ,this.configService.url.login , datos, this.configService.url.httpOptionsSinAutorizacion);
    //     return await   this.http.post(this.configService.url.login , datos, httpOptions()).toPromise() ; 
    // }
     getUsuarioLogeadoAsync(invoker: string = ''): Observable<AuthSessionData> {
        const datos = {
          action: actions.actionValidarKeylogin,
          _llaveSession: localStorage.getItem('sis41254#2@'),
          _invoker: invoker
        };
      CustomConsole.log('validar llave de session inicializado', this.configService.url.login, datos, this.configService.url.httpOptionsSinAutorizacion);
        return this.http
          .post<ApiResponse<AuthSessionData>>(this.configService.url.login, datos, httpOptions())
          .pipe(map((response) => response.data));
      } 
      
  SET_PASS_USUARIO( _id_usuario:number, _pass:string): Observable<AuthPasswordUpdateData> {
        const datos = {
          action: actions.actionSetPass, _id_usuario, _pass
        };
        return this.http
          .post<ApiResponse<AuthPasswordUpdateData>>(this.configService.url.login, datos, httpOptions())
          .pipe(map((response) => response.data));
      }
  getDatosUsuarioLogeado(invoker: string = ''): Observable<AuthCurrentUserData> {
        const datos = {
          action: actions.actionGetUsuarioActual,
          _llaveSession: localStorage.getItem('sis41254#2@'),
          _invoker: invoker
        };
        CustomConsole.log('validar llave de session inicializado', this.configService.url.login, datos, this.configService.url.httpOptionsSinAutorizacion);
        return this.http
          .post<ApiResponse<AuthCurrentUserData>>(this.configService.url.login, datos, httpOptions())
          .pipe(map((response) => response.data));
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
    }
 
