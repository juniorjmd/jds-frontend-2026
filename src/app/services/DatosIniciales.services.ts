import { Injectable } from '@angular/core';
import { vwsucursal } from 'src/app/models/app.db.interfaces';
import { actions } from 'src/app/models/app.db.actions';
import { httpOptions, url } from 'src/app/models/app.db.url';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { cajaModel } from '../models/ventas/cajas.model';
import { vistas } from '../models/app.db.view';
import { ProductosVendidosRequest } from '../interfaces/producto-request';
import { EmpleadoModel, VendedorModel } from '../models/empleados/empleados.module';
import { table } from 'ngx-bootstrap-icons';
import { TABLA } from '../models/app.db.tables';
import { ParametrosModel } from '../models/parametros/parametros.model';
import { CustomConsole } from '../models/CustomConsole';
import { ConfigService } from './config.service';
import { DatosInicialesBranchResponse } from '../interfaces/datos-iniciales-response.interface';
import { ApiResponse } from '../interfaces/api-response.interface';
import { GenericRecordsPayload } from '../interfaces/generic-response.interface';
import { UsuarioConVentaModel, UsuarioModel } from '../models/usuario.model';



@Injectable({
    providedIn: 'root'
})
export class DatosInicialesService { 
    private sucursal:vwsucursal[] = [] ;


    private sucursalSource = new BehaviorSubject<any>(null);
    currentSucursal = this.sucursalSource.asObservable(); 
    private continue = new BehaviorSubject<boolean>(false);
    continueVenta = this.continue.asObservable(); 
    private validarExistencia = new BehaviorSubject<any>(null);
    parmValExistencia =  this.validarExistencia.asObservable();
    
    private vendedores = new BehaviorSubject<EmpleadoModel[]|null>(null);
    currentVendedores = this.vendedores.asObservable();
 
constructor(private http: HttpClient , private configService: ConfigService){

}

    setArrayVendedores(sucursal:EmpleadoModel[]|null){ 
        this.vendedores.next(sucursal);
    }
    setParametroExistencia(sucursal:ParametrosModel|null){ 
        this.validarExistencia.next(sucursal);
    }
    chageParametroExistencia(sucursal:ParametrosModel){
        this.sucursalSource.next(sucursal);
    }
    chageSucursal(sucursal:vwsucursal){
        this.sucursalSource.next(sucursal);
    }
    chageContinueVenta(val:boolean){
        this.continue.next(val);
    }
    getParametroValidarExistencia():Observable<ApiResponse<GenericRecordsPayload<ParametrosModel>>>{
        let datos = {"action": actions.actionSelect , 
            "_tabla" : TABLA.PARAMETROS,
            "_where" : [{columna : 'cod_parametro' , tipocomp : '=' , dato : 'VALIDAR_EXISTENCIA'}]     
           }; 
           return this.http.post<ApiResponse<GenericRecordsPayload<ParametrosModel>>>(this.configService.url.action , datos, httpOptions()) ;
      }
      
      getProductosVendidos(): Observable<ProductosVendidosRequest> {
        let datos = {
          "action": actions.actionSelect,
          "_tabla": vistas.vw_productos_vendidos,  
        };
        CustomConsole.log('servicios de usuarios activo - getDocumentoActivo', url.action, datos, httpOptions());
        return this.http.post<ProductosVendidosRequest>(this.configService.url.action, datos, httpOptions());
      }   
  getVendedores():Observable<ApiResponse<GenericRecordsPayload<EmpleadoModel>>>{
    let datos = {"action": actions.actionSelect , 
        "_tabla" : vistas.vendedores,
        "_where" : []
       }; 
       return this.http.post<ApiResponse<GenericRecordsPayload<EmpleadoModel>>>(this.configService.url.action , datos, httpOptions()) ;
  } 
   getVendedoresConVentas():Observable<ApiResponse<GenericRecordsPayload<VendedorModel>>>{
    let datos = {"action": actions.actionSelect , 
        "_tabla" : vistas.vendedoresConVentas,
        "_where" : []
       }; 
       return this.http.post<ApiResponse<GenericRecordsPayload<VendedorModel>>>(this.configService.url.action , datos, httpOptions()) ;
  }

  getUsuariosConVentas():Observable<ApiResponse<GenericRecordsPayload<UsuarioModel>>>{
    let datos = {"action": actions.actionSelect , 
        "_tabla" : vistas.usuarioConVentas,
        "_where" : []
       }; 
       return this.http.post<ApiResponse<GenericRecordsPayload<UsuarioModel>>>(this.configService.url.action , datos, httpOptions()) ;
  }

  getUsuarios():Observable<ApiResponse<GenericRecordsPayload<UsuarioConVentaModel>>>{
    let datos = {"action": actions.actionSelect ,
        "_tabla" : vistas.usuario
       };
      CustomConsole.log('servicios de usuarios activo - getUsuarios' ,this.configService.url.action , datos, httpOptions()); 
       return this.http.post<ApiResponse<GenericRecordsPayload<UsuarioConVentaModel>>>(this.configService.url.action , datos, httpOptions()) ;
  }

    validarCuentasContablesEstablecimiento(caja:cajaModel) {
        if (caja == undefined
            || caja!.idCCntCCobrar == 0
            || caja!.idCCntCPagar == 0
            || caja!.idRetefuenteCompra == 0   
            || caja!.idCCntIvaCompra == 0 
            || caja!.idCCnttIvaVenta == 0  
            || caja!.idCCntCostoVenta == 0 
            || caja!.idCCntVenta == 0 
            || caja!.idCCntIngDifBonoRegalo == 0  
            || caja!.cuentaContableGastos == undefined  || caja!.cuentaContableGastos! == 0  
            || caja!.cuentaContableEfectivo == undefined  || caja!.cuentaContableEfectivo! == 0   )
        {
            this.chageContinueVenta(false) ;
          }else{
            this.chageContinueVenta(true) ;
          }
      
    }
    getDatosIniSucursal():Observable<vwsucursal[]>{ 
        let datos = {"action": actions.datosInicialesSucursal};
        console.log('ingreso aqui - getDatosIniSucursal')
        CustomConsole.log('servicios datos iniciales inicializado ' ,this.configService.url.datosIniciales , datos, this.configService.url.httpOptionsSinAutorizacion);
        return this.http
          .post<DatosInicialesBranchResponse>(this.configService.url.datosIniciales , datos, this.configService.url.httpOptionsSinAutorizacion as any)
          .pipe(map((response: any) => response.data.branches as vwsucursal[]));
      
    }

    getErrorMessage(error: any): string {
        return error?.error?.error?.message
          ?? error?.error?.error
          ?? error?.message
          ?? 'Error inesperado';
    }
     
}
 
