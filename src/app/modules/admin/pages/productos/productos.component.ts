import { Component, OnInit } from '@angular/core';

import { CategoriasModel } from 'src/app/models/categorias.model';
import { Categoria } from 'src/app/interfaces/categoria.interface'; 
import { loading } from 'src/app/models/app.loading';
import { ProductoService } from 'src/app/services/producto.service'; 
import { ProductoModel } from 'src/app/models/producto/producto.module';
import { MarcasModel } from 'src/app/models/marcas/marcas.module'; 
import { PrdExistenciasModule } from 'src/app/models/prd-existencias/prd-existencias.module';
import { BodegasModule } from 'src/app/models/bodegas/bodegas.module';
import { AuxIngresoInventarioModule } from 'src/app/models/aux-ingreso-inventario/aux-ingreso-inventario.module';
import { MatDialog } from '@angular/material/dialog';
import { BuscarProdDirectoComponent } from 'src/app/modules/pos/modals/buscar-prod-directo/buscar-prod-directo.component';
import { responsePrd } from 'src/app/interfaces/odoo-prd';
import Swal from 'sweetalert2';
import { ModalUpdateProductoComponent } from '../../modals/modalUpdateProducto/modalUpdateProducto.component';
import { PresentacionPrdModel } from 'src/app/models/presentacionPrdModel';
import { PrdPreciosModule } from 'src/app/models/prd-precios/prd-precios.module';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { InventarioPrechartResponse, InventarioProductMutationResponse, InventarioProductResponse, InventarioProductsResponse, InventarioWarehousesResponse } from 'src/app/interfaces/inventario-response.interface';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMultiRecordsPayload, GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
}) 
export class ProductosComponent implements OnInit {
  codProducto='';
  buscar = true;
  auxPrd:ProductoModel[] = []
  auxBodega:BodegasModule = {nombre : 'SELECCIONAR LA BODEGA' ,estado:0,   id:0  , descripcion : ''}
  existenciasPrd:PrdExistenciasModule[]=[] ;
  
  presentacion:PresentacionPrdModel[] = []
  productoRetornoBusqueda!:ProductoModel ;
  AuxIngresoInventarioModule : AuxIngresoInventarioModule[] = [];

 

  bodegas :BodegasModule[] = [this.auxBodega];
  inventario:any={
    nombre : '' , 
    bodega : this.bodegas[0] , 
    descripcion : '',
    tipoInventario : 0
  }
  Productos :ProductoModel[] = [];
  categoriaAux :CategoriasModel[]  =  [{id:0,  letra:'',  
       nombre:'Seleccione la categoria',  
          descripcion:'',  numHijos:0,   tipo:'',    contador :0  ,selected:false }] ; 
  categorias :CategoriasModel[] = []; 
  categorias1 :CategoriasModel[] = [...this.categoriaAux ];
  categorias2 :CategoriasModel[] = [...this.categoriaAux ];
  categorias3 :CategoriasModel[] = [...this.categoriaAux ];
  marcasAux:MarcasModel = { nombre:"Seleccione La marca",  descripcion:'',   estado: 0 ,     nombre_estado:'' , selected:false,
    id:0 };

    tipProductos:any = [{id:0 , nombre:'Seleccione el tipo de producto'},
      {id:1 , nombre:'prd.fisico '},
           {id:2 , nombre:'servicios' } 
         ];
         tipInventario:any = [{id:0 , nombre:'Seleccione el tipo de inventario'},
          {id:2 , nombre: 'Ajuste'},
               {id:1 , nombre:'General' } 
             ];
  marcas:MarcasModel[] = [this.marcasAux];
  newProducto:ProductoModel = new ProductoModel( '' , '' ,0 ,0,'0','0', 0,0,0,0,0,'','','',0, ''  ) ; 
  textFindProductos:string = '';
  
  ivaIncluido :boolean = true;
  constructor(private loading : loading,
    private productoService:ProductoService,
    
    private newAbrirDialog : MatDialog 
    ) {
      this.getPresentacion();
     this.getProductos();
     this.getBodegas();
     this.getCategorias_marcas(); 
     }
     cambioTipProducto(){
      if(this.newProducto.tipo_producto == 2 ){
        this.newProducto.presentacion = 0;
      }
     }
  getPresentacion(){
    this.productoService.getPresentacioProducto().subscribe({next:(value:ApiResponse<GenericRecordsPayload<PresentacionPrdModel>>)=>{
      let pre:PresentacionPrdModel = {
        id: 0,
        nombre: 'Ninguna',
        descripcion: '',
        sigla: ''
      };
      this.presentacion = [pre, ...value.data.records];  
    }});
  }
   getProductosPorFiltro(){
    CustomConsole.log('busqueda productos inicial' ); 
     this.loading.show()  
     this.productoService.getProductosPorNombre( this.textFindProductos ,[0,30] ).subscribe(

      {next :
       (respuesta:InventarioProductsResponse)=>{
         if (respuesta.ok){
            if (respuesta.data.count > 0 ){
              const productos = respuesta.data.products; 
              CustomConsole.log('producto general' , productos)
              this.Productos = productos   
            }else{ 
              Swal.fire(  "error",  'la busqueda no genero ningun resultado', "error" );
               } 
          }else{ 
            Swal.fire(  "error", respuesta.error?.message ?? 'error en el servidor' , "error"); 
          } 
          CustomConsole.log('getProductosNombre',JSON.stringify(respuesta));
         
         
          } , error:    error => { this.loading.hide();  
                    Swal.fire(  "error", error , "error"); 
          },complete:()=>  this.loading.hide() }
     );
    }
    setCategoria2(){   
        this.categorias3  = [... this.categoriaAux ];
        this.categorias2  = this.categorias.filter( x=> x.idPadreCategoria == this.newProducto.idCategoria  )
        
      this.categorias2.unshift(this.categoriaAux[0]);
    }
    setCategoria3(){  
      this.categorias3  = this.categorias2.filter( x=> x.idPadreCategoria == this.newProducto.idCategoria2  )
      this.categorias3.unshift(this.categoriaAux[0]);
    }
    buscarProductoPorCodigo() {
      // Verificar si el código del producto es válido
      if (!this.codProducto?.trim()) {
        return;
      }
    
      // Verificar si la bodega es válida
      if (this.inventario.bodega.id <= 0) {
        Swal.fire('Debe seleccionar la bodega de ingreso', '', 'error');
        return;
      }
    
      // Llamar al servicio para buscar el producto
      this.productoService.getProductoByIdOrCodBarra(this.codProducto).subscribe({
        next: (val: InventarioProductResponse) => {
          CustomConsole.log('dato retornado busqueda directa', val.data.products);
    
          if (val.data.count > 1) {
            this.auxPrd = val.data.products;
            // Crear el contenido HTML del modal
            const items = val.data.products.map(producto => 
              `<li style="cursor: pointer; margin: 5px 0;" data-producto-id="${producto.id}">${producto.nombre}</li>`).join('');
            const listHTML = `<ul id="productList">${items}</ul>`;
    
            // Mostrar el modal con Swal
            Swal.fire({
              title: 'Selecciona un producto',
              html: listHTML,
              showConfirmButton: false,
              focusConfirm: false,
              didOpen: () => {
                const self = this; 
                const productos = this.auxPrd ;
                // Añadir event listeners a los elementos de la lista después de que el modal se abra
                const elements = document.querySelectorAll('#productList li');
                const fndfiltrarAuxPrd = 
                elements.forEach((element ) => {
                  element.addEventListener('click', (event) => { 
                    const target = event.currentTarget as HTMLElement;
                    console.log(target); 
                    const productId = target.getAttribute('data-producto-id');
                    this.filtrarAuxPrd(productId);
                  });
                });
              }
            });
          } else if (val.data.count === 1 && val.data.products[0]) {
            // Agregar la cantidad si se encontró un solo producto
            this.agregarCantidad(val.data.products[0]);
          } else {
            // Manejar el caso donde no se encontró ningún producto
            Swal.fire('No se encontró el producto', '', 'warning');
          }
        },
        error: (e) => {
          const errorMessage = e.error?.message || 'Error desconocido';
          Swal.fire('Ocurrió un error al buscar el producto', errorMessage, 'error');
        }
      });
    }
    
    filtrarAuxPrd(idAux:any){  
      const selectedProduct = this.auxPrd.find(producto => producto.id === idAux ); 
      if (selectedProduct) {
        Swal.close();
        this.agregarCantidad(selectedProduct);
      }
    }   
 
 
    busquedaAuxiliarProducto( ){   
      if(this.inventario.bodega.id <= 0) {
        Swal.fire( 'Debe seleccionar la bodega de ingreso', '', 'error');
        return;
       }
       
       CustomConsole.log(JSON.stringify(this.inventario.bodega))
      this.newAbrirDialog.open(BuscarProdDirectoComponent   )
      .afterClosed()
      .subscribe(( response:responsePrd  )=>{
        CustomConsole.log(response);
        
        if (response.confirmado){
         this.productoRetornoBusqueda = response.datoDevolucion!;
          CustomConsole.log('dato retornado busqueda directa',response.datoDevolucion);
          this.agregarCantidad(response.datoDevolucion!)
        } 
      })  
    
     }


     agregarCantidad(prd:ProductoModel){ 
      let nomInventario = this.inventario.bodega.nombre;
      Swal.fire({
        title: `ingrese la cantidad a ingresar del producto "${prd!.nombre}"
         en la bodega  : "${nomInventario}"  .`, 
        input: 'number',
        showCancelButton: true,
        confirmButtonText: 'Si', 
        cancelButtonText:'No'
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        CustomConsole.log(result  );
        if (result.isConfirmed) {  
          if(result.value <= 0){
            Swal.fire( 'el valor debe ser mayor a cero', '', 'error');
            return;
          }
          let ingreso =    new AuxIngresoInventarioModule(prd.id! , result.value ,  this.inventario.bodega ) ; 
          this.productoService.guardarNuevoProductoPrecargue( ingreso  ).subscribe(
            (respuesta:InventarioPrechartResponse)=>{CustomConsole.log(respuesta)
             
            if (respuesta.ok){  
                CustomConsole.log(respuesta);
           if (respuesta.data.count > 0 ){ 
             this.AuxIngresoInventarioModule = respuesta.data.items;  
           }else{
             this.AuxIngresoInventarioModule = [];     
             } 
             
           }else{ 
             try {
              Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
             } catch (error : any) {
              Swal.fire('error en el servidor', '', 'error');
             }
           
           }
            this.loading.hide(); 
            }) 
        } 
     }) 
     }
     getBodegas(){ 
      this.bodegas   = [this.auxBodega];
      this.productoService.getbodegas( ).subscribe({next : 
        (datos:InventarioWarehousesResponse)=>{
           CustomConsole.log('producto component - get bodegas' , datos);
          if (datos.data.count > 0 ){ 
            this.bodegas = datos.data.warehouses
            this.bodegas.unshift(this.auxBodega);
          }else{
            this.bodegas   = [this.auxBodega];   }
            } , error:
        error => {this.loading.hide(); 
          try {
            Swal.fire( JSON.stringify(error));
          } catch (error) {
            Swal.fire( 'error interno, validar con el administrador del sitio', '' , 'error');
          }
        }
        , complete : ()=>this.loading.hide()    }  );
     }
     cerrarInventario(){
      if(this.inventario.bodega.id <= 0)
      { Swal.fire('Debe escoger la bodega!!!', '', 'error');
      return;}
      if(this.inventario.tipoInventario <= 0)
      { Swal.fire('Debe escoger el tipo de inventario!!', '', 'error');
      return;}
      if(this.inventario.nombre.trim() === '')
      {  Swal.fire('Debe ingresar el nombre del inventario!!!', '', 'error');
      return;} 
        let msg = '';
        CustomConsole.log("inventario cerrar" , this.inventario)
      switch(this.inventario.tipoInventario){
        case 1 : 
            msg = 'Ten en cuenta, el inventario tipo GENERAL borrara la existencia actual de los productos ingresados '+
             'y los reemplazara con los nuevos valores '
        break;
        case 2 :   
        msg = 'Ten en cuenta, el inventario tipo AJUSTE, sumara a la existencia actual de los productos ingresados '+
             'los nuevos valores con actuales ,  es decir si un producto X tiene valor -10 e ingresas 10 el valor acual del producto sera 0 (cero)'
        break;
        default:
          msg = 'Tipo de inventario no reconocido.';
      }

      msg  = msg + '. esta operacion no es reversible asi que es necesario que tengas muy claro esto antes de aplicar' ;
     
      Swal.fire({
        title: '¿Estás seguro?',
        text: msg,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, ¡hazlo!',
        cancelButtonText: 'No, cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          
      this.productoService.CERRAR_INVENTARIO(this.inventario.bodega.id, this.inventario.nombre ,this.inventario.descripcion
        ,this.inventario.tipoInventario ).subscribe(
          {next :       (respuesta:ApiResponse<GenericMutationPayload>)=>{CustomConsole.log(respuesta)        
          if (respuesta.ok){ 
            this.AuxIngresoInventarioModule = [];   
            this.inventario ={
              nombre : '' , 
              bodega : 0 , 
              descripcion : ''
            }
            Swal.fire('inventario Cerrado con exito', '', 'success');
         }else{ 
           try {
            Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
           } catch (error : any) {
            Swal.fire('error en el servidor', '', 'error');
           }
         
         }
         },error: error => 
          { Swal.fire(JSON.stringify(error)  )     
                     }  , complete:()=>
          this.loading.hide()
        }
        )
          // Aquí pones la lógica para la acción confirmada
        } 
      });





     }
     borrarPrecarga(){
      if(this.inventario.bodega <= 0)
      {this.AuxIngresoInventarioModule=[];
      return;}
      
      this.productoService.borrarPrecarguePorBodega(this.inventario.bodega.id).subscribe(
        (respuesta:InventarioPrechartResponse)=>{CustomConsole.log(respuesta)
        
          if (respuesta.ok){ 
            this.AuxIngresoInventarioModule = [];   
         }else{ 
           try {
            Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
           } catch (error : any) {
            Swal.fire('error en el servidor', '', 'error');
           }
         
         }
          this.loading.hide(); 
         }
        );
     }
     borrarIngreso(obj:AuxIngresoInventarioModule){

       this.productoService.eliminaritemIngresoInventario(obj.id)
       .subscribe({next:(data:ApiResponse<GenericMutationPayload>)=> { 
         if (data.ok) {
           Swal.fire( "Elemento eliminado con exito" , '', 'success');
           this.cargarPrecargue()
         }
                    },
                    error:error=>Swal.fire( error.error.error, '', 'error')
                  }
     )
     }
     cargarPrecargue(){
      if(this.inventario.bodega <= 0)
      {this.AuxIngresoInventarioModule=[];
      return;}
      this.productoService.getPrecarguePorBodega(this.inventario.bodega.id).subscribe({next:
        (datos:ApiResponse<GenericRecordsPayload<AuxIngresoInventarioModule>>)=>{
           CustomConsole.log(datos);
      if (datos.ok && datos.data.count > 0 ){ 
        this.AuxIngresoInventarioModule = datos.data.records;  
      }else{
        this.AuxIngresoInventarioModule = [];      }
        } ,
        error:error => {this.loading.hide();
          Swal.fire('getPrecarguePorBodega',error) 
          try {
            Swal.fire( error.error.error, '', 'error');
          } catch (error) {
            Swal.fire( 'error interno, validar con el administrador del sitio', '', 'error');
          }
        },complete:()=>
          this.loading.hide() }
        );
     }
     editarPrd(prd:ProductoModel){ 
      console.clear();
      CustomConsole.log('producto enviado', prd);
      
      this.limpiarFormulario() 
      this.newAbrirDialog.open(ModalUpdateProductoComponent , { data:  prd }  )
      .afterClosed()
      .subscribe(( response:responsePrd  )=>{
        CustomConsole.log(response);
        
        if (response.confirmado){ 
          CustomConsole.log('dato retornado busqueda directa',response.datoDevolucion);
       
        } 
      })  

     }


     existencias(prd:ProductoModel){
      this.productoService.getProductosExistencia(prd).subscribe({
        next:(value:ApiResponse<GenericRecordsPayload<PrdExistenciasModule>> )=>{
           CustomConsole.log('producto existencia' , value)
           if(value.ok){
            if(value.data.count > 0 ){
              prd.existencias = value.data.records;
              if (prd.existencias.length > 0 ){ 
                this.existenciasPrd = prd.existencias; 
                CustomConsole.log(this.existenciasPrd);
                let pagosHtml:string =  `<h1>Producto : <br>${prd.nombre}</h1>
                <table class='table' style='font-size:12px'> 
                <tr><td colspan='10' > <h1>Existentencias y Movimientos</h1><td></tr> 
                <tr>
                <td>Bodega</td>
                <td>ultimo mov.</td>
                <td>fecha</td>
                <td>usuario</td>
                <td>cnt. inicial</td>
                <td>cnt. actual</td>
                <td>ventas</td>
                <td>compras</td>
                <td>devoluciones</td>
                <td>remisionada</td> 
                </tr>
               `;
               // cantInicial, cantActual, compras, ventas, devoluciones, stock, remisionada,
               
               this.existenciasPrd!.forEach(pago=>{
                 pagosHtml +=`<tr> `;
                 pagosHtml +=`<td>${pago.nombreBodega}</td> `;
                 pagosHtml +=`<td nowrap>${pago.ult_mov}</td> `;
                 pagosHtml +=`<td nowrap>${pago.fecha_ultimo_cambio}</td> `;
                 pagosHtml +=`<td nowrap>${pago.nombreUsuario_ult_mov}</td> `;
                 pagosHtml +=`<td nowrap>${pago.cant_inicial}</td> `;
                 pagosHtml +=`<td nowrap>${pago.cant_actual}</td> `;
                 pagosHtml +=`<td nowrap>${pago.ventas}</td> `;
                 pagosHtml +=`<td nowrap>${pago.compras}</td> `;
                 pagosHtml +=`<td nowrap>${pago.devoluciones}</td> `;
                 pagosHtml +=`<td nowrap>${pago.remisiones}</td> `;
                 pagosHtml +=`</tr> `;
               })
           
           
               pagosHtml += '</table>'
           
           
           
               Swal.fire({html:pagosHtml, width: '900px'});
        
        
        
        
              }
              else{
                this.existenciasPrd = [];
                Swal.fire( 'el producto ' + prd.nombre+ ' no posee existencias en ninguna bodega!!', '', 'error');
              } 
            }else{
              Swal.fire( 'el producto ' + prd.nombre+ ' no posee existencias en ninguna bodega!!', '', 'error');
            }
           }else{
            Swal.fire(value.error?.message ?? 'error en el servidor')
           }
        },
        error:(e)=> Swal.fire(JSON.stringify(e))
      })
    
    
     }
     existencias_old(prd:ProductoModel){
      this.loading.show()
      this.productoService.getProductosExistencia(prd).subscribe(
        {
          next:
        (datos:ApiResponse<GenericRecordsPayload<PrdExistenciasModule>>)=>{
           CustomConsole.log(datos);
           
      if (datos.ok && datos.data.count > 0 ){ 
        this.existenciasPrd = datos.data.records; 
        CustomConsole.log(this.existenciasPrd);
        let pagosHtml:string =  `<h1>Producto : <br>${this.existenciasPrd[0].nombre_producto}</h1>
        <table class='table' style='font-size:12px'> 
        <tr><td colspan='10' > <h1>Existentencias y Movimientos</h1><td></tr> 
        <tr>
        <td>Bodega</td>
        <td>ultimo mov.</td>
        <td>fecha</td>
        <td>usuario</td>
        <td>cnt. inicial</td>
        <td>cnt. actual</td>
        <td>ventas</td>
        <td>compras</td>
        <td>devoluciones</td>
        <td>remisionada</td> 
        </tr>
       `;
       // cantInicial, cantActual, compras, ventas, devoluciones, stock, remisionada,
       
       this.existenciasPrd!.forEach(pago=>{
         pagosHtml +=`<tr> `;
         pagosHtml +=`<td>${pago.nombreBodega}</td> `;
         pagosHtml +=`<td nowrap>${pago.ult_mov}</td> `;
         pagosHtml +=`<td nowrap>${pago.fecha_ultimo_cambio}</td> `;
         pagosHtml +=`<td nowrap>${pago.nombreUsuario_ult_mov}</td> `;
         pagosHtml +=`<td nowrap>${pago.cant_inicial}</td> `;
         pagosHtml +=`<td nowrap>${pago.cant_actual}</td> `;
         pagosHtml +=`<td nowrap>${pago.ventas}</td> `;
         pagosHtml +=`<td nowrap>${pago.compras}</td> `;
         pagosHtml +=`<td nowrap>${pago.devoluciones}</td> `;
         pagosHtml +=`<td nowrap>${pago.remisiones}</td> `;
         pagosHtml +=`</tr> `;
       })
   
   
       pagosHtml += '</table>'
   
   
   
       Swal.fire({html:pagosHtml, width: '900px'});




      }else{
        this.existenciasPrd = [];
        Swal.fire( 'el producto ' + prd.nombre+ ' no posee existencias en ninguna bodega!!', '', 'error');
      }
  
          this.loading.hide()
        } , error:
        error => {this.loading.hide();
          Swal.fire('getProductosExistencia',error) 
          try {
            Swal.fire( error.error.error, '', 'error');
          } catch (error) {
            Swal.fire( 'error interno, validar con el administrador del sitio', '', 'error');
          }
        }}
        );
     }
     getCategorias_marcas(){ 
  this.marcas = [this.marcasAux];
  this.categorias = [];

    this.loading.show()
    this.productoService.getCategorias_marcas().subscribe({
      next: (datos:ApiResponse<GenericMultiRecordsPayload<any>>)=>{
         CustomConsole.log('getCategorias_marcas',datos);
    if (datos.ok && (datos.data.records[0]?.length ?? 0) > 0 ){ 
      this.categorias = datos.data.records[0] ;
      CustomConsole.log(this.categorias);
      this.categorias1 = this.categorias.filter(x=>x.idPadreCategoria == 0)
      this.categorias1.unshift(this.categoriaAux[0]);
    }else{
      this.categorias = [...this.categoriaAux ];
    }
    if ((datos.data.records[1]?.length ?? 0) > 0 ){ 
      this.marcas = datos.data.records[1] ;
      CustomConsole.log(this.marcas);
    }else{
      this.marcas = [this.marcasAux];
    }
        this.loading.hide()
      } ,
      error:(error : any) => {this.loading.hide();
        Swal.fire('getCategorias_marcas',error) 
        try {
          Swal.fire( error.error.error, '', 'error');
        } catch (error) {
          Swal.fire( 'error interno, validar con el administrador del sitio', '', 'error');
        }
      }}
      );
   
    }

    

     limpiarFormulario(){
      this.newProducto  =new ProductoModel( '' , '' ,0 ,0,'','0', 0,0,0,0,0,'','','',0,''  ) ; 
      
        let precio:PrdPreciosModule = new PrdPreciosModule();
        precio.id_producto = this.newProducto.id
        precio.precio_con_iva = 0;
        precio.precio_antes_de_iva = 0;
        precio.valor_iva = 0;
    
        if(this.newProducto.precios[0] == undefined)this.newProducto.precios.push({...precio})  ;
        if(this.newProducto.precios[1] == undefined)this.newProducto.precios.push({...precio})  ;
        if(this.newProducto.precios[2] == undefined)this.newProducto.precios.push({...precio})  ;

     }
     enviarProducto(){
     
      if( this.newProducto.nombre.trim()  === ''){ 
        Swal.fire( 'Debe establecer minimo el nombre principal del  producto', '', 'error');
       return ;
       }
       if(this.newProducto.infoTributaria == 'GRABADO' && this.newProducto.porcent_iva == 0){
        Swal.fire( 'Debe establecer el procentaje del IVA', '', 'error');
        return ;
      }
      if(this.newProducto.infoTributaria !== 'GRABADO'){
        this.newProducto.porcent_iva == 0
      }
       if( this.newProducto.idCategoria!   <= 0){ 
        Swal.fire( 'Debe establecer una categoria', '', 'error');
       return ;
       } 
       if( this.newProducto.idMarca!   <= 0){ 
        Swal.fire( 'Debe establecer una marca', '', 'error');
       return ;
       } 
       if( this.newProducto.tipo_producto!   <= 0){ 
        Swal.fire( 'Debe establecer un tipo de producto', '', 'error');
       return ;
       }
        

       if (this.newProducto.porcent_iva??0 > 0){
        let ivaPorcentaje = this.newProducto.porcent_iva??0;
        if (this.ivaIncluido){
        for (let i=0; i<3 ;i++){
         let precioConIVA =  this.newProducto.precios[i].precio_con_iva??0;
         this.newProducto.precios[i].precio_antes_de_iva = precioConIVA / (1 + ivaPorcentaje / 100);
         this.newProducto.precios[i].valor_iva = precioConIVA - this.newProducto.precios[i].precio_antes_de_iva!;
         this.newProducto.precios[i].precio_con_iva = precioConIVA;
        }
        }else{
          for (let i=0; i<3 ;i++){
            let precioAntesDeIVA =  this.newProducto.precios[i].precio_con_iva??0;
            this.newProducto.precios[i].precio_antes_de_iva = precioAntesDeIVA;
            this.newProducto.precios[i].valor_iva = precioAntesDeIVA * (ivaPorcentaje / 100);
            this.newProducto.precios[i].precio_con_iva = precioAntesDeIVA +  this.newProducto.precios[i].valor_iva!;
           }
        }
      }else{
        for (let i=0; i<3 ;i++){ 
          this.newProducto.precios[i].precio_antes_de_iva =   this.newProducto.precios[i].precio_con_iva??0;;
          this.newProducto.precios[i].valor_iva = 0; 
         }
      } 

      this.loading.show(); 
      this.productoService.guardarNuevoProducto(this.newProducto).subscribe(
        {next:
       (respuesta:InventarioProductMutationResponse)=>{CustomConsole.log(respuesta)
        
       if (respuesta.ok){
        this.buscar = true;
        Swal.fire('datos ingresados con exito'); 
         this.limpiarFormulario();
      }else{ 
        try {
         Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
        } catch (error : any) {
         Swal.fire('error en el servidor', '', 'error');
        }
      
      }
      
       }
       , error: error =>  {Swal.fire(JSON.stringify(error), '', 'error')  ;
        Swal.fire("enviar producto" ,  error)
       }
       , complete: () =>  {this.loading.hide();} }
      ) 
     }

     
     getProductos(){ 
      if(!this.buscar){return}
    this.loading.show()
    this.productoService.getProductosGeneral([0,100]).subscribe({
      next: 
      (datos:InventarioProductsResponse)=>{
         CustomConsole.log(datos);
         
    if (datos.data.count > 0 ){ 
      this.buscar =  false;
      this.Productos = datos.data.products 
      CustomConsole.log('getProductos',this.Productos);
    }else{
      this.Productos = [];
    }

        this.loading.hide()
      } , error:    error => {this.loading.hide();
        Swal.fire('getProductosGeneral',error) 
        try {
          Swal.fire( error.error.error, '', 'error');
        } catch (error) {
          Swal.fire( 'error interno, validar con el administrador del sitio', '', 'error');
        }
      }}
      );
    }

  removeGetActivo(a:string){
    CustomConsole.log(a);
    $('.likcontPrd').each(function(){
       $(this).removeClass('active')
    }) ;
    
    $('#'+a ).addClass('active') 
    $('.contPrd').css('display' , 'none   ')
    const elemDiv = document.getElementById(a.trim()+'Div') 
    elemDiv!.style.display = 'block'
  }
  ngOnInit(): void {
  }

}
