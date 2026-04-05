import { Component, Inject, OnInit } from "@angular/core"; 
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { tap } from "rxjs"; 
import { responseSubC } from "src/app/interfaces/odoo-prd";
import { cntSubCuentaVwRequest } from "src/app/interfaces/producto-request";
import { loading } from "src/app/models/app.loading";
import { CntClasesModel } from "src/app/models/cnt-clases/cnt-clases.module";
import { CntCuentaMModel } from "src/app/models/cnt-cuenta-m/cnt-cuenta-m.module";
import { CntGruposModel } from "src/app/models/cnt-grupos/cnt-grupos.module";
import { CntOperacionesModel } from "src/app/models/cnt-operaciones/cnt-operaciones.module";
import { subCuenta, vwCntSubCuentaModel } from "src/app/models/cnt-sub-cuenta/cnt-sub-cuenta.module";
import { TransaccionesModel, vwTransaccionesModel } from "src/app/models/transacciones/transacciones.module";
import { ModalCntSubCuentasComponent } from "src/app/modules/admin/modals/cuentasContables/cnt-sub-cuentas.component";
import { IngresarProductoVentaComponent } from "src/app/modules/pos/modals/ingresar-producto-venta/ingresar-producto-venta.component";
import { CntContablesService } from "src/app/services/cntContables.service";
import Swal from "sweetalert2";
import { ApiResponse } from "src/app/interfaces/api-response.interface";
import { GenericMutationPayload, GenericRecordsPayload } from "src/app/interfaces/generic-response.interface";
 

@Component({
  selector: 'app-modal-update-transaction-tmp', 
  templateUrl: './modalUpdateTransactionTmp.component.html',
  styleUrls: ['./modalUpdateTransactionTmp.component.css'], 
})
export class ModalUpdateTransactionTmpComponent implements OnInit{
  
  operCntTransacciones: vwTransaccionesModel[] = [] ;
 newOperacion:CntOperacionesModel= new CntOperacionesModel();
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
  slclases?: CntClasesModel ; // Lista de clases
  slgrupos?: CntGruposModel ; // Lista de grupos filtrada por clase
  slcuentasMayores?: CntCuentaMModel ; // Lista de cuentas mayores filtrada por grupo
  slcuentas?: vwCntSubCuentaModel;
  subCuentaCreacion:number = 0; 
  totalDebito = 0;
  totalCredito = 0;
  auxDate = '';

  constructor( @Inject(MAT_DIALOG_DATA) public newCntTransacciones:vwTransaccionesModel,
  public dialogo: MatDialogRef<IngresarProductoVentaComponent>,private cntService:CntContablesService , 
  private newAbrirDialog: MatDialog, private load : loading  ){
    //CustomConsole.log('newCntTransacciones',this.newCntTransacciones);
    
  }
  ngOnInit(): void {
    
    this.cntService.currentsubcuenta.subscribe({next:(value:vwCntSubCuentaModel[] | null)=>{
      this.Mcuentas = value??[] ;

      //CustomConsole.log(this.Mcuentas)  
    },error : (e:any)=>Swal.fire(e.error.error), complete: () =>  this.load.hide()})
  }


  
  onSubmit() {
    // Aquí puedes manejar la lógica de envío del formulario
    this.load.show(); 
    //CustomConsole.log(this.newCntTransacciones);
    if((this.newCntTransacciones.id_cuenta||0) <= 0){  return ;}
    
    if(((this.newCntTransacciones.valor_debito||0) <= 0 ) && ((this.newCntTransacciones.valor_credito||0) <= 0)){  
       return ;}

    this.cntService.setCntTransaccionesTmp(this.newCntTransacciones).subscribe({next:(value:ApiResponse<GenericMutationPayload>)=>{  
      if (!value.ok) {
        return;
      }
      this.load.hide(); 
      this.dialogo.close(true);
    }, error:error=>Swal.fire(error.error.error),  complete: () =>  this.load.hide()})
   

  }
  buscarCuentasContables( ){ 
    
    this.slcuentas= this.Mcuentas.filter(x=>x.id_scuenta == this.newCntTransacciones.id_cuenta)[0]; 
    //CustomConsole.log('buscarCuentasContables',this.slcuentas);
    if(this.slcuentas == undefined){
       this.cntService.getCntCuentasById(this.newCntTransacciones.id_cuenta).subscribe({next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{
        let data :subCuenta ;
            if(value.ok && value.data.count > 0 ){
              this.Mcuentas = [...this.Mcuentas , ...value.data.records  ];
              this.cntService.changeSubCuenta(this.Mcuentas);
              this.cuentas  = this.Mcuentas.filter(x=>x.cod_cuenta == this.selectedCuentaMayor);
              this.slcuentas= this.Mcuentas.filter(x=>x.id_scuenta == this.newCntTransacciones.id_cuenta)[0]; 
             
            }
            data = {
              clase: this.slcuentas?.cod_clase||0,
              grupo: this.slcuentas?.cod_grupo||0,
              cuenta: this.slcuentas?.cod_cuenta||0,
              subcuenta:this.slcuentas?.id_scuenta||0,
            }  
            this.abrirModal(data);
    
          }, error:error=>Swal.fire(error.error.error), complete: () =>  this.load.hide()
          })

    }else{  
        let data :subCuenta = {
          clase: this.slcuentas.cod_clase!,
          grupo: this.slcuentas.cod_grupo!,
          cuenta: this.slcuentas.cod_cuenta,
          subcuenta:this.slcuentas.id_scuenta!,
        }
        this.abrirModal(data);
  
  }
  }

  abrirModal(data:subCuenta){
    this.newAbrirDialog.open(ModalCntSubCuentasComponent, { data : data })
    .afterClosed() 
    .pipe(
      tap((response: responseSubC) => { 
        //CustomConsole.log('ModalCntSubCuentasComponent',response);
        if (response.confirmado && response.datoDevolucion !== undefined ) {  
          this.subCuentaCreacion = response.datoDevolucion.id_scuenta!; 
          this.load.show();
          this.slcuentas= this.Mcuentas.filter(x=>x.id_scuenta == this.subCuentaCreacion)[0]; 
          //CustomConsole.log('ModalCntSubCuentasComponent',this.slcuentas); 
          this.newCntTransacciones.id_cuenta = response.datoDevolucion!.id_scuenta||0;
          this.newCntTransacciones.nro_subcuenta = response.datoDevolucion!.nro_scuenta||0;
          this.newCntTransacciones.nombre_subcuenta = response.datoDevolucion!.nombre_scuenta||'';
          if(this.slcuentas == undefined){
          this.cntService.getCntCuentasById(this.subCuentaCreacion).subscribe({next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{
            if(value.ok && value.data.count > 0 ){
              this.Mcuentas = [...this.Mcuentas , ...value.data.records  ]; 
            }
    
          }, error:error=>Swal.fire(error.error.error), complete: () =>  this.load.hide()
          })
        }
        }  
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire('Error:', error),
      complete: () =>  this.load.hide()
    }); 
  }
 }
