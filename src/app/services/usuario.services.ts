import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { loading } from 'src/app/models/app.loading';
import { Usuarios } from '../interfaces/usuario.interface';
import { actions } from '../models/app.db.actions';
import { TABLA } from '../models/app.db.tables';
import { httpOptions, url } from '../models/app.db.url';
import { vistas } from '../models/app.db.view';
import { UsuarioModel } from '../models/usuario.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Recurso } from '../interfaces/recurso';
import { perfil, perfilRequest, recursoRequest } from '../interfaces/producto-request';
import { CustomConsole } from '../models/CustomConsole';
import { ConfigService } from './config.service';
import { AdminProfileResourcesResponse, AdminResourcesResponse, AdminUserResponse } from '../interfaces/admin-response.interface';
import { ApiResponse } from '../interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from '../interfaces/generic-response.interface';

@Injectable({
    providedIn: 'root'
})
export class usuarioService {


  private usuarioSource = new BehaviorSubject<any>(null);
  currentUsuario = this.usuarioSource.asObservable();


  private recursosSubject = new BehaviorSubject<Recurso[]>([]);
  recursos$ = this.recursosSubject.asObservable(); // Publica el observable


    // private _configService = inject(configService); 
constructor(private http: HttpClient , private configService:ConfigService,
        private loading : loading ){ 
        CustomConsole.log('servicios usuarios inicializado');  
    }
    

  // Método para actualizar los recursos
  updateRecursos(newRecursos: Recurso[]) {
    this.recursosSubject.next(newRecursos);
  }
    changeUsuario(usuario: any) {
        this.usuarioSource.next(usuario);
      }

      getArrayRecursos():Observable<AdminResourcesResponse>{
        let datos = {"action": actions.getAllRecursosArr   
                    };
        CustomConsole.log('servicios de usuarios activo - getArrayRecursos' ,this.configService.url.actionAdmin , datos, httpOptions());
        return this.http.post<AdminResourcesResponse>(this.configService.url.actionAdmin , datos, httpOptions());
    } 
    
     
      getArrayRecursosByPerfil(_idPerfil:number):Observable<AdminResourcesResponse>{
        let datos = {"action": actions.getAllRecursosArrByPerfil , _idPerfil };
        CustomConsole.log('servicios de usuarios activo - getArrayRecursosByPerfil' ,this.configService.url.actionAdmin , datos, httpOptions());
        return this.http.post<AdminResourcesResponse>(this.configService.url.actionAdmin , datos, httpOptions());
    } 
    
    setArrayRecursos(_perfil:number , _recursos:Recurso):Observable<AdminProfileResourcesResponse>{
        let datos = {"action": actions.setAllRecursosArr  , _perfil ,  _recursos           };
        CustomConsole.log('servicios de usuarios activo - setArrayRecursos' ,this.configService.url.actionAdmin , datos, httpOptions());
        return this.http.post<AdminProfileResourcesResponse>(this.configService.url.actionAdmin , datos, httpOptions());
    } 
    getPerfiles():Observable<ApiResponse<GenericRecordsPayload<perfil>>>{
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : TABLA.perfiles
                    };
        CustomConsole.log('servicios de usuarios activo - getPerfiles' ,this.configService.url.action , datos, httpOptions());
        return this.http.post<ApiResponse<GenericRecordsPayload<perfil>>>(this.configService.url.action , datos, httpOptions()) ;
    } 


    setPerfil(p:perfil):Observable<ApiResponse<GenericMutationPayload>>{
        let datos ;
        let  arraydatos ;
        if (p.id != undefined &&  p.id  > 0 ){
            let where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : p.id }] 
            p.id = undefined
            datos = {"action": actions.actionUpdate ,
            "_tabla" : TABLA.perfiles, "_where" : where ,
            "_arraydatos" : p
           };
        }
        else{
            datos = {"action": actions.actionInsert ,
            "_tabla" : TABLA.perfiles,
            "_arraydatos" : p
           };
        }  
       CustomConsole.log(datos); 
       return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ; 
    }




    getUsuarios():Observable<ApiResponse<GenericRecordsPayload<Usuarios>>>{
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.usuario
                    };
        CustomConsole.log('servicios de usuarios activo - getUsuarios' ,this.configService.url.action , datos, httpOptions());
        return this.http.post<ApiResponse<GenericRecordsPayload<Usuarios>>>(this.configService.url.action , datos, httpOptions()) ;
    } 

    guardarUsuarios(usuario : Usuarios|UsuarioModel):Observable<AdminUserResponse>{ 
        const { ID, ...datosRestantes } = usuario; 
         datosRestantes.nombreCompleto = undefined;
        datosRestantes.usr_registro = undefined;
        const arrayDatos = datosRestantes;  
        
        let datos = {"action": actions.actionInsertUsuario ,
                     "_tabla" : TABLA.usuarios,
                     "_arraydatos" : arrayDatos
                    };

        CustomConsole.log('servicios de usuarios activo - getUsuarios' ,this.configService.url.action , datos, httpOptions());
        return this.http.post<AdminUserResponse>(this.configService.url.actionAdmin , datos, httpOptions());
    }
    guardarUsuarioPerfil(usuario : UsuarioModel ,  perfil:number):Observable<ApiResponse<{ message: string; result: unknown }>>{
      
        let datos = {"action": actions.actionInsertPerfilUsuario  ,
        "_parametro" : { 
            "perfil" : perfil ,
            "usuario" : usuario.ID
        }
       };

        CustomConsole.log('servicios de usuarios activo - guardarUsuarioPerfil' ,this.configService.url.action , datos, httpOptions());
        return this.http
          .post<ApiResponse<{ message: string; result: unknown }>>(this.configService.url.action , datos, httpOptions());
    }
    updateUsuarios(usuario : Usuarios):Observable<ApiResponse<GenericMutationPayload>>{ 
        let where:any[] = []  
        const { ID, perfil, ...datosRestantes } = usuario; 
        datosRestantes.nombreCompleto = undefined ;
        const arrayDatos = datosRestantes;   
        where = [{"columna": 'ID', "tipocomp": '=', "dato":ID }]; 
        CustomConsole.log(arrayDatos);
        
        let datos = {"action": actions.actionUpdate ,
                     "_tabla" : TABLA.usuarios,
                     "_arraydatos" : arrayDatos,
                     "_where": where
                    };

        CustomConsole.log('servicios de usuarios activo - getUsuarios' ,this.configService.url.action , datos, httpOptions());
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
    }

    getErrorMessage(error: any): string {
        return error?.error?.error?.message
          ?? error?.error?.error
          ?? error?.message
          ?? 'Error inesperado';
    }

}
