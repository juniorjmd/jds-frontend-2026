import { AfterViewInit,  Component,  inject,   } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal'; 
import { ColumnasTabla } from 'src/app/interfaces/nInterfaces/columnas-tabla'; 
import {  MatDialog } from '@angular/material/dialog';
import { responseSubC } from 'src/app/interfaces/odoo-prd';
import { tap } from 'rxjs';
import { CntContablesService } from 'src/app/services/cntContables.service';
import { CntOperacionPrestablecidas } from 'src/app/interfaces/traslados_cnt/cnt_operacion_prestablecidas.';
import { newTrasladoAsignarSaldoComponent } from '../../modals/newTrasladoAsignarSaldo/newTrasladoAsignarSaldo.component';
import { EjecutarAsignacionSaldosComponent } from '../../modals/ejecutarAsignacionSaldos/ejecutarAsignacionSaldos.component';
import Swal from 'sweetalert2';
import { CustomConsole } from 'src/app/models/CustomConsole';

@Component({
  selector: 'app-traslado-para-asignar-saldo',
  templateUrl: './trasladoParaAsignarSaldo.component.html',
  styleUrls: ['./trasladoParaAsignarSaldo.component.css'], 
})
export class TrasladoParaAsignarSaldoComponent implements AfterViewInit {

  ngOnInit(): void { }
  origen = 'grupos';
  datos:CntOperacionPrestablecidas[] =  []
  ColumnasTabla:ColumnasTabla[] = [{ name : 'nombre_preforma' , columna : 'nombre' }, 
    { name : 'descripcion' , columna : 'descripcion' }   ];
  
    
  bsModalRef!: BsModalRef;
  nombreCCntCostoVenta = '';
  idCCntCostoVenta = 0 ; 
  private newAbrirDialog = inject(MatDialog); 
  private cntService = inject(CntContablesService);
constructor(){ 
  /*DESDE_CAJA\nASIGNA_SALDO\nDE_UNA_A_MUCHOS\nDE_MUCHOS_A_UNA */

}

eliminar(item:CntOperacionPrestablecidas){
  this.cntService.deleteItemListadoOprPre(item.id).subscribe({next:(value)=>{ 
   this.ngAfterViewInit(); 
  },error:e=>Swal.fire(this.cntService.getErrorMessage(e))})
}
editar(item:CntOperacionPrestablecidas){
  this.newAbrirDialog.open(newTrasladoAsignarSaldoComponent, { data:  item })
.afterClosed() 
.pipe(
  tap((response: responseSubC) => {
    CustomConsole.log('buscarCuentasContablesGastos',response);
    if(response != undefined){ 
      if (response  ) {    
        this.ngAfterViewInit()
      }  
    }
  })
).subscribe({
  next: () => {},
  error: (error) => Swal.fire('Error:', error),
  complete: () => CustomConsole.log('buscarCuentasContables completo')
}); 


}
ejecutarPerforma(item:CntOperacionPrestablecidas){
  //EjecutarAsignacionSaldosComponent
  this.newAbrirDialog.open(EjecutarAsignacionSaldosComponent, { data:  item }); 
  

}
  ngAfterViewInit(): void {
    this.cntService.getTrasladoByType('ASIGNA_SALDO').subscribe({next:(value)=>{
      this.datos = value.data;
      CustomConsole.log('Datos recibidos',this.datos);
      
    },error:e=>Swal.fire(this.cntService.getErrorMessage(e))})
  }
openModal() {  
this.newAbrirDialog.open(newTrasladoAsignarSaldoComponent, { data:  null })
.afterClosed() 
.pipe(
  tap((response: responseSubC) => {
    if(response != undefined){ 
      if (response  ) {    
        this.ngAfterViewInit()
      }  
    }
  })
).subscribe({
  next: () => {},
  error: (error) => Swal.fire('Error:', error),
  complete: () => CustomConsole.log('buscarCuentasContables completo')
}); 

}
}
