import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { actividadesDetalleRequest, actividadesRequest } from 'src/app/interfaces/producto-request';
import { ActividadesDescuentoModel } from 'src/app/models/actividadesDescuentoModel';
import { CategoriasModel } from 'src/app/models/categorias.model';
import { ClientesModel } from 'src/app/models/clientes/clientes.module';
import { MarcasModel } from 'src/app/models/marcas/marcas.module';
import { ProductoModel } from 'src/app/models/producto/producto.module';
import { ActiDescuentoService } from 'src/app/services/actiDescuento.service';
import Swal from 'sweetalert2';
import { ModalInOutDetalleActividad } from '../../../modals/modalExcluirIncluirDetalleActividad/modalExcluirIncluirDetalleActividad.component';
import { ModalChangeFechaActividadComponent } from '../../../modals/modalChangeFechaActividad/modalChangeFechaActividad.component';
import { tap } from 'rxjs';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-listar-actividad',
  templateUrl: './listar-actividad.component.html',
  styleUrls: ['./listar-actividad.component.css']
})
export class ListarActividadComponent {

    actividades:ActividadesDescuentoModel[] =[];

    productos:ProductoModel[] = [];
    categorias:CategoriasModel[] = [];
    marcas:MarcasModel[] = [] ;
    clientes: ClientesModel[] = [] ;

    private serviceAct = inject(ActiDescuentoService)
    constructor(    private newAbrirDialog: MatDialog,){
      CustomConsole.log('entro primero aqui en ListarActividadComponent');
      
      this.serviceAct.getActividades().subscribe({next:(value:ApiResponse<GenericRecordsPayload<ActividadesDescuentoModel>>)=>{
        this.actividades = value.data.records;
      }})
    }
    activarDesactivarActividad(actividad:ActividadesDescuentoModel){
      let act = {...actividad } 
CustomConsole.log((act.estado! == 1 ) );
      act.estado = (act.estado! == 1 )?  2 : 1 ;

      this.serviceAct.updateActividad(act).subscribe({next:(value:ApiResponse<GenericMutationPayload>)=>{
        if(value.ok){
          this.serviceAct.getActividades().subscribe({next:(value:ApiResponse<GenericRecordsPayload<ActividadesDescuentoModel>>)=>{
            this.actividades = value.data.records;
          }})
        }
      }, error:error=>Swal.fire(error.error.error)       })
    }
    editarFecha(actividad:ActividadesDescuentoModel){
      this.newAbrirDialog.open(ModalChangeFechaActividadComponent, { data:  {...actividad} })
      .afterClosed()
      .pipe(
        tap((confirmado: Boolean) => {      
          if(confirmado){     
          this.serviceAct.getActividades().subscribe({next:(value:ApiResponse<GenericRecordsPayload<ActividadesDescuentoModel>>)=>{
            this.actividades = value.data.records;  }})
        }})
      ).subscribe({
        next: () => {},
        error: (error) => Swal.fire('Error:', error),
        complete: () =>{ CustomConsole.log('FindProductosComponent completo');}
      });  
    }


    excluirProductos(detalle:ActividadesDescuentoModel){
      
      this.newAbrirDialog.open(ModalInOutDetalleActividad , { data:  detalle })
      .afterClosed().subscribe({
        next: () => {},
        error: (error) => Swal.fire('Error:', error),
        complete: () => CustomConsole.log('ModalInOutDetalleActividad completo')
      });  
    }
    verDetalle(detalle:ActividadesDescuentoModel){
      CustomConsole.log(detalle);
      this.serviceAct.getDetalleActividad(detalle).subscribe({next:(value:ApiResponse<GenericRecordsPayload<any>>)=>{ 

        CustomConsole.log('data response detalle' , value.data.records);
        let html = '<table class ="table" >';
      if(value.data.count > 0 ){
        switch(detalle.tipo){
          case 'PRD' : 
              this.productos = value.data.records ;
              html += `<tr><td> Productos en descuento </td></tr>      `;
            this.productos.forEach(x=>{
              html += `<tr style=" text-align: left; "><td>cod : ${x.id}</td> <td> Nombre : ${x.nombre} | ${x.nombre2} | ${x.nombre3} </td></tr>      `;
            })
          break;
          case 'CAT' : 
          this.categorias = value.data.records ;
          
          html += `<tr><td colspan='2'>  Categorias en descuento </td></tr>      `;
          this.categorias.forEach(x=>{
            html += `<tr style=" text-align: left; "><td>cod : ${x.id} </td> <td> Nombre : ${x.nombre}  </td></tr>      `;
          })
          break;
          case 'CLI' : 
          this.clientes = value.data.records ;
          html += `<tr><td colspan='2'>  Clientes con descuento </td></tr>      `;
          this.clientes.forEach(x=>{
            html += `<tr style=" text-align: left; "><td>Identificacion : ${x.numIdentificacion} </td> <td style='text-align=center'> Nombre : ${x.nombreCompleto}  </td></tr>      `;
          })
          break;
          case 'BRD' : 
          this.marcas = value.data.records ;
          this.marcas.forEach(x=>{
            html += `<tr style=" text-align: left; "><td>cod : ${x.id} </td><td>  Nombre : ${x.nombre}  </td></tr>      `;
          })
          break;
        }
        html += '</table>'
        Swal.fire({title:`Detalle actividad ${detalle.nombre}`,html });
        
      }   
            
      },error:error=>Swal.fire('error', error.error.error,'error')})
      
    }

    
}
