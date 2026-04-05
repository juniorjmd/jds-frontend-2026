import { Component, inject, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CntOperacionPrestablecidas } from 'src/app/interfaces/traslados_cnt/cnt_operacion_prestablecidas.'; 
import { CntContablesService } from 'src/app/services/cntContables.service';
import { newTrasladoAsignarSaldoComponent } from '../newTrasladoAsignarSaldo/newTrasladoAsignarSaldo.component';
import { SoporteOperacion } from 'src/app/interface/soporte-operacion';
import {   ejecucionTrasladosRequest } from 'src/app/interfaces/producto-request';
import { PrinterManager } from 'src/app/models/printerManager'; 
import { cajasServices } from 'src/app/services/Cajas.services';
import Swal from 'sweetalert2';
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model';
import { TrasladosCuentasModel } from 'src/app/models/trasladosCuentas.';
import { AdminOperationResponse } from 'src/app/interfaces/admin-response.interface';

@Component({
  selector: 'app-ejecutarDeMuchaAUna',
  templateUrl: './ejecutarDeMuchaAUna.component.html',
  styleUrls: ['./ejecutarDeMuchaAUna.component.css'],
})
export class ejecutarDeMuchaAUnaComponent   { 
  establecimientos:establecimientoModel[] = []; 
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
     this.cajasService.currentArrEsta.subscribe({next:(value:establecimientoModel[]|null)=>{
       if(value != undefined && value != null  ){  
         let cajasel:establecimientoModel = {
           id: 0, nombre: 'Seleccione el establecimiento origen',
           idCCntCCobrar: 0,
           idRetefuenteCompra: 0,
           idCCntCPagar: 0,
           idCCntIvaCompra: 0,
           idCCnttIvaVenta: 0,
           idCCntCostoVenta: 0,
           idCCntVenta: 0,
           idCCntIngDifBonoRegalo: 0,
           descripcion: '',
           tipo: 0,
           fecha_creacion: new Date(),
           usuario_creacion: 0,
           estado: 0,
           nombreRetefuenteCompra: '',
           nombreCCntCCobrar: '',
           nombreCCntCPagar: '',
           nombreCCntIngDifBonoRegalo: '',
           nombreCCnttIvaVenta: '',
           nombreCCntIvaCompra: '',
           nombreCCntCostoVenta: '',
           nombreCCntVentas: '',
           nombreCCntCajaGeneral: '',
           idCCntCajaGeneral: 0,
           idRetefuenteVenta: 0,
           idDescuentoCompra: 0,
           idDescuentoVenta: 0,
           nombreRetefuenteVenta: '',
           nombreDescuentoCompra: '',
           nombreDescuentoVenta: '',
           tel1: '',
           tel2: '',
           direccion: '',
           pais: '',
           departamento: '',
           ciudad: '',
           nit: '',
           logo: ''
         };
 
         this.establecimientos =(value.length>0)?[{...cajasel}  , ...value ] : [...value] ;
         //CustomConsole.log('cajaas' , this.establecimientos);
         
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
      if( this.establecimientos[this.cajaSeleccionada].id! == 0){
         Swal.fire('error','Debe escoger un establecimiento valido')
       }
       this.dataProceso!.idEstablecimiento = this.establecimientos[this.cajaSeleccionada].id!
       if(this.valorTraslado == 0){
         Swal.fire('error','Debe ingresar el valor del traslado')
       }
      
       this.cntService.ejecutarTrasladosCuentas(this.dataProceso!).subscribe(
        {next:(val:AdminOperationResponse)=>{
         this.printer_soporte_final(val.data.objeto as SoporteOperacion);
       },error:e=>Swal.fire('error' , this.cntService.getErrorMessage(e))
       })
   }
 
   sumaValorFinal(){
    this.valorTraslado =  this.dataProceso?.cuentas.reduce((sum , x )  => sum + ((x.tipo == 'ORIGEN') ? (x.valor||0) :0) , 0)|| 0   
    this.dataProceso?.cuentas.forEach(x=> x.valor = (x.tipo != 'ORIGEN' )? this.valorTraslado :x.valor
    )
   }
   async printer_soporte_final(soporte:SoporteOperacion) {   
     let printM =  new PrinterManager(this.cajasService);  
     printM.printSoporteMovimiento(false,soporte);
     this.dialogo.close(true);
   }
 }
 
