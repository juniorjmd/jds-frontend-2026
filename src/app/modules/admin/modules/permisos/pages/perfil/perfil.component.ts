 
import {   Component, OnInit } from '@angular/core'; 
import { perfil } from 'src/app/interfaces/producto-request';
import { Recurso } from 'src/app/interfaces/recurso'; 
import { usuarioService } from 'src/app/services/usuario.services';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { AdminResourcesResponse } from 'src/app/interfaces/admin-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-perfil', 
  templateUrl:'./perfil.component.html', 
  styleUrls: ['./perfil.component.css'], 
})
export class PerfilComponent implements OnInit  { 
  perfiles:perfil[] = [];
  recursos:Recurso[]=[];
  recursosAux:Recurso[]=[];
  Perfil:perfil ={
    id : 0 , 
    Perf_Nombre: '',
    estado: 1
  };
  auxPerfil = {...this.Perfil} ; 
  constructor(
    private usuarioService:usuarioService
  ){
  }
  ngOnInit(): void {    
    this.getPerfiles(); 
    this.usuarioService.recursos$.subscribe(recursos => {
      this.recursos = recursos; // Actualiza el arreglo de recursos
    });
this.usuarioService.getArrayRecursos().subscribe({next:(value:AdminResourcesResponse)=>{ 
   this.recursosAux = [...value.data.resources];
   this.usuarioService.updateRecursos([...this.recursosAux]) ;
   //CustomConsole.log('recursos' , this.recursos , Array.isArray(this.recursos));
    
}, error:e=>Swal.fire(this.usuarioService.getErrorMessage(e))
}
)
  }
getPerfiles(){
  this.usuarioService.getPerfiles().subscribe({next: (p:ApiResponse<GenericRecordsPayload<perfil>>)=>{
      this.perfiles = p.data.records;
  }});
}

  guardarPerfil(){
    //CustomConsole.log('recursos' , this.recursos);
    this.usuarioService.setPerfil(this.Perfil).subscribe(
      {
        next:(val:ApiResponse<any>)=>{
          if(val.ok){
            this.getPerfiles();
          }else{Swal.fire(val.error?.message ?? 'No fue posible guardar el perfil')}
        },error:e=>Swal.fire(JSON.stringify(e))
      }
    )
  }
  buscarRecursos(i:perfil){
    //CustomConsole.log('buscarRecursos',i); 
   this.usuarioService.updateRecursos([...this.recursosAux]) ;
    this.Perfil = {...i};
    this.usuarioService.getArrayRecursosByPerfil(i.id!).subscribe({next:(val:AdminResourcesResponse)=>{
      if(val.ok) this.usuarioService.updateRecursos([...val.data.resources]) ;
    } , error: e=> Swal.fire(this.usuarioService.getErrorMessage(e))
  }
      
    )
  }
}
