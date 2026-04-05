import { Injectable } from '@angular/core'; 
import { ciudad, datosMaestros, departamento, maestros, maestroSelect, pais } from '../interfaces/maestros.interface';
import { actions } from '../models/app.db.actions';
import { httpOptions, url } from '../models/app.db.url';
import { vistas } from '../models/app.db.view';
import { HttpClient } from '@angular/common/http';
import { TABLA } from '../models/app.db.tables';
import { DepartamentoModel, PaisModel , CiudadModel } from '../models/maestros.model';
import { select } from '../interfaces/generales.interface';

import { loading } from 'src/app/models/app.loading';  
import { CategoriasModel } from '../models/categorias.model';
import { BehaviorSubject } from 'rxjs';
import { CustomConsole } from '../models/CustomConsole';
import { ConfigService } from './config.service';
import { ApiResponse } from '../interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from '../interfaces/generic-response.interface';


@Injectable({
    providedIn: 'root'
})
export class MaestroClienteServices {
    private MaestrosCliente:maestros[] =[] ;
    ciudades: ciudad[]=[];
    departamentos: departamento[]=[];
    paises: pais[]=[]; 
    finP1 : boolean = false ;

     

    
    private cateSource = new BehaviorSubject<CategoriasModel[]|[]>([]);
    currentCategorias = this.cateSource.asObservable(); 
  // private _configService = inject(configService); 
constructor(private http: HttpClient , private configService:ConfigService,
        private loading : loading ){ 
        CustomConsole.log('servicios datos iniciales inicializado');  
    }
    asignarCategorias(cat:CategoriasModel[]){
        this.cateSource.next( cat) 
    }

   
    getCiudades(){
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.ciudades
                    };
        CustomConsole.log('servicios de maestro - ciudades ' ,this.configService.url.action , datos, httpOptions());
        return this.http.post<ApiResponse<GenericRecordsPayload<ciudad>>>(this.configService.url.action , datos, httpOptions()) ;
    }
    getCiudadesPorDepartamento(id:number){
        
        let where =   [{"columna" : "cod_departamento" , "tipocomp" : "=" , "dato" : id }];
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.ciudades ,
                     "_where" : where
                    };
        CustomConsole.log('servicios de maestro - ciudad ' ,this.configService.url.action , datos, httpOptions());
        return this.http.post<ApiResponse<GenericRecordsPayload<ciudad>>>(this.configService.url.action , datos, httpOptions()) ;
    }
    getCiudadesPorDepartamentoOdoo(id:number){
        let datos = {"action": actions.actionBuscarCiudadOdoo ,"_state_id" : id};
        CustomConsole.log('getCiudadesPorDepartamentoOdoo' ,this.configService.url.action , datos, httpOptions());
        return this.http.post<ApiResponse<unknown>>(this.configService.url.action , datos, httpOptions()) ; 
    }
    setCiudades( ciudad:CiudadModel){
        let  arraydatos = { "cod_pais" : ciudad.cod_pais , "nombre" : ciudad.nombre ,
        "cod_departamento" : ciudad.cod_departamento,
        "cod_ciudad" : ciudad.cod_ciudad, 
        "cod_dane" : ciudad.cod_dane }


        let datos = {"action": actions.actionInsert ,
        "_tabla" : TABLA.ciudades,
        "_arraydatos" : arraydatos
       };
       CustomConsole.log(datos);
       
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
    }

    actualizarCiudades(ciudad:CiudadModel){ 
        let where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : ciudad.id }]
        let  arraydatos = { "cod_pais" : ciudad.cod_pais , "nombre" : ciudad.nombre ,
        "cod_departamento" : ciudad.cod_departamento,
        "cod_ciudad" : ciudad.cod_ciudad, 
        "cod_dane" : ciudad.cod_dane }
        let datos = {"action": actions.actionUpdate ,
        "_tabla" : TABLA.ciudades,
        "_where" : where ,
        "_arraydatos" : arraydatos
       };
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
    }
    
    eliminarCiudades(ciudad:CiudadModel){ 
        let where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : ciudad.id }];
        let datos = {"action": actions.actionDelete ,
        "_tabla" : TABLA.ciudades,
        "_where" : where  
       };
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
    }
/////////////////////////////////////////////////

 PadLeft(value:any, length:number):string {
    return (value.toString().length < length) ? this.PadLeft("0" + value, length) : 
    value;
}

    getDepartamentos(){
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.departamento
                    };
        CustomConsole.log('servicios de maestro - departamento ' ,this.configService.url.action , datos, httpOptions());
        return this.http.post<ApiResponse<GenericRecordsPayload<departamento>>>(this.configService.url.action , datos, httpOptions()) ;
    }
    getDepartamentosPorPais(id:any){
        
        let where =   [{"columna" : "cod_pais" , "tipocomp" : "=" , "dato" : id[0] }];
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : vistas.departamento ,
                     "_where" : where
                    };
        CustomConsole.log('servicios de maestro - departamento ' ,this.configService.url.action , datos, httpOptions());
        return this.http.post<ApiResponse<GenericRecordsPayload<departamento>>>(this.configService.url.action , datos, httpOptions()) ;
    }
    getPaises(){
        let datos = {"action": actions.actionSelect ,
                     "_tabla" : TABLA.pais
                    };
        CustomConsole.log('servicios de maestro - paises ' ,this.configService.url.action , datos, httpOptions());
        return this.http.post<ApiResponse<GenericRecordsPayload<pais>>>(this.configService.url.action , datos, httpOptions()) ;
    }


    getPaisesOdoo(){
        let datos = {"action": actions.actionBuscarPaisesOdoo};
        CustomConsole.log('servicios de maestro - paises ' ,this.configService.url.action , datos, httpOptions());
        return this.http.post<ApiResponse<unknown>>(this.configService.url.action , datos, httpOptions()) ;
    }
    getDepartamentosPorPaisOdoo(pais_id:any){

        let datos = {"action": actions.actionBuscarStatesOdoo ,
                     "_id_pais" : pais_id};
        CustomConsole.log('getDepartamentosPorPaisOdoo' ,this.configService.url.action , datos, httpOptions());
        return this.http.post<ApiResponse<unknown>>(this.configService.url.action , datos, httpOptions()) ;
    }
    setPaises( pais:PaisModel){
        let  arraydatos = {   "cod_pais" : pais.cod_pais.toUpperCase() , "nombre" : pais.nombre }
        let datos = {"action": actions.actionInsert ,
        "_tabla" : TABLA.pais,
        "_arraydatos" : arraydatos
       };
       CustomConsole.log(datos);
       
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
    }

    actualizarPaises(pais:PaisModel){ 
        let where =   [{"columna" : "ID" , "tipocomp" : "=" , "dato" : pais.id }]
        let  arraydatos = { "cod_pais" : pais.cod_pais , "nombre" : pais.nombre }
        let datos = {"action": actions.actionUpdate ,
        "_tabla" : TABLA.pais,
        "_where" : where ,
        "_arraydatos" : arraydatos
       };
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
    }
    
    eliminarPaises(pais:PaisModel){ 
        let where =   [{"columna" : "ID" , "tipocomp" : "=" , "dato" : pais.id }];
        let datos = {"action": actions.actionDelete ,
        "_tabla" : TABLA.pais,
        "_where" : where  
       };
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
    }
    ///departamentos
    
    setDepartamentos( dep:DepartamentoModel){
        let  arraydatos = { "id":dep.id,
          "cod_pais" : dep.cod_pais , "nombre" : dep.nombre }
        let datos = {"action": actions.actionInsert ,
        "_tabla" : TABLA.departamento,
        "_arraydatos" : arraydatos
       };
       CustomConsole.log(datos);
       
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
    }

    actualizarDepartamentos( dep:DepartamentoModel){ 
        let where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : dep.id }];
        let  arraydatos = { "id": dep.id,
        "cod_pais" : dep.cod_pais , "nombre" : dep.nombre }
        let datos = {"action": actions.actionUpdate ,
        "_tabla" : TABLA.departamento,
        "_where" : where ,
        "_arraydatos" : arraydatos
       };
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
    }

    eliminarDepartamento(dep:DepartamentoModel){ 
        let where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : dep.id }];
        let datos = {"action": actions.actionDelete ,
        "_tabla" : TABLA.departamento,
        "_where" : where  
       };
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
    } 

    async  setMaestrosClientes_new(){
            let datos = {"action": actions.actionSelect ,
            "_tabla" : vistas.maestros
           };
          CustomConsole.log('servicios maestro Cliente - maestros ' ,this.configService.url.action , datos, httpOptions());
          return await this.http.post<ApiResponse<GenericRecordsPayload<maestroSelect>>>(this.configService.url.action , datos, httpOptions()).toPromise() ;
        }

        async  setTipoDocumentoOdoo(){
            let datos = {"action": actions.actionTipDoc  
           };
          CustomConsole.log('servicios maestro Cliente - getTipoDoc ' ,this.configService.url.action , datos, httpOptions());
          return await this.http.post<ApiResponse<unknown>>(this.configService.url.action , datos, httpOptions()).toPromise() ;
        }
   
    private setMaestrosClientes(){
        let datos = {"action": actions.actionSelect ,
        "_tabla" : vistas.maestros
       };
      CustomConsole.log('servicios maestro Cliente - maestros ' ,this.configService.url.action , datos, httpOptions());
       return this.http.post<ApiResponse<GenericRecordsPayload<maestroSelect>>>(this.configService.url.action , datos, httpOptions()) ;
    }

     setTiposDocumentos(){
        let datos = {"action": actions.actionTipDoc  };
      CustomConsole.log('servicios maestro Cliente - setTiposDocumentos ' ,this.configService.url.action , datos, httpOptions());
       return this.http.post<ApiResponse<unknown>>(this.configService.url.action , datos, httpOptions()) ;
    }
    setTitulos(){
        let datos = {"action": actions.actionTitulosOdoo  };
      CustomConsole.log('servicios maestro Cliente - actionTitulosOdoo ' ,this.configService.url.action , datos, httpOptions());
       return this.http.post<ApiResponse<unknown>>(this.configService.url.action , datos, httpOptions()) ;
    }
    
    setCategorias(){
        let datos = {"action": actions.actionCategoriasOdoo  };
      CustomConsole.log('servicios maestro Cliente - actionCategoriasOdoo  ' ,this.configService.url.action , datos, httpOptions());
       return this.http.post<ApiResponse<unknown>>(this.configService.url.action , datos, httpOptions()) ;
    }
    setCategoriasPrd(){
        let datos = {"action": actions.actionSelect ,  "_tabla" : vistas.categorias  };
      CustomConsole.log('servicios maestro Cliente - actionCategoriasOdoo  ' ,this.configService.url.action , datos, httpOptions());
       return this.http.post<ApiResponse<GenericRecordsPayload<CategoriasModel>>>(this.configService.url.action , datos, httpOptions()) ;
    }
    setMarcas(){
        let datos = {"action": actions.actionSelect ,  "_tabla" : vistas.marcas   };
      CustomConsole.log('servicios maestro Cliente - actionBuscarMarcas  ' ,this.configService.url.action , datos, httpOptions());
       return this.http.post<ApiResponse<GenericRecordsPayload<any>>>(this.configService.url.action , datos, httpOptions()) ;
    }
    setMarcasCatego(categoId:number){
        let datos = {"action": actions.actionBuscarMarcas ,
       "_categ":true ,
       "_data" : categoId };
      CustomConsole.log('servicios maestro Cliente - actionBuscarMarcas  ' ,this.configService.url.action , datos, httpOptions());
       return this.http.post<ApiResponse<unknown>>(this.configService.url.action , datos, httpOptions()) ;
    }
 setEmpresas(){
        let datos = {"action": actions.actionEmpresasOdoo  };
      CustomConsole.log('servicios maestro Cliente - setTiposDocumentos ' ,this.configService.url.action , datos, httpOptions());
       return this.http.post(this.configService.url.action , datos, httpOptions()) ;
    }
    async getTipoDoc(){
        try {
            const maestroService = await  this.setTipoDocumentoOdoo();
            const retorno = await maestroService 
            CustomConsole.log('retorno - getTipoDoc', retorno); 
            if (retorno?.ok && retorno.data) {
              this.crearMaestrosDatos(retorno ,'asdfasdf');
            }
           CustomConsole.log('estoy en getTipoDoc',this.MaestrosCliente);
        } catch (error : any) {
            throw new Error(`Error al leer getTipoDoc : ${error}`);
          }}
          
    async getMaestrosClientes(){
        try {
            const maestroService = await  this.setMaestrosClientes_new();
            const retorno = await maestroService 
            CustomConsole.log('retorno', retorno); 
            if (retorno?.ok && retorno.data) {
              this.crearMaestrosDatos(retorno);
            }
           CustomConsole.log('estoy en pruebaget',this.MaestrosCliente);
        } catch (error : any) {
            throw new Error(`Error al leer maestros : ${error}`);
          }}

    crearMaestrosDatos(datos:any , tipo:any = null){ 
        this.finP1 = true; 
        this.MaestrosCliente = [];
         CustomConsole.log('crearMaestrosDatos',datos);
         let idActual = 0;
         datos.data.records.forEach((datoMaestro:maestroSelect)=>{
            if (idActual !== datoMaestro.id){
                idActual = datoMaestro.id;
                if ( tipo  !== null){
                    this.MaestrosCliente.push(
                        {
                            "id" :  this.MaestrosCliente.length ,
                            "nombre" : 'tipo_doc',
                            "descripcion" : datoMaestro.display_name!  ,
                            "datos" :[]
                        }
                    )

                }else{
                this.MaestrosCliente.push(
                    {
                        "id" : datoMaestro.id ,
                        "nombre" : datoMaestro.id_maestro! ,
                        "descripcion" : datoMaestro.descripcion  ,
                        "datos" :[]
                    }
                ) }
            }
            const isLargeNumber = (element:any) => element.id === datoMaestro.id ; 
            if (typeof(datoMaestro.id_maestro) === 'undefined'){

                this.MaestrosCliente[this.MaestrosCliente.findIndex(isLargeNumber)].datos!.push({ "dato" :datoMaestro.id , "label" : datoMaestro.display_name!} )

            }else{
            this.MaestrosCliente[this.MaestrosCliente.findIndex(isLargeNumber)].datos!.push({ "dato" :datoMaestro.dato ,
            "label" : datoMaestro.label} )}


         })
         
        CustomConsole.log('esto es maestro cliente ' , this.MaestrosCliente);
        
            this.loading.hide(); 
            return true;
     };

    
        /*
        this.MaestrosCliente =[
            {
            id : 1 ,
            nombre : "tipo_direccion" ,
            descripcion : "tipos de direccion"   ,
            datos:[
                {dato : 'contact' ,
                    label : 'Contacto' } ,
                    {dato : 'invoice' ,
                        label : 'Direccion de Factura' },
                        {dato : 'delivery' ,
                            label : 'Direcion de entrega' },
                            {dato : 'other' ,
                                label : 'Otra direccion' },
                                {dato : 'private' ,
                                    label : 'Direccion Privada' }]
        },
        {
            id : 2 ,
            nombre : "compania" ,
            descripcion : "Compañia padre"   ,
            datos:[
                {dato : 1 ,
                    label : 'compañia 1' } ,
                    {dato : 2 ,
                        label : 'compañia 2' },
                        {dato : 3 ,
                            label : 'Compañia 3' },
                            {dato : 4 ,
                                label : 'Compañia 4' },
                                {dato : 5 ,
                                    label : 'Compañia 5' }]
        },
        {
            id : 3 ,
            nombre : "provincias" ,
            descripcion : "provincias"   ,
            datos:[
                {dato : 1 ,
                    label : 'provincia 1' } ,
                    {dato : 2 ,
                        label : 'provincia 2' },
                        {dato : 3 ,
                            label : 'provincia 3' },
                            {dato : 4 ,
                                label : 'provincia 4' },
                                {dato : 5 ,
                                    label : 'provincia 5' }]
        },
        {
            id : 4 ,
            nombre : "titulos" ,
            descripcion : "titulos"   ,
            datos:[
                {dato : 1 ,
                    label : 'titulos 1' } ,
                    {dato : 2 ,
                        label : 'titulos 2' },
                        {dato : 3 ,
                            label : 'titulos 3' },
                            {dato : 4 ,
                                label : 'titulos 4' },
                                {dato : 5 ,
                                    label : 'titulos 5' }]
        },
        {
            id : 5 ,
            nombre : "categorias" ,
            descripcion : "categorias"   ,
            datos:[
                {dato : 1 ,
                    label : 'categorias 1' } ,
                    {dato : 2 ,
                        label : 'categorias 2' },
                        {dato : 3 ,
                            label : 'categorias 3' },
                            {dato : 4 ,
                                label : 'categorias 4' },
                                {dato : 5 ,
                                    label : 'categorias 5' }]
        },
        {
            id : 6 ,
            nombre : "tipo_identificacion" ,
            descripcion : "tipo de identificacion"   ,
            datos:[
                {dato : 'CC',
                    label : 'Cedula' } ,
                    {dato : 'NIT' ,
                        label : 'NIT' },
                        {dato : 'TI' ,
                            label : 'Tarj. Ident.' },
                            {dato : 'PP' ,
                                label : 'Pasaporte' }]
        }


    
    
    ];*/ 
      
    

 
       getMaestroClientes(nomMaestro:string):any{ 
         CustomConsole.log('getMaestroClientes ',this.MaestrosCliente, nomMaestro);
         let datosRetorno:any = []; 
            this.MaestrosCliente!.forEach(
                (value )=>{
                CustomConsole.log('getMaestroClientes',value ,value.nombre, nomMaestro);
                 if(value.nombre === nomMaestro){   
                    CustomConsole.log('envio' , value);  
                    datosRetorno =  value.datos;
                }
                
            });
            return datosRetorno ; 
    }

    getErrorMessage(error: any): string {
        const rawApiError = error?.error?.error;
        const apiMessage = typeof rawApiError === 'string' ? rawApiError : rawApiError?.message;
        return apiMessage || error?.error?.message || error?.message || 'Error inesperado';
    }
}
 
