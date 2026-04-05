import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentoListado } from 'src/app/interfaces/documento.interface';
import { CarteraModel } from 'src/app/models/cartera/cartera.model';
import { ClientesModel } from 'src/app/models/clientes/clientes.module';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { PersonasModule } from 'src/app/modules/personas/personas.module';
import { DocumentoService } from 'src/app/services/documento.service';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { CarteraRecordsPayload } from 'src/app/services/documento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'modals-abonos-cuentas-xcobrar',
  templateUrl: './abonos-cuentas-xcobrar.component.html',
  styleUrls: ['./abonos-cuentas-xcobrar.component.css']
})
export class AbonosCuentasXCobrarComponent implements OnInit {


  public lisCartera:CarteraModel[] = [];
  public docAbono:DocumentosModel = new DocumentosModel();
  private  dialogo= inject( MatDialogRef<AbonosCuentasXCobrarComponent>);
  private  docService = inject(DocumentoService)
  constructor( @Inject(MAT_DIALOG_DATA) public personaIngreso:ClientesModel ){
    this.docAbono.cliente =  ( typeof( this.personaIngreso.id!) == "string"   ) ? parseInt(this.personaIngreso.id) :this.personaIngreso.id!;
    this.docService
    .getCuentasXCobrarByPersonaAbonos(( typeof( this.personaIngreso.id!) == "string"   ) ? parseInt(this.personaIngreso.id) :this.personaIngreso.id! )
    .subscribe({next:(retorno:ApiResponse<CarteraRecordsPayload>)=>{
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
    } , error:error=>{Swal.fire(error,error.error.error, 'error')}
  })
  }
  ngOnInit(): void {

    
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

  enviarAbono(){
    if(this.docAbono.valorParcial <= 0){
      Swal.fire('Error en el envio' , 'debe ingresar minimo un abono' , 'error')
    }
     CustomConsole.log('documento a enviar',this.docAbono);
     this.docService.crearDocumentoAbono(this.docAbono).subscribe({next:value=>{
      CustomConsole.log('crearDocumentoAbono',value);
      this.dialogo.close(true);
     }})
  }
  cancelar(){
    this.docAbono.listado.forEach(x=> x.presioVenta = 0)
    this.docAbono.valorParcial =  this.docAbono.listado.reduce((acc, item) => acc + parseFloat(item.presioVenta.toString()), 0);
    CustomConsole.log('documento a enviar',this.docAbono);
  
  }
}
