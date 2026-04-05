import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { tap } from 'rxjs';
import { responseSubC } from 'src/app/interfaces/odoo-prd';
import { cntSubCuentaRequest, cntSubCuentaVwRequest, cntTransaccionesRequest } from 'src/app/interfaces/producto-request';
import { loading } from 'src/app/models/app.loading';
import { CntClasesModel } from 'src/app/models/cnt-clases/cnt-clases.module';
import { CntCuentaMModel } from 'src/app/models/cnt-cuenta-m/cnt-cuenta-m.module';
import { CntGruposModel } from 'src/app/models/cnt-grupos/cnt-grupos.module';
import { CntOperacionesModel } from 'src/app/models/cnt-operaciones/cnt-operaciones.module';
import { CntSubCuentaModel, subCuenta, vwCntSubCuentaModel } from 'src/app/models/cnt-sub-cuenta/cnt-sub-cuenta.module';
import { TransaccionesModel, vwTransaccionesModel } from 'src/app/models/transacciones/transacciones.module';
import { ModalCntSubCuentasComponent } from 'src/app/modules/admin/modals/cuentasContables/cnt-sub-cuentas.component';
import { LoginRoutingModule } from 'src/app/modules/login/login-routing.module';
import { CntContablesService } from 'src/app/services/cntContables.service';
import Swal from 'sweetalert2';
import { ModalUpdateTransactionTmpComponent } from '../../../modals/modalUpdateTransactionTmp/modalUpdateTransactionTmp.component';
import { FndClienteComponent } from 'src/app/modules/shared/modals/fnd-cliente/fnd-cliente.component';
import { ClientesModel } from 'src/app/models/clientes/clientes.module';
import { AdminOperationResponse } from 'src/app/interfaces/admin-response.interface';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'crear-operaciones',
  templateUrl: './crtOperaciones.component.html',
  styleUrls: ['./crtOperaciones.component.css']
})
export class CrearOperacionesComponent implements OnInit {
  newCntTransacciones: vwTransaccionesModel = new vwTransaccionesModel();
  operCntTransacciones: vwTransaccionesModel[] = [] ;
 newOperacion:CntOperacionesModel= new CntOperacionesModel();
  clases: CntClasesModel[] = []; // Lista de clases
  grupos: CntGruposModel[] = []; // Lista de grupos filtrada por clase
  cuentasMayores: CntCuentaMModel[] = []; // Lista de cuentas mayores filtrada por grupo
  cuentas: vwCntSubCuentaModel[] = []; // Lista de cuentas filtrada por cuenta mayor
 
  Mgrupos: CntGruposModel[] = []; // Lista de grupos filtrada por clase
  McuentasMayores: CntCuentaMModel[] = []; // Lista de cuentas mayores filtrada por grupo
  Mcuentas: vwCntSubCuentaModel[] = [];
  nombreTercero:string = '';
  selectedClase: number= 0;
  selectedGrupo: number = 0;
  selectedCuentaMayor: number  =0;
  slclases?: CntClasesModel ; // Lista de clases
  slgrupos?: CntGruposModel ; // Lista de grupos filtrada por clase
  slcuentasMayores?: CntCuentaMModel ; // Lista de cuentas mayores filtrada por grupo
  slcuentas?: vwCntSubCuentaModel;
  subCuentaCreacion:number = 0; 

  operacion:CntOperacionesModel = new CntOperacionesModel();
  totalDebito = 0;
  totalCredito = 0; 
  constructor(private cntService:CntContablesService , 
    private newAbrirDialog: MatDialog, private load : loading ){ 
      this.newCntTransacciones.fecha_transaccion = this.operacion.fechaOperacion||'';
  }

  cancelarOperacion(){ 
    this.load.show();
    this.cntService.deleteListadoOprTmp().subscribe({next:(value:any)=>{ 
      //CustomConsole.log('cancelarOperacion' , value); 
      this.operCntTransacciones = [];
      this.limpiarMovimiento();
    },error:error=>Swal.fire(this.cntService.getErrorMessage(error)), complete: () =>  this.load.hide()})
  }
  buscarTerceroGasto (){

    this.newAbrirDialog.open(FndClienteComponent,{ data: {  invoker:'gasto' } })
    .afterClosed()
    .pipe( 
      tap((resp:{response: Boolean , persona:ClientesModel})=>{
        if (resp.response) { 
          this.operacion.idPersona = (typeof(resp.persona.id )== 'string')? parseInt(resp.persona.id):  resp.persona.id||0;
          this.operacion.nombrePersona =  resp.persona.nombreCompleto;
        }
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire('Error:', error) 
    });   
  }
  buscarCuentasContables( ){ 
    let data :subCuenta = {
      clase: this.selectedClase,
      grupo: this.selectedGrupo,
      cuenta: this.selectedCuentaMayor,
      subcuenta:0,
    }
    this.newAbrirDialog.open(ModalCntSubCuentasComponent, { data : data })
    .afterClosed() 
    .pipe(
      tap((response: responseSubC) => { 
        //CustomConsole.log('buscarCuentasContablesGastos',response);
        if (response.confirmado && response.datoDevolucion !== undefined ) {  
          this.subCuentaCreacion = response.datoDevolucion.id_scuenta!; 
          this.load.show();
          this.cntService.getCntCuentasById(this.subCuentaCreacion).subscribe({next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{
            if(value.ok && value.data.count > 0 ){
              this.Mcuentas = [...this.Mcuentas , ...value.data.records  ];
              this.cntService.changeSubCuenta(this.Mcuentas);
              this.cuentas  = this.Mcuentas.filter(x=>x.cod_cuenta == this.selectedCuentaMayor);
            }
    
          }, error:error=>Swal.fire(this.cntService.getErrorMessage(error)), complete: () =>  this.load.hide()
          })

        }  
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire('Error:', error),
      complete: () =>  this.load.hide()
    }); 
  }


  eliminarDato(dato:TransaccionesModel){
    this.load.show()
    this.cntService.deleteItemListadoOprTmp(dato.cod_transaccion).
    subscribe({next:(value:ApiResponse<GenericMutationPayload>)=>{ if(value.ok){this.getTransaccionesTemporales();}else{Swal.fire('error',value.error?.message ?? 'error en el servidor','error')} },
    error:error=>Swal.fire(this.cntService.getErrorMessage(error)), complete: () =>  this.load.hide()
    })
  }
  editar(dato:vwTransaccionesModel){

    //ModalUpdateTransactionTmpComponent
    
    this.newAbrirDialog.open(ModalUpdateTransactionTmpComponent, { data:  dato })
    .afterClosed()
    .pipe(
      tap((confirmado: Boolean) => {
        if (confirmado) { 
          this.getTransaccionesTemporales();
        }
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire('Error:', error) 
    });  
  }

  limpiarMovimiento(){
    this.newCntTransacciones = new vwTransaccionesModel(); // Crear una nueva instancia del modelo
    this.selectedClase = 0;
    this.selectedGrupo = 0;
    this.selectedCuentaMayor = 0; 
    this.newCntTransacciones.fecha_transaccion = this.operacion.fechaOperacion||'';
    this.slcuentas = undefined;
  }
  guardarOperacion(){
    //CustomConsole.log('guardaroperacion' , this.operacion);
    if(this.operacion.nombre == ''){Swal.fire('error', 'debe ingresar el nombre de la operacion' , 'warning') ; return;}
    if(this.operCntTransacciones.length <= 0 ){Swal.fire('error', 'No exiten movimientos para generar la operacion' , 'warning') ; return;}
    this.cntService.setNewOperacion(this.operacion).subscribe({next:(value:AdminOperationResponse)=>{
      if(value.ok){
        this.limpiarMovimiento();
        this.getTransaccionesTemporales();
      }
    },error : (e:any)=>Swal.fire(this.cntService.getErrorMessage(e)), complete: () =>  this.load.hide()})
    
  }
  ngOnInit(): void {

    this.load.show();
    this.getTransaccionesTemporales();
    this.cntService.currentCntClase.subscribe({next:(value:CntClasesModel[] | null)=>{
      this.clases = value??[] ;
      //CustomConsole.log(this.clases) 
    },error : (e:any)=>Swal.fire(this.cntService.getErrorMessage(e)), complete: () =>  this.load.hide()})
    
    this.cntService.currentCntGrupo.subscribe({next:(value:CntGruposModel[] | null)=>{
      this.Mgrupos = value??[] ;
      //CustomConsole.log(this.clases) 
    },error : (e:any)=>Swal.fire(this.cntService.getErrorMessage(e)), complete: () =>  this.load.hide()})
 
    this.cntService.currentCntcuentaM.subscribe({next:(value:CntCuentaMModel[] | null)=>{
      this.McuentasMayores = value??[] ;
      //CustomConsole.log(this.clases) 
      
    },error : (e:any)=>Swal.fire(this.cntService.getErrorMessage(e))})
    this.cntService.currentsubcuenta.subscribe({next:(value:vwCntSubCuentaModel[] | null)=>{
      this.Mcuentas = value??[] ;
      //CustomConsole.log(this.clases) 
      if (this.subCuentaCreacion > 0 ){
        this.onCuentaMayorChange() 
       this.newCntTransacciones.id_cuenta= this.subCuentaCreacion;
      }
    },error : (e:any)=>Swal.fire(this.cntService.getErrorMessage(e)), complete: () =>  this.load.hide()})
    


  }

  
  onClaseChange(){
    this.grupos = []; // Lista de grupos filtrada por clase
    this.cuentasMayores  = []; // Lista de cuentas mayores filtrada por grupo
    this.cuentas  = [];  
    this.slcuentas= undefined;
    this.grupos = this.Mgrupos.filter(x=>x.cod_clase == this.selectedClase)

  }
  onGrupoChange(){ // Lista de grupos filtrada por clase
    this.cuentasMayores  = []; // Lista de cuentas mayores filtrada por grupo
    this.cuentas  = [];    // Lista de cuentas mayores filtrada por grupo
    this.slcuentas= undefined;
  
    
    this.cuentasMayores = this.McuentasMayores.filter(x=>x.cod_grupo == this.selectedGrupo)
  }
  onCuentaMayorChange(){   
     this.slcuentas= undefined;
     //CustomConsole.log('onCuentaMayorChange', this.Mcuentas , this.selectedCuentaMayor);
    this.cuentas  = this.Mcuentas.filter(x=>x.cod_cuenta == this.selectedCuentaMayor)

    if(this.cuentas.length == 0){
      this.load.show();
      this.cntService.getCntCuentasByIdCM(this.selectedCuentaMayor).subscribe({next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{
        if(value.ok && value.data.count > 0 ){
          this.Mcuentas = [...this.Mcuentas , ...value.data.records  ];
          this.cntService.changeSubCuenta(this.Mcuentas);
          this.cuentas  = this.Mcuentas.filter(x=>x.cod_cuenta == this.selectedCuentaMayor);
        }

      }, error:error=>Swal.fire(this.cntService.getErrorMessage(error)), complete: () =>  this.load.hide()
      })
    }
  }

    formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
     
  }
  getTransaccionesTemporales(){
    this.load.show();
    this.cntService.getCntTransaccionesTmp().subscribe({next:(value:ApiResponse<GenericRecordsPayload<vwTransaccionesModel>>)=>{
      this.operCntTransacciones = [];      
      
      this.operacion.totalDebito = 0;
      this.operacion.totalCredito = 0;

      if(value.ok && value.data.count > 0 ){ 
          this.operCntTransacciones = value.data.records ;                
          this.operacion.totalDebito = this.operCntTransacciones.reduce((sum:number, x) => sum + parseFloat(x.valor_debito.toString()), 0);
          this.operacion.totalCredito = this.operCntTransacciones.reduce((sum:number, x) => sum + parseFloat(x.valor_credito.toString()), 0);
          console.clear()
        const minDate = this.operCntTransacciones.reduce((min, x) => {
          const currentDate = new Date(x.fecha_transaccion);
          return currentDate < min ? currentDate : min;
        },new Date('9999-12-31')); // Initialize with a large date
          //CustomConsole.log(minDate); // Will print the earliest date 
          this.operacion.fechaOperacion =  this.formatDateToString(minDate); 
         this.newCntTransacciones.fecha_transaccion = this.operacion.fechaOperacion;
          //CustomConsole.log('fecha transaccion',this.operacion.fechaOperacion, this.newCntTransacciones.fecha_transaccion );
          
          
    }
    }, error:error=>Swal.fire(this.cntService.getErrorMessage(error)),  complete: () =>  this.load.hide()})
  }
  onSubmit() {
    // Aquí puedes manejar la lógica de envío del formulario
    this.load.show();
    this.slcuentas= this.cuentas.filter(x=>x.id_scuenta == this.newCntTransacciones.id_cuenta)[0];
    this.newCntTransacciones.nro_subcuenta =  this.slcuentas.nro_scuenta;
    this.newCntTransacciones.nombre_subcuenta = this.slcuentas.nombre_scuenta ; 
    this.newCntTransacciones.nombre_cuenta = this.slcuentas.nombre_cuenta ; 
    this.newCntTransacciones.nombre_grupo = this.slcuentas.nombre_grupo ; 
    this.newCntTransacciones.nombre_clase = this.slcuentas.nombre_clase ;  
    //CustomConsole.log(this.newCntTransacciones);
    this.cntService.setCntTransaccionesTmp(this.newCntTransacciones).subscribe({next:(value:ApiResponse<GenericMutationPayload>)=>{ 
      if (!value.ok) {
        return;
      }
      this.getTransaccionesTemporales();
      this.limpiarMovimiento();
      this.operacion = new CntOperacionesModel();    }, error:error=>Swal.fire(this.cntService.getErrorMessage(error)),  complete: () =>  this.load.hide()})
   

  }
}
