import { Component, OnInit } from '@angular/core';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { DocumentoService } from 'src/app/services/documento.service';
import { loading } from 'src/app/models/app.loading';  
import { PrinterManager } from 'src/app/models/printerManager';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { cajasServices } from 'src/app/services/Cajas.services';
import { ProductoVendido } from 'src/app/interfaces/productoVendido.';
import Swal from 'sweetalert2';
import { CategoriasVendidasModel } from 'src/app/models/categorias.model';
import { ResumenVenta } from 'src/app/interfaces/resumenVenta.';
import { EmpleadoModel, VendedorModel } from 'src/app/models/empleados/empleados.module';
import { UsuarioConVentaModel } from 'src/app/models/usuario.model';
import { CustomConsole } from 'src/app/models/CustomConsole';

@Component({
  selector: 'app-ventasPorVendedor',
  templateUrl: './ventasPorVendedor.component.html',
  styleUrls: ['./ventasPorVendedor.component.css']
})
export class ventasPorVendedorComponent  implements OnInit {
  resumenVenta?:ResumenVenta;
  resumen:boolean=false;
  hideR:boolean=true;
  hideF:boolean=true;
  saler:boolean=true;
  documentos : DocumentosModel[] = [];
  indexProductoSel:number = 0; 
  empleadoSeleccionado: VendedorModel | null  = new VendedorModel(); 
  usuarioSeleccionado: UsuarioConVentaModel | null  = new UsuarioConVentaModel(undefined); 
  fecha1:string;
  fechaMinima:string;
  fecha2:string;
  maximo:string;
  constructor(public loading : loading,private serviceCaja:cajasServices,
    private documentoService : DocumentoService, private inicioService:DatosInicialesService ) {
      this.empleadoSeleccionado!.id = 0 ; 
      this.empleadoSeleccionado!.nombreCompleto = 'Seleccione un empleado para filtrar';  
      this.usuarioSeleccionado!.ID = 0;
      this.usuarioSeleccionado!.nombreCompleto = 'Seleccione un usuario Cajero para filtrar';
       let fecha = new Date();
       this.fecha1 = fecha.getFullYear().toString() +'-'+ (fecha.getMonth() + 1).toString().padStart(2,'0')+'-'+ (fecha.getDate()).toString().padStart(2,'0') ;
       this.fecha2 = this.fecha1;
        this.maximo = this.fecha1;
        this.fechaMinima=this.fecha1;
     }

     setVendedor(){
      this.saler=true;
      this.documentos= [];
      this.usuarioSeleccionado!.ID = 0;
      this.usuarioSeleccionado!.nombreCompleto = 'Seleccione un usuario Cajero para filtrar';
      this.empleadoSeleccionado!.id = 0 ; 
      this.empleadoSeleccionado!.nombreCompleto = 'Seleccione un empleado para filtrar'; 
      this.resumenVenta = undefined; 
     }
     setUsuario(){
      this.saler=false;
      this.documentos = [];
      this.usuarioSeleccionado!.ID = 0;
      this.usuarioSeleccionado!.nombreCompleto = 'Seleccione un usuario Cajero para filtrar';
      this.empleadoSeleccionado!.id = 0 ; 
      this.empleadoSeleccionado!.nombreCompleto = 'Seleccione un empleado para filtrar';  
      this.resumenVenta = undefined; 
     }
     getVentasPorVendedor(prd:VendedorModel){
      this.usuarioSeleccionado!.ID = 0;
      this.usuarioSeleccionado!.nombreCompleto = 'Seleccione un usuario Cajero para filtrar';
      CustomConsole.log('productos seleccionado' , this.empleadoSeleccionado);
      this.empleadoSeleccionado = prd;
      if(this.empleadoSeleccionado?.id != 0){
      //  alert('categoria seleccionado ' +JSON.stringify(this.empleadoSeleccionado!) )
        let f1 =  this.empleadoSeleccionado.firstDate!.toString()
        this.fecha1 =  f1.slice(0,10) ;
        f1 =  this.empleadoSeleccionado.lastDate!.toString() ;
        this.fecha2 =  f1.slice(0,10) ;
        this.maximo = this.fecha2 ;
        this.fechaMinima = this.fecha1;
        this.hideR=false; 
        this.hideF=false;

        this.documentoService.getResumenVendedorVentas
        (this.empleadoSeleccionado?.id!,this.fecha1.trim(),this.fecha2.trim() ).subscribe({next:
          (datos:any)=>{
           
        if (datos.numdata > 0 ){
          this.resumenVenta = datos.data  ;
          CustomConsole.log('getResumenProductosVentas',this.resumenVenta);
       } else{
        Swal.fire('No existen datos relacionados con la busqueda')
       } 
       this.hideR=true; 
      } ,error:
      (error: any) =>{
        Swal.fire(JSON.stringify(error )); 
        this.hideR=true; 
      }});
        this.documentoService.getVentasFinalizadasPorVendedorFecha(this.empleadoSeleccionado?.id,this.fecha1.trim(),this.fecha2.trim() )
        .subscribe({next:
          (datos:any)=>{
            let cont = 0; 
             this.documentos = []; 
             CustomConsole.log('getDocumentos', datos.numdata);
             CustomConsole.log('getDocumentos_recuest', datos );
             
        if (datos.numdata > 0 ){ 
          this.documentos = datos.data;
       } else{
        Swal.fire('No existen datos relacionados con la busqueda')
       } this.hideF=true; 
      } ,error:
      (error: any) =>{
        Swal.fire(JSON.stringify(error ));
        this.hideF=true; 
      }}
    
    ); 



      }else{let fecha = new Date();
        this.fecha1 = fecha.getFullYear().toString() +'-'+ (fecha.getMonth() + 1).toString().padStart(2,'0')+'-'+ (fecha.getDate()).toString().padStart(2,'0') ;
        this.fecha2 = this.fecha1;
        this.fechaMinima = this.fecha1;
      }


     }

     getVentasPorUsuario(prd:UsuarioConVentaModel){
      CustomConsole.log('productos seleccionado' , this.empleadoSeleccionado); 
      this.empleadoSeleccionado!.id = 0 ; 
      this.empleadoSeleccionado!.nombreCompleto = 'Seleccione un empleado para filtrar';  
      this.usuarioSeleccionado = prd;
      if(this.usuarioSeleccionado?.ID != 0){
      //  alert('categoria seleccionado ' +JSON.stringify(this.empleadoSeleccionado!) )
        let f1 =  this.usuarioSeleccionado!.firstDate!.toString()
        this.fecha1 =  f1.slice(0,10) ;
        f1 =  this.usuarioSeleccionado!.lastDate!.toString() ;
        this.fecha2 =  f1.slice(0,10) ;
        this.fechaMinima = this.fecha1;
        this.maximo = this.fecha2 ;
        this.hideR=false; 
        this.hideF=false;

        this.documentoService.getResumenUsuarioVentas
        (this.usuarioSeleccionado?.ID!,this.fecha1.trim(),this.fecha2.trim() ).subscribe({next:
          (datos:any)=>{
           
        if (datos.numdata > 0 ){
          this.resumenVenta = datos.data  ;
          CustomConsole.log('getResumenProductosVentas',this.resumenVenta);
       } else{
        Swal.fire('No existen datos relacionados con la busqueda')
       } 
       this.hideR=true; 
      } ,error:
      (error: any) =>{
        Swal.fire(JSON.stringify(error )); 
        this.hideR=true; 
      }});
        this.documentoService.getVentasFinalizadasPorUsuarioFecha
        (this.usuarioSeleccionado?.ID!,this.fecha1.trim(),this.fecha2.trim() )
        .subscribe({next:
          (datos:any)=>{
            let cont = 0; 
             this.documentos = []; 
             CustomConsole.log('getDocumentos', datos.numdata);
             CustomConsole.log('getDocumentos_recuest', datos );
             
        if (datos.numdata > 0 ){ 
          this.documentos = datos.data;
       } else{
        Swal.fire('No existen datos relacionados con la busqueda')
       } this.hideF=true; 
      } ,error:
      (error: any) =>{
        Swal.fire(JSON.stringify(error ));
        this.hideF=true; 
      }}
    
    );  
      }else{let fecha = new Date();
        this.fecha1 = fecha.getFullYear().toString() +'-'+ (fecha.getMonth() + 1).toString().padStart(2,'0')+'-'+ (fecha.getDate()).toString().padStart(2,'0') ;
        this.fecha2 = this.fecha1;
      
        this.fechaMinima = this.fecha1;
      }


     }
  ngOnInit(): void { 
       this.inicioService.currentSucursal.subscribe({next:value=>{
        PrinterManager.setSucursal(value);
      }})


  }
  limpiarListado(){
    this.documentos=[];
  } 

  VerFactura(venta:DocumentosModel){
    let pagosHtml:string =  `<h1>Factura :  ${venta.idDocumentoFinal}</h1>
    <h2>Cliente :  ${venta.clienteNombre}</h2>
    <h2>fecha :  ${venta.fecha}</h2>
    <table class='table' style='font-size:12px'> 
    <tr>
    <td>Producto</td>
    <td>código</td>
    <td>cantidad</td>
    <td>precio</td>
    <td>IVA</td>
    <td>total</td> 
    </tr>
   `;
   // cantInicial, cantActual, compras, ventas, devoluciones, stock, remisionada,
   
   venta.listado!.forEach(pago=>{
     pagosHtml +=`<tr> `;
     pagosHtml +=`<td>${pago.nombreProducto}</td> `;
     pagosHtml +=`<td nowrap>${pago.idProducto}</td> `;
     pagosHtml +=`<td nowrap>${pago.cant_real_descontada}</td> `;
     pagosHtml +=`<td nowrap>${pago.presioSinIVa}</td> `;
     pagosHtml +=`<td nowrap>${pago.IVA}</td> `;
     pagosHtml +=`<td nowrap>${pago.valorTotal}</td> `; 
     pagosHtml +=`</tr> `;
   })



   pagosHtml +=   `  
   <tr><td colspan="2"></td>
     <td colspan="4">
     <table class='table' style='font-size:12px'> 
     <tr><td colspan="3">
     <h4>Pagos</h4></td></tr>
  `;
  pagosHtml +=`<tr> `;
  pagosHtml +=`<td>Medio de pago</td> `;
  pagosHtml +=`<td nowrap>Referencia</td> `;
  pagosHtml +=`<td nowrap>Valor</td> `; 
  pagosHtml +=`</tr> `;
  // cantInicial, cantActual, compras, ventas, devoluciones, stock, remisionada,
  
  venta.pagos!.forEach(pago=>{
    pagosHtml +=`<tr> `;
    pagosHtml +=`<td style="text-align: left;"><b>${pago.nombreMedio}</b></td> `;
    pagosHtml +=`<td nowrap>${pago.referencia}</td> `;
    pagosHtml +=`<td nowrap>${pago.valorPagado}</td> `; 
    pagosHtml +=`</tr> `;
  })


  pagosHtml += '</table>'


  
  pagosHtml += '</td></tr></table>'

   Swal.fire({html:pagosHtml, width: '800px' , showCancelButton:true , cancelButtonText:'imprimir'}).then(value=>{
    CustomConsole.log(value);
    if(value.isDismissed){
      this.imprimirFactura(venta);
    }
    
   });
  }
  async imprimirFactura(factura:DocumentosModel)
  { CustomConsole.log(factura); 
   let printerManager =  new PrinterManager(this.serviceCaja);;
   printerManager.setDocumento(factura);
   printerManager.printReceipt();
  } 
 
  async imprimirResumen()
  {  
   let printerManager =  new PrinterManager(this.serviceCaja); 
   if(this.resumenVenta != undefined){ 
   printerManager.printResumenVenta(false,this.resumenVenta);
  } 
}
 
async ExportarResumen()
{  
 let printerManager =  new PrinterManager(this.serviceCaja); 
 if(this.resumenVenta != undefined){ 
  printerManager.exportResumenVentas( this.resumenVenta , 'VentaPorVendedor');
} }

  getDocumentosPorFecha(){
    //this.printer_factura_final();  
    
    if(this.empleadoSeleccionado?.id == 0 && this.saler){  
      Swal.fire('Es necesario escoger el Vendedor a filtrar','error','error');
      return;}
      if(this.usuarioSeleccionado?.ID == 0 && !this.saler){  
      Swal.fire('Es necesario escoger Usuario de caja a filtrar','error','error');
      return;}
    if(this.fecha1.trim() === ''){
      Swal.fire('Es necesario escoger la fecha inicial del rango de factura','error','error');
      return;
    } 
    if(this.fecha2.trim() === ''){
      Swal.fire('Es necesario escoger la fecha final del rango de factura','error','error');
      return;
    } 
    this.hideR=false; 
    this.hideF=false;

  let idEmpleado:number|undefined = (typeof(this.empleadoSeleccionado?.id) =='string')?parseInt(this.empleadoSeleccionado?.id):this.empleadoSeleccionado?.id;
  
  let idUsuario:number|undefined = (typeof(this.usuarioSeleccionado?.ID) =='string')?parseInt(this.usuarioSeleccionado?.ID):this.usuarioSeleccionado?.ID;
    
  if( (idEmpleado||0) > 0){
      this.documentoService.getResumenVendedorVentas
      (this.empleadoSeleccionado?.id!,this.fecha1.trim(),this.fecha2.trim() ).subscribe({next:
        (datos:any)=>{
         
      if (datos.numdata > 0 ){
        this.resumenVenta = datos.data  ;
        CustomConsole.log('getResumenProductosVentas',this.resumenVenta);
     } else{
      Swal.fire('No existen datos relacionados con la busqueda')
     } 
     this.hideR=true; 
    } ,error:
    (error: any) =>{
      Swal.fire(JSON.stringify(error )); 
      this.hideR=true; 
    }});
      this.documentoService.getVentasFinalizadasPorVendedorFecha(this.empleadoSeleccionado?.id,this.fecha1.trim(),this.fecha2.trim() )
      .subscribe({next:
        (datos:any)=>{
          let cont = 0; 
           this.documentos = []; 
           CustomConsole.log('getDocumentos', datos.numdata);
           CustomConsole.log('getDocumentos_recuest', datos );
           
      if (datos.numdata > 0 ){ 
        this.documentos = datos.data;
     } else{
      Swal.fire('No existen datos relacionados con la busqueda')
     } this.hideF=true; 
    } ,error:
    (error: any) =>{
      Swal.fire(JSON.stringify(error ));
      this.hideF=true; 
    }}
  
  ); 
    }else if((idUsuario||0) > 0){
      
      this.documentoService.getResumenUsuarioVentas
      (this.usuarioSeleccionado?.ID!,this.fecha1.trim(),this.fecha2.trim() ).subscribe({next:
        (datos:any)=>{
         
      if (datos.numdata > 0 ){
        this.resumenVenta = datos.data  ;
        CustomConsole.log('getResumenProductosVentas',this.resumenVenta);
     } else{
      Swal.fire('No existen datos relacionados con la busqueda')
     } 
     this.hideR=true; 
    } ,error:
    (error: any) =>{
      Swal.fire(JSON.stringify(error )); 
      this.hideR=true; 
    }});
      this.documentoService.getVentasFinalizadasPorUsuarioFecha
      (this.usuarioSeleccionado?.ID!,this.fecha1.trim(),this.fecha2.trim() )
      .subscribe({next:
        (datos:any)=>{
          let cont = 0; 
           this.documentos = []; 
           CustomConsole.log('getDocumentos', datos.numdata);
           CustomConsole.log('getDocumentos_recuest', datos );
           
      if (datos.numdata > 0 ){ 
        this.documentos = datos.data;
     } else{
      Swal.fire('No existen datos relacionados con la busqueda')
     } this.hideF=true; 
    } ,error:
    (error: any) =>{
      Swal.fire(JSON.stringify(error ));
      this.hideF=true; 
    }}
  
  ); 

    }




  } 
}
