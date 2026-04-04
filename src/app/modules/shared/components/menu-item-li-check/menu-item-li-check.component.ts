import { Component, Input, OnInit } from '@angular/core';
import { Recurso } from 'src/app/interfaces/recurso'; 
import { CustomConsole } from 'src/app/models/CustomConsole';
import { usuarioService } from 'src/app/services/usuario.services';
import Swal from 'sweetalert2';

@Component({
  selector: 'shared-menu-item-li-check',
  templateUrl: './menu-item-li-check.component.html',
  styleUrls: ['./menu-item-li-check.component.css']
})
export class MenuItemLiCheckComponent implements OnInit {
  isDropdownActive:boolean = false;
  @Input() recurso!:Recurso;
  @Input() idPerfil!:number;  
  recursos:Recurso[]=[]; 
   constructor(    private usuarioService:usuarioService ){
    CustomConsole.log('recursos :::::  ',this.recurso);
    
   }
  ngOnInit(): void { 
    this.usuarioService.recursos$.subscribe(recursos => {
      this.recursos = recursos; // Actualiza el arreglo de recursos
    });
  }

  showDropdown() {
    this.isDropdownActive =(this.isDropdownActive)?false: true;
  }

  hideDropdown() {
    this.isDropdownActive = false;
  }

  toggleSeleccionado() {
    //this.recurso.seleccionado = !this.recurso.seleccionado;
 CustomConsole.log(this.recurso.display_nombre);
      let numPadre = this.recurso.idPadre.length  - 1 ; 
      let rec2:Recurso[] = [];
      CustomConsole.log( 'numPadre' , numPadre)
      if (numPadre >= 0  ){ 
      this.recurso.idPadre.forEach((x, index)=>{
        if(index == 0){
          rec2.push(  this.recursos.find(y=>y.id == x)! )
        }else{
          rec2.push( rec2[index-1].recursosHijos.find(y=>y.id == x)!) 
        }})

        if(this.recurso.seleccionado){
          rec2.forEach(x=>x.seleccionado = true);
        }else{
          let cont =  rec2[numPadre].recursosHijos.reduce((count, child) => {
            return count + (child.seleccionado ? 1 : 0);
          }, 0);
          CustomConsole.log('numero de hijos' , cont);
          
          if(cont == 0){
            rec2[numPadre].seleccionado = false
          for(let i=numPadre-1 ; i>=0 ; i-- ){
            cont =  rec2[i].recursosHijos.reduce((count, child) => {
              return count + (child.seleccionado ? 1 : 0);
            }, 0);
            if(cont == 0){{ rec2[i].seleccionado = false; } 
          }
          }
        }
      } }else{
        rec2[0] = this.recurso;
      }



    this.updateChildSelection(this.recurso.seleccionado);
    CustomConsole.log('finalizo' , this.recurso.display_nombre);
    if(this.idPerfil > 0 ){
     this.usuarioService.setArrayRecursos(this.idPerfil , rec2[0]).subscribe(
      {
        next:(val)=>{
          CustomConsole.log(val);
          
        },
        error:e=>Swal.fire(this.usuarioService.getErrorMessage(e))
      }
     )}
  }
 

  updateChildSelection(isSelected: boolean) {
    if (this.recurso.recursosHijos) {
      this.recurso.recursosHijos.forEach(child => {
        child.seleccionado = isSelected;
        if (child.recursosHijos && child.recursosHijos.length > 0) {
          CustomConsole.log(  'inicio' ) ; 
          this.updateChildSelectionRecursive(child, isSelected);
          CustomConsole.log(  'fin' ) ; 
        }
      });
    }
  }

  updateChildSelectionRecursive(recurso: Recurso, isSelected: boolean) {
    CustomConsole.log(  'recursivo' ) ; 
    recurso.recursosHijos.forEach(child => {
      child.seleccionado = isSelected;
      if (child.recursosHijos && child.recursosHijos.length > 0) {
        this.updateChildSelectionRecursive(child, isSelected);
      }
    });
  }
}
