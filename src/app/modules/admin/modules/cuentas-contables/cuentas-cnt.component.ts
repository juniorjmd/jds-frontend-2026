import { Component, OnInit } from '@angular/core';
import { CntContablesService } from 'src/app/services/cntContables.service';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
import { CntCuentaMModel } from 'src/app/models/cnt-cuenta-m/cnt-cuenta-m.module';
import { CntGruposModel } from 'src/app/models/cnt-grupos/cnt-grupos.module';
import { vwCntSubCuentaModel } from 'src/app/models/cnt-sub-cuenta/cnt-sub-cuenta.module';
import { CntClasesModel } from 'src/app/models/cnt-clases/cnt-clases.module';

@Component({
  selector: 'app-cuentas-cnt',
  templateUrl: './cuentas-cnt.component.html',
  styleUrls: ['./cuentas-cnt.component.css']
})
export class CuentasCntComponent  implements OnInit {
  constructor(private cntService:CntContablesService){

  }
  ngOnInit() {
    this.cntService.getCntCuentasMayores().subscribe({next:(value:ApiResponse<GenericRecordsPayload<CntCuentaMModel>>)=>{ 
      this.cntService.changeCuentasM(value.data.records); 
      //CustomConsole.log("getCntCuentasMayores",value.data )
    },error : (e)=>Swal.fire(e.error.error)})
    
    this.cntService.getCntGrupos().subscribe({
      next:(value:ApiResponse<GenericRecordsPayload<CntGruposModel>>)=>{ 
      this.cntService.changeGrupo(value.data.records); 
      //CustomConsole.log("getCntGrupos",value.data )

    },error : (e)=>Swal.fire(e.error.error)})

    this.cntService.getCntCuentas().subscribe({
      next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{ 
      this.cntService.changeSubCuenta(value.data.records); 
      //CustomConsole.log("getCntCuentas",value.data )

    },error : (e)=>Swal.fire(e.error.error)})


    this.cntService.getCntClases().subscribe({next:(value:ApiResponse<GenericRecordsPayload<CntClasesModel>>)=>{ 
      this.cntService.changeClase(value.data.records); 
      //CustomConsole.log("getCntClases",value.data )

    },error : (e)=>Swal.fire(e.error.error)})
    // Aquí deberías cargar los datos de `cnt_cuenta` desde el servicio correspondiente
    
  }
  
 }

