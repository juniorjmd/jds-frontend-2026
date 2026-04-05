import { Component, inject,  OnInit } from '@angular/core'; 
import { CarteraModel } from 'src/app/models/cartera/cartera.model'; 
import { CustomConsole } from 'src/app/models/CustomConsole';
import { PrinterManager } from 'src/app/models/printerManager';
import { DocumentosModel } from 'src/app/models/ventas/documento.model'; 
import { cajasServices } from 'src/app/services/Cajas.services';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { DocumentoService } from 'src/app/services/documento.service';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
import { DocumentoActionPayload } from 'src/app/services/documento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-devoluciones',
  templateUrl: './devoluciones.component.html',
  styleUrls: ['./devoluciones.component.css']
})
export class DevolucionesCreateComponent implements OnInit {


  public lisCartera:CarteraModel[] = [];
  public docAbono:DocumentosModel = new DocumentosModel(); 
  private  docService = inject(DocumentoService); 
  private dInicialServ= inject(DatosInicialesService)
  constructor( private serviceCaja:cajasServices,   ){  

  }
  ngOnInit(): void {

    
    this.dInicialServ.currentSucursal.subscribe({next:(suc)=>{  
       PrinterManager.setSucursal(suc!);

    }})
  }
printDocumento(doc:DocumentosModel){
  CustomConsole.log('documento a imprimir',doc);
  
  if(doc  != undefined  && doc.orden != undefined ){
    let printerManager:PrinterManager =  new PrinterManager(this.serviceCaja);;;
    printerManager.setDocumento(doc )
    printerManager.printReceipt();
  }
}
  buscarDocumento(  ){

    this.docService.getVentasByNumFactura(this.docAbono.idDocumentoFinal )
    .subscribe({next:(retorno:ApiResponse<GenericRecordsPayload<DocumentosModel>>)=>{
      if(retorno.ok && retorno.data.count > 0){
        this.docAbono = retorno.data.records[0];
        CustomConsole.log('retorno' , retorno , this.docAbono);
       
      }
    } , error:error=>{Swal.fire(error,error.error.error, 'error')}
  })
  }
  recalcular(indice:number){
    CustomConsole.log('validar cantidad' ,   this.docAbono.listado[indice].cant_real_descontada,this.docAbono.listado[indice].cant_devuelta ,
      ( this.docAbono.listado[indice].cant_real_descontada < this.docAbono.listado[indice].cant_devuelta! )

    );
    
   if( this.docAbono.listado[indice].cant_real_descontada < this.docAbono.listado[indice].cant_devuelta! )
    {this.docAbono.listado[indice].cant_devuelta = 0 ; }
   else{
    this.docAbono.campo_auxiliar_2 =  this.docAbono.listado.reduce((acc, item) => acc + ( parseFloat(item.presioVenta.toString()) *  item.cant_devuelta! ), 0);
    CustomConsole.log('documento a enviar',this.docAbono);}
  
  }
  pagarTodo(){
    this.docAbono.listado.forEach(x=> x.cant_devuelta = (x.estado_linea_venta =='A')? x.cant_real_descontada:0 )
    this.docAbono.campo_auxiliar_2 =  this.docAbono.listado.reduce((acc, item) => acc + ( parseFloat(item.presioVenta.toString()) *  item.cant_devuelta! ), 0);
     CustomConsole.log('documento a enviar',this.docAbono);
  
  }

  enviarAbono(){
    if(this.docAbono.campo_auxiliar_2! <= 0){
      Swal.fire('Error en el envio' , 'debe ingresar minimo un producto' , 'error')
      return;
    }
     CustomConsole.log('documento a enviar',this.docAbono);
     this.docService.crearDocumentoDevolucion(this.docAbono).subscribe({next:(value:ApiResponse<DocumentoActionPayload>)=>{
      CustomConsole.log('crearDocumentoAbono',value);
      if (!value.ok || !value.data.documentoFinal) {
        Swal.fire('error', value.error?.message ?? 'Error interno del servidor', 'error');
        return;
      }
      this.buscarDocumento();
      this.printDocumento(value.data.documentoFinal )

     },error:error=>Swal.fire(error.error.error)})
  }
  cancelar(){
    this.docAbono.listado.forEach(x=> x.presioVenta = 0)
    this.docAbono.campo_auxiliar_2 =  0 ;
    CustomConsole.log('documento a enviar',this.docAbono);
  
  }
}
