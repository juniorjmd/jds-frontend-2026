import { Component, OnInit } from '@angular/core'; 
import { loading } from 'src/app/models/app.loading';
import { cajasServices } from 'src/app/services/Cajas.services'; 
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model'; 
import { TiposEstablecimientosModel } from 'src/app/models/ventas/tipos-establecimientos.model';
import { TiposEstablecimientos } from 'src/app/interfaces/tipos-establecimientos';
import { MatDialog } from '@angular/material/dialog';
import { TiposEstablComponent } from './tipos-establ.component'; 
import Swal from 'sweetalert2';
import { BodegasModule } from 'src/app/models/bodegas/bodegas.module'; 
import { ModalCntSubCuentasComponent } from '../../modals/cuentasContables/cnt-sub-cuentas.component';
import { responseSubC } from 'src/app/interfaces/odoo-prd';
import { tap } from 'rxjs';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-crear',
  templateUrl: './crear.component.html',
  styleUrls: ['./crear.component.css']
})
export class CrearComponent implements OnInit { 
  
  auxBodega:BodegasModule = {nombre : 'SELECCIONAR LA BODEGA' ,estado:0,   id:0  , descripcion : ''}
  objIni:BodegasModule  = {   estado:0,   id:0  , descripcion : '',  nombre: ''  }   ;
  establecimientos :establecimientoModel[]  = [];
  tiposEsta: TiposEstablecimientosModel[] = [];
  aLocationFisico:BodegasModule = {...this.objIni}   ;
  aLocationPOS:BodegasModule  ={...this.objIni};
  aLocationVirtual:BodegasModule = {...this.objIni};
  locationStore:BodegasModule[]  = [];
  locationPOS:BodegasModule[]  = [];
  locationVirtual:BodegasModule[]  = [];
  newEsta : establecimientoModel = new establecimientoModel(undefined); 
  constructor( private serviceCaja : cajasServices , 
    private newAbrirDialog: MatDialog, 
    private newEstablecimientoDialog : MatDialog ,   
    private loading : loading ) {
      this.Cancelar();
      this.getTiposEstablecimiento(); 
     this.getLocacionPrincipales();
    
  }
  buscarCuentasContables(nombreBusqueda:string){
    this.newAbrirDialog.open(ModalCntSubCuentasComponent, { data:  null })
    .afterClosed() 
    .pipe(
      tap((response: responseSubC) => {
        CustomConsole.log('buscarCuentasContablesGastos',response);
        if (response.confirmado && response.datoDevolucion !== undefined ) {  
          switch(nombreBusqueda){
            case'cajaGeneral':
            this.newEsta.nombreCCntCajaGeneral = response.datoDevolucion.nombre_scuenta!;
            this.newEsta.idCCntCajaGeneral = response.datoDevolucion.id_scuenta!; 
            break
            case 'IDifBonoRegalo':  
            this.newEsta.nombreCCntIngDifBonoRegalo = response.datoDevolucion.nombre_scuenta!;
            this.newEsta.idCCntIngDifBonoRegalo = response.datoDevolucion.id_scuenta!; 
            break
            case 'cuentasPorPagar' :  
            this.newEsta.nombreCCntCPagar = response.datoDevolucion.nombre_scuenta!;
            this.newEsta.idCCntCPagar = response.datoDevolucion.id_scuenta!; 
            break
            case 'cuentasPorCobrar' : 
            this.newEsta.nombreCCntCCobrar = response.datoDevolucion.nombre_scuenta!;
            this.newEsta.idCCntCCobrar = response.datoDevolucion.id_scuenta!; 
            break 
            case 'ivaEnCompras' : 
            this.newEsta.nombreCCntIvaCompra = response.datoDevolucion.nombre_scuenta!;
            this.newEsta.idCCntIvaCompra = response.datoDevolucion.id_scuenta!; 
            break 
            case 'ivaEnVenta' : 
            this.newEsta.nombreCCnttIvaVenta = response.datoDevolucion.nombre_scuenta!;
            this.newEsta.idCCnttIvaVenta = response.datoDevolucion.id_scuenta!; 
            break

            case 'costoEnVenta' : 
            this.newEsta.nombreCCntCostoVenta = response.datoDevolucion.nombre_scuenta!;
            this.newEsta.idCCntCostoVenta = response.datoDevolucion.id_scuenta!; 
            break
            case 'venta' : 
            this.newEsta.nombreCCntVentas = response.datoDevolucion.nombre_scuenta!;
            this.newEsta.idCCntVenta = response.datoDevolucion.id_scuenta!; 
            break
            
            case 'retefuenteCompra' : 
            this.newEsta.nombreRetefuenteCompra = response.datoDevolucion.nombre_scuenta!;
            this.newEsta.idRetefuenteCompra = response.datoDevolucion.id_scuenta!; 
            break
            
            case 'retefuenteVenta' : 
            this.newEsta.nombreRetefuenteVenta = response.datoDevolucion.nombre_scuenta!;
            this.newEsta.idRetefuenteVenta = response.datoDevolucion.id_scuenta!; 
            break
            
            case 'descuentoVenta' : 
            this.newEsta.nombreDescuentoVenta = response.datoDevolucion.nombre_scuenta!;
            this.newEsta.idDescuentoVenta = response.datoDevolucion.id_scuenta!; 
            break
            
            case 'descuentoCompra' : 
            this.newEsta.nombreDescuentoCompra = response.datoDevolucion.nombre_scuenta!;
            this.newEsta.idDescuentoCompra = response.datoDevolucion.id_scuenta!; 
            break

          }
        }  
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire('Error:', error),
      complete: () => CustomConsole.log('buscarCuentasContables completo')
    }); 
  }
  asignarLocation( b:BodegasModule){
    CustomConsole.log("asignar datos al elemento",b) 
      this.newEsta.idAuxiliar =   (typeof ( b.id! ) === 'number'  )? b.id! : parseInt(b.id!) ;
      this.newEsta.nombreAuxiliar =   b.nombre ;  
      this.newEsta.idBodegaStock =   (typeof ( b.id! ) === 'number'  )? b.id! : parseInt(b.id!) ;
      this.newEsta.NameBodegaStock =   b.nombre ;  
      this.newEsta.idBodegaVitual =    (typeof ( b.id! ) === 'number'  )? b.id! : parseInt(b.id!) ;
      this.newEsta.NameBodegaVirtual =   b.nombre ;  
   
  }
  getLocacionPrincipales(){
this.locationStore = [this.auxBodega];
    this.serviceCaja.getBodegasDisponibles()
    .subscribe({next:     (datos: ApiResponse<GenericRecordsPayload<{ obj: BodegasModule }>>)=>{
        CustomConsole.log(datos);
        this.locationStore = [];   
        this.locationPOS   = [];
      this.locationVirtual  = [];
   if (datos.ok && datos.data.count > 0 ){  
            this.locationStore = datos.data.records.map((x)=>x.obj) 
            this.locationStore.unshift(this.auxBodega);  
     CustomConsole.log("this.locationStore" , this.locationStore) 
     this.newEsta.tipo = 0;
     this.newEsta.estado = 0;
    }else{
      this.locationStore   = [this.auxBodega];   }
       this.loading.hide()
     } ,error:    error => {this.loading.hide();
       
   this.locationStore = [];
       Swal.fire('error getLocacionPrincipales' , this.serviceCaja.getErrorMessage(error));
      } }
     );
  }
  mantenerTiposEsta(){
    this.newEstablecimientoDialog.open(TiposEstablComponent,{data:null})
    .afterClosed()
    .subscribe((confirmado: Boolean)=>{
     // if (confirmado){ 
      this.getTiposEstablecimiento(); 
    //}
    })
  }
  Cancelar(){
    this.newEsta =  new establecimientoModel(undefined);
  this.aLocationFisico = this.objIni   ;
  this.aLocationPOS   = this.objIni   ;  
  this.aLocationVirtual  = this.objIni   ;
     
  }
  getEstablecimiento(){ 
    this.serviceCaja.getAllEstablecimientos()
     .subscribe({next:   (datos: ApiResponse<GenericRecordsPayload<establecimientoModel>> )=>{
         CustomConsole.log(datos);   
    if (datos.ok && datos.data.count > 0 ){ 
      this.establecimientos = datos.data.records ?? [];
      this.serviceCaja.asignarEstablecimientos(datos.data.records);
      CustomConsole.log(this.establecimientos);
      this.newEsta.tipo = 0;
      this.newEsta.estado = 0;
    }

        this.loading.hide()
      } , error:    error => {this.loading.hide();
        
    this.establecimientos = [];
        Swal.fire(this.serviceCaja.getErrorMessage(error));
      }}
      );
  }

  
  getTiposEstablecimiento(){ 
    this.serviceCaja.getTiposEstablecimientos()
     .subscribe({next:  (datos: ApiResponse<GenericRecordsPayload<TiposEstablecimientosModel>>)=>{
         CustomConsole.log(datos);
         this.tiposEsta = [];   
    if (datos.ok && datos.data.count > 0 ){ 
      
      datos.data.records.forEach((dato:TiposEstablecimientos , index:number )=>{
        this.tiposEsta[index] = new TiposEstablecimientosModel( dato );
      }) 
      CustomConsole.log(this.tiposEsta);
    }

        this.loading.hide()
      } ,error:  error => {this.loading.hide(); 
        this.tiposEsta = [];
        Swal.fire(this.serviceCaja.getErrorMessage(error));
      }}
      );
  }

  
  setActualizaCaja(estaActualiza : establecimientoModel){
    this.Cancelar();
    this.newEsta = {...estaActualiza} ;   
    this.aLocationFisico = this.locationStore.filter(x=>{x.id== estaActualiza.idBodegaStock})[0] !;
 
  }
  ngOnInit(): void {
    this.serviceCaja.currentArrEsta.subscribe({next:(esta)=>{
      if(esta){this.establecimientos =  esta}
    }})
  }
  guardarCaja(){
   CustomConsole.log('nueva caja',this.newEsta.nombre)
   if (typeof(this.newEsta.nombre) === 'undefined'){
    this.loading.hide();
    Swal.fire('Debe ingresar el Nombre del establecimiento');
    return;
   }
   if (typeof(this.newEsta.descripcion) === 'undefined'){
    this.newEsta.descripcion = this.newEsta.nombre ;
   }else{
    if ( this.newEsta.descripcion.trim() === ''){
      this.newEsta.descripcion = this.newEsta.nombre ;
     }
   }

   CustomConsole.log('this.newEsta.idAuxiliar : '+this.newEsta.idAuxiliar,'this.newEsta.tipo '+this.newEsta.tipo )
   if(this.newEsta.tipo == 1) {
  
   if ( this.newEsta.idAuxiliar  ==  0 ){
    this.loading.hide();
    Swal.fire('Debe seleccionar la locacion fisica a la que pertenece');
    return;
   }
   
   if ( this.newEsta.idBodegaStock  == 0 ){
    this.loading.hide();
    Swal.fire('Debe seleccionar la locacion POS a la que pertenece');
    return;
   }
   if ( this.newEsta.idBodegaVitual == 0 ){
    this.loading.hide();
    Swal.fire('Debe seleccionar la locacion virtual a la que apuntara el establecimiento');
    return;
   }}
   this.loading.show(); 
 
   this.serviceCaja.setEstablecimiento(this.newEsta).subscribe(
    (respuesta: ApiResponse<GenericMutationPayload>)=>{CustomConsole.log(respuesta)
     
    if (respuesta.ok){
      Swal.fire('datos ingresados con exito');  
      this.newEsta =  new establecimientoModel(undefined);
      this.getEstablecimiento();
    }else{
      Swal.fire(respuesta.error?.message || 'No fue posible guardar el establecimiento');
      this.loading.hide();
    }
    }

   )
  }


}
