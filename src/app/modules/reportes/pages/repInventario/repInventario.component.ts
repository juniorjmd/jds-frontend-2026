import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { data } from 'jquery'; 
import { Inventario, InventarioApl, InventarioAplDetalle } from 'src/app/interfaces/nInterfaces/inventario';
import { InventarioModule } from 'src/app/modules/admin/modules/inventario/inventario.module';
import { ProductoService } from 'src/app/services/producto.service';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-rep-inventario', 
  templateUrl: `./repInventario.component.html`,
  styleUrls: ['./repInventario.component.css'], 
})
export class RepInventarioComponent implements OnInit {

  private prdService = inject(ProductoService); 
  detalle:InventarioAplDetalle[] = [];
  inventarios:InventarioApl[] = [] ;
  idInventario:any = 0 ;
  ngOnInit(): void {
    this.prdService.getInventariosAplicados()
    .subscribe({
      next:(val:ApiResponse<GenericRecordsPayload<InventarioApl>>)=>{
        console.log('inventarios  ',val);   
        if(val.ok && val.data.count > 0){
          this.inventarios = val.data.records
        }
      } 
    ,error:(e)=> Swal.fire(JSON.stringify(e))})
  }
     
 
getInventarioDetalle(){
  if(this.idInventario != ''){
    
    this.prdService.getInventariosAplicadosDetalle(this.idInventario)
    .subscribe({
      next:(val:ApiResponse<GenericRecordsPayload<InventarioAplDetalle>>)=>{
        console.log('INVENTARIO DETALLE  ',val);   
        if(val.ok && val.data.count > 0){
          this.detalle = val.data.records
        }
      } 
    ,error:(e)=> Swal.fire(JSON.stringify(e))})
  }
}

 }
