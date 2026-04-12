import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
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
    filtroActividades = '';
    paginaActual = 1;
    tamanoPagina = 10;
    readonly tamanosPagina = [5, 10, 20, 50];

    productos:ProductoModel[] = [];
    categorias:CategoriasModel[] = [];
    marcas:MarcasModel[] = [] ;
    clientes: ClientesModel[] = [] ;

    private serviceAct = inject(ActiDescuentoService)
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    constructor(    private newAbrirDialog: MatDialog,){
      CustomConsole.log('entro primero aqui en ListarActividadComponent');
      this.cargarActividades();
    }

    get actividadesFiltradas(): ActividadesDescuentoModel[] {
      const term = this.filtroActividades.trim().toLowerCase();
      if (term === '') {
        return this.actividades;
      }

      return this.actividades.filter((item) =>
        [
          item.nombre,
          item.nombreTipo,
          item.fechaInicial,
          item.fechaFinal,
          item.nombreDescuento,
          item.nombre_estado
        ]
          .filter((value) => value !== undefined && value !== null)
          .some((value) => String(value).toLowerCase().includes(term))
      );
    }

    get totalPaginas(): number {
      return Math.max(1, Math.ceil(this.actividadesFiltradas.length / this.tamanoPagina));
    }

    get actividadesPaginadas(): ActividadesDescuentoModel[] {
      const start = (this.paginaActual - 1) * this.tamanoPagina;
      return this.actividadesFiltradas.slice(start, start + this.tamanoPagina);
    }

    actualizarFiltro(): void {
      this.paginaActual = 1;
    }

    cambiarTamanoPagina(): void {
      this.paginaActual = 1;
    }

    irAPagina(page: number): void {
      this.paginaActual = Math.min(Math.max(page, 1), this.totalPaginas);
    }

    irACrear(): void {
      this.router.navigate(['../crear'], { relativeTo: this.route });
    }

    cargarActividades(): void {
      this.serviceAct.getActividades().subscribe({
        next:(value:ApiResponse<GenericRecordsPayload<ActividadesDescuentoModel>>)=>{
          this.actividades = value.data.records ?? [];
          this.paginaActual = 1;
        },
        error:error=>Swal.fire('Error', error.error?.error ?? 'No fue posible consultar las actividades', 'error')
      })
    }
    activarDesactivarActividad(actividad:ActividadesDescuentoModel){
      let act = {...actividad } 
CustomConsole.log((act.estado! == 1 ) );
      act.estado = (act.estado! == 1 )?  2 : 1 ;

      this.serviceAct.updateActividad(act).subscribe({next:(value:ApiResponse<GenericMutationPayload>)=>{
        if(value.ok){
          this.cargarActividades();
        }
      }, error:error=>Swal.fire(error.error.error)       })
    }
    editarFecha(actividad:ActividadesDescuentoModel){
      this.newAbrirDialog.open(ModalChangeFechaActividadComponent, { data:  {...actividad} })
      .afterClosed()
      .pipe(
        tap((confirmado: Boolean) => {      
          if(confirmado){     
          this.cargarActividades();
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

    
    trackByActividad = (index: number, actividad: ActividadesDescuentoModel): number | string =>
      actividad.id ?? `${actividad.nombre}-${index}`;
}
