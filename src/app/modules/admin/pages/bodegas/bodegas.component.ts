import { Component, OnInit } from '@angular/core';
import { CategoriasModel } from 'src/app/models/categorias.model';

import { loading } from 'src/app/models/app.loading';
import { ProductoService } from 'src/app/services/producto.service'; 
import { BodegasModule } from 'src/app/models/bodegas/bodegas.module';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { InventarioWarehousesResponse } from 'src/app/interfaces/inventario-response.interface';

@Component({
  selector: 'app-bodegas',
  templateUrl: './bodegas.component.html',
  styleUrls: ['./bodegas.component.css']
})
export class BodegasComponent implements OnInit {
  bodegas:any[] = [];
  constructor(private loading : loading,
    private productoService:ProductoService) { 
      this.getBodegas();
    }
  getBodegas(){ 
    this.loading.show()
    this.productoService.getbodegas().subscribe(
      {next:   (datos:InventarioWarehousesResponse)=>{
         CustomConsole.log('getBodegas',datos); 
    if (datos.data.count > 0 ){
      this.bodegas =  datos.data.warehouses;
      CustomConsole.log('bodegas',this.bodegas);
    }else{
      this.bodegas = [];
    }

        this.loading.hide()
      } ,
      error:(error : any) => {this.loading.hide();
        CustomConsole.log(error)
        alert( error.error.error);
      }}
      );
  }
  setActualizacategoria(categoria:BodegasModule){}
  setAgregarPerfil(categoria:BodegasModule){}
  ngOnInit(): void {
  }

}
