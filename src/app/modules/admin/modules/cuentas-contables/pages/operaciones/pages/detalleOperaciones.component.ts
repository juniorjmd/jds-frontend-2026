import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { error } from 'jquery';
import { SoporteOperacion } from 'src/app/interface/soporte-operacion';
import { cntOperacionesRequest, cntTransaccionesRequest, soporteMovimientoCntRequest } from 'src/app/interfaces/producto-request';
import { CntClasesModel } from 'src/app/models/cnt-clases/cnt-clases.module';
import { CntCuentaMModel } from 'src/app/models/cnt-cuenta-m/cnt-cuenta-m.module';
import { CntGruposModel } from 'src/app/models/cnt-grupos/cnt-grupos.module';
import { CntOperacionesModel } from 'src/app/models/cnt-operaciones/cnt-operaciones.module';
import { CntSubCuentaModel, vwCntSubCuentaModel } from 'src/app/models/cnt-sub-cuenta/cnt-sub-cuenta.module';
import { PrinterManager } from 'src/app/models/printerManager';
import { TransaccionesModel, vwTransaccionesModel } from 'src/app/models/transacciones/transacciones.module';
import { cajasServices } from 'src/app/services/Cajas.services';
import { CntContablesService } from 'src/app/services/cntContables.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'listar-operaciones',
  templateUrl: './detalleOperaciones.component.html',
  styleUrls: ['./detalleOperaciones.component.css']
})
export class DetalleOperacionesComponent implements OnInit {
  operacion?: CntOperacionesModel ;  
  transacciones:vwTransaccionesModel[] =  [];
  constructor(private cntService:CntContablesService, private cajasService : cajasServices , private _Router: Router){
     
  }
 
    printer_soporte_final() {   
    this.cntService.bucarSoporteMovimiento(this.operacion?.id!).subscribe({
      next:async (value:soporteMovimientoCntRequest)=>{
      
        //CustomConsole.log('printer_soporte_final',value); 
       let printM =  new PrinterManager(this.cajasService);  
      await printM.printSoporteMovimiento(false,value.data[0].obj); 
    },
    error:
  e=> Swal.fire(this.cntService.getErrorMessage(e))
   
  })
   
   }
  ngOnInit(): void {
      
    this.cntService.currentoperacion.subscribe({next:(value:CntOperacionesModel | null )=>{
      this.operacion = value?? undefined ; 
      //CustomConsole.log(this.operacion)
      if(this.operacion !== undefined){
        this.cntService.getCntTransacciones(this.operacion?.id!).subscribe(
          {next:(result:cntTransaccionesRequest)=>{
           this.transacciones= result.data;
           //CustomConsole.log(this.transacciones)
          },error:(e)=>Swal.fire(this.cntService.getErrorMessage(e))}
        )
      }

    },error : (e:any)=>Swal.fire(this.cntService.getErrorMessage(e))}) 
    


  }
 
}
