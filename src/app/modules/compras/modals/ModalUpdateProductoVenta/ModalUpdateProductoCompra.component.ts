
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { error } from 'jquery';
import { DocumentoListado } from 'src/app/interfaces/documento.interface';
import { loading } from 'src/app/models/app.loading';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { DocumentoService } from 'src/app/services/documento.service';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-modal-update-producto-venta', 
  templateUrl: './ModalUpdateProductoCompra.component.html',
  styleUrls: ['./ModalUpdateProductoCompra.component.css'], 
})
export class ModalUpdateProductoCompraComponent { 
  disable=false;
  auxItem:DocumentoListado;
  descuento:number = 0 ;  
  constructor(public loading : loading, private service:DocumentoService , 
     public dialogo: MatDialogRef<ModalUpdateProductoCompraComponent>,
    @Inject(MAT_DIALOG_DATA) public item:DocumentoListado ){  

       this.auxItem = {...this.item} ;
      this.item.val_aux_1 =   this.item.val_aux_1||this.item.presioSinIVa ; 
      this.item.val_aux_2 =  this.item.val_aux_2||this.item.presioVenta ; 
    }

  editar(){
    this.disable = true
    CustomConsole.log('ModalUpdateProductoVentaComponent' ,this.item );
    if(this.item.cant_real_descontada <= 0 ){
      Swal.fire('Debe ingresar la cantidad a comprar');
      return;
    }
    this.service.editarLineaDocumento(this.item).subscribe({next:(value:ApiResponse<GenericMutationPayload>)=>{
      if (value.ok){
        this.dialogo.close(true)   
         }else{Swal.fire('error', value.error?.message ?? 'Error interno del servidor', 'error');this.disable = false}
    }, error:e=>{Swal.fire(this.service.getErrorMessage(e));
                this.disable = true}})

    
  }  

  cambioValor(origen=''){
    this.disable = true
    if(origen=='precioCompra' &&  this.item.presioVenta > 0 ){
      this.item.val_aux_2 =  this.item.presioVenta ,
      this.item.val_aux_1 = parseFloat(( this.item.presioVenta / (1 + ( this.item.porcent_iva / 100 ) ) ).toFixed(2));
     };
    this.item.cantidadVendida = this.item.cant_real_descontada;
    this.item.descuento = 0;
    this.descuento= this.descuento||0 ;
     if(this.descuento  > 0 ){

      let des :number = 0 ; 
      if(this.item.tipoDescuento == 'porcentaje'){
        des = (this.item.val_aux_2||0) * this.descuento / 100 ;
      }else{
        des =   this.descuento  ;
      }
      if(origen!='precioCompra' ){
      this.item.presioVenta  = this.item.val_aux_2! - des ;
      this.item.presioVenta = parseFloat(this.item.presioVenta.toFixed(2));
     }else{
        this.item.val_aux_1! += des ;
      }

      this.item.presioSinIVa = parseFloat(( this.item.presioVenta / (1 + ( this.item.porcent_iva / 100 ) ) ).toFixed(2));
      this.item.descuento = parseFloat((( this.item.val_aux_1! - this.item.presioSinIVa ) ).toFixed(2));
      this.item.presioSinIVa =    parseFloat(( this.item.presioSinIVa  + this.item.descuento ).toFixed(2));
      this.item.descuentoAplicado = 'Descuento en venta',
      this.item.nombreActividadDescuento = ''
    } else{
      this.item.presioSinIVa  =  parseFloat(( this.item.val_aux_2!  / (1 + ( this.item.porcent_iva / 100 ) ) ).toFixed(2));;  
      this.item.descuentoAplicado = '',
      this.item.nombreActividadDescuento = ''
    }
    this.item.IVA = parseFloat(((this.item.presioSinIVa - this.item.descuento) * (this.item.porcent_iva / 100)).toFixed(2));
    this.item.valorTotal = parseFloat(( this.item.presioVenta * this.item.cant_real_descontada).toFixed(2));
    this.disable = false
   // this.item.presioVenta =  parseFloat(((this.item.presioSinIVa - this.item.descuento + this.item.IVA)  ).toFixed(2));
  }
}
