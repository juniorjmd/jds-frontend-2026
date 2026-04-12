import { Component, OnInit } from '@angular/core';
import { Establecimientos } from 'src/app/interfaces/establecimientos.interface';
import { MediosDePago } from 'src/app/interfaces/medios-de-pago.interface';
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import { loading } from 'src/app/models/app.loading';
import { MediosDePagoModel } from 'src/app/models/ventas/medios-de-pago.model';
import { MatDialog } from '@angular/material/dialog';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
import { MedioPagoDialogComponent, MedioPagoDialogResult } from '../../modals/medio-pago-dialog/medio-pago-dialog.component';

@Component({
  selector: 'app-medios-de-pago',
  templateUrl: './medios-de-pago.component.html',
  styleUrls: ['./medios-de-pago.component.css']
})
export class MediosDePagoComponent implements OnInit {
  MedioP: MediosDePago[] = [];
  esta: Establecimientos[] = [];
  filtroMedios = '';
  paginaActual = 1;
  tamanoPagina = 10;
  readonly tamanosPagina = [5, 10, 20, 50];

  constructor(
    private serviceCaja: cajasServices,
    private dialog: MatDialog,
    private loading: loading
  ) {
    this.getEstablecimiento();
    this.getMedios();
  }

  ngOnInit(): void {
  }

  get mediosFiltrados(): MediosDePago[] {
    const term = this.filtroMedios.trim().toLowerCase();
    if (term === '') {
      return this.MedioP;
    }

    return this.MedioP.filter((medio) =>
      [
        medio.nombre,
        medio.descripcion,
        medio.nombreCuentaContable,
        medio.nombreEstado,
        medio.nombreEsta
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.mediosFiltrados.length / this.tamanoPagina));
  }

  get mediosPaginados(): MediosDePago[] {
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    return this.mediosFiltrados.slice(start, start + this.tamanoPagina);
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

  abrirModalMedio(medio?: MediosDePago): void {
    this.dialog
      .open(MedioPagoDialogComponent, {
        width: 'min(760px, 95vw)',
        autoFocus: false,
        data: {
          medio,
          establecimientos: this.esta
        }
      })
      .afterClosed()
      .subscribe((resultado?: MedioPagoDialogResult) => {
        if (resultado?.saved) {
          this.getMedios();
        }
      });
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
getMedios(){ 
  
  this.loading.show()
    this.serviceCaja.getMedios()
     .subscribe(
      (datos: ApiResponse<GenericRecordsPayload<MediosDePagoModel>>)=>{
         CustomConsole.log(datos);
         this.MedioP = [];
    if (datos.ok && datos.data.count > 0 ){ 
      datos.data.records.forEach((dato:MediosDePago , index:number )=>{
        this.MedioP[index] =   dato ;
      }) 
      CustomConsole.log(this.MedioP);
    }else{
      this.MedioP = [];
    }

        this.loading.hide()
        this.paginaActual = 1;
      } ,
      error => {this.loading.hide();
        window.alert(this.serviceCaja.getErrorMessage(error));
      }
      );
}

trackByMedio = (index: number, medio: MediosDePago): number | string =>
  medio.id ?? `${medio.nombre}-${index}`;

}
