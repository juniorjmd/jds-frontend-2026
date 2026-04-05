import { Component, OnInit, SimpleChanges } from '@angular/core';
import { select } from 'src/app/interfaces/generales.interface';
import { pais } from 'src/app/interfaces/maestros.interface';
import { PaisModel } from 'src/app/models/maestros.model';
import { MaestroClienteServices } from 'src/app/services/MaestroCliente.services';

import { MatDialog } from "@angular/material/dialog";
import { DialogoConfirmacionComponent } from "src/app/modules/shared/components/dialogo-confirmacion/dialogo-confirmacion.component";
import { NewPaisComponent } from './new-pais.component';
import { loading } from 'src/app/models/app.loading';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
@Component({
  selector: 'app-paises',
  templateUrl: './paises.component.html',
  styleUrls: ['./paises.component.css']
})
export class PaisesComponent implements OnInit {
  paises : pais[] = [];
  changePais : PaisModel = new PaisModel();
  numpaises:number = 0;//private maestroServicio : MaestroClienteServices
  constructor(private maestroCliente : MaestroClienteServices ,
    private dialogo : MatDialog,
    private newPais : MatDialog,
    private loading : loading
    ) 
    {
    this.listarPaises();
   }


   borrarPais(pais:PaisModel ){
     
    this.dialogo.
    open(DialogoConfirmacionComponent,{data:`Realmente quieres eliminar el país ${pais.nombre}`})
    .afterClosed()
    .subscribe((confirmado: Boolean)=>{
      if (confirmado){
        this.maestroCliente.eliminarPaises(pais).subscribe(
          (respuesta: ApiResponse<GenericMutationPayload>)=>{CustomConsole.log(respuesta)
            if (respuesta.ok){
              alert('datos eliminados con exito');     
              this.listarPaises();
            } 
          }
        );
      } 
    })
   }
   listarPaises(){
    this.loading.show() 
    this.maestroCliente.getPaises().subscribe(
      (datos: ApiResponse<GenericRecordsPayload<pais>>)=>{ 
    this.numpaises = datos.data.count;
    if (datos.ok && datos.data.count > 0 ){
      this.paises = datos.data.records;
    }else{
      this.paises = [];
    }
        
        CustomConsole.log(this.paises);
        this.loading.hide() 
      } ,
      error => {this.loading.hide();
        alert(this.maestroCliente.getErrorMessage(error));});
   }
   
   editarPais( id:number , codPais:string , nombre:string){
     this.changePais.id = id ;
     this.changePais.cod_pais = codPais;
     this.changePais.nombre = nombre;
     let activaModal : HTMLElement = document.getElementById('activaModal')!;
     //activaModal.click()
     this.newPais.open(NewPaisComponent,{data:this.changePais})
     .afterClosed()
     .subscribe((confirmado: Boolean)=>{
       if (confirmado)
      this.listarPaises() 
     })
      
   }

  ngOnInit(): void {


  }
  

}
