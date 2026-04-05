import { Component, OnInit } from '@angular/core';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { PrinterManager } from 'src/app/models/printerManager';
import { DevolucionModel, DocumentosModel } from 'src/app/models/ventas/documento.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { DocumentoService } from 'src/app/services/documento.service';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.css']
})
export class ListarComponent implements OnInit {
  codFactura:string; 
  documentos : DevolucionModel[] = [];
  constructor( private serviceCaja:cajasServices, private inicioService:DatosInicialesService,
    private documentoService : DocumentoService ) {
       this.codFactura = '';
       this.getDocumentos();
     }

  ngOnInit(): void {
    this.inicioService.currentSucursal.subscribe({next:value=>{
      PrinterManager.setSucursal(value);
    }})
  }
  VerFactura(venta:DevolucionModel){
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
  async imprimirFactura(factura:DevolucionModel)
  { CustomConsole.log(factura); 
   let printerManager =  new PrinterManager(this.serviceCaja);;;
   printerManager.setDocumentoDevolucion(factura)
   printerManager.printBonoDevolucion(false) ;
  } 

  getDocumentos(){
  
    this.documentoService.getDevoluciones( ).subscribe({next:
      (datos:ApiResponse<GenericRecordsPayload<DocumentosModel>>)=>{
         this.documentos = []; 
         CustomConsole.log('getDocumentos', datos.data.count , 'datos', datos );
         
    if (datos.ok && datos.data.count > 0 ){ 
      this.documentos = datos.data.records as DevolucionModel[];
   } 
  } ,error:
  (error: any) =>{
    alert(JSON.stringify(error ));
  
  }});
  }

}
