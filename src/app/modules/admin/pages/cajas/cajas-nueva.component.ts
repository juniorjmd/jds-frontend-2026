import { Component, OnInit } from '@angular/core';
import { caja } from 'src/app/interfaces/caja.interface';
import { select } from 'src/app/interfaces/generales.interface';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { loading } from 'src/app/models/app.loading';
import { cajasServices } from 'src/app/services/Cajas.services'; 
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model';
import { Establecimientos } from 'src/app/interfaces/establecimientos.interface';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ParametrosModel } from 'src/app/models/parametros/parametros.model';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ModalCntSubCuentasComponent } from '../../modals/cuentasContables/cnt-sub-cuentas.component';
import { tap } from 'rxjs';
import { responseSubC } from 'src/app/interfaces/odoo-prd';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-cajas-nueva',
  templateUrl: './cajas-nueva.component.html',
  styleUrls: ['./cajas-nueva.component.css']
})
export class CajasNuevaComponent implements OnInit {
  cajas :cajaModel[]  = []; 
  parametros:ParametrosModel[] = [];
  newCaja : cajaModel = new cajaModel(undefined);
  esta : establecimientoModel[] = [];
  guardarBtn = false;
  constructor( private serviceCaja : cajasServices ,  
     private parServices:ParametrosService , 
     private newAbrirDialog: MatDialog,
    private loading : loading ) { 
      this.getParametros();
     this.getEstablecimiento();
     this.getCajas();
    
  }
  Cancelar(){
    this.newCaja =  new cajaModel(undefined);
     
  }

  buscarCuentasContablesGastos(){
    this.newAbrirDialog.open(ModalCntSubCuentasComponent, { data:  null })
    .afterClosed() 
    .pipe(
      tap((response: responseSubC) => {
        CustomConsole.log('buscarCuentasContablesGastos',response);
        if (response.confirmado && response.datoDevolucion !== undefined ) {  
          this.newCaja.nombre_scuenta_gastos = response.datoDevolucion.nombre_scuenta;
          this.newCaja.cod_cuenta_gastos = response.datoDevolucion.id_scuenta;
          this.newCaja.cuentaContableGastos = response.datoDevolucion.id_scuenta;  
        }  
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire('Error:', error),
      complete: () => CustomConsole.log('buscarCuentasContables completo')
    }); 
  }

  buscarCuentasContablesEfectivo(){
    this.newAbrirDialog.open(ModalCntSubCuentasComponent, { data:  null })
    .afterClosed() 
    .pipe(
      tap((response: responseSubC) => {
        if (response.confirmado && response.datoDevolucion !== undefined ) {  
          this.newCaja.nombre_scuenta_venta = response.datoDevolucion.nombre_scuenta
          this.newCaja.cod_cuenta_venta = response.datoDevolucion.id_scuenta;
          this.newCaja.cuentaContableEfectivo = response.datoDevolucion.id_scuenta;  
        }  
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire('Error:', error),
      complete: () => CustomConsole.log('buscarCuentasContables completo')
    }); 
  }
  getParametros(){ 
    this.parametros = []; 
     this.loading.show()
     this.parServices.getParametros().subscribe(
       (datos: ApiResponse<GenericRecordsPayload<ParametrosModel>>)=>{
          CustomConsole.log(datos);
          
     if (datos.ok && datos.data.count > 0 ){ 
      this.parametros = datos.data.records 
       CustomConsole.log('parametros',this.parametros);
     }else{
       this.parametros = [];
     }
     this.parametros!.forEach(parametro =>{
      if(parametro.cod_parametro.trim() === 'SISTEMA_MULTICAJAS'){
        if(parametro.par_boolean == true)
        {this.guardarBtn = true; }   
            else{this.guardarBtn = false; }
      }
     })
         this.loading.hide();
       } ,
       error => {this.loading.hide();
         CustomConsole.log(error)
         Swal.fire(this.parServices.getErrorMessage(error), '', 'error');
       }
       );
   }  
  getEstablecimiento(){
    this.newCaja.establecimiento = 0;
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
  setActualizaCaja(cajaActualizar : cajaModel){
    this.newCaja = {...cajaActualizar} ; 
    CustomConsole.log('setActualizaCaja',this.newCaja)
  }
getCajas(){
  this.cajas[0] = this.newCaja ;
  
  this.loading.show()
  this.serviceCaja.getCajas()
     .subscribe({next:  (datos:ApiResponse<GenericRecordsPayload<cajaModel>>)=>{
         CustomConsole.log(datos);
         
    if (datos.ok && datos.data.count > 0 ){  
        this.cajas = datos.data.records
      CustomConsole.log(this.cajas);
    }else{
      this.cajas = [];
    }

        this.loading.hide()
      } ,error:error => {this.loading.hide();
        alert(this.serviceCaja.getErrorMessage(error));
      }}
      );
}


  ngOnInit(): void {
  }
  guardarCaja(){
   CustomConsole.log('nueva caja',this.newCaja.nombre)
   if (typeof(this.newCaja.nombre) === 'undefined'){
    this.loading.hide();
    alert('Debe ingresar el Nombre de la caja');
    return;
   }
   if (typeof(this.newCaja.descripcion) === 'undefined'){
    this.newCaja.descripcion = this.newCaja.nombre ;
   }else{
    if ( this.newCaja.descripcion.trim() === ''){
      this.newCaja.descripcion = this.newCaja.nombre ;
     }
   }
   if (this.newCaja.estadoGeneral === 0){
    this.newCaja.estadoGeneral = 2 ;
   }
   if (this.newCaja.establecimiento === 0){
    this.newCaja.establecimiento = 1 ;
   }
   /* 
 cuentaContableGastos?:number;
 cuentaContableEfectivo?:number; */
   if (this.newCaja.cuentaContableGastos == undefined || this.newCaja.cuentaContableGastos  < 1){ 
        
    this.loading.hide();
    alert('Debe ingresar la cuenta de gastos de la caja');
    return;
   }
   if (this.newCaja.cuentaContableEfectivo == undefined || this.newCaja.cuentaContableEfectivo  < 1){
    this.loading.hide();
    alert('Debe ingresar la cuenta de efectivo de la caja');
    return;
   }

   this.loading.show(); 
   this.serviceCaja.setCaja(this.newCaja).subscribe(
    (respuesta:ApiResponse<GenericMutationPayload>)=>{CustomConsole.log(respuesta)
     
    if (respuesta.ok){
      alert('datos ingresados con exito');  
      this.newCaja =  new cajaModel(undefined);
      this.getCajas();
    }else{
      alert(respuesta.error?.message || 'No fue posible guardar la caja');
      this.loading.hide();
    }
    }

   )
  }


}
