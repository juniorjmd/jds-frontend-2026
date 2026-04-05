import { Component, Inject, inject, OnInit } from '@angular/core'; 
import { TipoVehiculoModule } from 'src/app/models/tipo-vehiculo/tipo-vehiculo.module';
import { TiposServiciosModule } from 'src/app/models/tipos-servicios/tipos-servicios.module';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import Swal from 'sweetalert2';
import { loading } from 'src/app/models/app.loading';
import { VehiculosIngresoServicioModule } from 'src/app/models/vehiculos-ingreso-servicio/vehiculos-ingreso-servicio.module'; 
import { ServiciosCostosModule } from 'src/app/models/servicios-costos/servicios-costos.module';
import { EmpleadoModel } from 'src/app/models/empleados/empleados.module';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog'; 
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { cajasServices } from 'src/app/services/Cajas.services'; 
import { FndClienteComponent } from 'src/app/modules/shared/modals/fnd-cliente/fnd-cliente.component';
import { ClientesModel } from 'src/app/models/clientes/clientes.module';
import { tap } from 'rxjs';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
import { VehiculoIngresoResponse, VehiculoPropietarioResponse, VehiculoServiciosCostosResponse, VehiculoTiposResponse, VehiculoTiposServiciosResponse } from 'src/app/interfaces/vehiculos-response.interface';

@Component({
  selector: 'app-IngresoServicioVehiculo',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.css'],
})
export class IngresoServicioVehiculoComponent implements OnInit {
  ingreso: VehiculosIngresoServicioModule = new VehiculosIngresoServicioModule(  );
  // serviciosAVehiculos:ServiciosModule[] = [];
  // : cajaModel = new cajaModel(undefined);
  

  serviciosAmostrar: any[] = [{ id: 0, nombre: 'Escoger tipoServicio' }];
  serviciosAVehiculos: ServiciosCostosModule[] = [];
  tiposVehiculo: TipoVehiculoModule[] = [];
  tiposServicio: TiposServiciosModule[] = [];
  tipo_servicio: number = 0;
  empleados: EmpleadoModel[] = [];  
  cajaEStablecida:cajaModel = new cajaModel(undefined);
  private readonly empleadosServices= inject(EmpleadosService);
  private readonly VehiculosService= inject(VehiculosService);
  private readonly serviceCaja= inject(cajasServices);
  private readonly newAbrirDialog  = inject( MatDialog); 
  private readonly loading= inject( loading);
  constructor( 
     @Inject(MAT_DIALOG_DATA) public idcajaEStablecida:number, 
  public dialogo: MatDialogRef<IngresoServicioVehiculoComponent>,) { 
    this.serviceCaja.getCaja(this.idcajaEStablecida).subscribe({
      next:(value)=>{
        if(value.ok){
          if(value.data.count > 0){
               this.cajaEStablecida = value.data.records[0];
          }else{Swal.fire('La caja que intenta establecer no existe');}
        }else{Swal.fire(value.error?.message || 'No fue posible consultar la caja');}
      },error:e=> Swal.fire(JSON.stringify(e))
    })
    this.getTiposServicios();
    this.getTiposVehiculos();
    this.getEmpleados();
  }
  
  asignarPropietario(){
    this.ingreso.nombrePropietario = 'voy a buscarlo - perate';
    this.ingreso.propietario = 0 ; 
    this.newAbrirDialog.open(FndClienteComponent,{data:{invoker:'Empleados'} })
    .afterClosed()
    .pipe(
      tap((response: {response:boolean , empleado:ClientesModel})=>{
        if (response.response) {  
          this.ingreso.nombrePropietario =response.empleado.nombreCompleto!;
          this.ingreso.propietario = typeof response.empleado.id === 'string' ? parseInt(response.empleado.id, 10) : response.empleado.id!;
        }
      })
    ).subscribe({
      next: () => {},
      error:  error => Swal.fire('Error:', error),
      complete: () => CustomConsole.log('buscarCliente completo')
    });   
    
  }  
  
  generarIngresoApatios() {
    CustomConsole.log('caja establecida',this.cajaEStablecida)
    if (this.cajaEStablecida == undefined || this.cajaEStablecida.id == undefined) {
      Swal.fire(
        'Debe establecer una caja para asignar el servicio creado',
        '',
        'error'
      ); 
      return;
    }
    if (this.ingreso.lavador === undefined) {
      Swal.fire('Debe escoger el lavador', '', 'error');
      return;
    }
    if (this.ingreso.cod_tipo_vehiculo == undefined) {
      Swal.fire('Debe escoger el tipo de vehiculo', '', 'error');
      return;
    }
    if (this.ingreso.cod_servicio == undefined) {
      Swal.fire('Debe escoger el servicio', '', 'error');
      return;
    }
    if (this.ingreso.propietario == undefined) {
      Swal.fire('Debe ingresar el propietario', '', 'error');
      return;
    } 
    if (this.ingreso.placaVehiculo == undefined) {
      Swal.fire('Debe ingresar la placa del vehiculo', '', 'error');
      return;
    }

    if (this.ingreso.cajaAsignada! > 0 && this.ingreso.idDocumento! > 0) {
      if (this.ingreso.cajaAsignada != this.cajaEStablecida.id) {
        Swal.fire({
          title:
            `La placa a ingresar tiene una factura activa en la caja : "${this.ingreso.nombreCajaAsignada}" ` +
            `, Desea continuar en esta factura o crear una nueva factura en la caja establecida.`,
          showCancelButton: true,
          confirmButtonText: 'Si',
          cancelButtonText: 'No',
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          CustomConsole.log(result);

          if (result.isDismissed) {
            this.ingreso.cajaAsignada = this.cajaEStablecida.id;
            this.ingreso.nombreCajaAsignada = this.cajaEStablecida.nombre;
            this.ingreso.idDocumento = 0;
          }
          CustomConsole.log(this.ingreso);

          // return;
          this.loading.show();
          this.VehiculosService.guardarNuevoIngresoServicio(
            this.ingreso
          ).subscribe((respuesta: VehiculoIngresoResponse) => {
            CustomConsole.log(respuesta);

            if (respuesta.ok) {
              Swal.fire('datos ingresados con exito');

              this.ingreso.idDocumento = respuesta.data.idDocumento;
              this.ingreso.valor = 0;
              this.ingreso.cod_servicio = 0;
              this.tipo_servicio = 0;
              this.cerrarOk();
            } else {
              try {
                Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
              } catch (error: any) {
                Swal.fire('error en el servidor', '', 'error');
              }
            }
            this.loading.hide();
          });
        });
        return;
      }
    } else {
      this.ingreso.cajaAsignada = this.cajaEStablecida.id;
      this.ingreso.nombreCajaAsignada = this.cajaEStablecida.nombre;
    }
    this.loading.show();
    this.VehiculosService.guardarNuevoIngresoServicio(this.ingreso).subscribe(
      (respuesta: VehiculoIngresoResponse) => {
        CustomConsole.log(respuesta);

        if (respuesta.ok) {
          Swal.fire('datos ingresados con exito');
          this.ingreso.idDocumento = respuesta.data.idDocumento;
          this.ingreso.valor = 0;
          this.ingreso.cod_servicio = 0;
          this.tipo_servicio = 0;
          this.cerrarOk();
          //this.getServiciosVehiculos();
        } else {
          try {
            Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
          } catch (error: any) {
            Swal.fire('error en el servidor', '', 'error');
          }
        }
        this.loading.hide();
      }
    );
  }

  cerrarOk() {
    this.ingreso = new VehiculosIngresoServicioModule();
    this.dialogo.close(true)
  }
  cancelar() {
    this.ingreso = new VehiculosIngresoServicioModule();
    this.dialogo.close(false)
  }

  getEmpleados() {
    this.empleados = [];
    this.loading.show();
    this.empleadosServices.getEmpleadosLavador()
    .subscribe({next:     (datos: ApiResponse<GenericRecordsPayload<EmpleadoModel>>) => {
        CustomConsole.log(datos);

        if (datos.data.count > 0) {
          this.empleados = datos.data.records;
          CustomConsole.log('getEmpleadosLavador - empleados', this.empleados);
        } else {
          this.empleados = [];
        }

        this.loading.hide();
      },error:
      (error) => {
        this.loading.hide();
        CustomConsole.log('error getEmpleadosLavador',error);
        Swal.fire(error.error.error, '', 'error');
      }}
    );
  }
  validarPlaca() {
    //vw_vehiculos_propietario

    if (this.ingreso.placaVehiculo == undefined) {
      return;
    }
    this.loading.show();
    this.VehiculosService.getVehiculos_propietario(
      this.ingreso.placaVehiculo!
    ).subscribe({next:
      (datos: VehiculoPropietarioResponse) => {
        CustomConsole.log('getVehiculos_propietario',datos);
        let dato: any = {
          placaVehiculo: '',
          propietario: 0,
          nombrePropietario : '',
          telefono: '',
          cod_tipo_vehiculo: 0,
          idDocumento: 0,
          cajaAsignada: 0,  
          tipoDocumento:0, 
		      nombreCajaAsignada:'',   
		     nombreTipoDoc:'' 
        };

        if (datos.data.count > 0) {
          dato = datos.data.records[0]; 
        } 
        CustomConsole.log(dato);
        this.ingreso.propietario = dato.propietario; 
        this.ingreso.nombrePropietario = dato.nombrePropietario; 
        this.ingreso.cod_tipo_vehiculo = dato.cod_tipo_vehiculo;
        this.ingreso.idDocumento = (dato.nombreTipoDoc == 'EnBlanco' ) ? dato.idDocumento:undefined;
        this.ingreso.cajaAsignada =(dato.nombreTipoDoc == 'EnBlanco' ) ? dato.cajaAsignada:undefined;
        this.ingreso.nombreCajaAsignada = (dato.nombreTipoDoc == 'EnBlanco' ) ? dato.nombreCajaAsignada:'';
        this.getServiciosVehiculos();
        this.loading.hide();
      },error:
      (error) => {
        this.loading.hide();
        CustomConsole.log(error);
        Swal.fire(error.error.error, '', 'error');
      }}
    );
  }

  getTiposServicios() {
    this.tiposServicio = [];
    this.serviciosAVehiculos = [];
    this.tiposVehiculo = [];

    this.tiposServicio[0] = new TiposServiciosModule('', '');
    this.loading.show();
    this.VehiculosService.getTiposServicios().subscribe({next:
      (datos: VehiculoTiposServiciosResponse) => {
        CustomConsole.log(datos); 
        if (datos.data.count > 0) {
          this.tiposServicio = datos.data.records;
          CustomConsole.log('tiposervicio' , this.tiposServicio);
        } else {
          this.tiposServicio = [];
        } 
      },error:  (error) => {
        this.loading.hide();
        CustomConsole.log(error);
        Swal.fire(error.error.error, '', 'error');
      },complete:()=>  this.loading.hide() }
    );
  }

  optenerValor() {
    this.ingreso.valor = 0;
    this.serviciosAVehiculos.forEach((servicio: ServiciosCostosModule) => {
      if (servicio.cod_servicio == this.ingreso.cod_servicio) {
        this.ingreso.valor = servicio.valor;
      }
    });
    CustomConsole.log('optener el valor del servicio', this.ingreso);
  }

  mostrarServicioPorTipo() {
    this.ingreso.cod_servicio = 0;
    this.serviciosAmostrar = [{ id: 0, nombre: 'Escoger tipoServicio' }];
    if (this.tipo_servicio <= 0) {
      return;
    }
    let cont = 0;
    CustomConsole.log('mostrarServicioPorTipo' , this.serviciosAVehiculos, 'tipo de servicio' , this.tipo_servicio )
    this.serviciosAmostrar = this.serviciosAVehiculos.filter(x=>x.tipo_servicio == this.tipo_servicio)
    CustomConsole.log(this.serviciosAmostrar)
    
  }
  getServiciosVehiculos() {
    this.serviciosAVehiculos = [];
    // alert(this.ingreso.cod_tipo_vehiculo  )
    if (this.ingreso.cod_tipo_vehiculo == undefined) {
      return;
    }
    this.loading.show();
    this.VehiculosService.getServiciosPorTipoVehiculo(
      this.ingreso.cod_tipo_vehiculo
    ).subscribe({next:
      (datos: VehiculoServiciosCostosResponse) => {
        CustomConsole.log(datos);

        if (datos.data.count > 0) {
          this.serviciosAVehiculos = datos.data.records;
          CustomConsole.log(this.serviciosAVehiculos);
          this.mostrarServicioPorTipo();
        } else {
          this.serviciosAVehiculos = [];
        }

        this.loading.hide();
      },error:
      (error) => {
        this.loading.hide();
        CustomConsole.log(error);
        Swal.fire(error.error.error, '', 'error');
      }}
    );
  }

  getTiposVehiculos() {
    this.tiposVehiculo = [];
    this.tiposVehiculo[0] = new TipoVehiculoModule('', '');
    this.loading.show();
    this.VehiculosService.geTiposVehiculos().subscribe({next:
      (datos: VehiculoTiposResponse) => {
        CustomConsole.log('geTiposVehiculos', datos);

        if (datos.data.count > 0) {
          this.tiposVehiculo = datos.data.records  
          CustomConsole.log(this.tiposVehiculo);
        } else {
          this.tiposVehiculo = [];
        }

        this.loading.hide();
      },error:   (error) => {
        this.loading.hide();
        CustomConsole.log(error);
        Swal.fire(error.error.error, '', 'error');
      }}
    );
  }

  ngOnInit(): void {
    this.serviceCaja.currentCaja.subscribe({next:(caja)=>  this.cajaEStablecida = (caja!= undefined) ? caja : this.cajaEStablecida })
  }
}
