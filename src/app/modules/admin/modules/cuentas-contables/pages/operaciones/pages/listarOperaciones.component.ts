import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { router } from 'ngx-bootstrap-icons';
import { cntOperacionesRequest } from 'src/app/interfaces/producto-request';
import { CntClasesModel } from 'src/app/models/cnt-clases/cnt-clases.module';
import { CntCuentaMModel } from 'src/app/models/cnt-cuenta-m/cnt-cuenta-m.module';
import { CntGruposModel } from 'src/app/models/cnt-grupos/cnt-grupos.module';
import { CntOperacionesModel } from 'src/app/models/cnt-operaciones/cnt-operaciones.module';
import { CntSubCuentaModel, vwCntSubCuentaModel } from 'src/app/models/cnt-sub-cuenta/cnt-sub-cuenta.module';
import { TransaccionesModel } from 'src/app/models/transacciones/transacciones.module';
import { CntContablesService } from 'src/app/services/cntContables.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'listar-operaciones',
  templateUrl: './listarOperaciones.component.html',
  styleUrls: ['./listarOperaciones.component.css']
})
export class ListarOperacionesComponent implements OnInit {
  operaciones: CntOperacionesModel[] = [];  

  constructor(private cntService:CntContablesService,  private _Router: Router , ){
    
  }
  enviarOperacionCurrent(operacion:CntOperacionesModel){
       this.cntService.changeOperacion(operacion);
       this._Router.navigate(['home','admin','cuentasContables',        
        'operaciones','detalle']);///home/admin/cuentasContables/operaciones/listar
  }
  ngOnInit(): void {
      
    this.cntService.getCntOperacionesManuales().subscribe({next:(value:cntOperacionesRequest )=>{
      this.operaciones =  value.data; 
    },error : (e:any)=>Swal.fire(this.cntService.getErrorMessage(e))}) 
    


  }
 
}
