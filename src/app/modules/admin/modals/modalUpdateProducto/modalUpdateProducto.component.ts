import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { loading } from 'src/app/models/app.loading';
import { CategoriasModel } from 'src/app/models/categorias.model';
import { MarcasModel } from 'src/app/models/marcas/marcas.module';
import { PrdPreciosModule } from 'src/app/models/prd-precios/prd-precios.module';
import { PresentacionPrdModel } from 'src/app/models/presentacionPrdModel';
import { ProductoModel } from 'src/app/models/producto/producto.module'; 
import { ProductoService } from 'src/app/services/producto.service';
import Swal from 'sweetalert2';
import { InventarioProductMutationResponse } from 'src/app/interfaces/inventario-response.interface';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMultiRecordsPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-modal-update-producto',
  templateUrl: './modalUpdateProducto.component.html',
  styleUrls: ['./modalUpdateProducto.component.css'],
})
export class ModalUpdateProductoComponent {
  ivaIncluido :boolean = true;
   marcas:MarcasModel[] = []; 
   categorias:CategoriasModel[] = [];
   
   tipProductos:any = [{id:0 , nombre:'Seleccione el tipo de producto'},
    {id:1 , nombre:'prd.fisico '},
         {id:2 , nombre:'servicios' } 
       ];
  presentacion:PresentacionPrdModel[] = []
  private productoService = inject(ProductoService)  
private dialogo= inject(MatDialogRef<ModalUpdateProductoComponent>);
  constructor( @Inject(MAT_DIALOG_DATA) public   newProducto:ProductoModel , private loading:loading){ 
    this.getPresentacion();
    this.getCategorias_marcas()   
    //CustomConsole.log('producto injectado' , this.newProducto); 
    let precio:PrdPreciosModule = new PrdPreciosModule();
    precio.id_producto = this.newProducto.id
    precio.precio_con_iva = 0;
    precio.precio_antes_de_iva = 0;
    precio.valor_iva = 0;
  if(this.newProducto.precios[0] == undefined)this.newProducto.precios[0]= {...precio}  ;
  if(this.newProducto.precios[1] == undefined)this.newProducto.precios[1]= {...precio}  ;
  if(this.newProducto.precios[2] == undefined)this.newProducto.precios[2]= {...precio}  ;
  }

 
    
  getPresentacion(){
    this.productoService.getPresentacioProducto().subscribe({next:(value:ApiResponse<GenericRecordsPayload<PresentacionPrdModel>>)=>{
      this.presentacion = value.data.records;  
    }});
  }
  getCategorias_marcas(){ 
    this.marcas = [];
    this.categorias = [];
  
      this.loading.show()
      this.productoService.getCategorias_marcas().subscribe({
        next: (datos:ApiResponse<GenericMultiRecordsPayload<any>>)=>{
      if (datos.ok){
        this.categorias = datos.data.records[0] ?? [];
        this.marcas = datos.data.records[1] ?? [];
      }else{
        this.categorias = [];
        this.marcas = [];
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
        this.dialogo.close(true); 
  
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
          this.newProducto.porcent_iva = 0
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
        /* if( this.newProducto.precioVenta   <= 0){ 
          Swal.fire( 'Debe establecer el precio de venta', '', 'error');
         return ;
         } */
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
        this.productoService.updateProducto(this.newProducto).subscribe(
          {next:
         (respuesta:InventarioProductMutationResponse)=>{//CustomConsole.log(respuesta)
          
         if (respuesta.ok){ 
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
 }
