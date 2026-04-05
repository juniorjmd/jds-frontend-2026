import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { caja } from 'src/app/interfaces/caja.interface'; 
import { loading } from 'src/app/models/app.loading';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { cajasServices } from 'src/app/services/Cajas.services'; 
import { ApiResponse } from 'src/app/interfaces/api-response.interface';

@Component({
  selector: 'app-usuario-detalle',
  template: `
     <div class="container-fluid modal_container">
     <div class="row">
        <div class="col-sm-12  ">
            <h2 class='centrado'>Asignar Cajas a Usuario</h2>
        </div>
    </div><hr>
    <div class="row">
        <div class="col-sm-12  ">
          <b> {{usuarioActual.nombreCompleto}}</b>
        </div></div>
    <div class="row">
        <div class="col-sm-12  ">
          usuario : <b> {{usuarioActual.Login}}</b>
        </div></div><hr>
    <div class="row" *ngIf="cajas.length > 0">
        <div class="col-sm-12  " style="color: blue;">
          <ul *ngIf="cajas.length > 0">
            <li *ngFor="let caja of cajas; let i = index">
            <mat-checkbox [(ngModel)]="opciones[i]">
              {{caja.nombre}}</mat-checkbox>
            </li>
          </ul>
            <table class='table' *ngIf="cajas.length <= 0">  
              <tbody >
              <tr><td>No existen cajas para asignar al usuario</td></tr>
              </tbody>
            </table>
        </div>
    </div>
     <div class="row"  *ngIf="cajas.length > 0">
     <div class="col-sm-5  ">
          <button type="button" class="btn btn-primary" (click) = 'guardarRelacion()'>Guardar</button>
        </div>
        <div class="col-sm-5  ">
          <button type="button" class="btn btn-danger" (click)= 'cerrarDialog()'>Cancelar</button>
        </div></div>
     </div>
  `,
  styles: [
  ]
})
export class UsuarioDetalleComponent implements OnInit {


  cajas :cajaModel[]  = [];
  opciones:boolean[] = [];
  usuarioActual:UsuarioModel ;  
  constructor(@Inject(MAT_DIALOG_DATA) public usuario: UsuarioModel ,
  private loading : loading ,
  private serviceCaja : cajasServices,
  public dialogo: MatDialogRef<UsuarioDetalleComponent>
  ) {
                 this.usuarioActual = usuario;
                 this.getCajas();
                }

  ngOnInit(): void {
  }
  
getCajas(){
  this.cajas[0] = new cajaModel(undefined);
  
  this.loading.show()
  this.serviceCaja.getCajasPorUsuario(this.usuarioActual.ID)
     .subscribe(
      (datos:ApiResponse<{ boxes: cajaModel[]; count: number }>)=>{
         //CustomConsole.log('getCajasPorUsuario',datos);
         
    if (datos.data.count > 0 ){ 
      datos.data.boxes.forEach((dato, index:number)=>{
        this.cajas[index] = new cajaModel(dato as any);
        this.opciones[index] = this.cajas[index].asignada!;
      }) 
      //CustomConsole.log(this.cajas);
    }else{
      this.cajas = [];
    }

        this.loading.hide()
      } ,
      error => {this.loading.hide();
        alert(this.serviceCaja.getErrorMessage(error));
      }
      );
}
cerrarDialog(){
  this.dialogo.close(false);
}
guardarRelacion(){
  //CustomConsole.log('opciones',this.opciones)
  let OpcionesEnvio:number[] = []; 
  let count = 0;
  this.opciones!.forEach((values,index)=>{
    if(values && this.cajas[index].id != undefined){
      OpcionesEnvio[count] = this.cajas[index].id!;
      count++;
    }
    
  })
  if (OpcionesEnvio.length > 0){
    this.loading.show(); 
   this.serviceCaja.setCajasAUsuarios(this.usuarioActual.ID,OpcionesEnvio).subscribe(
    (respuesta:ApiResponse<{ message: string; assignedBoxIds: number[]; inserted: number; deleted: number }>)=>{//CustomConsole.log(respuesta)
     
    alert(respuesta.data.message ?? 'datos ingresados con exito');  
    this.loading.hide();
    this.cerrarDialog()
    }

   , error => {
    this.loading.hide();
    alert(this.serviceCaja.getErrorMessage(error));
   })
  }else{
    alert('debe escoger las cajas a asignar!!!')
  }
  //CustomConsole.log(OpcionesEnvio);
}
}
