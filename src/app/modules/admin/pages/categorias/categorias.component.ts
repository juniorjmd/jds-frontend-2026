import { Component, inject, OnInit } from '@angular/core';
import { CategoriasModel } from 'src/app/models/categorias.model';

import { loading } from 'src/app/models/app.loading';
import { ProductoService } from 'src/app/services/producto.service';
import { select } from 'src/app/interfaces/generales.interface';
import { Categoria } from 'src/app/interfaces/categoria.interface';
import { MatDialog } from '@angular/material/dialog';
import { AdminCategoriasComponent } from '../../modals/admin-categorias/admin-categorias.component';
import { tap } from 'rxjs';
import Swal from 'sweetalert2';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { InventarioCategoriesResponse } from 'src/app/interfaces/inventario-response.interface';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {
  categorias: CategoriasModel[] = []; 
  
private newAbrirDialog =  inject(MatDialog)

  constructor( private loading : loading,
   private productoService:ProductoService
    ) {this.getAllCategorias() }
  crearCategoria(){
    this.newAbrirDialog.open(AdminCategoriasComponent, { data:  null })
    .afterClosed() 
    .pipe(
      tap((response: any) => {
        CustomConsole.log('AdminCategoriasComponent',response); 
        if(response){
        this.getAllCategorias();
        }
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire('Error:', error),
      complete: () => CustomConsole.log('buscarCuentasContables completo')
    }); 
  }

  setActualizacategoria(categoria:CategoriasModel){

  }

  setAgregarPerfil(categoria:CategoriasModel){}
  getAllCategorias(){ 
    this.loading.show()
    this.productoService.getCategorias().subscribe({
       next :(datos:InventarioCategoriesResponse)=>{
         CustomConsole.log('getAllCategorias',datos);
         
    if (datos.data.count > 0 ){  
        this.categorias = datos.data.categories;
        this.productoService.asignarCategorias(this.categorias);
        CustomConsole.log(this.categorias);
    }else{
      this.categorias = [];
    }

        this.loading.hide()
      } ,
      error: error => {this.loading.hide();
        CustomConsole.log(error)
        alert( error.error.error);
      }}
      );
  }

  ngOnInit(): void { 
  }

}
