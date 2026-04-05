import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CreditosResumenRequest, proveedorHistorico } from 'src/app/interfaces/producto-request';
import { ResumenCreditos } from 'src/app/interfaces/resumenCuentas';
import { ClientesModel } from 'src/app/models/clientes/clientes.module';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { PrinterManager } from 'src/app/models/printerManager';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import { ClientesService } from 'src/app/services/Clientes.services';
import { DocumentoService } from 'src/app/services/documento.service';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-repProveedor', 
  templateUrl: './repProveedor.component.html',
  styleUrls: ['./repProveedor.component.css'], 
})
export class repProveedorComponent { 
  provedorID:number = 0;
  filtrar:boolean = true;
  proveedores:proveedorHistorico[]=[]
  proveedoresFiltrados:proveedorHistorico[]=[]
  resumen:boolean=false;
  hideR:boolean=true;
  hideF:boolean=true;
  resumenCreditos?:ResumenCreditos  = undefined
  documentos : DocumentosModel[] = []; 
  fecha1:string;
  fecha2:string; 
  maximo:string; 
  min:string; 
  constructor(private srvDocumentos:DocumentoService , private serviceCaja:cajasServices,
    private clienteService:ClientesService
  ){
    let fecha = new Date();
    this.min = ''
    this.fecha1 = fecha.getFullYear().toString() +'-'+ (fecha.getMonth() + 1).toString().padStart(2,'0')+'-01';
    this.fecha2 = fecha.getFullYear().toString() +'-'+ (fecha.getMonth() + 1).toString().padStart(2,'0')+'-'+ (fecha.getDate()).toString().padStart(2,'0') ;
    this.maximo = this.fecha2 ; 
    this.clienteService.getProveedorParaHistorico().subscribe({next:(prov:ApiResponse<GenericRecordsPayload<proveedorHistorico>>)=>{
      let aux : proveedorHistorico = {
        idTercero: 0,
        terceroNombre: 'Seleccione un Proveedor',
        fin: new Date( this.fecha2 ) ,
        inicio: new Date( this.fecha1),
      }
      this.proveedores= [{...aux},...prov.data.records];
      this.proveedoresFiltrados= [{...aux},...prov.data.records];
    },error:e=>Swal.fire(JSON.stringify(e))})
  }

  cambiarFecha(){

    let aux = this.proveedores.filter(x=> x.idTercero == this.provedorID)[0];
    let f1 =  aux.inicio!.toString()
        this.fecha1 =  f1.slice(0,10) ;
        f1 =  aux.fin.toString() ;
        this.fecha2 =  f1.slice(0,10) ; 
    this.min =  this.fecha1;
  }
  getDocumentosPorFecha(){

    if(this.provedorID == 0 ){
      Swal.fire('error' , 'Debe seleccionar un proveedor' , 'error');
      return;
    }
   
   let f1 = (this.filtrar)? this.fecha1 : '2000-01-01'; 
   let f2 =  (this.filtrar)?this.fecha2 : '9999-12-31' ; 
   this.srvDocumentos.getCuentasXPagarProveedorByfecha(this.provedorID ,   f1, f2 ).subscribe({next:(value:CreditosResumenRequest)=>{
    
    CustomConsole.log('getCuentasXCobrarByfecha',value.data); 
    if(value.error == 'ok' && ((value.numdata||0) > 0 ) ){ 
      CustomConsole.log('getCuentasXCobrarByfecha',value.data); 
      this.resumenCreditos = value.data;
    }
   }})

   this.srvDocumentos.getComprasFinalizadasPorCreditoFechaPorProveedor(this.provedorID,  f1, f2 )
   .subscribe({next: (datos:any)=>{
    let cont = 0; 
     this.documentos = []; 
     CustomConsole.log('getDocumentos', datos.numdata);
     CustomConsole.log('getDocumentos_recuest', datos );
     
if (datos.numdata > 0 ){  
  this.documentos =  datos.data.map((x:any)=> x.objeto)
} else{
Swal.fire('No existen datos relacionados con la busqueda')
} 
}   , error: e=> Swal.fire(JSON.stringify(e))})

  }  

  buscarDocumento(orden:number){
    this.srvDocumentos.getDocumentosByOrden(orden).subscribe({next:(val:any)=>{
      if (val.numdata > 0 ){ 
        let doc:DocumentosModel =  val.data.map((x:any)=> x.objeto)[0]||undefined; 
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
  printerManager.exportResumenCreditos( this.resumenCreditos , 'Cuentas_Por_Pagar');
} }
 }
