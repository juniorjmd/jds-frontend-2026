import { Component, inject } from '@angular/core';
import { error } from 'jquery';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { DescuentoModule } from 'src/app/models/descuento/descuento.model';
import { ProductoService } from 'src/app/services/producto.service';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-descuentos',
  templateUrl: './descuentos.component.html',
  styleUrls: ['./descuentos.component.css']
})
export class DescuentosComponent {
   descuentos:DescuentoModule[]=[];
   private productoService= inject(ProductoService);
   public newDesc:DescuentoModule =  new DescuentoModule();
  constructor(){
    this.getDescuentos()
  }

  eliminar(){
    
  }
   editar( ){  
        this.productoService.setDescuento(this.newDesc).subscribe({next:(value:any)=>{
          CustomConsole.log(value);
          if (value.ok){ 
            this.newDesc =  new DescuentoModule();
            this.getDescuentos();
          } else{
            Swal.fire('error','error en la generacion del descuento','error')
          }
        },error:error=>Swal.fire(this.productoService.getErrorMessage(error))
        })

   }
   setEditar(item:DescuentoModule ){
   this.newDesc  = {...item} 

   }

   getDescuentos(){
    this.productoService.getDescuentos().subscribe({next:(value:ApiResponse<GenericRecordsPayload<DescuentoModule>>)=>{
      if(value.ok && value.data.count > 0){
        this.descuentos =  value.data.records;
      }
    }})
   }
}
