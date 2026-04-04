import { Component, OnInit } from '@angular/core';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import { loading } from 'src/app/models/app.loading'; 
import { caja } from 'src/app/interfaces/caja.interface';
import { cajaResumen } from 'src/app/interfaces/cajaResumen.interface';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DefinirBaseCajaComponent } from '../../modals/definir-base-caja/definir-base-caja.component';
import { ResumenCajaComponent } from '../../modals/resumen-caja/resumen-caja.component';
import { cajasResumenModel } from 'src/app/models/ventas/cajasResumen.model';
import { cajaRequest } from 'src/app/interfaces/producto-request';
import { PrinterManager } from 'src/app/models/printerManager';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import Swal from 'sweetalert2';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { CarwashCloseBoxData, CarwashBoxSummaryData, CarwashSummaryData } from 'src/app/interfaces/carwash-response.interface';
@Component({
  selector: 'app-abrir-caja',
  templateUrl: './abrir-caja.component.html',
  styleUrls: ['./abrir-caja.component.css']
})



export class AbrirCajaComponent implements OnInit {
  cajas : cajaModel[]=[];
  cajaAbierta !: cajaModel;
  cajaAbiertaFlag:boolean = false;
  flagCajasDisponibles:boolean = true;
  constructor(private serviceCaja : cajasServices ,  private inicioService : DatosInicialesService ,
    private _Router : Router,
    private loading : loading, private cajaService : cajasServices,
    private newAbrirCajaDialog : MatDialog) { 
      this.getCajas()
      this.serviceCaja.getCuentasContablesEstablecimientoUsuario().subscribe({next:(value:cajaRequest)=>{
        CustomConsole.log('getCuentasContablesEstablecimientoUsuario' , value)
        this.inicioService.validarCuentasContablesEstablecimiento(value.data[0] )  
      }})
    
    }

  ngOnInit(): void {
  }
  private toResumenModel(summary: CarwashSummaryData): cajasResumenModel {
    return Object.assign(new cajasResumenModel(), summary);
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
        next: (respuesta: CarwashCloseBoxData)=>{
          CustomConsole.log(respuesta)
          this.abrirResumen(this.toResumenModel(respuesta.summary));
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
        next: (respuesta: CarwashCloseBoxData)=>{
          CustomConsole.log(respuesta)
          this.abrirResumen(this.toResumenModel(respuesta.summary));
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
        next: (datos: CarwashBoxSummaryData)=>{
           CustomConsole.log(datos);  
          this.abrirResumen(this.toResumenModel(datos.summary));
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
    this.serviceCaja.getCajasUsuario()
       .subscribe( {next:
        (datos:cajaRequest)=>{        
          let cont = 0;
           CustomConsole.log('getCajasUsuario',datos);
           this.cajaAbiertaFlag = false;   
      if (datos.numdata > 0 ){ 

        cajaAux = datos.data.filter(x=>x.nombreEstado === "Abierta" && x.idUsuario == x.usuarioEstadoCaja)[0] ;
        if (cajaAux !== undefined){
          this.loading.hide() 
          this.cajaAbierta = cajaAux;
          this.cajaAbiertaFlag = true; 
        }else{
          this.cajas = datos.data;
        }  
      }else{
        this.cajas = [];
        this.flagCajasDisponibles = false;
      }
  
          this.loading.hide()
        } ,
        error: (error : any) => {this.loading.hide();
          Swal.fire( error.error.error);
        } } 
        );
  }
  asignarCaja(caja : cajaModel){
    /*["/home", "pos"]*/ 
    CustomConsole.log(caja);
    
      this.newAbrirCajaDialog.open(DefinirBaseCajaComponent,{data:caja})
      .afterClosed()
      .subscribe((confirmado: Boolean)=>{
        if (confirmado){ 
          this._Router.navigate(["/home","pos","ventas"]);
      }
      })
  }
  continuar(){
    this._Router.navigate(["/home","pos","ventas"]);
  }

  continuar_caja_suspendida(caja : cajaModel){
    
    this.loading.show() 
    this.cajaService.abrirCaja(caja, 0).subscribe( {next:
      (respuesta:any)=>{
        CustomConsole.log(respuesta)
        Swal.fire(respuesta.message).then(() => {
          this.continuar();
        });
        this.loading.hide();
      },
      error:(error : any) => {this.loading.hide();
        Swal.fire(this.serviceCaja.getErrorMessage(error));
      }}
      );
  } 
  
}
