 
import {   Component, inject } from '@angular/core'; 
import { MarcasModel } from 'src/app/models/marcas/marcas.module';
import { ActiDescuentoService } from 'src/app/services/actiDescuento.service';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-find-marcas', 
  templateUrl: './findMarcas.html',
  styleUrls: ['./findMarcas.component.css'], 
})
export class FindMarcasComponent { 
  
  private actividadService =  inject(ActiDescuentoService)
  public marcas:MarcasModel[] = [];
  public marcasFiltrados:MarcasModel[] = [];
  filtroName:string = ''

  ngOnInit(): void { 
    this.actividadService.arrayMarcas.subscribe({next:(prd)=>{
      this.marcas = [...prd??[]]; 
      //CustomConsole.log('oninit filtroname',this.filtroName); 
      if(this.filtroName == '') {this.marcasFiltrados = [...this.marcas];}  
          }})
  } 
  
 
  enviarProducto(item:MarcasModel){
    //CustomConsole.log(item); 
    let id:number = (typeof( item.id ) == 'string')? parseInt(item.id!) :item.id! ;  
    if(!item.selected){
      this.actividadService.ingresarItemDescuentoTmp(id ,'BRD' ).subscribe({next:(val:ApiResponse<GenericMutationPayload>)=>{
        if (!val.ok) {
          return;
        }
        item.selected= true; 
      }})
    }else{ 
      this.actividadService.deleteItemDescuentoTmp(id ,'BRD' ) .subscribe({next:(val:ApiResponse<GenericMutationPayload>)=>{  
        if (!val.ok) {
          return;
        }
        item.selected= false;  
      },error:error=>Swal.fire(error.error.error)
      })
   
  }
 }
 


    filtrarPorNombre( ) {

      this.marcasFiltrados = [...this.marcas??[]].filter(x => (        
        x.nombre.toLowerCase().includes(this.filtroName.toLowerCase())  
      
      )
  ); 
      if(this.marcasFiltrados.length == 0){

       this.busquedaFiltradoPorNombre()
      } 
  }

  busquedaFiltradoPorNombre(){ 
      this.actividadService.
      getMarcasDisponiblesByName(this.filtroName)
      .subscribe({next:(value:ApiResponse<GenericRecordsPayload<MarcasModel>>)=>{ 
        //CustomConsole.log('resultado busqueda' , value);
        
        if(value.data.count > 0) { 
          //CustomConsole.log('termina la busqueda');
          
          this.marcasFiltrados = value.data.records;
          const nuevosProductos = value.data.records.filter((nuevoProducto: MarcasModel) => 
            !this.marcas.some(producto => producto.id === nuevoProducto.id)
          ); 
          this.actividadService.setArrayMarcas( [...this.marcas, ...nuevosProductos] );
          //CustomConsole.log('busqueda marcas',this.marcasFiltrados);
          
        }
      }})
    
  }
}
