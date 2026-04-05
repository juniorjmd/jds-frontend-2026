import { NgForOf } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { Form,NgForm } from '@angular/forms';
import { departamento, pais } from 'src/app/interfaces/maestros.interface';
import { CiudadModel, PaisModel } from 'src/app/models/maestros.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DepartamentoModel } from 'src/app/models/maestros.model';
import { MaestroClienteServices } from 'src/app/services/MaestroCliente.services';
import { loading } from 'src/app/models/app.loading'; 
import { select } from 'src/app/interfaces/generales.interface';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-new-ciudad',
  templateUrl: './new-ciudad.component.html',
  styleUrls: ['./new-ciudad.component.css']
})
export class NewCiudadComponent implements OnInit {
  paises:pais[] = [] ; 
  dep:departamento[] = [] ; 
  numpaises:number = 0;
  numdep:number = 0;
  cityN:CiudadModel;
  constructor(
  
    private loading : loading,
    config: NgbModalConfig, 
    private modalService: NgbModal, 
    private maestroServicio : MaestroClienteServices ,
    public dialogo: MatDialogRef<NewCiudadComponent>,
    @Inject(MAT_DIALOG_DATA) public cityNuevo: CiudadModel

  ) {  this.cityN = cityNuevo;
    this.getPaises();
    this.getDepartamento();



  }

  ngOnInit(): void {
  }
  ingresar(form : NgForm){   
    if (form.invalid){
      return;
    } 
    this.loading.show();
    let codDep:number;
    CustomConsole.log("ciudad enviada"+ JSON.stringify(this.cityN));
    this.dep!.forEach(departamentos =>{
      CustomConsole.log(this.cityN.cod_departamento, departamentos.id);
     if ( this.cityN.cod_departamento === departamentos.id){
      codDep =departamentos.id;
     }
    })
    this.cityN.cod_dane = ( codDep! * 1000) +  this.cityN.cod_ciudad ;
    if(this.cityN.id > 0 ){
        this.maestroServicio.actualizarCiudades(this.cityN).subscribe(
          (respuesta: ApiResponse<GenericMutationPayload>)=>{CustomConsole.log(respuesta)
            this.loading.hide();
            if (respuesta.ok){
              alert('datos ingresados con exito'); 
              this.confirmado();                 
            }             
          }        
        );
    }else{
      this.maestroServicio.setCiudades(this.cityN).subscribe(
        (respuesta: ApiResponse<GenericMutationPayload>)=>{CustomConsole.log(respuesta)
          this.loading.hide();
        if (respuesta.ok){
          alert('datos ingresados con exito'); 
          this.confirmado(); 
        } 
        });
    }
    CustomConsole.log('nuevo pais',this.cityN)
  }

  limpiarForm(){ 
    this.cityN = new CiudadModel();      
  }

  cerrarDialogo(): void {
    this.dialogo.close(false);
  }
  confirmado(): void {
    this.dialogo.close(true);
  }

  getPaises(){
    this.loading.show() 
    this.maestroServicio.getPaises().subscribe(
      (datos: ApiResponse<GenericRecordsPayload<pais>>)=>{ 
    this.numpaises = datos.data.count;
    if (datos.ok && datos.data.count > 0 ){
      this.paises = datos.data.records;
    }else{
      this.paises = [];
      alert('no existen paises Creador');
      this.cerrarDialogo();
      
    }
        
        CustomConsole.log(this.paises);
        this.loading.hide() 
      } ,
      error => {this.loading.hide();
        alert(this.maestroServicio.getErrorMessage(error));});
   }

 
   getDepartamentosPorPais(id:number){
     if(id>0){
    this.loading.show() 
    this.maestroServicio.getDepartamentosPorPais(id).subscribe(
      (datos: ApiResponse<GenericRecordsPayload<departamento>>)=>{ 
    this.numdep = datos.data.count;
    CustomConsole.log(datos );
    
    if (datos.ok && datos.data.count > 0 ){

      this.dep = datos.data.records;
    }else{
      this.dep = [];
      alert('no existen Departamentos Para el pais seleccionado'); 
    }
        
        CustomConsole.log(this.dep);
        this.loading.hide() 
      } ,
      error => {this.loading.hide();
        alert(this.maestroServicio.getErrorMessage(error));});
   }}


   getDepartamento(){
    this.loading.show() 
    this.maestroServicio.getDepartamentos().subscribe(
      (datos: ApiResponse<GenericRecordsPayload<departamento>>)=>{ 
    this.numdep = datos.data.count;
    if (datos.ok && datos.data.count > 0 ){
      this.dep = datos.data.records;
    }else{
      this.dep = [];
      alert('no existen Departamentos Creados');
      this.cerrarDialogo();
    }
        
        CustomConsole.log(this.paises);
        this.loading.hide() 
      } ,
      error => {this.loading.hide();
        alert(this.maestroServicio.getErrorMessage(error));});
   }
}
