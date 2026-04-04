import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CntOperacionPrestablecidas } from 'src/app/interfaces/traslados_cnt/cnt_operacion_prestablecidas.';
import { TrasladosCuentasArrModel, TrasladosCuentasModel } from 'src/app/models/trasladosCuentas.';
import { CntContablesService } from 'src/app/services/cntContables.service';
import { newTrasladoAsignarSaldoComponent } from '../newTrasladoAsignarSaldo/newTrasladoAsignarSaldo.component';
import { cajasResumenModel } from 'src/app/models/ventas/cajasResumen.model';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import Swal from 'sweetalert2';
import { cajaRequest, ejecucionTrasladosRequest } from 'src/app/interfaces/producto-request';
import { PrinterManager } from 'src/app/models/printerManager';
import { SoporteOperacion } from 'src/app/interface/soporte-operacion';

@Component({
  selector: 'app-ejecutarTrasladoDesdeCaja',
  templateUrl: './ejecutarTrasladoDesdeCaja.component.html',
  styleUrls: ['./ejecutarTrasladoDesdeCaja.component.css'],
})
export class ejecutarTrasladoDesdeCajaComponent { 
 cajas:cajaModel[] = []; 
  nombreCuentaDestino :string = ''
  nombreTraslado :string = ''
  idCuentaDestino :number = 0 ; 
  private newAbrirDialog = inject(MatDialog);
  dataProceso?:TrasladosCuentasModel;
  valorTraslado:number = 0;
  private cntService = inject(CntContablesService);
  private cajasService = inject(cajasServices);
  public cajaSeleccionada:number = 0;

  constructor(  @Inject(MAT_DIALOG_DATA) public dataIngreso:CntOperacionPrestablecidas,public dialogo: MatDialogRef<newTrasladoAsignarSaldoComponent>,  ){
    this.dataProceso =  new TrasladosCuentasModel();
    this.cajasService.getCajasTraslados().subscribe({next:(value:cajaRequest)=>{
      if(value.error != 'ok'){
        Swal.fire('error',value.error,'error')
      }else{ 
        let cajasel:cajaModel = { id: 0, nombre: 'Seleccione una caja origen', 
          idCCntCCobrar:  0,
          idRetefuenteCompra:    0,
          idCCntCPagar:  0, 
          idCCntIvaCompra:    0,
          idCCnttIvaVenta:    0,
          idCCntCostoVenta:    0,
          idCCntVenta:   0,
          idCCntIngDifBonoRegalo:   0 
};

        this.cajas =[{...cajasel}  , ...value.data.filter(x=>(x.cuentaContableEfectivo||0) > 0)]  
        //CustomConsole.log('cajaas' , this.cajas);
        
      }
    }, error: e=>Swal.fire('error',this.cntService.getErrorMessage(e),'error')})
    /*
     DESDE_CAJA
     ASIGNA_SALDO
     DE_UNA_A_MUCHOS
     DE_MUCHOS_A_UNA
    */ 
   //CustomConsole.log(this.dataIngreso);
   
   if(this.dataIngreso != undefined){
    this.dataProceso  = this.dataProceso.createTraslado( dataIngreso );  
    this.cntService.getCuentasTrasladosPreeEjecucion(this.dataIngreso.id!).subscribe({next:(value)=>{ 
          this.dataProceso!.cuentas =  value.data;
          //CustomConsole.log('cuentas' , value.data);
          
    },error:e=> Swal.fire(this.cntService.getErrorMessage(e)) })

  }
  }
  ejecutar(){
      //CustomConsole.log('cajaSeleccionada',this.cajaSeleccionada);
      
      if(this.cajaSeleccionada == 0){
        Swal.fire('error','Debe seleccionar el origen del traslado')
      }
      this.dataProceso!.idEstablecimiento = this.cajas[this.cajaSeleccionada].establecimiento!
      if(this.valorTraslado == 0){
        Swal.fire('error','Debe ingresar el valor del traslado')
      }
      this.dataProceso?.cuentas.forEach(x=> x.valor = this.valorTraslado)
      let newCuentaOrigen = new TrasladosCuentasArrModel();
      newCuentaOrigen.idCuenta = this.cajas[this.cajaSeleccionada].cuentaContableEfectivo!      ;
      newCuentaOrigen.tipo = 'ORIGEN';
      newCuentaOrigen.valor = this.valorTraslado;
      newCuentaOrigen.cuenta = this.cajas[this.cajaSeleccionada].nro_scuenta_venta!;
      newCuentaOrigen.nombre = this.cajas[this.cajaSeleccionada].nombre_scuenta_venta!;

      this.dataProceso?.cuentas.push(newCuentaOrigen);
      this.cntService.ejecutarTrasladosCuentas(this.dataProceso!).subscribe({next:(val:ejecucionTrasladosRequest)=>{
        this.printer_soporte_final(val.objeto);
      },error:e=>Swal.fire('error' , this.cntService.getErrorMessage(e))
      })
      
  }

  
  async printer_soporte_final(soporte:SoporteOperacion) {   
   // //CustomConsole.log('documento retorno',doc,'sucursal ', this.sucursal); 
    let printM =  new PrinterManager(this.cajasService);  
    printM.printSoporteMovimiento(false,soporte);
    this.dialogo.close(true);
  }
}
