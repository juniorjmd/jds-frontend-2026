import { Component, Inject, Input, OnInit } from '@angular/core';
import { Form,NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaisModel } from 'src/app/models/maestros.model';
import { MaestroClienteServices } from 'src/app/services/MaestroCliente.services';
import { loading } from 'src/app/models/app.loading';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload } from 'src/app/interfaces/generic-response.interface';


@Component({
  selector: 'app-new-pais',
  templateUrl: './new-pais.component.html',
  styleUrls: ['./new-pais.component.css']
})
export class NewPaisComponent implements OnInit {
 // @Input() pais : PaisModel
 ;
  constructor( private _Router : Router,
               private loading : loading,
               config: NgbModalConfig, 
               private modalService: NgbModal, 
               private maestroServicio : MaestroClienteServices ,
               public dialogo: MatDialogRef<NewPaisComponent>,
               @Inject(MAT_DIALOG_DATA) public pais: PaisModel
   ) { 

  }
  limpiarForm(){
    this.pais.nombre = '';
    this.pais.id = 0 ;
    this.pais.cod_pais = '';      
  }
  ingresarPais(form : NgForm){
    this.loading.show();
    if(this.pais.id > 0 ){
        this.maestroServicio.actualizarPaises(this.pais).subscribe(
          (respuesta: ApiResponse<GenericMutationPayload>)=>{CustomConsole.log(respuesta)
            this.loading.hide();
            if (respuesta.ok){
              alert('datos ingresados con exito'); 
              this.confirmado(); 
                 
            } 
            
          }
        
        );
    }else{
      this.maestroServicio.setPaises(this.pais).subscribe(
        (respuesta: ApiResponse<GenericMutationPayload>)=>{CustomConsole.log(respuesta)
          this.loading.hide();
        if (respuesta.ok){
          alert('datos ingresados con exito'); 
          this.confirmado(); 
             
        } 
        }
      
      );
    }
    CustomConsole.log('nuevo pais',this.pais)
  }

  ngOnInit(): void {
  }
  cerrarDialogo(): void {
    this.dialogo.close(false);
  }
  confirmado(): void {
    this.dialogo.close(true);
  }

}
