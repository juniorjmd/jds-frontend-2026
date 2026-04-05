import { Component, Inject, OnInit } from '@angular/core'; 
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; 
import { CiudadModel, DepartamentoModel, PaisModel } from 'src/app/models/maestros.model';
import { MaestroClienteServices } from 'src/app/services/MaestroCliente.services'; 
import { loading } from 'src/app/models/app.loading';  
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import {ClientesService} from 'src/app/services/Clientes.services'  
import { ClientesModel } from 'src/app/models/clientes/clientes.module';
import { MaestroCliente, fndCliente } from 'src/app/interfaces/maestro-cliente';
import Swal from 'sweetalert2'; 
import { BusquedaPersona } from 'src/app/interfaces/busqueda-persona';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-fnd-cliente',
  templateUrl: './fnd-cliente.component.html',
  styleUrls: ['./fnd-cliente.component.css']
})
export class FndClienteComponent implements OnInit {
 
  cli= new ClientesModel();
  Ciudad?:CiudadModel ;
  paises?:PaisModel[] = [];
  tipo_direccion:any[] = [] ; 
  Provincias:any[] = [] ;
  titulos:any[] = [] ;
  categorias:any[] = [] ; 
  NwCliente:ClientesModel = new ClientesModel();  
  ClientesResult:ClientesModel[] = [];
  Ciudades:CiudadModel[] = [];
  departamentos:DepartamentoModel[] = [];
  busqueda:boolean = true;
  empresaShwich : boolean = true;
  crear:boolean = true ; 
  asignarADoc = true;
  buscarPorNombre = false;
  buscarDocumentos = false;
  devolverPersona = false;  
  mostrarListado = false;
  documentoActivo:DocumentosModel;
  maestro?:MaestroCliente;
  retorno:BusquedaPersona;
   asignarEmpleado = false;
  constructor( public loading : loading, private MaestroClienteServices :MaestroClienteServices , 

    public dialogo: MatDialogRef<FndClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public dataIngreso:fndCliente ,

    private clientesService:ClientesService       
    ) {  
      this.retorno ={
        response:false,
        persona :null,    
        empleado :null
      } ;
     // CustomConsole.log('datos de ingreso ' ,  this.dataIngreso)
      this.documentoActivo = this.dataIngreso.docActivo! ; 
      this.NwCliente = this.dataIngreso.clienteIngreso?? new ClientesModel() ; 
      if(this.dataIngreso.invoker == 'clienteListado'){
        this.busqueda = false;
      }



      if(this.dataIngreso.invoker == 'Empleados'){
        this.empresaShwich = false;
        this.asignarEmpleado = true;
      }
      if(this.dataIngreso.invoker == 'nuevoCliente'){
        this.busqueda = false;
      } 
      if(this.dataIngreso.invoker != 'ventas'){
        this.asignarADoc = false;
      }
      if(this.dataIngreso.invoker == 'cuentasPorCobrarVentas' 
        || this.dataIngreso.invoker == 'gasto'){
          this.asignarADoc = false; 
        this.asignarEmpleado =  false;
        this.crear =  false
        this.devolverPersona = true;

      }

 if( this.dataIngreso.invoker == 'gasto'){
          this.buscarPorNombre = true;
          this.asignarADoc = false; 
          this.asignarEmpleado =  false;
          this.crear =  true
          this.devolverPersona = true; 
          this.mostrarListado = true
          
      }
      if(this.dataIngreso.invoker == 'compra'){
        this.asignarADoc = true;         
        this.mostrarListado = true 
        this.buscarPorNombre = true;
      }
      if(this.dataIngreso.invoker == 'EdicionCompra'){
        this.asignarADoc = true;         
        this.mostrarListado = true 
        this.buscarPorNombre = true;
        this.buscarDocumentos = true;
      }
      if(this.dataIngreso.invoker == 'cuentasXpagar'){
        this.asignarADoc = false;         
        this.mostrarListado = true 
        this.buscarPorNombre = true;
        this.buscarPorNombre = true;
      }
      
  }
  seleccionarBuscarDocumento(cliente:ClientesModel){
    this.NwCliente = {...cliente}; 
    this.clientesService.changeCliente( this.NwCliente);  
   this.dialogo.close(true)
  } 
  seleccionar(cliente:ClientesModel){
    this.NwCliente = {...cliente};
    this.clientesService.changeCliente( this.NwCliente);
    if(this.dataIngreso.invoker == 'cuentasXpagar'){
      this.pasarComoEmpleado();
      return
    }
    if(!this.asignarADoc){
    if (this.asignarEmpleado || this.devolverPersona){
      this.pasarComoEmpleado();
      return
    }}else{
      if(this.NwCliente.id !== undefined)
     { this.loading.show();
          this.clientesService.asignarClienteAlDocumento(this.documentoActivo.orden , parseInt(this.NwCliente.id.toString()) ).subscribe(
            {next:(value)=>{
              CustomConsole.log(value)
              if(value.ok){
                if (this.asignarEmpleado || this.devolverPersona){
                  this.pasarComoEmpleado();
                   
                }else{
                    this.dialogo.close(true)
                }


              }else{Swal.fire("error" , value.error?.message || 'No fue posible asignar el cliente al documento' , "error")}
              
            },error:(error)=>Swal.fire("error" , this.clientesService.getErrorMessage(error) , "error")
            ,complete:()=>this.loading.hide()})
        }
    }
  }
  eliminar(cliente:ClientesModel){
    this.NwCliente = {...cliente};
  }
  editarCliente(cliente:ClientesModel){
      this.NwCliente = {...cliente};
      this.mostrarListado = false
  }
  pasarComoEmpleado(){
    this.retorno= {response:true , empleado: this.NwCliente , persona:this.NwCliente}
    this.dialogo.close(this.retorno)

  }
  
  asignarClienteAlDocumento(){
    if(this.NwCliente.id !== undefined)
     { this.loading.show();
    this.clientesService.asignarClienteAlDocumento(this.documentoActivo.orden , parseInt(this.NwCliente.id.toString()) ).subscribe(
      {next:(value)=>{
         CustomConsole.log(value)
        if(value.ok){this.dialogo.close(true)}else{Swal.fire("error" , value.error?.message || 'No fue posible asignar el cliente al documento' , "error")}
        
      },error:(error)=>Swal.fire("error" , this.clientesService.getErrorMessage(error) , "error")
      ,complete:()=>this.loading.hide()})
  }}

  getDepartamento(){
    this.Ciudades = [];
    
   CustomConsole.log('departamentos a filtrar',this.maestro?.departamentos , this.NwCliente.pais)
   this.departamentos = this.maestro?.departamentos.filter(x=> x.cod_pais == this.NwCliente.pais)?? [] ;
   CustomConsole.log('getDepartamento' , this.departamentos)
  }
  getCiudad(){
   CustomConsole.log('ciudades a filtrar',this.maestro?.ciudades , this.NwCliente.departamento)
   let ciuArr = (this.maestro)?[...this.maestro.ciudades]:[] ; 
    this.Ciudades =  ciuArr.filter(x=> x.cod_departamento == this.NwCliente.departamento)?? [] ; 
    CustomConsole.log(this.Ciudades)
  }
  buscarCliente(){
    if (this.NwCliente.numIdentificacion !== undefined && this.NwCliente.tipoIdentificacion!== undefined ){
      this.loading.show();
            this.clientesService.getClientesByNumAndTipId(
              this.NwCliente.numIdentificacion , this.NwCliente.tipoIdentificacion
            ).subscribe({next:(value:ApiResponse<GenericRecordsPayload<ClientesModel>>)=>{
              CustomConsole.log(value)
              if(!value.ok || value.data.count === 0){
                Swal.fire( {title:'Persona no encontrada',
                   text:'Desea crearla e ingresarla a la venta?',
                   icon:'question', 
                  showCancelButton: true,
                  confirmButtonText: 'Si', 
                  cancelButtonText:'No'} 
                )
                .then((result) => {
                  if (result.isConfirmed) {  
                    this.busqueda =  false
                  }}); 
              }else{
                this.NwCliente =  value.data.records[0] 
                if(this.dataIngreso.invoker == 'cuentasPorCobrarVentas'){
                  this.pasarComoEmpleado();
                }else{
                CustomConsole.log('cliente encontrado' , this.NwCliente)
                this.getDepartamento() 
                this.getCiudad()
                this.busqueda =  false
              }
              }
            },error:(error)=>Swal.fire(this.clientesService.getErrorMessage(error))
          ,complete:()=>this.loading.hide()})
          }
      }


      buscarClientePorNombre(){
        if (this.NwCliente.nombreCompleto !== undefined && this.NwCliente.nombreCompleto!== undefined ){
          this.loading.show();
          if(this.dataIngreso.invoker=='cuentasXpagar' ){
            
            this.clientesService.getProveedorByNombre(
              this.NwCliente.nombreCompleto  
            ).subscribe({next:(value:ApiResponse<GenericRecordsPayload<ClientesModel>>)=>{
              CustomConsole.log(value)
              if(!value.ok || value.data.count === 0){
                Swal.fire('no se encuentra el proveedor','','info')
              }else{
                this.NwCliente =  value.data.records[0] 
                this.ClientesResult = value.data.records; 
                CustomConsole.log('cliente encontrado' , this.NwCliente)
                this.getDepartamento() 
                this.getCiudad()
                this.busqueda =  false 
            }},error:(error)=>Swal.fire(this.clientesService.getErrorMessage(error))
          ,complete:()=>this.loading.hide()})

          }else{
                this.clientesService.getClientesByNombre(
                  this.NwCliente.nombreCompleto  
                ).subscribe({next:(value:ApiResponse<GenericRecordsPayload<ClientesModel>>)=>{
                  CustomConsole.log(value)
                  if(!value.ok || value.data.count === 0){
                    Swal.fire( {title:'Persona no encontrada',
                       text:'Desea crearla e ingresarla a la venta?',
                       icon:'question', 
                      showCancelButton: true,
                      confirmButtonText: 'Si', 
                      cancelButtonText:'No'}
    
                    )
                    .then((result) => {
                      if (result.isConfirmed) {  
                        this.busqueda =  false;
                        this.mostrarListado = false;
                      }}); 
                  }else{
                    this.NwCliente =  value.data.records[0] 
                    this.ClientesResult = value.data.records;
                    if(this.dataIngreso.invoker == 'cuentasPorCobrarVentas'){
                      this.pasarComoEmpleado();
                    }else{
                    CustomConsole.log('cliente encontrado' , this.NwCliente)
                    this.getDepartamento() 
                    this.getCiudad()
                    this.busqueda =  false
                  }
                  }
                },error:(error)=>Swal.fire(this.clientesService.getErrorMessage(error))
              ,complete:()=>this.loading.hide()})
          }




              }
          }    
  

  buscarClienteFinal(){ 
        if (this.NwCliente.numIdentificacion !== undefined && this.NwCliente.tipoIdentificacion!== undefined ){
          this.loading.show();
                this.clientesService.getClientesByNumAndTipId(
                  this.NwCliente.numIdentificacion , this.NwCliente.tipoIdentificacion
                ).subscribe({next:(value:ApiResponse<GenericRecordsPayload<ClientesModel>>)=>{
                  CustomConsole.log(value)
                  if(!value.ok || value.data.count === 0){

                   if (this.crear ){

                    Swal.fire( {title:'Persona no encontrada',
                       text:'Desea crearla e ingresarla a la venta?',
                       icon:'question', 
                      showCancelButton: true,
                      confirmButtonText: 'Si', 
                      cancelButtonText:'No'}
    
                    )
                    .then((result) => {
                      if (result.isConfirmed) {  
                        this.busqueda =  false
                      }}); 
                    }else{
                      Swal.fire('persona no encontrada','la persona no se encuentra en la base de datos','error');
                      this.dialogo.close({response:false , empleado: new ClientesModel()});
                    }
                  }else{
                    this.NwCliente =  value.data.records[0]  
                    if(this.dataIngreso.invoker == 'cuentasXpagar'){
                      this.pasarComoEmpleado();
                      return
                    }
                    if (this.documentoActivo != undefined){
                      this.asignarClienteAlDocumento();
                    }else{
                      this.clientesService.changeCliente( this.NwCliente);
                      if (this.asignarEmpleado || this.devolverPersona){
                        this.pasarComoEmpleado();
                      }else{
                          this.dialogo.close(true)
                      }
                    }
                  }
                },error:(error)=>Swal.fire(this.clientesService.getErrorMessage(error))
              ,complete:()=>this.loading.hide()})
              }
          }    
     
crearCliente(){ 
  CustomConsole.log('crearCliente' , this.NwCliente);
 // return 
  this.loading.show() 
this.clientesService.setClienteOdoo(this.NwCliente ).subscribe({next:
  (respuesta:ApiResponse<GenericMutationPayload>)=>{
     CustomConsole.log('setClienteOdoo',respuesta); 
     if (respuesta.ok){
       alert('Datos creados con exito!!')
       if(respuesta.data.insertId){
        this.NwCliente.id =  respuesta.data.insertId; 
       } 
       this.buscarClienteFinal()
     
     }else{
       alert(respuesta.error?.message || 'No fue posible crear el cliente');
      
     }
     this.loading.hide();
},error:e=>{
  this.loading.hide();
  Swal.fire(this.clientesService.getErrorMessage(e));
}})
}
     
crearPersonaYDevolverla(){
 
  this.loading.show() 
  //this.documentoActivo.orden;
this.clientesService.setClienteOdoo(this.NwCliente ).subscribe(
  (respuesta:ApiResponse<GenericMutationPayload>)=>{
     CustomConsole.log('setClienteOdoo',respuesta); 
     if (respuesta.ok){
       alert('Datos creados con exito!!')
       if(respuesta.data.insertId){
        this.NwCliente.id =  respuesta.data.insertId; 
       } 
       this.buscarClienteFinal()
     
     }else{
       alert(respuesta.error?.message || 'No fue posible crear el cliente');
      
     }
     this.loading.hide();
})
}
asignarDefaultTipoId(){
  if(!this.NwCliente.is_empresa){
    this.NwCliente.tipoIdentificacion = this.maestro?.parametros.ID_TIPO_ID_CEDULA; 
    this.cli.tipoIdentificacion = this.maestro?.parametros.ID_TIPO_ID_CEDULA; 
  }else{
    
    this.NwCliente.tipoIdentificacion = this.maestro?.parametros.ID_TIPO_ID_NIT;  
  } 
}

asignarDefaults(){ 
  
  if (this.NwCliente.is_empresa == undefined)  this.NwCliente.is_empresa = false; 
  if (this.NwCliente.retefuenteCompras == undefined)  this.NwCliente.retefuenteCompras = false; 
  if (this.NwCliente.retefuentesVentas == undefined)  this.NwCliente.retefuentesVentas = false; 
  this.NwCliente.pais = this.maestro?.parametros.ID_PAIS_DEFAULT; 
  this.paises = (this.maestro?.paises)?[...this.maestro?.paises]:[];
  this.getDepartamento()
  this.NwCliente.departamento = this.maestro?.parametros.ID_DEP_DEFAULT; 
  this.getCiudad()
  this.NwCliente.ciudad = this.maestro?.parametros.ID_CIUDAD_DEFAULT; 
  this.asignarDefaultTipoId();
  CustomConsole.log(this.NwCliente)
}
 
  async setMaestros(){
    this.loading.show() 
    this.clientesService.getMaestroClientes().subscribe(
      {next:(value: any)=>{ 
        this.maestro = value.datos; 
        CustomConsole.log(value);
        this.asignarDefaults();
      }, error:(error: any)=>Swal.fire(JSON.stringify(error)),complete:()=>this.loading.hide() }
    )
   let result = await this.MaestroClienteServices.getMaestrosClientes();
    CustomConsole.log('termino el trabajo');
     
    this.tipo_direccion = this.MaestroClienteServices.getMaestroClientes('tipo_direccion'); 
    CustomConsole.log(this.tipo_direccion); 
    this.Provincias =  this.MaestroClienteServices.getMaestroClientes('provincias');
    this.titulos =  this.MaestroClienteServices.getMaestroClientes('titulos');
    this.categorias =  this.MaestroClienteServices.getMaestroClientes('categorias');   
  } 
    
   
  ngOnInit(): void { 
     
    this.setMaestros();
     
  }

}
