import { Component, OnInit } from '@angular/core';
import { Establecimientos } from 'src/app/interfaces/establecimientos.interface';
import { MediosDePago } from 'src/app/interfaces/medios-de-pago.interface';
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import { loading } from 'src/app/models/app.loading';
import { select } from 'src/app/interfaces/generales.interface';
import { MediosDePagoModel } from 'src/app/models/ventas/medios-de-pago.model';
import { responseSubC } from 'src/app/interfaces/odoo-prd';
import { ModalCntSubCuentasComponent } from '../../modals/cuentasContables/cnt-sub-cuentas.component';
import { MatDialog } from '@angular/material/dialog';
import { tap } from 'rxjs';
import Swal from 'sweetalert2';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-medios-de-pago',
  templateUrl: './medios-de-pago.component.html',
  styleUrls: ['./medios-de-pago.component.css']
})
export class MediosDePagoComponent implements OnInit {
  newMedioP:MediosDePago = {
    id: 0,
    nombre: '',
    descripcion: '',
    estado: 0,
    cuentaContable: 0,
    establecimiento: 0,
    nombreCuentaContable:''
  };
MedioP:MediosDePago[] = [] ;
  esta:Establecimientos[] =[] ;
  constructor(private serviceCaja : cajasServices , private  newAbrirDialog : MatDialog,  
    private loading : loading ) { 
      this.Cancelar();
     this.getEstablecimiento(); 
     this.getMedios();
    }

  ngOnInit(): void {
  }

  buscarCuentasContables(){
    this.newAbrirDialog.open(ModalCntSubCuentasComponent, { data:  null })
    .afterClosed() 
    .pipe(
      tap((response: responseSubC) => {
        CustomConsole.log('buscarCuentasContablesGastos',response);
        if (response.confirmado && response.datoDevolucion !== undefined ) {   
            this.newMedioP.nombreCuentaContable = response.datoDevolucion.nombre_scuenta!;
            this.newMedioP.cuentaContable = response.datoDevolucion.id_scuenta!;  
        }  
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire('Error:', error),
      complete: () => CustomConsole.log('buscarCuentasContables completo')
    }); 
  }
   

  guardarMedio(){
    //newMedioP.nombre
    CustomConsole.log('nueva caja',this.newMedioP.nombre)
    if (typeof(this.newMedioP.nombre) === 'undefined' || this.newMedioP.nombre.trim() === ''){
     this.loading.hide();
     alert('Debe ingresar el Nombre del medio de pago');
     return;
    }
    if (typeof(this.newMedioP.descripcion) === 'undefined' ){
     this.newMedioP.descripcion = this.newMedioP.nombre ;
    }else{
     if ( this.newMedioP.descripcion.trim() === ''){
       this.newMedioP.descripcion = this.newMedioP.nombre ;
      }
    }
    if ( this.newMedioP.estado  === 0){
      this.loading.hide();
      alert('Debe escoger un estado');
      return;
     }
    if ( this.newMedioP.establecimiento  === 0){
      this.loading.hide();
      alert('Debe escoger un establecimiento');
      return;
     }
     
    this.loading.show(); 
  
    this.serviceCaja.setMedioDePago(this.newMedioP).subscribe(
     (respuesta: ApiResponse<GenericMutationPayload>)=>{CustomConsole.log(respuesta)
      
     if (respuesta.ok){
       alert('datos ingresados con exito');  
       this.newMedioP =  new MediosDePagoModel(); 
       this.getMedios();
     }else{
       alert(respuesta.error?.message || 'No fue posible guardar el medio de pago');
     }
     
     this.loading.hide();
     }
 
    )
   }
  Cancelar(){
    let auxMedio:MediosDePagoModel ; 
    auxMedio = new MediosDePagoModel();
    auxMedio.nombre = '';
    auxMedio.estado = 0 ;
    auxMedio.cuentaContable = 0;
    auxMedio.descripcion ='';
    auxMedio.establecimiento = 0;
    this.newMedioP=auxMedio;
  }

  getEstablecimiento(){ 
    this.serviceCaja.getEstablecimientos()
     .subscribe(
      (datos: ApiResponse<GenericRecordsPayload<establecimientoModel>>)=>{
         CustomConsole.log(datos);
         this.esta = [];   
    if (datos.ok && datos.data.count > 0 ){ 
      
      datos.data.records.forEach((dato:Establecimientos , index:number )=>{
        this.esta[index] = new establecimientoModel( dato );
      }) 
      CustomConsole.log(this.esta);
    }

        this.loading.hide()
      } ,
      error => {this.loading.hide();
        
    this.esta = [];
        alert(this.serviceCaja.getErrorMessage(error));
      }
      );
  }  
getMedios(){ 
  
  this.loading.show()
  this.serviceCaja.getMedios()
     .subscribe(
      (datos: ApiResponse<GenericRecordsPayload<MediosDePagoModel>>)=>{
         CustomConsole.log(datos);
         this.MedioP = [];
    if (datos.ok && datos.data.count > 0 ){ 
      datos.data.records.forEach((dato:MediosDePago , index:number )=>{
        this.MedioP[index] =   dato ;
      }) 
      CustomConsole.log(this.MedioP);
    }else{
      this.MedioP = [];
    }

        this.loading.hide()
      } ,
      error => {this.loading.hide();
        alert(this.serviceCaja.getErrorMessage(error));
      }
      );
}
setActualizaCaja(auxMedio:MediosDePago){
  this.newMedioP = auxMedio;
}

}
