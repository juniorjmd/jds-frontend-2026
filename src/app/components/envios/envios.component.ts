import { Component, OnInit } from '@angular/core';
import { Domicilios } from 'src/app/interfaces/domicilios';
import { DomiciliosService } from 'src/app/services/domicilios.service';
import { loading } from 'src/app/models/app.loading'; 
import { MatDialog } from '@angular/material/dialog';
import { DocpagosModel } from 'src/app/models/ventas/pagos.model';
import { Documento, DocumentoListado } from 'src/app/interfaces/documento.interface';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { PagosVentaComponent } from '../../modules/pos/modals/pagos-venta/pagos-venta.component';
import { DocumentoService } from 'src/app/services/documento.service';
import { select } from 'src/app/interfaces/generales.interface';
import { ConectorPlugin } from 'src/app/models/app.printer.con';
import { printer, url } from 'src/app/models/app.db.url';
import { DomiciliosModel } from 'src/app/models/domicilios/domicilios.model';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
@Component({
  selector: 'app-envios',
  templateUrl: './envios.component.html',
  styleUrls: ['./envios.component.css']
})
export class EnviosComponent implements OnInit {
  listadoDePedidos:DomiciliosModel[] = [];  
  documentoRetorno : DocumentosModel = new DocumentosModel();


  constructor(private serviceDomicilio : DomiciliosService , 
              private loading : loading ,
              private documentoService :DocumentoService,
              private newAbrirDialog : MatDialog ) { 


                this.getDomicilios();
              }
  MostrarDetalle(pedidos:DocumentosModel){
    //console.log(pedidos);
    
   let pagosHtml:string =  `
   <table class='table' style='font-size:12px'>  
   <tr>
   <td>producto</td>
   <td>cantidad</td>
   <td>precio</td>
   <td>total</td>
   </tr>`;
 
   pedidos.listado!.forEach(item=>{
    pagosHtml +=`<tr> `;
    pagosHtml +=` <td>${item.nombreProducto}</td> `;
    pagosHtml +=` <td>${item.cant_real_descontada}</td> `; 
    pagosHtml +=` <td>${item.presioVenta}</td> `; 
    pagosHtml +=` <td>${item.valorTotal}</td> `; 
    pagosHtml +=`</tr> `;
  });
  
  pagosHtml += '</table>'



  Swal.fire({html:pagosHtml, width: '400px'});

  }
  generarPago( envio:DocumentosModel){ 
    
      //console.log('envio generado',envio);
      this.newAbrirDialog.open(PagosVentaComponent ,{data:envio })
       .afterClosed()
       .subscribe((confirmado:  {rep:boolean,credito:boolean})=>{
         if (confirmado.rep){ 
           this.facturarDocumento(envio.orden );
       }
       }) 
  }
  
  facturarDocumento(idDocumento: number){ 
  //  documentoActivo

  this.loading.show() 
  this.documentoService.cerrarDocumento(idDocumento).subscribe(
    (respuesta:any)=>{
       //console.log('cerrarDocumento',respuesta); 
       if (respuesta.ok){
        this.documentoRetorno = respuesta.data.documentoFinal;
        this.printer_factura_final()         
       }else{
         alert(respuesta.error?.message || 'No fue posible cerrar el documento');
       }
       this.loading.hide(); 

} );
  
  }

   
  printer_factura_final(){}
  getDomicilios(){
     
    this.loading.show();
    this.serviceDomicilio.getListadosDomicilios().subscribe(
      (respuesta:ApiResponse<GenericRecordsPayload<DomiciliosModel>>)=>{//console.log(respuesta)
       
      if (respuesta.ok){
         this.listadoDePedidos = respuesta.data.records;
      }else{
        alert(respuesta.error?.message || 'No fue posible consultar los domicilios');
      }
      
      this.loading.hide();
      }
  
     )
  }           
  ngOnInit(): void {
  }

}
