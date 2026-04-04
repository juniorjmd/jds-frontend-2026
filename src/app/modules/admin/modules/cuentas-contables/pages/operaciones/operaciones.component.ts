import { Component, OnInit } from '@angular/core';
import { CntClasesModel } from 'src/app/models/cnt-clases/cnt-clases.module';
import { CntCuentaMModel } from 'src/app/models/cnt-cuenta-m/cnt-cuenta-m.module';
import { CntGruposModel } from 'src/app/models/cnt-grupos/cnt-grupos.module';
import { CntSubCuentaModel, vwCntSubCuentaModel } from 'src/app/models/cnt-sub-cuenta/cnt-sub-cuenta.module';
import { TransaccionesModel } from 'src/app/models/transacciones/transacciones.module';
import { CntContablesService } from 'src/app/services/cntContables.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-operaciones',
  templateUrl: './operaciones.component.html',
  styleUrls: ['./operaciones.component.css']
})
export class OperacionesComponent implements OnInit {
  newCntTransacciones: TransaccionesModel = new TransaccionesModel();

  clases: CntClasesModel[] = []; // Lista de clases
  grupos: CntGruposModel[] = []; // Lista de grupos filtrada por clase
  cuentasMayores: CntCuentaMModel[] = []; // Lista de cuentas mayores filtrada por grupo
  cuentas: vwCntSubCuentaModel[] = []; // Lista de cuentas filtrada por cuenta mayor
 
  Mgrupos: CntGruposModel[] = []; // Lista de grupos filtrada por clase
  McuentasMayores: CntCuentaMModel[] = []; // Lista de cuentas mayores filtrada por grupo
  Mcuentas: vwCntSubCuentaModel[] = [];

  selectedClase: number= 0;
  selectedGrupo: number = 0;
  selectedCuentaMayor: number  =0;

  constructor(private cntService:CntContablesService){

  }

  ngOnInit(): void {
      
    this.cntService.currentCntClase.subscribe({next:(value:CntClasesModel[] | null)=>{
      this.clases = value??[] ;
      //CustomConsole.log('Clases = >',this.clases) 
    },error : (e:any)=>Swal.fire(this.cntService.getErrorMessage(e))})
    
    this.cntService.currentCntGrupo.subscribe({next:(value:CntGruposModel[] | null)=>{
      this.Mgrupos = value??[] ;
      //CustomConsole.log('Grupos = >',this.Mgrupos) 
    },error : (e:any)=>Swal.fire(this.cntService.getErrorMessage(e))})
 
    this.cntService.currentCntcuentaM.subscribe({next:(value:CntCuentaMModel[] | null)=>{
      this.McuentasMayores = value??[] ;
      //CustomConsole.log('Cuentas = >',this.McuentasMayores) 
    },error : (e:any)=>Swal.fire(this.cntService.getErrorMessage(e))})
    this.cntService.currentsubcuenta.subscribe({next:(value:vwCntSubCuentaModel[] | null)=>{
      this.Mcuentas = value??[] ;
      //CustomConsole.log('subCuentas = >',this.Mcuentas) 
    },error : (e:any)=>Swal.fire(this.cntService.getErrorMessage(e))})
    


  }

  
  onClaseChange(){
    this.grupos = []; // Lista de grupos filtrada por clase
    this.cuentasMayores  = []; // Lista de cuentas mayores filtrada por grupo
    this.cuentas  = []; 
    this.grupos = this.Mgrupos.filter(x=>x.cod_clase == this.selectedClase)

  }
  onGrupoChange(){ // Lista de grupos filtrada por clase
    this.cuentasMayores  = []; // Lista de cuentas mayores filtrada por grupo
    this.cuentas  = []; 
    
    this.cuentasMayores = this.McuentasMayores.filter(x=>x.id_grupo == this.selectedGrupo)
  }
  onCuentaMayorChange(){  
    this.cuentas  = this.Mcuentas.filter(x=>x.cod_cuenta == this.selectedCuentaMayor)
  }
  onSubmit() {
    // Aquí puedes manejar la lógica de envío del formulario
    //CustomConsole.log(this.newCntTransacciones);
  }
}
