import { Component, OnInit } from '@angular/core';
import { ServiciosCostosModule } from 'src/app/models/servicios-costos/servicios-costos.module';
import { ServiciosModule } from 'src/app/models/servicios/servicios.module';
import { TipoVehiculoModule } from 'src/app/models/tipo-vehiculo/tipo-vehiculo.module';
import { TiposServiciosModule } from 'src/app/models/tipos-servicios/tipos-servicios.module'; 
import { VehiculosService } from 'src/app/services/vehiculos.service';
import Swal from 'sweetalert2'; 
import { loading } from 'src/app/models/app.loading';   
import { CustomConsole } from 'src/app/models/CustomConsole';
import { VehiculoMutationResponse, VehiculoNoAsignadosResponse, VehiculoServiciosCostosResponse, VehiculoServiciosResponse, VehiculoTiposServiciosResponse } from 'src/app/interfaces/vehiculos-response.interface';

@Component({
  selector: 'app-servicioscostos',
  templateUrl: './servicioscostos.component.html',
  styleUrls: ['./servicioscostos.component.css']
})
export class ServicioscostosComponent implements OnInit {
  arrServiciosCostos:ServiciosCostosModule[] = [];
  tiposServicio:TiposServiciosModule[] = [];
  serviciosAVehiculos:ServiciosModule[] = [];
  tiposVehiculo:TipoVehiculoModule[] = [];
  tipoVehiculo:number;
  servicioSelecionado:number;
  precio : number ;
  newServiciosCostos:ServiciosCostosModule = new ServiciosCostosModule(0,0,0);
  tipo_servicio:number; 
  constructor( private VehiculosService : VehiculosService ,  
               private loading : loading   )
                {this.tipo_servicio=0; 
                 this.tipoVehiculo=0;
                 this.servicioSelecionado=0;
                 this.precio = 0;
                 this.getTiposServicios();
                }
  private actualizarPrecioServicioSeleccionado(){
    const servicio = this.serviciosAVehiculos.find((item) => Number(item.id) === Number(this.servicioSelecionado));
    this.precio = Number(servicio?.precio_general || 0);
  }

  private resetServicioDependientes(){
    this.arrServiciosCostos = [];
    this.tiposVehiculo = [];
    this.tipoVehiculo = 0;
    this.servicioSelecionado = 0;
    this.precio = 0;
  }

  private recargarServicioSeleccionado(){
    if (Number(this.servicioSelecionado) <= 0) {
      this.arrServiciosCostos = [];
      this.tiposVehiculo = [];
      this.tipoVehiculo = 0;
      this.precio = 0;
      return;
    }

    this.actualizarPrecioServicioSeleccionado();
    this.tipoVehiculo = 0;
    this.getCostosServiciosVehiculos();
    this.getVehiculosNoAsignados();
  }

  setActualiza_costoServicioVehiculo(costo : ServiciosCostosModule){
Swal.fire({
  title: 'Ingrese el nuevo valor a editar',
  text:`servicio : ${costo.nombreServicio}, vehiculo : ${costo.nombreTipoVehiculo}, costo Actual : ${costo.valor} `,
  input: 'number',
  inputAttributes: {
    autocapitalize: 'off'
  },
  showCancelButton: true,
  confirmButtonText: 'Actualizar',
  showLoaderOnConfirm: true,
  preConfirm: (valor) => {
    costo.valor = valor;
    this.VehiculosService.guardarCostoServicio(costo).subscribe(
      (respuesta:VehiculoMutationResponse)=>{CustomConsole.log(respuesta)
       
      Swal.fire(respuesta.data.message ?? 'datos ingresados con exito');  
      this.recargarServicioSeleccionado();
      this.loading.hide(); 
      }, error => {
        this.loading.hide();
        Swal.fire(this.VehiculosService.getErrorMessage(error), '', 'error');
      }) 
  },
  allowOutsideClick: () => !Swal.isLoading()
}).then((result) => {
  if (result.isConfirmed) {
  }
})




  }
  borrarCostoServicioVehiculo(costo : ServiciosCostosModule){
    Swal.fire({
      title: `Seguro que quiere borrar el costo del servicio "${costo.nombreServicio}" al vehiculo  "${costo.nombreTipoVehiculo}"`, 
      showCancelButton: true,
      confirmButtonText: 'Eliminar', 
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        
        this.VehiculosService.eliminarCostosServicios(costo).subscribe(
          (respuesta:VehiculoMutationResponse)=>{CustomConsole.log(respuesta)
            if (respuesta.ok){
              this.recargarServicioSeleccionado();
              Swal.fire('Elemento eliminado con exito!', '', 'success');
              
            } 
          }
        );
        
      } 
    })
  }
  lipiarSelect(){
    this.serviciosAVehiculos = [];
    this.resetServicioDependientes();
  }
  getTiposServicios(){ 
    this.arrServiciosCostos  = [];
  this.tiposServicio = [];
  this.serviciosAVehiculos  = [];
  this.tiposVehiculo  = [];
  this.tipo_servicio = 0;
  this.servicioSelecionado = 0;
  this.tipoVehiculo = 0;
  this.precio = 0;


    this.tiposServicio[0] =  new TiposServiciosModule('','' );
    this.loading.show()
    this.VehiculosService.getTiposServicios().subscribe({next:
      (datos:VehiculoTiposServiciosResponse)=>{
         CustomConsole.log(datos);
         
    if (datos.data.count > 0 ){ 
      this.tiposServicio = datos.data.records ; 
      CustomConsole.log(this.tiposServicio);
    }else{
      this.tiposServicio = [];
    }

      } , error:   error => {this.loading.hide();
        CustomConsole.log(error)
        Swal.fire( error.error.error, '', 'error');
      }, complete:()=>    this.loading.hide() }
      );
  }  
  getServiciosVehiculos( ){ 
    this.lipiarSelect();
    //this.serviciosAVehiculos[0] =   new ServiciosModule('',0,'',0,0); 
   // alert(this.tipo_servicio )
    if (Number(this.tipo_servicio) <=  0  ) { return;  }
    this.loading.show()
    this.VehiculosService.getServiciosPorTipo(this.tipo_servicio).subscribe(
      (datos:VehiculoServiciosResponse)=>{
         CustomConsole.log(datos); 
    if (datos.data.count > 0 ){ 
      this.serviciosAVehiculos = datos.data.records ;
      CustomConsole.log(this.serviciosAVehiculos);
    }else{
      this.serviciosAVehiculos = [];
    }

        this.loading.hide()
      } ,
      error => {this.loading.hide();
        CustomConsole.log(error)
        Swal.fire( error.error.error, '', 'error');
      }
      );
  } 

  getTiposVehiculos(){ 
    this.recargarServicioSeleccionado();
  }  

  getVehiculosNoAsignados(){
    this.tiposVehiculo = [];
    if (Number(this.servicioSelecionado) <= 0) {
      return;
    }

    this.loading.show()
    this.VehiculosService.getVehiculoNoAsignadoAServicios(this.servicioSelecionado).subscribe(
      (datos:VehiculoNoAsignadosResponse)=>{
         CustomConsole.log(datos);
         
    if (datos.data.count > 0 ){
      this.tiposVehiculo = datos.data.records 
      CustomConsole.log('getVehiculoNoAsignadoAServicios',this.tiposVehiculo);
    }else{
      this.tiposVehiculo = [];
    }

        this.loading.hide()
      } ,
      error => {this.loading.hide();
        CustomConsole.log(error)
        Swal.fire( error.error.error, '', 'error');
      }
      );
  }

  enviarRelacionServicioVehiculo(){
  if(  Number(this.tipo_servicio) === 0 ) {
    Swal.fire( 'debe seleccionar el tipo de servicio', '', 'error');
    return
  }
  if( Number(this.servicioSelecionado) === 0 ) {
  Swal.fire( 'debe seleccionar el servicio', '', 'error');
  return
}
if( Number(this.tipoVehiculo) === 0 ) {
  Swal.fire( 'debe seleccionar el tipo de vehiculo', '', 'error');
  return
}
if( this.precio <= 0  ) {
  Swal.fire( 'debe ingresar el valor del servicio, este debe ser mayor a cero', '', 'error');
  return
}
this.loading.show(); 
// newServiciosCostos:ServiciosCostosModule = new ServiciosCostosModule(0,0,0,0);
this.newServiciosCostos = new ServiciosCostosModule(Number(this.servicioSelecionado), Number(this.tipoVehiculo) ,Number(this.precio) );
this.VehiculosService.guardarCostoServicio(this.newServiciosCostos).subscribe(
 (respuesta:VehiculoMutationResponse)=>{CustomConsole.log(respuesta)
  
 Swal.fire(respuesta.data.message ?? 'datos ingresados con exito');  
 this.recargarServicioSeleccionado();
 this.loading.hide(); 
 }, error => {
  this.loading.hide();
  Swal.fire(this.VehiculosService.getErrorMessage(error), '', 'error');
 }) 
 }

 getCostosServiciosVehiculos(){ 
  this.arrServiciosCostos = [];
  if ( Number(this.servicioSelecionado) <= 0){return;}
  this.loading.show()
  this.VehiculosService.getCostosServicios(this.servicioSelecionado).subscribe(
    (datos:VehiculoServiciosCostosResponse)=>{
       CustomConsole.log(datos);
       
  if (datos.data.count > 0 ){ 
    
    this.arrServiciosCostos = datos.data.records; 
   
    CustomConsole.log(this.arrServiciosCostos);
  }else{
    this.arrServiciosCostos = [];
  }

      this.loading.hide()
    } ,
    error => {this.loading.hide();
      CustomConsole.log(error)
      Swal.fire( error.error.error, '', 'error');
    }
    );
}  


limpiar(){
    this.tipoVehiculo = 0;
    this.newServiciosCostos = new ServiciosCostosModule(0,0,0 );
    this.recargarServicioSeleccionado();
 
}
  ngOnInit(): void {
  }

}
