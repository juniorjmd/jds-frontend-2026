import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { actions } from '../models/app.db.actions';
import { httpOptions, url } from '../models/app.db.url';
import { vistas } from '../models/app.db.view';
import { BehaviorSubject } from 'rxjs';
import { ClientesModel } from '../models/clientes/clientes.module';
import { DescuentoModule } from '../models/descuento/descuento.model';
import { MarcasModel } from '../models/marcas/marcas.module';
import { CategoriasModel } from '../models/categorias.model';
import { ProductoModel } from '../models/producto/producto.module';
import { ActividadesDescuentoModel } from '../models/actividadesDescuentoModel';
import { TABLA } from '../models/app.db.tables';
import { ConfigService } from './config.service';
import { CustomConsole } from '../models/CustomConsole';
import { ApiResponse } from '../interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from '../interfaces/generic-response.interface';

@Injectable({
  providedIn: 'root'
})
export class ActiDescuentoService  {
  
 
  private clientes = new BehaviorSubject<ClientesModel[]|null>(null);
  arrayClientes = this.clientes.asObservable();
  
  private marcas = new BehaviorSubject<MarcasModel[]|null>(null);
  arrayMarcas = this.marcas.asObservable();
  
  private categorias = new BehaviorSubject<CategoriasModel[]|null>(null);
  arrayCategorias = this.categorias.asObservable();
  
  private productos = new BehaviorSubject<ProductoModel[]|null>(null);
  arrayProductos = this.productos.asObservable();

  
   private  configService = inject(ConfigService); 
constructor(private http: HttpClient){} 

  updateActividad(actividad:ActividadesDescuentoModel){
    let _where =   [{"columna" : "id" , "tipocomp" : "=" , "dato" : actividad.id }]
    let _arraydatos =  { nombre :actividad.nombre,
      descripcion:actividad.descripcion,
      fechaInicial : actividad.fechaInicial,
      fechaFinal:    actividad.fechaFinal , 
      estado:    actividad.estado , 
      usuario_edicion   : 'USUARIO_LOGUEADO'  }; 
     let datos = {"action": actions.actionUpdate , "_tabla" : TABLA.actividad_descuento, _where ,  _arraydatos };
     CustomConsole.log('updateActividad',datos); 
   return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
  }

  excluirProducto(idProducto:string , actividad:any){
    let arraydatos =  { 'idActividad' : actividad , 
			"idProducto" : idProducto    }
          let  datos = {"action": actions.actionInsert ,
            "_tabla" : TABLA.actividad_det_producto_excluido,
            "_arraydatos" : arraydatos
           };  
       CustomConsole.log(datos); 
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
        
  }
  
  quitarDeExcluidoProducto(idProducto:string, actividad:any ){ 
    let where =   [{"columna" : "idProducto" , "tipocomp" : "=" , "dato" : idProducto},
                   {"columna" : "idActividad" , "tipocomp" : "=" , "dato" : actividad}   ];
    let datos = {"action": actions.actionDelete ,
    "_tabla" : TABLA.actividad_det_producto_excluido,
    "_where" : where  
   };
   CustomConsole.log(datos); 
    return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
}
    setProducto(idProducto:string){
    let arraydatos =  { 
			"id_producto" : idProducto    }
          let  datos = {"action": actions.actionInsert ,
            "_tabla" : TABLA.actividad_det_tmp,
            "_arraydatos" : arraydatos
           };  
       CustomConsole.log(datos); 
        return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
        
  }
  deleteProducto(idProducto:string ){ 
    let where =   [{"columna" : "id_producto" , "tipocomp" : "=" , "dato" : idProducto}];
    let datos = {"action": actions.actionDelete ,
    "_tabla" : TABLA.actividad_det_tmp,
    "_where" : where  
   };
    return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
}


deleteItemDescuentoTmp(idProducto:any , tipo:string){ 
  let columna :string = ''
  // id, id_categoria, id_producto, id_cliente, id_marca
  switch(tipo){
    case 'PRD' : 
    columna =  'id_producto';
    break;
    case 'CAT' : 
    columna =  'id_categoria';
    break;
    case 'CLI' : 
    columna =  'id_cliente';
    break;
    case 'BRD' : 
    columna =  'id_marca';
    break;
  }
  let where =   [{columna , "tipocomp" : "=" , "dato" : idProducto}];
  let datos = {"action": actions.actionDelete ,
  "_tabla" : TABLA.actividad_det_tmp,
  "_where" : where  
 };
  return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
}


ingresarItemDescuentoTmp(idProducto:any , tipo:string){ 
  let columna :string = ''
  let arraydatos :any;
  // id, id_categoria, id_producto, id_cliente, id_marca
  switch(tipo){
    case 'PRD' :  
     arraydatos =  { "id_producto" : idProducto    }
    break;
    case 'CAT' :  
    arraydatos =  { "id_categoria" : idProducto    }
    break;
    case 'CLI' :  
    arraydatos =  { "id_cliente" : idProducto    }
    break;
    case 'BRD' :  
    arraydatos =  { "id_marca" : idProducto    }
    break;
  }
  let  datos = {"action": actions.actionInsert ,
        "_tabla" : TABLA.actividad_det_tmp,
        "_arraydatos" : arraydatos
       };  
   CustomConsole.log(datos); 
  return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
}


setCategoria(idProducto:number){
  let arraydatos =  { 
    "id_categoria" : idProducto    }
        let  datos = {"action": actions.actionInsert ,
          "_tabla" : TABLA.actividad_det_tmp,
          "_arraydatos" : arraydatos
         };  
     CustomConsole.log(datos); 
      return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
      
}

deleteCategoria(idProducto:number){ 
  let where =   [{"columna" : "id_categoria" , "tipocomp" : "=" , "dato" : idProducto}];
  let datos = {"action": actions.actionDelete ,
  "_tabla" : TABLA.actividad_det_tmp,
  "_where" : where  
 };
 CustomConsole.log(datos); 
  return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
}



setMarca(idProducto:number){
  let arraydatos =  { 
    "id_marca" : idProducto    }
        let  datos = {"action": actions.actionInsert ,
          "_tabla" : TABLA.actividad_det_tmp,
          "_arraydatos" : arraydatos
         };  
     CustomConsole.log(datos); 
      return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
      
}

deleteMarca(idProducto:number){ 
  let where =   [{"columna" : "id_marca" , "tipocomp" : "=" , "dato" : idProducto}];
  let datos = {"action": actions.actionDelete ,
  "_tabla" : TABLA.actividad_det_tmp,
  "_where" : where  
 };
 CustomConsole.log(datos); 
  return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.action , datos, httpOptions()) ;
}





setArrayClientes(sucursal:ClientesModel[]|null){ 
    this.clientes.next(sucursal);
}
setArrayMarcas(marca:MarcasModel[]|null){ 
  this.marcas.next(marca);
}
setArrayCategorias(sucursal:CategoriasModel[]|null){ 
  this.categorias.next(sucursal);
}
setArrayProductos(sucursal:ProductoModel[]|null){ 
  this.productos.next(sucursal);
}

  

createDescuentoActividad(_datosInsert:ActividadesDescuentoModel){
  let datos = {"action": actions.set_actividad_descuento , 
              _datosInsert
   };  
   CustomConsole.log('createDescuentoActividad', datos);
   
return this.http.post<ApiResponse<GenericMutationPayload>>(this.configService.url.inventario , datos, httpOptions()) ;
}
/**obtener productos, marcar, categorias y clientes disponibles para ingresar a la lista tmp de actividad */
getProductosDisponibles(){ 
  let datos = {"action": actions.actionSelect , 
    _limit: 1000,  
    "_tabla" : vistas.vw_actividad_disponible_producto, 
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<ProductoModel>>>(this.configService.url.action , datos, httpOptions()) ;
}

getCategoriasDisponibles(){ 
  let datos = {"action": actions.actionSelect , 
    "_tabla" : vistas.vw_actividad_disponible_categoria, 
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<CategoriasModel>>>(this.configService.url.action , datos, httpOptions()) ;
}
getMarcasDisponibles(){ 
  let datos = {"action": actions.actionSelect , 
    "_tabla" : vistas.vw_actividad_disponible_marca, 
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<MarcasModel>>>(this.configService.url.action , datos, httpOptions()) ;
}
getClientesDisponibles(){ 
  let datos = {"action": actions.actionSelect , 
    "_tabla" : vistas.vw_actividad_disponible_cliente, 
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<ClientesModel>>>(this.configService.url.action , datos, httpOptions()) ;
}
/**obtener productos, marcar, categorias y clientes disponibles para ingresar a la lista tmp de actividad */


/**obtener productos, marcar, categorias y clientes  en la lista tmp de actividad */
 
getProductosActividad( idActividad:any ){ 
  let datos = {"action": actions.actionSelect ,  
    "_tabla" : vistas.act_det_producto, 
    "_where" : [ {columna : 'id_actividad' , tipocomp : '=' , dato : idActividad  }]
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<ProductoModel>>>(this.configService.url.action , datos, httpOptions()) ;
}

getProductosActividadTmp(){ 
  let datos = {"action": actions.actionSelect ,  
    "_tabla" : vistas.act_det_tmp_producto, 
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<ProductoModel>>>(this.configService.url.action , datos, httpOptions()) ;
}

getCategoriaActividadTmp(){ 
  let datos = {"action": actions.actionSelect , 
    "_tabla" : vistas.act_det_tmp_categoria, 
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<CategoriasModel>>>(this.configService.url.action , datos, httpOptions()) ;
}

getClienteActividadTmp(){ 
  let datos = {"action": actions.actionSelect ,  
    "_tabla" : vistas.act_det_tmp_cliente, 
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<ClientesModel>>>(this.configService.url.action , datos, httpOptions()) ;
}

getMarcaActividadTmp(){ 
  let datos = {"action": actions.actionSelect ,  
    "_tabla" : vistas.act_det_tmp_marca, 
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<MarcasModel>>>(this.configService.url.action , datos, httpOptions()) ;
}

/**obtener productos, marcar, categorias y clientes en la lista tmp de actividad */
getProductosDisponiblesByName(name:string){ 
  
  let datos = {"action": actions.actionSelect , 
    _limit: 1000,  
    "_tabla" : vistas.vw_actividad_disponible_producto, 
    "_where" : [
      {columna : 'nombre' , tipocomp : 'like' , dato : name , 'relacion' : 'or'},
      {columna : 'nombre2' , tipocomp : 'like' , dato : name , 'relacion' : 'or'},
      {columna : 'nombre3' , tipocomp : 'like' , dato : name}]
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<ProductoModel>>>(this.configService.url.action , datos, httpOptions()) ;
}

getCategoriasDisponiblesByName(name:string){ 
  
  let datos = {"action": actions.actionSelect , 
    _limit: 1000,  
    "_tabla" : vistas.vw_actividad_disponible_categoria, 
    "_where" : [{columna : 'nombre' , tipocomp : 'like' , dato : name  } ]
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<CategoriasModel>>>(this.configService.url.action , datos, httpOptions()) ;
}

getMarcasDisponiblesByName(name:string){ 
  let datos = {"action": actions.actionSelect , 
    _limit: 1000,  
    "_tabla" : vistas.vw_actividad_disponible_marca, 
    "_where" : [{columna : 'nombre' , tipocomp : 'like' , dato : name  } ]
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<MarcasModel>>>(this.configService.url.action , datos, httpOptions()) ;
}


getDescuentos(){ 
  let datos = {"action": actions.actionSelect , 
    "_tabla" : vistas.inv_descuentos, 
   }; 
return this.http.post<ApiResponse<GenericRecordsPayload<DescuentoModule>>>(this.configService.url.action , datos, httpOptions()) ;
}
getActividades(){ 
  let datos = {"action": actions.actionSelect , 
    "_tabla" : vistas.vw_inv_descuentos_actividad,

   };
CustomConsole.log('abrirCaja activo ' ,this.configService.url.action , datos, httpOptions());
return this.http.post<ApiResponse<GenericRecordsPayload<ActividadesDescuentoModel>>>(this.configService.url.action , datos, httpOptions()) ;
}

getDetalleActividad(detalle:ActividadesDescuentoModel){ 
  let tabla = '';

  switch(detalle.tipo){
    case 'PRD' : 
       tabla =  vistas.act_det_producto;
    break;
    case 'CAT' : 
        tabla =  vistas.act_det_categoria;
    break;
    case 'CLI' : 
        tabla =  vistas.act_det_cliente;
    break;
    case 'BRD' : 
        tabla =  vistas.act_det_marca;
    break;
  }
  let datos = {"action": actions.actionSelect , 
    "_tabla" : tabla,
    "_where" : [
      {columna : 'id_actividad' , tipocomp : '=' , dato : detalle.id  }]

   };
CustomConsole.log('getDetalleActividad ' ,this.configService.url.action , datos, httpOptions());
return this.http.post<ApiResponse<GenericRecordsPayload<any>>>(this.configService.url.action , datos, httpOptions()) ;
}

}
