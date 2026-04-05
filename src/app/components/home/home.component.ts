import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/interfaces/usuario.interface';
import { cajasServices } from 'src/app/services/Cajas.services';
import { CntContablesService } from 'src/app/services/cntContables.service';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { LoginService } from 'src/app/services/login.services';
import { ProductoService } from 'src/app/services/producto.service';
import { usuarioService } from 'src/app/services/usuario.services';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { InventarioCategoriesResponse } from 'src/app/interfaces/inventario-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model';
import { EmpleadoModel } from 'src/app/models/empleados/empleados.module';
import { CntCuentaMModel } from 'src/app/models/cnt-cuenta-m/cnt-cuenta-m.module';
import { CntGruposModel } from 'src/app/models/cnt-grupos/cnt-grupos.module';
import { vwCntSubCuentaModel } from 'src/app/models/cnt-sub-cuenta/cnt-sub-cuenta.module';
import { CntClasesModel } from 'src/app/models/cnt-clases/cnt-clases.module';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  usuario?:Usuario
  constructor(
    private _servProducto:ProductoService,
    private _ServLogin : LoginService,
    private inicioService:DatosInicialesService ,
    private cntService:CntContablesService ,  
    private serviceCaja:cajasServices , 
    private _Router: Router , private usuarioService:usuarioService,  
  ) { 

    const height = window.innerHeight;
    //alert(height)
  }

    

  print() {
    const printContent = document.getElementById('print-section');
    const WindowPrt = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0')!;
    WindowPrt.document.write(printContent!.innerHTML);
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.addEventListener('afterprint', () => {
      WindowPrt.close();
    });
    WindowPrt.print();
  }
  ngOnInit(): void {
    this.inicioService.getVendedores().subscribe({next: (datos:ApiResponse<GenericRecordsPayload<EmpleadoModel>>) =>{
      this.inicioService.setArrayVendedores(datos.data.records)
    },error:error=>Swal.fire(JSON.stringify(error))
    })
    this.inicioService.getDatosIniSucursal().subscribe({next :  (data:any)=>{
       data;
      this.inicioService.chageSucursal(data[0])
      //console.log('sucursal',data[0]);
    } ,
    error: error => {
      Swal.fire(JSON.stringify(error))
       
    }}
      ); 
    
     
      this.serviceCaja.getCuentasContablesEstablecimientoUsuario().subscribe({next:(value:ApiResponse<{ records: cajaModel[]; count: number }>)=>{
        //console.log('getCuentasContablesEstablecimientoUsuario' , value) 

          this.inicioService.validarCuentasContablesEstablecimiento(value.data.records[0] )  
          
      }, error: error => {
        Swal.fire('getCuentasContablesEstablecimientoUsuario', JSON.stringify(error))
         
      }})
    

    this.getUsuarioLogeado(); 



    this._servProducto.getCategorias().subscribe({next:(datos:InventarioCategoriesResponse)=>{ 
      this._servProducto.asignarCategorias(datos.data.categories) 
   }, error : (e)=>Swal.fire(JSON.stringify(e))})

    this._servProducto.getMarcas().subscribe({next:(datos:ApiResponse<GenericRecordsPayload<any>>)=>{ 
      this._servProducto.asignarMarcas(datos.data.records) 
   }, error : (e)=>Swal.fire(JSON.stringify(e))})
    
    this.cntService.getCntCuentasMayores().subscribe({next:(value:ApiResponse<GenericRecordsPayload<CntCuentaMModel>>)=>{  
      //console.log("getCntCuentasMayores",value )
      this.cntService.changeCuentasM(value.data.records); 
    },error : (e)=>Swal.fire(JSON.stringify(e))})
    
    this.cntService.getCntGrupos().subscribe({
      next:(value:ApiResponse<GenericRecordsPayload<CntGruposModel>>)=>{ 
      this.cntService.changeGrupo(value.data.records); 
      //console.log("getCntGrupos",value.data )

    },error : (e)=>Swal.fire(JSON.stringify(e))})

    this.cntService.getCntCuentas().subscribe({
      next:(value:ApiResponse<GenericRecordsPayload<vwCntSubCuentaModel>>)=>{ 
      this.cntService.changeSubCuenta(value.data.records); 
      //console.log("getCntCuentas",value.data )

    },error : (e)=>Swal.fire(JSON.stringify(e))})


    this.cntService.getCntClases().subscribe({next:(value:ApiResponse<GenericRecordsPayload<CntClasesModel>>)=>{ 
      this.cntService.changeClase(value.data.records); 
      //console.log("getCntClases",value.data )

    },error : (e)=>Swal.fire(JSON.stringify(e))})


    this.cntService.getCntClases().subscribe({next:(value:ApiResponse<GenericRecordsPayload<CntClasesModel>>)=>{ 
      this.cntService.changeClase(value.data.records); 
      //console.log("getCntClases",value.data )

    },error : (e)=>Swal.fire(JSON.stringify(e))})

    this.serviceCaja.getEstablecimientos()
    .subscribe({next: (datos:ApiResponse<GenericRecordsPayload<establecimientoModel>>)=>{
        //console.log('datos establecimientosRequest',datos); 
       if (datos.ok && datos.data.count > 0 ){ 
        this.serviceCaja.asignarEstablecimientos(datos.data.records);  
       } 
     } , error:   error => {  Swal.fire(JSON.stringify(error))  
     }}
     );

    // Aquí deberías cargar los datos de `cnt_cuenta` desde el servicio correspondiente
    
  }

  getUsuarioLogeado() {
     
    this._ServLogin.getUsuarioLogeadoAsync().subscribe({next:(datos)=>{
     
    this.usuario = datos.usuario;   
    this.usuarioService.changeUsuario(this.usuario); // Actualiza con el usuario logueado

    },error: (error: any) => { 
      Swal.fire('getUsuarioLogeadoAsync', this._ServLogin.getErrorMessage(error))
    this._Router.navigate(['login']);
  }})  
}

}
