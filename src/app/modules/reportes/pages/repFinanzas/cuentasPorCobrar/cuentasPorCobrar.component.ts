import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { error } from 'jquery';
import {   CreditosResumenRequest } from 'src/app/interfaces/producto-request'; 
import { ResumenCreditos } from 'src/app/interfaces/resumenCuentas';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { PrinterManager } from 'src/app/models/printerManager';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import { DocumentoService } from 'src/app/services/documento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cuentas-por-cobrar', 
  templateUrl: './cuentasPorCobrar.component.html',
  styleUrls: ['./cuentasPorCobrar.component.css'], 
})
export class CuentasPorCobrarComponent {
  
  resumen:boolean=false;
  hideR:boolean=true;
  hideF:boolean=true;
  resumenCreditos?:ResumenCreditos  = undefined
  documentos : DocumentosModel[] = []; 
  fecha1:string;
  fecha2:string; 
  maximo:string; 
  constructor(private srvDocumentos:DocumentoService , private serviceCaja:cajasServices,){
    let fecha = new Date();
    this.fecha1 = fecha.getFullYear().toString() +'-'+ (fecha.getMonth() + 1).toString().padStart(2,'0')+'-01';
    this.fecha2 = fecha.getFullYear().toString() +'-'+ (fecha.getMonth() + 1).toString().padStart(2,'0')+'-'+ (fecha.getDate()).toString().padStart(2,'0') ;
    this.maximo = this.fecha2 ;
  this.getDocumentosPorFecha();
  }
  getDocumentosPorFecha(){
   this.srvDocumentos.getCuentasXCobrarByfecha(this.fecha1, this.fecha2 ).subscribe({next:(value:CreditosResumenRequest)=>{
    
    CustomConsole.log('getCuentasXCobrarByfecha',value.data); 
    if(value.error == 'ok' && ((value.numdata||0) > 0 ) ){ 
      CustomConsole.log('getCuentasXCobrarByfecha',value.data); 
      this.resumenCreditos = value.data;
    }
   }})

   this.srvDocumentos.getVentasFinalizadasPorCarteraFecha(this.fecha1, this.fecha2 )
   .subscribe({next: (datos:any)=>{
    let cont = 0; 
     this.documentos = []; 
     CustomConsole.log('getDocumentos', datos.numdata);
     CustomConsole.log('getDocumentos_recuest', datos );
     
if (datos.numdata > 0 ){  
  this.documentos = datos.data
} else{
Swal.fire('No existen datos relacionados con la busqueda')
} 
}   , error: e=> Swal.fire(JSON.stringify(e))})

  }  

  buscarDocumento(orden:number){
    this.srvDocumentos.getDocumentosByOrden(orden).subscribe({next:(val:any)=>{
      if ((val.data?.records?.length || 0) > 0 ){ 
        let doc:DocumentosModel =  val.data.records[0] || undefined; 
        if (doc != undefined){
          this.VerFactura(doc)
        }
        
      } else{
      Swal.fire('No existen datos relacionados con la busqueda')
      }  
      
    },error:e=>Swal.fire(JSON.stringify(e))})
  }
  VerFactura(venta:DocumentosModel){
    let pagosHtml:string =  `<h1>Factura :  ${venta.idDocumentoFinal}</h1>
    <h2>Cliente :  ${venta.clienteNombre}</h2>
    <h2>fecha :  ${venta.fecha}</h2>

    <div style='with:100%'>
     <table class='table' style='font-size:12px'> 
     <tr> 
     <th>Valor Parcia</th>
     <th>Descuento</th>
     <th>IVA</th>
     <th>Ajuste</th>
     <th>Total</th>
     </tr> 
     <tr> 
     <th>${venta.valorParcial}</th>
     <th>${venta.descuento}</th>
     <th>${venta.valorIVA}</th>
     <th>${venta.ajusteAlpeso}</th>
     <th>${venta.totalFactura}</th>
     </tr> 
     </table>
    </div>


    <table class='table' style='font-size:12px'> `;


if (venta.listado.length > 0 )  pagosHtml +=` <tr>  <td>Producto</td>    <td>código</td>    <td>cantidad</td>    <td>precio</td>    <td>IVA</td>    <td>total</td>     </tr>   `;   // cantInicial, cantActual, compras, ventas, devoluciones, stock, remisionada,
   
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
   if(this.resumenCreditos != undefined){ 
   printerManager.printResumenCredito(false,this.resumenCreditos);
  } 
}
async ExportarResumen()
{  
 let printerManager =  new PrinterManager(this.serviceCaja); 
 if(this.resumenCreditos != undefined){ 
  printerManager.exportResumenCreditos( this.resumenCreditos , 'Cuentas_Por_cobrar');
} }
 }
