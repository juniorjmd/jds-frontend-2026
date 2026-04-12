import { Component, OnInit } from '@angular/core';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { loading } from 'src/app/models/app.loading';
import { cajasServices } from 'src/app/services/Cajas.services'; 
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model';
import { Establecimientos } from 'src/app/interfaces/establecimientos.interface';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ParametrosModel } from 'src/app/models/parametros/parametros.model';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
import { CajaDialogComponent, CajaDialogResult } from '../../modals/caja-dialog/caja-dialog.component';

@Component({
  selector: 'app-cajas-nueva',
  templateUrl: './cajas-nueva.component.html',
  styleUrls: ['./cajas-nueva.component.css']
})
export class CajasNuevaComponent implements OnInit {
  cajas :cajaModel[]  = []; 
  parametros:ParametrosModel[] = [];
  esta : establecimientoModel[] = [];
  guardarBtn = false;
  filtroCajas = '';
  paginaActual = 1;
  tamanoPagina = 10;
  readonly tamanosPagina = [5, 10, 20, 50];
  constructor( private serviceCaja : cajasServices ,  
     private parServices:ParametrosService , 
     private newAbrirDialog: MatDialog,
    private loading : loading ) { 
      this.getParametros();
     this.getEstablecimiento();
     this.getCajas();
    
  }

  get cajasFiltradas(): cajaModel[] {
    const term = this.filtroCajas.trim().toLowerCase();
    if (term === '') {
      return this.cajas;
    }

    return this.cajas.filter((caja) =>
      [
        caja.nombre,
        caja.nombreEstadoGeneral,
        caja.nombre_scuenta_gastos,
        caja.nombre_scuenta_venta,
        caja.nombreEstado,
        caja.nombreEstablecimiento,
        caja.descripcion
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.cajasFiltradas.length / this.tamanoPagina));
  }

  get cajasPaginadas(): cajaModel[] {
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    return this.cajasFiltradas.slice(start, start + this.tamanoPagina);
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

  abrirModalCaja(caja?: cajaModel): void {
    this.newAbrirDialog
      .open(CajaDialogComponent, {
        width: 'min(860px, 95vw)',
        autoFocus: false,
        data: {
          caja,
          establecimientos: this.esta
        }
      })
      .afterClosed()
      .subscribe((resultado?: CajaDialogResult) => {
        if (resultado?.saved) {
          this.getCajas();
        }
      });
  }
  getParametros(){ 
    this.parametros = []; 
     this.loading.show()
     this.parServices.getParametros().subscribe(
       (datos: ApiResponse<GenericRecordsPayload<ParametrosModel>>)=>{
          CustomConsole.log(datos);
          
     if (datos.ok && datos.data.count > 0 ){ 
      this.parametros = datos.data.records 
       CustomConsole.log('parametros',this.parametros);
     }else{
       this.parametros = [];
     }
     this.parametros!.forEach(parametro =>{
      if(parametro.cod_parametro.trim() === 'SISTEMA_MULTICAJAS'){
        if(parametro.par_boolean == true)
        {this.guardarBtn = true; }   
            else{this.guardarBtn = false; }
      }
     })
         this.loading.hide();
       } ,
       error => {this.loading.hide();
         CustomConsole.log(error)
         Swal.fire(this.parServices.getErrorMessage(error), '', 'error');
       }
       );
   }  
  getEstablecimiento(){
    this.serviceCaja.getEstablecimientos()
     .subscribe(
      (datos: ApiResponse<GenericRecordsPayload<establecimientoModel>>)=>{
         CustomConsole.log(datos);
         this.esta = [];   
    if (datos.ok && datos.data.count > 0 ){ 
      
      datos.data.records.forEach((dato:Establecimientos , index:number )=>{
        this.esta[index] = new establecimientoModel( dato );
      }) 
      CustomConsole.log(this.esta);
    }

        this.loading.hide()
      } ,
      error => {this.loading.hide();
        
    this.esta = [];
        window.alert(this.serviceCaja.getErrorMessage(error));
      }
      );
  }
getCajas(){
  this.loading.show()
  this.serviceCaja.getCajas()
     .subscribe({next:  (datos:ApiResponse<GenericRecordsPayload<cajaModel>>)=>{
         CustomConsole.log(datos);
         
    if (datos.ok && datos.data.count > 0 ){  
        this.cajas = datos.data.records
      CustomConsole.log(this.cajas);
    }else{
      this.cajas = [];
    }

        this.loading.hide()
        this.paginaActual = 1;
      } ,error:error => {this.loading.hide();
        window.alert(this.serviceCaja.getErrorMessage(error));
      }}
      );
}


  ngOnInit(): void {
  }

  trackByCaja = (index: number, caja: cajaModel): number | string =>
    caja.id ?? `${caja.nombre}-${index}`;
}
