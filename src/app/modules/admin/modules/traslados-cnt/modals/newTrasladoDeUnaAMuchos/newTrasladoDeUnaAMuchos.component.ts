import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { tap } from 'rxjs';
import { responseSubC } from 'src/app/interfaces/odoo-prd';
import { CntOperacionPrestablecidas } from 'src/app/interfaces/traslados_cnt/cnt_operacion_prestablecidas.';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { TrasladosCuentasArrModel, TrasladosCuentasModel } from 'src/app/models/trasladosCuentas.';
import { ModalCntSubCuentasComponent } from 'src/app/modules/admin/modals/cuentasContables/cnt-sub-cuentas.component';
import { CntContablesService } from 'src/app/services/cntContables.service';
import Swal from 'sweetalert2';
import { AdminOperationResponse } from 'src/app/interfaces/admin-response.interface';

@Component({
  selector: 'app-new-traslado-deUnoAmuchos', 
  templateUrl: './newTrasladoDeUnaAMuchos.component.html',
  styleUrls: ['./newTrasladoDeUnaAMuchos.component.css'], 
})
export class newTrasladoDeUnaAMuchosComponent {  
  nombreCuentaDestino :string = ''
  nombreTraslado :string = ''
  idCuentaDestino :number = 0 ; 
  private newAbrirDialog = inject(MatDialog);
  dataProceso?:TrasladosCuentasModel;
  private cntService = inject(CntContablesService);
  constructor(  @Inject(MAT_DIALOG_DATA) public dataIngreso:CntOperacionPrestablecidas,public dialogo: MatDialogRef<newTrasladoDeUnaAMuchosComponent>,  ){
    this.dataProceso =  new TrasladosCuentasModel();
      /*
  DESDE_CAJA
ASIGNA_SALDO
DE_UNA_A_MUCHOS
DE_MUCHOS_A_UNA
*/
    this.dataProceso.tipo = 'DE_UNA_A_MUCHOS'
   if(this.dataIngreso != undefined){
    this.dataProceso  = this.dataProceso.createTraslado( dataIngreso );  
    this.cntService.getCuentasTrasladosPree(this.dataIngreso.id!).subscribe({next:(value)=>{
          this.dataProceso!.cuentas =  value.data;
    },error:e=> Swal.fire(this.cntService.getErrorMessage(e)) })

  }
  }

buscarCuentaContableDestino(){  
this.newAbrirDialog.open(ModalCntSubCuentasComponent, { data:  null })
.afterClosed() 
.pipe(
  tap((response: responseSubC) => {
    if (response.confirmado && response.datoDevolucion !== undefined ) {    
      //this.dataProceso!.cuentas = this.dataProceso!.cuentas.filter(cuenta => cuenta.tipo !== 'ORIGEN');
      this.dataProceso!.cuentas.push(new TrasladosCuentasArrModel(
        response.datoDevolucion.nro_scuenta ,
        response.datoDevolucion.id_scuenta ,
        response.datoDevolucion.nombre_scuenta ,
        'DESTINO'
      ))
      this.nombreCuentaDestino = response.datoDevolucion.nombre_scuenta!;
      this.idCuentaDestino = response.datoDevolucion.id_scuenta!;  
      
    }  
  })
).subscribe({
  next: () => {},
  error: (error) => Swal.fire('Error:', error) 
}); 
  
}



buscarCuentaContableOrigen(){  
 this.newAbrirDialog.open(ModalCntSubCuentasComponent, { data:  null })
 .afterClosed() 
 .pipe(
   tap((response: responseSubC) => {
     if (response.confirmado && response.datoDevolucion !== undefined ) {   
      this.dataProceso!.cuentas = this.dataProceso!.cuentas.filter(cuenta => cuenta.tipo !== 'ORIGEN');
       this.dataProceso!.cuentas.push(new TrasladosCuentasArrModel(
         response.datoDevolucion.nro_scuenta ,
         response.datoDevolucion.id_scuenta ,
         response.datoDevolucion.nombre_scuenta ,
         'ORIGEN'
       ))
       this.nombreCuentaDestino = response.datoDevolucion.nombre_scuenta!;
       this.idCuentaDestino = response.datoDevolucion.id_scuenta!;   
       CustomConsole.log('buscarCuentasContablesGastos',response , this.nombreCuentaDestino , response.datoDevolucion.nombre_scuenta!,
       this.idCuentaDestino , response.datoDevolucion.id_scuenta!   ) ;
       
     }  
   })
 ).subscribe({
   next: () => {},
   error: (error) => Swal.fire('Error:', error),
   complete: () => CustomConsole.log('buscarCuentasContables completo')
 }); 
   
 }

guardar(){
//  this.cntService.setCntTransaccionesTmp
let origen =  this.dataProceso?.cuentas.filter(x=> x.tipo == 'ORIGEN')
let destino =  this.dataProceso?.cuentas.filter(x=> x.tipo == 'DESTINO')

if (((destino?.length)||0) <= 0){
  Swal.fire('Debe asignar la cuenta destino')
  return;}

   if (((origen?.length)||0) <= 0){
    Swal.fire('Debe asignar la cuenta origen')
    return;}
  
  if (this.dataProceso?.nombre == ''){
      Swal.fire('Debe asignar Nombre al traslado')
      return;
    }
if (this.dataProceso == undefined ){
    Swal.fire('Debe ingresar los datos de la transaccion')
    return;}
this.cntService.setTraslado(this.dataProceso).subscribe({next:(value:AdminOperationResponse)=>{
  if(!value.ok) Swal.fire(value.error?.message ?? 'No fue posible guardar el traslado');
  if(value.ok) this.dialogo.close(true)


},error:e=>Swal.fire(this.cntService.getErrorMessage(e))
    })
}
}
