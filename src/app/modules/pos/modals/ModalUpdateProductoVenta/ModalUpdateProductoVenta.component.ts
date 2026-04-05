
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { error } from 'jquery';
import { DocumentoListado } from 'src/app/interfaces/documento.interface';
import { ProductoExitenciaRequest, ProductoRequest } from 'src/app/interfaces/producto-request';
import { loading } from 'src/app/models/app.loading';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { DocumentoService } from 'src/app/services/documento.service';
import { ProductoService } from 'src/app/services/producto.service';
import Swal from 'sweetalert2';
import { InventarioExistenceResponse } from 'src/app/interfaces/inventario-response.interface';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-modal-update-producto-venta', 
  templateUrl: './ModalUpdateProductoVenta.component.html',
  styleUrls: ['./ModalUpdateProductoVenta.component.css'], 
})
export class ModalUpdateProductoVentaComponent implements OnInit { 
  
  validarExistencia?:boolean;  
  descuento:number = 0 ;  
  constructor(public loading : loading, private service:DocumentoService ,  private prdService : ProductoService,
     public dialogo: MatDialogRef<ModalUpdateProductoVentaComponent>,
    @Inject(MAT_DIALOG_DATA) public item:DocumentoListado,
    private dInicialServ: DatosInicialesService  ){  
      this.item.val_aux_1 =   this.item.val_aux_1||this.item.presioSinIVa ; 
      this.item.val_aux_2 =  this.item.val_aux_2||this.item.presioVenta ; 
    }

    
  ngOnInit(): void { 
    this.loading.show()
    this.dInicialServ.parmValExistencia.subscribe({next:value=>{  
      this.validarExistencia = value.par_boolean; 
      this.loading.hide() 
    }});
  }

  editar(){
    CustomConsole.log('ModalUpdateProductoVentaComponent' ,this.item );
    this.service.editarLineaDocumento(this.item).subscribe({next:(value:ApiResponse<GenericMutationPayload>)=>{
      if (value.ok){
        this.dialogo.close(true)   
         }
    }, error:e=>Swal.fire(this.service.getErrorMessage(e))})

    
  } 
  enviarCntDirecto(){
    if (this.validarExistencia){ 
        this.loading.show()
        this.prdService.getProductoExtistenciaDocById(this.item.idProducto,this.item.idDocumento!).subscribe({next:(value:InventarioExistenceResponse)=>{
          CustomConsole.log('producto completo', value); 
          this.loading.hide()    

          if(value.data.productExistence.existencia  <    this.item.cantidadVendida) 
            {this.item.cantidadVendida = this.item.cant_real_descontada 
              Swal.fire('El producto no posee la existencia requerida en la bodega ' + value.data.productExistence.nombreBodega )
            }
          else{
            this.item.cant_real_descontada = this.item.cantidadVendida;
            this.cambioValor();
            this.editar();
          }

        }, error:e=>{Swal.fire(e.error.error) ; this.loading.hide();  
        }})
      
    }else{
    this.item.cant_real_descontada = this.item.cantidadVendida;
    this.cambioValor();
    this.editar();
   }
  } 

  cambioValor(){
    this.item.descuento = 0;
    this.descuento= this.descuento||0 ;
     if(this.descuento  > 0 ){

      let des :number = 0 ; 
      if(this.item.tipoDescuento == 'porcentaje'){
        des = (this.item.val_aux_2||0) * this.descuento / 100 ;
      }else{
        des =   this.descuento  ;
      }
      this.item.presioVenta  = this.item.val_aux_2! - des ; 
      this.item.presioSinIVa = parseFloat(( this.item.presioVenta / (1 + ( this.item.porcent_iva / 100 ) ) ).toFixed(2));
      this.item.descuento = parseFloat((( this.item.val_aux_1! - this.item.presioSinIVa    ) ).toFixed(2));
      this.item.presioSinIVa +=this.item.descuento;
      this.item.descuentoAplicado = 'Descuento en venta',
      this.item.nombreActividadDescuento = ''
    } else{
      this.item.presioSinIVa  = this.item.val_aux_1||this.item.presioSinIVa  ;  
      this.item.descuentoAplicado = '',
      this.item.nombreActividadDescuento = ''
    }
    this.item.IVA = parseFloat(((this.item.presioSinIVa - this.item.descuento) * (this.item.porcent_iva / 100)).toFixed(2));
    this.item.valorTotal = parseFloat(((this.item.presioSinIVa - this.item.descuento + this.item.IVA) * this.item.cant_real_descontada).toFixed(2));
    this.item.presioVenta =  parseFloat(((this.item.presioSinIVa - this.item.descuento + this.item.IVA)  ).toFixed(2));
  }
}
