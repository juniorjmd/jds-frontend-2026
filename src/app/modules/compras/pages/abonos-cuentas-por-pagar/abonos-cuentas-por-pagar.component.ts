import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { retry, tap } from 'rxjs';
import { DocumentoListado } from 'src/app/interfaces/documento.interface';
import { DocumentoCierreRequest } from 'src/app/interfaces/producto-request';
import { CarteraModel } from 'src/app/models/cartera/cartera.model';
import { ClientesModel } from 'src/app/models/clientes/clientes.module';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { PersonasModule } from 'src/app/modules/personas/personas.module';
import { FndClienteComponent } from 'src/app/modules/shared/modals/fnd-cliente/fnd-cliente.component';
import { DocumentoService } from 'src/app/services/documento.service';
import Swal from 'sweetalert2';
import { PagosCPPComponent } from '../../modals/pagos-CPP/pagos-CPP.component';
import { PrinterManager } from 'src/app/models/printerManager';
import { DocpagosModel } from 'src/app/models/ventas/pagos.model';
import { loading } from 'src/app/models/app.loading';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { DocumentoActionPayload, CarteraRecordsPayload } from 'src/app/services/documento.service';

@Component({
  selector: 'modals-abonos-cuentas-por-pagar',
  templateUrl: './abonos-cuentas-por-pagar.component.html',
  styleUrls: ['./abonos-cuentas-por-pagar.component.css']
})
export class AbonosCuentasPorPagarComponent  implements OnInit {

 public docActivo:DocumentosModel = new DocumentosModel()
  public lisCartera:CarteraModel[] = [];
  public docAbono:DocumentosModel = new DocumentosModel(); 
  private  docService = inject(DocumentoService)
  public personaIngreso:ClientesModel = new ClientesModel();  
  establecimientos:establecimientoModel[] = [];
  constructor( private loading:loading , private inicioService:DatosInicialesService,private serviceCaja : cajasServices,
    private newAbrirDialog: MatDialog,){

      this.loading.show()
      this.serviceCaja.getEstablecimientosCompras().subscribe({next:value=>{
        if(value.ok && value.data.count > 0 ){this.establecimientos = value.data.records
          this.docAbono.establecimiento = this.establecimientos[0].id;
        }else{Swal.fire('error','No existen establecimientos disponibles','error')}
        
      },error:e=>Swal.fire('error',this.serviceCaja.getErrorMessage(e),'error'),complete:()=>this.loading.hide()    
    })
  }
  ngOnInit(): void {
    this.inicioService.currentSucursal.subscribe({next:value=>{
      PrinterManager.setSucursal(value);
    }})
  }
  buscarCreditosDesdeEstablecimiento(){
    if(this.docAbono.cliente == undefined){return;}
    this.buscarCreditoCliente();
  }
  buscarCliente(){ 
    this.newAbrirDialog.open(FndClienteComponent,{ data: {  invoker:'cuentasXpagar' } })
    .afterClosed()
    .pipe(
      tap((confirmado:  {response:true  , persona:ClientesModel})=>{
        if (confirmado.response) { 
          this.personaIngreso = confirmado.persona;
          CustomConsole.log('personaIngreso',this.personaIngreso);
          this.docAbono.cliente =  ( typeof( this.personaIngreso.id!) == "string"   ) ? parseInt(this.personaIngreso.id) :this.personaIngreso.id!;
          this.buscarCreditoCliente();   }
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire('Error:', JSON.stringify( error)),
      complete: () => CustomConsole.log('buscarCliente completo')
    });   
  }
  buscarCreditoCliente( ){
    if(this.docAbono.cliente == undefined){Swal.fire('Debe seleccionar el proveedor');return;}
    if(this.docAbono.establecimiento == undefined){Swal.fire('Debe seleccionar el establecimiento');return;} 
    this.docService
    .getCuentasXPagarByPersonaAbonos(( typeof( this.personaIngreso.id!) == "string"   ) ? parseInt(this.personaIngreso.id) :this.personaIngreso.id! ,
     this.docAbono.establecimiento )
    .subscribe({next:(retorno:ApiResponse<CarteraRecordsPayload>)=>{
      CustomConsole.log('getCuentasXPagarByPersonaAbonos',retorno);
      
      if(retorno.ok && retorno.data.count > 0){
        this.lisCartera =  retorno.data.records;
        this.docAbono.campo_auxiliar_1 =   this.lisCartera.reduce((acc:number, item) => acc + parseFloat(item.totalActual.toString()), 0);
       
        this.docAbono.campo_auxiliar_4 =   this.lisCartera.reduce((acc:number, item) => acc + parseFloat(item.suma_plazos_vencidos.toString()), 0);
       
        this.docAbono.valorParcial =  0;
        this.docAbono.listado = this.lisCartera.map((x:CarteraModel)=> {
                              let ret:DocumentoListado =  {
                                idProducto: `Cred_${x.id}`,
                                nombreProducto: x.descripcion,
                                presioVenta: 0,
                                porcent_iva: 0,
                                presioSinIVa: 0,
                                IVA: 0,
                                cantidadVendida: 1,
                                descuento: 0,
                                valorTotal: x.totalActual,
                                orden: 0,
                                cant_real_descontada: 1,
                                id_externo_auxiliar: x.id,
                                cant_devuelta : 0,estado_linea_venta:'A',
                                tipoDescuento:'porcentaje',
                                idDocBase:x.comprobante
                              }
          return ret
          
        })??[];
        
        CustomConsole.log('cartera' ,  this.lisCartera)
      }
    } , error:error=>{Swal.fire( JSON.stringify(error))}
  })
  }  

  recalcular(indice:number){
   if( this.docAbono.listado[indice].valorTotal < this.docAbono.listado[indice].presioVenta )
    {this.docAbono.listado[indice].presioVenta = 0 ; }
   else{
    this.docAbono.valorParcial =  this.docAbono.listado.reduce((acc, item) => acc + parseFloat(item.presioVenta.toString()), 0);
    CustomConsole.log('documento a enviar',this.docAbono);}
  
  }
  pagarTodo(){
    this.docAbono.listado.forEach(x=> x.presioVenta = x.valorTotal)
    this.docAbono.valorParcial =  this.docAbono.listado.reduce((acc, item) => acc + parseFloat(item.presioVenta.toString()), 0);
    CustomConsole.log('documento a enviar',this.docAbono);
  
  }

  facturarDocumento() {
    this.docActivo!.pagos = [];
  
    if (this.docActivo!.listado!.length === 0) {
      let error = 'Debe ingresar los productos a facturar' ; 
      try {
        Swal.fire(error, '', 'error');
       } catch (error : any) {
        Swal.fire('error en el servidor', '', 'error');
       }
      return;
    }
    if (parseInt(this.docActivo!.totalFactura.toString()) === 0) { 
      try {
        Swal.fire('el total de la factura debe ser mayor a cero', '', 'error');
       } catch (error : any) {
        Swal.fire('error en el servidor', '', 'error');
       }
      return;
    }

    this.loading.show();
    this.docService .cerrarDocumento(this.docActivo!.orden).subscribe({next:(respuesta: ApiResponse<DocumentoActionPayload>) => {
      //console.clear();
      CustomConsole.log("respuesta cierre documento =>" , respuesta)
      if (respuesta.ok && respuesta.data.documentoFinal) {  
        this.docActivo = Object.assign(new DocumentosModel(), respuesta.data.documentoFinal); 
        CustomConsole.log('facturarDocumento =>>>>>', this.docActivo);
        this.printer_factura_final(); 
      } else {
        try {
          Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }
      }
      this.loading.hide(); 
    }
      ,error: (error: any) => {
         
        try {
          Swal.fire(error.error.error, '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }},complete:()=>{CustomConsole.log('facturarDocumento completo');
            this.loading.hide()
         }
    })
  }

  async printer_factura_final() {  
    let printM =  new PrinterManager(this.serviceCaja);;;
    printM.setDocumento(this.docActivo);
    printM.printReceipt(false);
    this.buscarCreditoCliente();
  }

  enviarAbono(){
    if(this.docAbono.valorParcial <= 0){
      Swal.fire('Error en el envio' , 'debe ingresar minimo un abono' , 'error')
    }
     CustomConsole.log('documento a enviar',this.docAbono);
     this.docService.crearDocumentoAbonoCredito(this.docAbono).subscribe({next:(value:ApiResponse<DocumentoActionPayload>)=>{
      CustomConsole.log('crearDocumentoAbonoCredito', value);
      if (!value.ok || !value.data.documentoFinal) {
        Swal.fire('error', value.error?.message ?? 'Error interno del servidor', 'error');
        return;
      }
     this.docActivo =   value.data.documentoFinal;
      
    this.newAbrirDialog.open(PagosCPPComponent,{ data: this.docActivo  })
    .afterClosed()
    .pipe(
      tap((confirmado: boolean)=>{
        if (confirmado) {  
          this.facturarDocumento()
          }
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire('Error:', error),
      complete: () => CustomConsole.log('buscarCliente completo')
    });   
      CustomConsole.log('crearDocumentoAbono',value); 
     }})
  }
  cancelar(){
    this.docAbono.listado.forEach(x=> x.presioVenta = 0)
    this.docAbono.valorParcial =  this.docAbono.listado.reduce((acc, item) => acc + parseFloat(item.presioVenta.toString()), 0);
    CustomConsole.log('documento a enviar',this.docAbono);
  
  }
}
