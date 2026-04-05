import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { cajaRequest } from 'src/app/interfaces/producto-request';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { PrinterManager } from 'src/app/models/printerManager';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { cajasResumenModel } from 'src/app/models/ventas/cajasResumen.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import Swal from 'sweetalert2'; 
import { ResumenCajaComponent } from '../../modals/resumen-caja/resumen-caja.component';

import { loading } from 'src/app/models/app.loading'; 
import { CarwashCloseBoxData, CarwashBoxSummaryData, CarwashSummaryData } from 'src/app/interfaces/carwash-response.interface';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
@Component({
  selector: 'app-cerrar-caja',
  templateUrl: './cerrar-caja.component.html',
  styleUrls: ['./cerrar-caja.component.css']
})
export class CerrarCajaComponent implements OnInit {
  cajas : cajaModel[]=[];
  cajaAbierta !: cajaModel;
  cajaAbiertaFlag:boolean = false;
  flagCajasDisponibles:boolean = true;
  private toResumenModel(summary: CarwashSummaryData): cajasResumenModel {
    return Object.assign(new cajasResumenModel(), summary);
  }

  constructor(private serviceCaja : cajasServices ,  private inicioService : DatosInicialesService ,
    private _Router : Router,
    private loading : loading, private cajaService : cajasServices,
    private newAbrirCajaDialog : MatDialog) { 
      this.getCajas()
      this.serviceCaja.getCuentasContablesEstablecimientoUsuario().subscribe({next:(value:ApiResponse<{ records: cajaModel[]; count: number }>)=>{
        CustomConsole.log('getCuentasContablesEstablecimientoUsuario' , value)
        this.inicioService.validarCuentasContablesEstablecimiento(value.data.records[0] )  
      }})
    
    }

  ngOnInit(): void {
  }
  abrirResumen(cajaResumen : cajasResumenModel){
    
    /*["/home", "pos"]*/ 
    let printerManager : PrinterManager =  new PrinterManager(this.serviceCaja);;;
    printerManager?.printClose(cajaResumen)
    this.newAbrirCajaDialog.open(ResumenCajaComponent,{ data:cajaResumen})
    .afterClosed()
    .subscribe((confirmado: Boolean)=>{
      if (confirmado){ 
        this.getCajas()
    }
    })
  }
  cerrar_parcial(caja :cajaModel){
    this.loading.show()
    this.serviceCaja.cerrarCajaParcial(caja)
       .subscribe({
        next: (respuesta: ApiResponse<CarwashCloseBoxData>)=>{
          CustomConsole.log(respuesta)
          this.abrirResumen(this.toResumenModel(respuesta.data.summary));
          this.loading.hide();
        },
        error: (error: any) => {
          this.loading.hide();
          Swal.fire(this.serviceCaja.getErrorMessage(error));
        }
       });
    }
  cerrar(caja :cajaModel ){
    this.loading.show()
    this.serviceCaja.cerrarCaja(caja)
       .subscribe({
        next: (respuesta: ApiResponse<CarwashCloseBoxData>)=>{
          CustomConsole.log(respuesta)
          this.abrirResumen(this.toResumenModel(respuesta.data.summary));
          this.loading.hide();
        },
        error: (error: any) => {
          this.loading.hide();
          Swal.fire(this.serviceCaja.getErrorMessage(error));
        }
       });
  }

   getResumenCaja(caja:cajaModel){
    this.loading.show()
    this.serviceCaja.resumenCaja(caja)
       .subscribe({
        next: (datos: ApiResponse<CarwashBoxSummaryData>)=>{
           CustomConsole.log(datos);  
          this.abrirResumen(this.toResumenModel(datos.data.summary));
          this.loading.hide();
        },
        error: (error: any) => {
          this.loading.hide();
          Swal.fire(this.serviceCaja.getErrorMessage(error));
        }
       });
   }
  getCajas(){
    this.flagCajasDisponibles = true;
    this.cajas[0] = new cajaModel(undefined) ;
    let cajaAux :cajaModel;
    this.loading.show()
    this.serviceCaja.getCajasActivas()
       .subscribe( {next:
        (datos:ApiResponse<{ records: cajaModel[]; count: number }>)=>{        
          let cont = 0;
           CustomConsole.log('getCajasUsuario',datos);
           this.cajaAbiertaFlag = false;   
      if (datos.data.count > 0 ){ 
          this.cajas = datos.data.records;
         }else{
        this.cajas = [];
        this.flagCajasDisponibles = false;
      }
  
          this.loading.hide()
        } ,
        error: (error : any) => {this.loading.hide();
          Swal.fire(this.serviceCaja.getErrorMessage(error));
        } } 
        );
  } 
  
}
