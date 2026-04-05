import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogoConfirmacionComponent } from 'src/app/modules/shared/components/dialogo-confirmacion/dialogo-confirmacion.component';
import { select } from 'src/app/interfaces/generales.interface';
import { departamento } from 'src/app/interfaces/maestros.interface'; 
import { loading } from 'src/app/models/app.loading';
import { DepartamentoModel } from 'src/app/models/maestros.model';
import { MaestroClienteServices } from 'src/app/services/MaestroCliente.services';
import { NewDepartamentoComponent } from './new-departamento.component';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-departamentos',
  templateUrl: './departamentos.component.html',
  styleUrls: ['./departamentos.component.css']
})
export class DepartamentosComponent implements OnInit {
 
    departamentos: departamento[]  = []  ;
    departamentoChange : DepartamentoModel = new DepartamentoModel();
    numdepartamentos : number = 0 ; 
      constructor( private maestroCliente : MaestroClienteServices,
        private dialogo : MatDialog ,
        private newDep : MatDialog , private loading :loading) { 
      
        this.listarDepartamentos()
  }
  listarDepartamentos(){
    this.loading.show();
    this.maestroCliente.getDepartamentos()
    .subscribe({next:
      (datos: ApiResponse<GenericRecordsPayload<departamento>>)=>{ 
    this.numdepartamentos = datos.data.count;
    if (datos.ok && datos.data.count > 0 ){
      this.departamentos = datos.data.records;
    }else{
      this.departamentos = [];
    }
        
        CustomConsole.log(this.departamentos);
        this.loading.hide();
      } ,
      error:(error : any) => { this.loading.hide();
        alert(this.maestroCliente.getErrorMessage(error));}});
  }
  
  borrar(dep:DepartamentoModel ){
     
    this.dialogo.
    open(DialogoConfirmacionComponent,{data:`Realmente quieres eliminar el Departamento ${dep.nombre}`})
    .afterClosed()
    .subscribe((confirmado: Boolean)=>{
      if (confirmado){
        this.maestroCliente.eliminarDepartamento(dep).subscribe(
          (respuesta: ApiResponse<GenericMutationPayload>)=>{CustomConsole.log(respuesta)
            if (respuesta.ok){
              alert('datos eliminados con exito');     
              this.listarDepartamentos();
            } 
          }
        );
      } 
    })
   }
  editarDepartamento (dep : DepartamentoModel){ 
    this.newDep.open(NewDepartamentoComponent,{data:dep})
    .afterClosed()
    .subscribe((confirmado: Boolean)=>{
      if (confirmado){
      this.listarDepartamentos() 
      CustomConsole.log('se listo');
      
    }
    })
  }
  ngOnInit(): void {
  }

}
