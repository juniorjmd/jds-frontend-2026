 
import {   Component, OnInit } from '@angular/core'; 
import { perfil, perfilRequest, recursoRequest } from 'src/app/interfaces/producto-request';
import { Recurso } from 'src/app/interfaces/recurso'; 
import { usuarioService } from 'src/app/services/usuario.services';
import Swal from 'sweetalert2';

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
this.usuarioService.getArrayRecursos().subscribe({next:(value:recursoRequest)=>{ 
   for(let i= 0 ; i< value.numdata ; i++ )  {
    //CustomConsole.log('recursos ' + i , value.data[i])  
    this.recursosAux.push(value.data[i]) 
   } 
   this.usuarioService.updateRecursos([...this.recursosAux]) ;
   //CustomConsole.log('recursos' , this.recursos , Array.isArray(this.recursos));
    
}, error:e=>Swal.fire(this.usuarioService.getErrorMessage(e))
}
)
  }
getPerfiles(){
  this.usuarioService.getPerfiles().subscribe({next: (p:perfilRequest)=>{
    if(p.error=='ok'){
      if(p.numdata > 0){ 
        this.perfiles = p.data
        //CustomConsole.log('perfiles' , p.data);
        
      }else{Swal.fire(p.error)}
    }else{Swal.fire(p.error)}
  }});
}

  guardarPerfil(){
    //CustomConsole.log('recursos' , this.recursos);
    this.usuarioService.setPerfil(this.Perfil).subscribe(
      {
        next:(val:any)=>{
          if(val.error == 'ok'){
            this.getPerfiles();
          }else{Swal.fire(val.error)}
        },error:e=>Swal.fire(JSON.stringify(e))
      }
    )
  }
  buscarRecursos(i:perfil){
    //CustomConsole.log('buscarRecursos',i); 
   this.usuarioService.updateRecursos([...this.recursosAux]) ;
    this.Perfil = {...i};
    this.usuarioService.getArrayRecursosByPerfil(i.id!).subscribe({next:(val:recursoRequest)=>{
      if(val.error == 'ok') this.usuarioService.updateRecursos([...val.data]) ;
    } , error: e=> Swal.fire(this.usuarioService.getErrorMessage(e))
  }
      
    )
  }
}
