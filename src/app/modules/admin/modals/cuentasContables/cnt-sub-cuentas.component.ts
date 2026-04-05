import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { responseSubC } from 'src/app/interfaces/odoo-prd';
import { cntClaseRequest, cntCuentaMayorRequest, cntSubCuentaRequest } from 'src/app/interfaces/producto-request';
import { CntClasesModel } from 'src/app/models/cnt-clases/cnt-clases.module';
import { CntCuentaMModel } from 'src/app/models/cnt-cuenta-m/cnt-cuenta-m.module';
import { CntGruposModel } from 'src/app/models/cnt-grupos/cnt-grupos.module';
import { CntSubCuentaModel, subCuenta, vwCntSubCuentaModel } from 'src/app/models/cnt-sub-cuenta/cnt-sub-cuenta.module';
import { CntContablesService } from 'src/app/services/cntContables.service';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'modal-cnt-sub-cuentas',
  templateUrl: './cnt-sub-cuentas.component.html',
  styleUrls: ['./cnt-sub-cuentas.component.css']
})
export class ModalCntSubCuentasComponent implements OnInit { 
  Subcuentas:vwCntSubCuentaModel[] = [];


  clases:CntClasesModel[]=[];
  grupos:CntGruposModel[]=[]; 
  cuentas : CntCuentaMModel[] = [];
  AuxCuentas: CntCuentaMModel[] = [] ; // Esta lista debería ser llenada con los datos de la tabla `cnt_cuenta`
  AuxGrupos:CntGruposModel[]=[];
  codClase:number = 0;
  codGrupo:number = 0;
  auxSubCuentas:vwCntSubCuentaModel[] = [];
  newSubcuenta: vwCntSubCuentaModel = new vwCntSubCuentaModel();
  SubcuentaDevolucion: vwCntSubCuentaModel = new vwCntSubCuentaModel();
constructor(private cntService:CntContablesService,  
  @Inject(MAT_DIALOG_DATA) public dataIngreso:subCuenta,
  public dialogo: MatDialogRef<ModalCntSubCuentasComponent>, 
){
    this.getAllSubcuentas();
    //CustomConsole.log('datos ingresos busqueda cuenta' , this.dataIngreso);
    
}
filtrarPorNombre( ) {
  this.Subcuentas =  [...this.auxSubCuentas]
  //CustomConsole.log('codigo cuenta',this.newSubcuenta.cod_cuenta);
  if(this.newSubcuenta.nombre_scuenta  !== undefined  && this.newSubcuenta.nombre_scuenta!.trim() != '') { 
        this.cntService.getCntCuentasByName(this.newSubcuenta.nombre_scuenta).subscribe( {next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{ 
          //CustomConsole.log('getCntCuentasByName',value)
          this.Subcuentas = value.data.records;  
          //CustomConsole.log('Subcuentas' , this.Subcuentas) 
         },
        error: (e:any)=>Swal.fire(e.error.error)})
      } 
  
}
cancelar(){
  let idSuc = this.newSubcuenta.cod_cuenta ; 
  this.newSubcuenta= new vwCntSubCuentaModel(); 
  this.newSubcuenta.cod_cuenta = idSuc; 
  this.Subcuentas =  [...this.auxSubCuentas] 
  this.codClase = 0;
  this.codGrupo  = 0;
}


filtrarSubCuentas(){
  if(this.newSubcuenta.cod_cuenta != undefined){ 
  this.cntService.getCntCuentasByIdCM(this.newSubcuenta.cod_cuenta).subscribe( {next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{ 
    //CustomConsole.log('getCntCuentasByIdCM',value)
    this.Subcuentas = value.data.records; 
    this.auxSubCuentas=value.data.records;
    //CustomConsole.log('Subcuentas' , this.Subcuentas) 
   },
  error: (e:any)=>Swal.fire(e.error.error)})
}else{this.getAllSubcuentas()}
}

filtrarSubCuentasPorGrupo(){
  if(this.codGrupo != undefined && this.codGrupo > 0 ){ 
    this.cuentas = this.AuxCuentas?.filter(x=>x.cod_grupo == this.codGrupo)??[];
  this.cntService.getCntCuentasByIdGrupo(this.codGrupo).subscribe( {next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{ 
    //CustomConsole.log('getCntCuentasByIdCM',value)
    this.Subcuentas = value.data.records; 
    this.auxSubCuentas=value.data.records;
    //CustomConsole.log('Subcuentas' , this.Subcuentas) 
   },
  error: (e:any)=>Swal.fire(e.error.error)})
}else{this.getAllSubcuentas()
  this.cuentas = [...this.AuxCuentas!];
}
}
filtrarSubCuentasPorClase(){
  if(this.codClase != undefined && this.codClase > 0 ){ 
    this.grupos = this.AuxGrupos.filter(x=>x.cod_clase == this.codClase) ;
  this.cntService.getCntCuentasByIdClase(this.codClase).subscribe( {next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{ 
    //CustomConsole.log('getCntCuentasByIdCM',value)
    this.Subcuentas = value.data.records; 
    this.auxSubCuentas=value.data.records;
    //CustomConsole.log('Subcuentas' , this.Subcuentas) 
   },
  error: (e:any)=>Swal.fire(e.error.error)})
}else{this.getAllSubcuentas() 
  this.grupos =[...this.AuxGrupos];
}
}

revisarIngreso(){
  //CustomConsole.log('revisar ingreso ==> ' , this.dataIngreso);
  
  if(this.dataIngreso != undefined){
    if(this.clases.length > 0 && this.dataIngreso.clase>0 ){
        this.codClase = this.dataIngreso.clase ;
        this.dataIngreso.clase = 0;
    }
    
    if(this.grupos.length > 0 && this.dataIngreso.grupo >0 ){
      this.codGrupo = this.dataIngreso.grupo ;
      this.dataIngreso.grupo = 0;
  }
    
  if(this.AuxCuentas.length > 0 && this.dataIngreso.cuenta >0 ){
    this.newSubcuenta.cod_cuenta = this.dataIngreso.cuenta ;
    this.dataIngreso.cuenta = 0; 
  }
    if(this.clases.length > 0  && this.grupos.length > 0 && this.cuentas.length> 0 ){
      this.grupos = this.AuxGrupos.filter(x=>x.cod_clase == this.codClase)??[] ;
      this.cuentas = this.AuxCuentas?.filter(x=>x.cod_grupo == this.codGrupo)??[];
      if(this.newSubcuenta.cod_cuenta > 0 ){
         
            this.cntService.getCntCuentasByIdCM(this.newSubcuenta.cod_cuenta).subscribe( {next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{ 
              //CustomConsole.log('getCntCuentasByIdCM',value)
              this.Subcuentas = value.data.records; 
              this.auxSubCuentas=value.data.records;
              //CustomConsole.log('Subcuentas' , this.Subcuentas) 
            },
            error: (e:any)=>Swal.fire(e.error.error)})

      } else { if(this.codGrupo > 0 ){
	
        this.cntService.getCntCuentasByIdGrupo(this.codGrupo).subscribe( {next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{ 
          //CustomConsole.log('getCntCuentasByIdCM',value)
          this.Subcuentas = value.data.records; 
          this.auxSubCuentas=value.data.records;
          //CustomConsole.log('Subcuentas' , this.Subcuentas) 
         },
        error: (e:any)=>Swal.fire(e.error.error)})

      } }
    }
 
  }}


ngOnInit() {
console.clear();

  this.cntService.currentCntClase.subscribe({next:(value:CntClasesModel[] | null)=>{
     
    this.clases = value??[] ;
    this.revisarIngreso();
    //CustomConsole.log('currentCntClase',this.clases) 
  },error : (e:any)=>Swal.fire(e.error.error)})


  
  this.cntService.currentCntGrupo.subscribe({next:(value:CntGruposModel[] | null)=>{  
    this.grupos = value??[] ;
    this.AuxGrupos = this.grupos; 
    this.revisarIngreso();
    //CustomConsole.log('currentCntGrupo',this.grupos) 
  },error : (e:any)=>Swal.fire(e.error.error)})


  this.cntService.currentCntcuentaM.subscribe({next:(value:CntCuentaMModel[]| null)=>{
    
    //CustomConsole.log('currentCntcuentaM  - - value',value) 
    this.cuentas = value??[] ;
    
    //CustomConsole.log('currentCntcuentaM ---- >>',this.cuentas) 
    this.AuxCuentas = this.cuentas; 
    this.revisarIngreso();
    //CustomConsole.log('currentCntcuentaM',this.cuentas) 
  },error : (e:any)=>Swal.fire(e.error.error)})
  // Aquí deberías cargar los datos de `cnt_cuenta` desde el servicio correspondiente
  
}
modificarSubcuenta(subcuenta:vwCntSubCuentaModel){
  this.newSubcuenta = {...subcuenta}
}
getAllSubcuentas(){
  this.cntService.getCntCuentas().subscribe( {next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{   
    this.Subcuentas = value.data.records; 
    this.auxSubCuentas=value.data.records;
    //CustomConsole.log('Subcuentas' , this.Subcuentas) 
   },
  error: (e:any)=>Swal.fire(e.error.error)})



}
enviarNewRegistro() {

  // Aquí puedes manejar la lógica de envío del formulario
  //CustomConsole.log('nueva subcuenta' , this.newSubcuenta);
  
  this.cntService.setNewSubCuenta(this.newSubcuenta).subscribe( {next:(respuesta:ApiResponse<GenericMutationPayload>)=>{  

    if (respuesta.ok){
      alert('Datos creados con exito!!')
      if(respuesta.data.insertId != undefined){
        this.newSubcuenta.id_scuenta  =  respuesta.data.insertId;  
      }  
      this.SubcuentaDevolucion = {...this.newSubcuenta}
      this.cerrarok()  
    } 
   },
  error: (e:any)=>Swal.fire(e.error.error)})  
}

retornarRegistroBusqueda(subCuentaSel:CntSubCuentaModel) {
   this.SubcuentaDevolucion= {...subCuentaSel};
  // Aquí puedes manejar la lógica de envío del formulario
  //CustomConsole.log('nueva subcuenta' , this.newSubcuenta, subCuentaSel); 
  this.cerrarok()  
}
cerrarok(){
  let respuesta:responseSubC = {
    confirmado: true , datoDevolucion: this.SubcuentaDevolucion
  }
   this.dialogo.close(respuesta)
}
}
