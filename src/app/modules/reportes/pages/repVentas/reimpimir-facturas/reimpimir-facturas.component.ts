import { Component, OnInit } from '@angular/core';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { DocumentoService } from 'src/app/services/documento.service';
import { loading } from 'src/app/models/app.loading';
import { select } from 'src/app/interfaces/generales.interface';
import Swal from 'sweetalert2';
import { ConectorPlugin } from 'src/app/models/app.printer.con';
import { DocpagosModel } from 'src/app/models/ventas/pagos.model';
import { DocumentoListado } from 'src/app/interfaces/documento.interface';
import { printer, url } from 'src/app/models/app.db.url';
import { CurrencyPipe } from '@angular/common';
import { PrinterManager } from 'src/app/models/printerManager';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { cajasServices } from 'src/app/services/Cajas.services';
import { CustomConsole } from 'src/app/models/CustomConsole';

@Component({
  selector: 'app-reimpimir-facturas',
  templateUrl: './reimpimir-facturas.component.html',
  styleUrls: ['./reimpimir-facturas.component.css']
})
export class ReimpimirFacturasComponent implements OnInit {
  codFactura:string; 
  documentos : DocumentosModel[] = [];
  constructor(public loading : loading, private inicioService:DatosInicialesService,private serviceCaja: cajasServices,
    private documentoService : DocumentoService ) {
       this.codFactura = '';
     }

  ngOnInit(): void {
    this.inicioService.currentSucursal.subscribe({next:value=>{
      PrinterManager.setSucursal(value);
    }})
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

   Swal.fire({html:pagosHtml, width: '800px' ,showDenyButton:true ,denyButtonText:'imprimir'}).then(value=>{
    CustomConsole.log(value);
    if(value.isDenied){
      this.imprimirFactura(venta);
    }
    
   });
  }
  async imprimirFactura(factura:DocumentosModel)
  { CustomConsole.log(factura); 
   let printerManager =  new PrinterManager(this.serviceCaja);;
   printerManager.setDocumento(factura)
   printerManager.printReceipt() ;
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
   } 
  } ,
  (error: any) =>{
    alert(JSON.stringify(error ));
  
  });
  }

}
