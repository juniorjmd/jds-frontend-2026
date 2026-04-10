import { Component, OnInit } from '@angular/core';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { DocumentoService } from 'src/app/services/documento.service';
import { loading } from 'src/app/models/app.loading'; 
import Swal from 'sweetalert2';
import { ConectorPlugin } from 'src/app/models/app.printer.con';
import { DocpagosModel } from 'src/app/models/ventas/pagos.model';
import { DocumentoListado } from 'src/app/interfaces/documento.interface';
import { printer, url } from 'src/app/models/app.db.url';
import { PrinterManager } from 'src/app/models/printerManager';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { cajasServices } from 'src/app/services/Cajas.services';
import {   ResumenVenta } from 'src/app/interfaces/resumenVenta.';
import { CustomConsole } from 'src/app/models/CustomConsole';

@Component({
  selector: 'app-ventasDiariaHora',
  templateUrl: './ventasDiariaHora.component.html',
  styleUrls: ['./ventasDiariaHora.component.css']
})
export class ventasDiariaHoraComponent implements OnInit {
  resumenVenta?:ResumenVenta;
  resumen:boolean=false;
  hideR:boolean=true;
  hideF:boolean=true;
  documentos : DocumentosModel[] = [];
  codFactura:string;
  codCliente:string;
  fecha1:string;
  fecha2:string; 
  hora1:string = '08:00';  
  hora2:string = '18:00';
  maximo:string; 
  constructor(public loading : loading,private serviceCaja:cajasServices,
    private documentoService : DocumentoService, private inicioService:DatosInicialesService ) {
       this.codFactura = '';
       this.codCliente= '';
       /**const year = date.getFullYear() * 1e4; // 1e4 gives us the the other digits to be filled later, so 20210000.
const month = (date.getMonth() + 1) * 100; // months are numbered 0-11 in JavaScript, * 100 to move two digits to the left. 20210011 => 20211100
const day = date.getDate(); // */
      let fecha = new Date();
       this.fecha1 = fecha.getFullYear().toString() +'-'+ (fecha.getMonth() + 1).toString().padStart(2,'0')+'-'+ (fecha.getDate()).toString().padStart(2,'0') ;
       this.fecha2 = this.fecha1;
       this.maximo = this.fecha2 ;
    
     }

  ngOnInit(): void {
       this.removeGetActivo('ListadoPorNumeroLink');
       this.inicioService.currentSucursal.subscribe({next:value=>{
        PrinterManager.setSucursal(value);
      }})
  }
  limpiarListado(){
    this.documentos=[];
  }
  removeGetActivo(a:string){
    this.limpiarListado()
    CustomConsole.log(a);
    $('.likcontPrd').each(function(){
       $(this).removeClass('active')
    }) ;
    
    $('#'+a ).addClass('active') 
    $('.contPrd').css('display' , 'none   ')
    const elemDiv = document.getElementById(a.trim()+'Div') 
    elemDiv!.style.display = 'block'
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
  printerManager.exportResumenVentas( this.resumenVenta , 'VentaFechaYHora');
} }
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

  getDocumentos(){
    //this.printer_factura_final(); 
    if(this.codFactura.trim() === ''){
      Swal.fire('Es necesario ingresar el codigo o numero de factura','error','error');
      return;
    }
    this.documentoService.getVentasFinalizadas(this.codFactura.trim() ).subscribe(
      (datos:any)=>{
        let cont = 0; 
         this.documentos = []; 
         CustomConsole.log('getDocumentos', datos.numdata);
         CustomConsole.log('getDocumentos_recuest', datos );
         
    if (datos.numdata > 0 ){ 
      this.documentos = datos.data;
   } else{
    Swal.fire('No existen datos relacionados con la busqueda')
   } 
  } ,
  (error: any) =>{
    alert(JSON.stringify(error ));
  
  });
  }


  getDocumentosPorFecha(){
    //this.printer_factura_final(); 
    if(this.fecha1.trim() === ''){
      Swal.fire('Es necesario escoger la fecha inicial del rango de factura','error','error');
      return;
    } 
    if(this.fecha2.trim() === ''){
      Swal.fire('Es necesario escoger la fecha final del rango de factura','error','error');
      return;
    }
    this.documentoService.getResumenVentasPorHora
        (this.fecha1.trim(),this.fecha2.trim() , this.hora1.trim(),this.hora2.trim() ).subscribe({next:
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
    this.documentoService.getVentasFinalizadasPorFechaHora(this.fecha1.trim(),this.fecha2.trim(), this.hora1.trim(),this.hora2.trim() ).subscribe({next:
      (datos:any)=>{
        let cont = 0; 
         this.documentos = []; 
         CustomConsole.log('getDocumentos', datos.numdata);
         CustomConsole.log('getDocumentos_recuest', datos );
         
    if (datos.numdata > 0 ){ 
      this.documentos = datos.data;
   } else{
    Swal.fire('No existen datos relacionados con la busqueda')
   } 
  } ,error:
  (error: any) =>{
    alert(JSON.stringify(error ));
  
  }});
  }
  getDocumentosPorCliente(){
    //this.printer_factura_final(); 
    if(this.codCliente.trim() === ''){
      Swal.fire('Es necesario ingresar el numero de identificacion o nombre del cliente de la factura','error','error');
      return
    }
    this.documentoService.getVentasFinalizadasPorCliente(this.codCliente.trim() ).subscribe(
      (datos:any)=>{
        let cont = 0; 
         this.documentos = []; 
         CustomConsole.log('getDocumentos', datos.numdata);
         CustomConsole.log('getDocumentos_recuest', datos );
         
    if (datos.numdata > 0 ){ 
      this.documentos = datos.data;
   }else{
    Swal.fire('No existen datos relacionados con la busqueda')
   } 
  } ,
  (error: any) =>{
    alert(JSON.stringify(error ));
  
  });
  }
}
