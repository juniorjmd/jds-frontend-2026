import { AfterViewInit, Component, ElementRef,   OnInit, ViewChild } from '@angular/core';
import {  MatDialog } from '@angular/material/dialog';
import { error } from 'jquery';
import { tap, catchError, of } from 'rxjs';
import { BusquedaPersona } from 'src/app/interfaces/busqueda-persona';
import { productoDocumento } from 'src/app/interfaces/clientes-odoo';
import { DocumentoListado } from 'src/app/interfaces/documento.interface';
import { DtoDocumentoProducto } from 'src/app/interfaces/dto-documento-producto';
import { MediosDePago } from 'src/app/interfaces/medios-de-pago.interface';
import { errorOdoo, responsePrd } from 'src/app/interfaces/odoo-prd';
import { cajaRequest,  DocumentoCierreRequest, DocumentoRequest, ProductoRequest } from 'src/app/interfaces/producto-request';
import { RecursoDetalle, Usuario } from 'src/app/interfaces/usuario.interface';
import { vwsucursal } from 'src/app/models/app.db.interfaces'; 
import { loading } from 'src/app/models/app.loading';
import { EmpleadoModel } from 'src/app/models/empleados/empleados.module';
import { PrinterManager } from 'src/app/models/printerManager';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model';
import { pagosModel, DocpagosModel } from 'src/app/models/ventas/pagos.model';
import { AbonosCuentasXCobrarComponent } from 'src/app/modules/pos/modals/abonos-cuentas-xcobrar/abonos-cuentas-xcobrar.component';
import { BuscarProdDirectoComponent } from 'src/app/modules/pos/modals/buscar-prod-directo/buscar-prod-directo.component';
import { GenerarCntPorCobrarComponent } from 'src/app/modules/pos/modals/generar-cnt-por-cobrar/generar-cnt-por-cobrar.component';
import { IngresarProductoVentaComponent } from 'src/app/modules/pos/modals/ingresar-producto-venta/ingresar-producto-venta.component';
import { ModalUpdateProductoVentaComponent } from 'src/app/modules/pos/modals/ModalUpdateProductoVenta/ModalUpdateProductoVenta.component';
import { MoverDocumentosComponent } from 'src/app/modules/pos/modals/mover-documentos/mover-documentos.component';
import { NewGastoComponent } from 'src/app/modules/pos/modals/new-gasto/new-gasto.component';
import { PagosVentaComponent } from 'src/app/modules/pos/modals/pagos-venta/pagos-venta.component';
import { FndClienteComponent } from 'src/app/modules/shared/modals/fnd-cliente/fnd-cliente.component';
import { cajasServices } from 'src/app/services/Cajas.services';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { DocumentoService } from 'src/app/services/documento.service';
import { LoginService } from 'src/app/services/login.services';
import { ProductoService } from 'src/app/services/producto.service';
import Swal from 'sweetalert2';
import { ModalUpdateProductoCompraComponent } from '../../modals/ModalUpdateProductoVenta/ModalUpdateProductoCompra.component';
import { GenerarCntPorPagarComponent } from '../../modals/generar-cnt-por-pagar/generar-cnt-por-pagar.component';
import { CustomConsole } from 'src/app/models/CustomConsole';

@Component({
  selector: 'app-crearCompra',
  templateUrl: './crearCompra.component.html',
  styleUrls: ['./crearCompra.component.css']
})
export class CreateComprasComponent implements AfterViewInit, OnInit {

  cotiza = false; 
  libranza = false; 
  pasaAotraCaja = false;
  planSepare = false;
  CrtGasto = false;
  domicilio = false;
  pagos: pagosModel[] = []; 
  indexEfectivo!: number;
  focus!: boolean;
  MedioP: MediosDePago[] = [];
  MedioPInicial: MediosDePago[] = [];
  buscarClose: boolean = true;
  codigoProducto!: string;
  vueltas: boolean = false;
  menusUsuario: RecursoDetalle[] = [];
  documentos: DocumentosModel[] = [];
  empleados: EmpleadoModel[] = [];
  documentoActivo:DocumentosModel = new DocumentosModel();
  empleadoActivo:EmpleadoModel  = new EmpleadoModel();
  documentoRetorno: DocumentosModel = new DocumentosModel();
  documentoSeleccionadoActivo: DocumentosModel = new DocumentosModel(); 
  sucursal?:vwsucursal;
  @ViewChild('codProd') codProdlement!: ElementRef;
  continuar:boolean;
  establecimientos:establecimientoModel[] = []
  constructor( 
    private serviceCaja: cajasServices,
    private newAbrirDialog: MatDialog,
    private documentoService: DocumentoService,
    private productoService: ProductoService,
    private _ServLogin: LoginService, 
    private dInicialServ: DatosInicialesService , private loading : loading
  ) {    
    console.clear();
          this.getUsuarioLogueado();
          this.serviceCaja.getEstablecimientosCompras().subscribe({next:value=>{
            if(value.numdata > 0 ){this.establecimientos = value.data}else{Swal.fire('error','No existen establecimientos disponibles','error')}
            
          },error:e=>Swal.fire('error',e.error.error,'error')})
          this.continuar =  true;
      
  }

  ngOnInit(): void {   
     this.getAsyncDocumentos();
    this.dInicialServ.currentVendedores.subscribe({next:value=>{
      this.empleados = value??[];
    }})
    
    this.dInicialServ.continueVenta.subscribe({next:(value)=>{
      this.continuar = value;
      CustomConsole.log('continuar',this.continuar);
      
    }})
    this.dInicialServ.currentSucursal.subscribe({next:(suc)=>{ 
       this.sucursal =  suc;
       PrinterManager.setSucursal(this.sucursal!);

    }})
  
  }

  getDatosContables(){
    this.serviceCaja.getCuentasContablesEstablecimientoUsuario().subscribe({next:(value:cajaRequest)=>{
      CustomConsole.log('getCuentasContablesEstablecimientoUsuario' , value)
      this.dInicialServ.validarCuentasContablesEstablecimiento(value.data[0] ) 
    }})
  }

  ngAfterViewInit(): void {
    if(this.documentoActivo!=null){
      setTimeout(() => {
        if (!this.continuar){this.getDatosContables();}
        
      }, 5000);
    }
  }
  getUsuarioLogueado(){
    this._ServLogin.getUsuarioLogeado().subscribe(
      {
        next:(request) => {
          CustomConsole.log('usuario logeado' , request);
          
          this.getMenuImage(request.usuario)
        } ,
        error: error=>{Swal.fire(this._ServLogin.getErrorMessage(error));} 
      }
    )
  }

  getMenuImage(usuario: Usuario) {
    let menuCard: RecursoDetalle[] = [];
    let menu = usuario.permisos; 
    CustomConsole.log( 'permisos usuario' , usuario, menu);

    let menuDetalleBtn =  usuario.permisos.filter(x=> x.nombre_recurso === "Punto de Venta" )
    CustomConsole.log( 'permisos usuario',  menuDetalleBtn[0].recursosHijos);
    menuDetalleBtn[0].recursosHijos!.forEach((recurso ) => { 

        switch (recurso.nombre_recurso.trim()) {
          case 'crear cotizacion':
            this.cotiza = true; 
            break;
          case 'crear libranza':
            this.libranza = true; 
            break;
          case 'pasar a otra caja':
            this.pasaAotraCaja = true;
            break;
          case 'plan separe':
            this.planSepare = true;
            break;
          case 'domicilio':
            this.domicilio = true;
            break; 
          case 'crearGastoPV':
            this.CrtGasto = true;
            break;
        }
       
    });

    return menuCard;
  }
 
  async getAsyncDocumentos() { 
    this.vueltas = true; 
    await this.documentoService.getDocumentosCompraBlanco().pipe(
      tap((datos: any) => {
        this.documentos = [];
        let documentoSeleccionado: DocumentosModel[] ;
        CustomConsole.log('getAsyncDocumentos recibido', datos); 
        if (datos.numdata > 0) { 
          this.documentos = datos.data.map((x:any)=>x.objeto)[0] ; 
          CustomConsole.log('getDocumentos_recuest getAsyncDocumentos', this.documentos ,this.documentos[0]);
          if (datos.numdata === 1) {
            this.documentoActivo = this.documentos[0];
          } else {
            documentoSeleccionado = this.documentos.filter((x: DocumentosModel) => x.estado == 1) ; 
          CustomConsole.log('documentoSeleccionado' , documentoSeleccionado);
            this.documentoActivo = (documentoSeleccionado.length > 0) ?  documentoSeleccionado[0] :  this.documentos[0]; 
          }  
          this.empleadoActivo = (this.empleados.filter(x=> x.id == this.documentoActivo?.cod_vendedor )[0])??[] 

          if(this.empleadoActivo.id == undefined){
            this.empleadoActivo.nombreCompleto =  this.documentoActivo?.vendedorNombre!;
            this.empleadoActivo.idPersona = this.documentoActivo?.cod_vendedor!;
        }
            
        } else {
          this.crearDocumento();
        }
        
      }),
      catchError((error: any) => {
        Swal.fire(JSON.stringify(error));
        return of(null); // Devuelve un observable vacío en caso de error
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire(JSON.stringify(error)),
      complete: () => CustomConsole.log('getDocumentos completo')
    });
  }
 
  
   getDocumentos() { 
      
    this.vueltas = true; 
     this.documentoService.getDocumentosCompraBlanco().pipe(
      tap((datos: any) => {
        CustomConsole.log('getDocumentosCompraBlanco', datos); 
        this.documentos = [];
        let documentoSeleccionado: DocumentosModel[] ; 

        if (datos.numdata > 0) {
          this.documentos = datos.data.map((x:any)=>x.objeto)[0];     
          if (this.documentos.length === 1) {
            this.documentoActivo = this.documentos[0];
          } else {
            documentoSeleccionado = this.documentos.filter((x: DocumentosModel) => x.estado == 1) ;  
            this.documentoActivo = (documentoSeleccionado.length > 0) ?  documentoSeleccionado[0] :  this.documentos[0]; 
          }
          this.empleadoActivo = (this.empleados.filter(x=> x.id == this.documentoActivo?.cod_vendedor )[0] )??[]
          if(this.empleadoActivo.id == undefined){
            this.empleadoActivo.nombreCompleto =  this.documentoActivo?.vendedorNombre!;
            this.empleadoActivo.idPersona = this.documentoActivo?.cod_vendedor!;
        }  
        } else {
          this.crearDocumento();
        }
        
      }),
      catchError((error: any) => {
        Swal.fire('error', error );
        return of(null); // Devuelve un observable vacío en caso de error
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire(JSON.stringify(error)),
      complete: () => CustomConsole.log('getDocumentos completo')
    });
  }
 

  crearDocumento() {
    this.loading.show();
    this.documentoService.crearDocumentoCompraEnBlanco(this.documentoActivo.establecimiento).pipe(
      tap((respuesta: any) => {
        CustomConsole.log('crearDocumento', respuesta); 
        if (respuesta.error === 'ok') {
          this.getDocumentos();
        } else {
          try {
            Swal.fire(respuesta.error, '', 'error');
           } catch (error : any) {
            Swal.fire('error en el servidor', '', 'error');
           }
        }
        this.loading.hide();
        
      }),
      catchError((error: any) => {
        this.loading.hide(); 
        try {
          Swal.fire(error.error.error, '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }
        return of(null);
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire(JSON.stringify(error)),
      complete: () => CustomConsole.log('crearDocumento completo')
    });
  }
  cambiarEstablecimientoDocumento(){
    this.productoService.updateDocumento(this.documentoActivo).subscribe({next:(value:DocumentoRequest)=>{
      if(value.error!= 'ok') {Swal.fire('error',value.error,'error')}
    },error:error=>Swal.fire(JSON.stringify(error))
    })
  }
  buscarProducto() { 
    CustomConsole.log('buscarProducto', this.codigoProducto); 
    if (this.codigoProducto.trim() !== '' ) {
      
      this.loading.show();
      this.productoService.getProductoByIdOrCodBarra(this.codigoProducto).subscribe({
        next:(value:ProductoRequest)=>{CustomConsole.log(value)
        if(value.numdata > 1 ){
          this.buscarClose = false;
          this.newAbrirDialog.open(BuscarProdDirectoComponent, { data: value.data })
          .afterClosed()
                .pipe(
                  tap((response: responsePrd) => {
                    if ((response.confirmado||false) && response.datoDevolucion !== undefined ) {  
                      let precioSinIva =parseFloat( (response.datoDevolucion.precioCompra! / (1+(response.datoDevolucion.porcent_iva! / 100))).toFixed(2))
                      let linea:DocumentoListado = {
                        orden: this.documentoActivo.orden,
                        idProducto:  ( typeof(response.datoDevolucion.id) == 'string')? response.datoDevolucion.id : response.datoDevolucion.id!.toString() ,
                        nombreProducto: `${response.datoDevolucion.nombre} | ${response.datoDevolucion.nombre2} | ${response.datoDevolucion.nombre3} ` ,
                        presioVenta: response.datoDevolucion.precioCompra!,
                        porcent_iva:  response.datoDevolucion.porcent_iva!,
                        presioSinIVa: precioSinIva,
                        IVA:  parseFloat( (response.datoDevolucion.precioCompra! - precioSinIva ).toFixed(2)),
                        cantidadVendida: 0,
                        descuento: 0,
                        tipoDescuento: 'porcentaje',
                        valorTotal: 0,
                        cant_real_descontada: 0,
                        cant_devuelta: 0,
                        estado_linea_venta: 'A'
                      }; 
                      this.editar(linea);
          
                    } else { 
                      this.codigoProducto = '';
                      
                    }
                  })
                ).subscribe({
                  next: () => {},
                  error: (error) => Swal.fire(JSON.stringify(error)),
                  complete: () => CustomConsole.log('busquedaAuxiliarProducto completo')
                });
   
          }else{
            let precioSinIva =parseFloat( (value.data[0].precioCompra! / (1+(value.data[0].porcent_iva! / 100))).toFixed(2))
            let linea:DocumentoListado = {
              orden: this.documentoActivo.orden,
              idProducto:  ( typeof(value.data[0].id) == 'string')? value.data[0].id : value.data[0].id!.toString() ,
              nombreProducto: `${value.data[0].nombre} | ${value.data[0].nombre2} | ${value.data[0].nombre3} ` ,
              presioVenta: value.data[0].precioCompra!,
              porcent_iva:  value.data[0].porcent_iva!,
              presioSinIVa: precioSinIva,
              IVA:  parseFloat( (value.data[0].precioCompra! - precioSinIva ).toFixed(2)),
              cantidadVendida: 0,
              descuento: 0,
              tipoDescuento: 'porcentaje',
              valorTotal: 0,
              cant_real_descontada: 0,
              cant_devuelta: 0,
              estado_linea_venta: 'A'
            }; 
            this.editar(linea); 
          }
        },
      error:error=>Swal.fire(JSON.stringify(error)),complete:()=>
        this.loading.hide() 
      })
     
    }
  }


  editar(linea: DocumentoListado){
    
    if(linea.id == undefined){
    let arrAux:any = this.documentoActivo.listado.find(x=>x.idProducto == linea.idProducto) 
      linea  = (arrAux == undefined)?linea:arrAux;
    }

    this.newAbrirDialog.open(ModalUpdateProductoCompraComponent, { data: {...linea} })
      .afterClosed()
      .pipe(
        tap((confirmado: Boolean) => {
          if (confirmado) { 
            this.getDocumentos();
          }
        })
      ).subscribe({
        next: () => {},
        error: (error) => Swal.fire(JSON.stringify(error)),
        complete: () => CustomConsole.log('editar linea completo')
      });
  }
  eliminarLinea(linea: DocumentoListado) {
    CustomConsole.log(linea);
    this.loading.show();
    this.productoService.devolverPrdCompra(linea).pipe(
      tap((respuesta: any) => {
        CustomConsole.log(JSON.stringify(respuesta));
        if (respuesta.error !== 'ok') { 
          try {
            Swal.fire(respuesta.error, '', 'error');
           } catch (error : any) {
            Swal.fire('error en el servidor', '', 'error');
           }
        } else {
          this.getDocumentos();
        }
        this.loading.hide();
      }),
      catchError((error: errorOdoo) => {
        CustomConsole.log(JSON.stringify(error)); 
        try {
          Swal.fire(error.error.error, '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }
        this.loading.hide();
        return of(null);
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire(JSON.stringify(error)),
      complete: () => CustomConsole.log('eliminarLinea completo')
    });
  }

  irbuscarProducto() {
    let activeTextarea = document.activeElement!.tagName; 
    CustomConsole.log('elemento==>',activeTextarea);
    if (activeTextarea.toUpperCase().indexOf('SELECT') < 0) {
       this.codProdlement.nativeElement.focus();
    }
  }

  irbuscarProductoObl() { 
    this.codProdlement.nativeElement.focus(); 
  }

  asignarPagosAVenta() {
    if (typeof(this.documentoActivo!.listado) === 'undefined' || this.documentoActivo!.listado.length === 0) { 
      Swal.fire('No posee elementos a facturar', 'Debe incluir minimo un producto o servicio en la factura', 'error');
      return;
    } 
    this.newAbrirDialog.open(PagosVentaComponent, { data: this.documentoActivo })
      .afterClosed()
      .pipe(
        tap((confirmado: {rep:boolean,credito:boolean}) => {
          if (confirmado.rep  ) { 
            if ( !confirmado.credito) { 
              this.facturarDocumento();
            }else{
             // this.documentoActivo 

             this.documentoService.getDocumentoActivo().subscribe({next:(value:DocumentoRequest)=>{
              CustomConsole.log('docuemento activo actual',value.data[0].objeto)
              this.documentoActivo = value.data[0].objeto
              this.empleadoActivo = (this.empleados.filter(x=> x.id == this.documentoActivo?.cod_vendedor )[0] )??[]
              if(this.empleadoActivo.id == undefined){
                this.empleadoActivo.nombreCompleto =  this.documentoActivo?.vendedorNombre!;
                this.empleadoActivo.idPersona = this.documentoActivo?.cod_vendedor!;
            }
              this.asignarPagosACuentaPorCobrar();
             }})



            }
          }
        })
      ).subscribe({
        next: () => {},
        error: (error) => Swal.fire(JSON.stringify(error)),
        complete: () => CustomConsole.log('asignarPagosAVenta completo')
      });
  }

  asignarPagosARemision() {
    if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
      return;
    }
    if (typeof(this.documentoActivo!.listado) === 'undefined' || this.documentoActivo!.listado.length === 0) { 
      Swal.fire('No posee elementos a facturar', 'Debe incluir minimo un producto o servicio en la factura', 'error');
      return;
    } 
    this.newAbrirDialog.open(PagosVentaComponent, { data: this.documentoActivo })
      .afterClosed()
      .pipe(
        tap((confirmado: {rep:boolean,credito:boolean}) => {
          if (confirmado.rep  ) { 
            if ( !confirmado.credito) { 
              this.facturarDocumentoRemision();
            }else{
             // this.documentoActivo 

             this.documentoService.getDocumentoActivo().subscribe({next:(value:DocumentoRequest)=>{
              CustomConsole.log('docuemento activo actual',value.data[0].objeto)
              this.documentoActivo = value.data[0].objeto
              this.empleadoActivo = (this.empleados.filter(x=> x.id == this.documentoActivo?.cod_vendedor )[0] )??[]
              if(this.empleadoActivo.id == undefined){
                this.empleadoActivo.nombreCompleto =  this.documentoActivo?.vendedorNombre!;
                this.empleadoActivo.idPersona = this.documentoActivo?.cod_vendedor!;
            }
              this.asignarPagosACuentaPorCobrarRemision();
             }})



            }
          }
        })
      ).subscribe({
        next: () => {},
        error: (error) => Swal.fire(JSON.stringify(error)),
        complete: () => CustomConsole.log('asignarPagosAVenta completo')
      });
  }

  generarAbonosCuentasXcobrar() { 
    if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
      return;
    } 
      if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
        return;
      }
      this.newAbrirDialog.open(FndClienteComponent,{ data: {  invoker:'cuentasPorCobrarVentas' } })
      .afterClosed()
      .pipe(
        tap((respuesta: BusquedaPersona)=>{
          if (respuesta.response) {  
            this.newAbrirDialog.open(AbonosCuentasXCobrarComponent, { data:respuesta.persona })
            .afterClosed()
            .pipe(
              tap((confirmado:  boolean ) => {
                if (confirmado) { this.getDocumentos(); }
              })
            ).subscribe({
              next: () => {},
              error: (error) => Swal.fire(JSON.stringify(error)),
              complete: () => CustomConsole.log('AbonosCuentasXCobrarComponent completo')
            });
        }
      })      ).subscribe({
        next: () => {},
        error: (error) => Swal.fire(JSON.stringify(error)),
        complete: () => CustomConsole.log('buscarCliente completo')
      });   
     
  

  
  }
  asignarPagosACuentaPorCobrar() {
    if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
      return;
    }
    if (typeof(this.documentoActivo!.listado) === 'undefined' || (
       this.documentoActivo!.listado !== undefined &&
      this.documentoActivo!.listado.length === 0) ){ 
      Swal.fire('No posee elementos a facturar', 'Debe incluir minimo un producto o servicio en la factura', 'error');
      return;
    } 
    if (typeof(this.documentoActivo!.cliente) === 'undefined' || this.documentoActivo!.clienteNombre == "CLIENTE GENERICO") { 
      this.buscarCliente();
      return;
    } 
    this.newAbrirDialog.open(GenerarCntPorPagarComponent, {   data:{ Documento:this.documentoActivo , origen:'venta'} })
      .afterClosed()
      .pipe(
        tap((confirmado:  {result : boolean , documento :  DocumentosModel }) => {
          if (confirmado.result) { 
          this.documentoRetorno = Object.assign(new DocumentosModel(), confirmado.documento); 
          CustomConsole.log('facturarDocumento =>>>>>', this.documentoRetorno);
          this.printer_factura_final();
          this.crearDocumento();
          }
        })
      ).subscribe({
        next: () => {},
        error: (error) => Swal.fire(JSON.stringify(error)),
        complete: () => CustomConsole.log('asignarPagosAVenta completo')
      });
  }
 asignarPagosACuentaPorCobrarRemision() {
    if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
      return;
    }
    if (typeof(this.documentoActivo!.listado) === 'undefined' || (
       this.documentoActivo!.listado !== undefined &&
      this.documentoActivo!.listado.length === 0) ){ 
      Swal.fire('No posee elementos a facturar', 'Debe incluir minimo un producto o servicio en la factura', 'error');
      return;
    } 
    if (typeof(this.documentoActivo!.cliente) === 'undefined' || this.documentoActivo!.clienteNombre == "CLIENTE GENERICO") { 
      Swal.fire('error en cliente', 'Debe incluir incluir al cliente', 'error');
      return;
    } 
    this.newAbrirDialog.open(GenerarCntPorCobrarComponent, { data:{ Documento:this.documentoActivo , origen:'remision'}
      
       })
      .afterClosed()
      .pipe(
        tap((confirmado:  {result : boolean , documento :  DocumentosModel }) => {
          if (confirmado.result) { 
          this.documentoRetorno = Object.assign(new DocumentosModel(), confirmado.documento); 
          CustomConsole.log('facturarDocumento =>>>>>', this.documentoRetorno);
          this.printer_factura_final();
          this.crearDocumento();
          }
        })
      ).subscribe({
        next: () => {},
        error: (error) => Swal.fire(JSON.stringify(error)),
        complete: () => CustomConsole.log('asignarPagosAVenta completo')
      });
  }


  facturarDocumento() {
    this.documentoActivo!.pagos = [];
    if (typeof(this.documentoActivo!.pagos) === 'undefined' || this.documentoActivo!.pagos.length === 0) {
      this.documentoActivo!.pagos[0] = new DocpagosModel();
      this.documentoActivo!.pagos[0].idDocumento = this.documentoActivo!.orden;
      try {
        this.documentoActivo!.pagos[0].idMedioDePago = this.pagos[this.indexEfectivo].idMedioDePago;
        this.documentoActivo!.pagos[0].referencia = 'Efectivo';
        this.documentoActivo!.pagos[0].valorPagado = this.pagos[this.indexEfectivo].valorPagado;
      } catch (error: any) {
        this.documentoActivo!.pagos[0].idMedioDePago = 1;
        this.documentoActivo!.pagos[0].referencia = 'Efectivo';
        this.documentoActivo!.pagos[0].valorPagado = this.documentoActivo!.valorTotal;
      }
    } else {
      CustomConsole.log(this.documentoActivo!.pagos);
    }
    if (this.documentoActivo!.listado!.length === 0) {
      let error = 'Debe ingresar los productos a facturar' ; 
      try {
        Swal.fire(error, '', 'error');
       } catch (error : any) {
        Swal.fire('error en el servidor', '', 'error');
       }
      return;
    }
    if (parseInt(this.documentoActivo!.totalFactura.toString()) === 0) { 
      try {
        Swal.fire('el total de la factura debe ser mayor a cero', '', 'error');
       } catch (error : any) {
        Swal.fire('error en el servidor', '', 'error');
       }
      return;
    }

    this.loading.show();
    this.documentoService.cerrarDocumento(this.documentoActivo!.orden).subscribe({next:(respuesta: DocumentoCierreRequest) => { 
      CustomConsole.log("respuesta cierre documento =>" , respuesta)
      if (respuesta.error === 'ok') {  
        this.documentoRetorno = Object.assign(new DocumentosModel(), respuesta.data.documentoFinal); 
        CustomConsole.log('facturarDocumento =>>>>>', this.documentoRetorno);
        this.printer_factura_final();
        this.crearDocumento();
      } else {
        try {
          Swal.fire(respuesta.error, '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }
      }
      this.loading.hide();
      
    }
      ,error: (error: any) => {
         
        try {
          Swal.fire(error.error.error, '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }},complete:()=>{CustomConsole.log('facturarDocumento completo');
            this.loading.hide()
         }
    })
  }

  facturarDocumentoRemision() {
    this.documentoActivo!.pagos = [];
    if (typeof(this.documentoActivo!.pagos) === 'undefined' || this.documentoActivo!.pagos.length === 0) {
      this.documentoActivo!.pagos[0] = new DocpagosModel();
      this.documentoActivo!.pagos[0].idDocumento = this.documentoActivo!.orden;
      try {
        this.documentoActivo!.pagos[0].idMedioDePago = this.pagos[this.indexEfectivo].idMedioDePago;
        this.documentoActivo!.pagos[0].referencia = 'Efectivo';
        this.documentoActivo!.pagos[0].valorPagado = this.pagos[this.indexEfectivo].valorPagado;
      } catch (error: any) {
        this.documentoActivo!.pagos[0].idMedioDePago = 1;
        this.documentoActivo!.pagos[0].referencia = 'Efectivo';
        this.documentoActivo!.pagos[0].valorPagado = this.documentoActivo!.valorTotal;
      }
    } else {
      CustomConsole.log(this.documentoActivo!.pagos);
    }
    if (this.documentoActivo!.listado!.length === 0) {
      let error = 'Debe ingresar los productos a facturar' ; 
      try {
        Swal.fire(error, '', 'error');
       } catch (error : any) {
        Swal.fire('error en el servidor', '', 'error');
       }
      return;
    }
    if (parseInt(this.documentoActivo!.totalFactura.toString()) === 0) { 
      try {
        Swal.fire('el total de la factura debe ser mayor a cero', '', 'error');
       } catch (error : any) {
        Swal.fire('error en el servidor', '', 'error');
       }
      return;
    }

    this.loading.show();
    this.documentoService.cerrarDocumentoRemision(this.documentoActivo!.orden).subscribe({next:(respuesta: DocumentoCierreRequest) => { 
      CustomConsole.log("respuesta cierre documento =>" , respuesta)
      if (respuesta.error === 'ok') {  
        this.documentoRetorno = Object.assign(new DocumentosModel(), respuesta.data.documentoFinal); 
        CustomConsole.log('facturarDocumento =>>>>>', this.documentoRetorno);
        this.printer_factura_final();
        this.crearDocumento();
      } else {
        try {
          Swal.fire(respuesta.error, '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }
      }
      this.loading.hide();
      
    }
      ,error: (error: any) => {
         
        try {
          Swal.fire(error.error.error, '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }},complete:()=>{CustomConsole.log('facturarDocumento completo');
            this.loading.hide()
         }
    })
  }
  cambiarVendedor(ven:EmpleadoModel){
    if(ven.idPersona != undefined && ven.idPersona > 0 ){
    this.documentoActivo!.cod_vendedor = (typeof(ven.id)== 'string' ) ? parseInt(ven.id): ven.id??0 ;
    this.documentoActivo!.vendedorNombre = ven.nombreCompleto??0 ;
    this.documentoService.cambiarVendedorDocumento(this.documentoActivo!.orden , ven).subscribe({next:value=>{
      CustomConsole.log('cambio empleado',value)
    }})
  }
  }
  cambiarDocumentoActivo(doc:DocumentosModel) {
    this.documentoActivo = doc;
    this.loading.show();
    this.documentoService.cambiarDocumentoCompra(this.documentoActivo!.orden).pipe(
      tap((respuesta: any) => {
        if (respuesta.error !== 'ok') {  
          try {
            Swal.fire(respuesta.error, '', 'error');
           } catch (error : any) {
            Swal.fire('error en el servidor', '', 'error');
           }
        } else {  
          this.empleadoActivo = (this.empleados.filter(x=> x.id == this.documentoActivo?.cod_vendedor )[0])??[] 

          if(this.empleadoActivo.id == undefined){
            this.empleadoActivo.nombreCompleto =  this.documentoActivo?.vendedorNombre!;
            this.empleadoActivo.idPersona = this.documentoActivo?.cod_vendedor!;
        }



          try {
            
          } catch (error: any) {
            Swal.fire('Error setting pagos', error);
          }
        }
        this.loading.hide();
        
      }),
      catchError((error: any) => {
        this.loading.hide();
        try {
          Swal.fire(error.error.error, '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }
        return of(null);
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire(JSON.stringify(error)),
      complete: () => CustomConsole.log('cambiarDocumentoActivo completo')
    });
  }

  cancelarDocumento() {
    this.loading.show();
    this.documentoService.cancelarDocumento(this.documentoActivo!.orden).pipe(
      tap((respuesta: any) => {
        if (respuesta.error === 'ok') {
          this.getDocumentos(); 
        } else {
          this.getDocumentos();
          try {
            Swal.fire(respuesta.error, '', 'error');
           } catch (error : any) {
            Swal.fire('error en el servidor', '', 'error');
           }
        }
        this.loading.hide();
        
      }),
      catchError((error: any) => {
        this.loading.hide();
        try {
          Swal.fire(error, '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }
        return of(null);
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire(JSON.stringify(error)),
      complete: () => CustomConsole.log('cancelarDocumento completo')
    });
  }
  crearCotizacion() {
    if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
      return;
    }
    this.loading.show();
    this.documentoService.convertirDocumentoEnCotizacion(this.documentoActivo!.orden).pipe(
      tap((respuesta: DocumentoCierreRequest) => {
        if (respuesta.error === 'ok') {
          this.documentoRetorno = Object.assign(new DocumentosModel(), respuesta.data.documentoFinal); 
          CustomConsole.log('facturarCotizacion =>>>>>', this.documentoRetorno);
          this.printer_factura_final();
          this.crearDocumento();
        } else {
          this.getDocumentos();
          try {
            Swal.fire(respuesta.error, '', 'error');
           } catch (error : any) {
            Swal.fire('error en el servidor', '', 'error');
           }
        }
        this.loading.hide();
        
      }),
      catchError((error: any) => {
        this.loading.hide();
        try {
          Swal.fire(error, '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }
        return of(null);
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire(JSON.stringify(error)),
      complete: () => CustomConsole.log('cancelarDocumento completo')
    });
  }
//generar factura domicilio
  generarEnvio() { 
    if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
      return;
    }
    if (this.documentoActivo!.totalFactura <= 0) { 
      
      Swal.fire('El valor en la factura debe ser mayor a cero', '', 'error');
      
      return;
    }
    if (this.documentoActivo!.cliente === 0) {
      this.newAbrirDialog.open(FndClienteComponent, { data: { docActivo : this.documentoActivo , invoker:'ventas' }})
        .afterClosed()
        .pipe(
          tap((confirmado: Boolean) => {
            this.generarDomicilio();
            this.buscarClose = true;
          })
        ).subscribe({
          next: () => {},
          error: (error) => Swal.fire(JSON.stringify(error)),
          complete: () => CustomConsole.log('generarEnvio completo')
        });   
    } else {
      this.generarDomicilio();
    }
  }
 generarLibranza(){
  if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
    return;
  }
 } 
  generarDomicilio() {
    this.loading.show();
    this.documentoService.generarDomicilioDocumento(this.documentoActivo!.orden).pipe(
      tap((respuesta: any) => {
        if (respuesta.error === 'ok') {
          this.getDocumentos(); 
        } else {
          this.getDocumentos();
          try {
            Swal.fire(respuesta.error, '', 'error');
           } catch (error : any) {
            Swal.fire('error en el servidor', '', 'error');
           }
        }
        this.loading.hide();
        
      }),
      catchError((error: any) => {
        this.loading.hide();
        try {
          Swal.fire(error.error.error, '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }
        return of(null);
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire(JSON.stringify(error)),
      complete: () => CustomConsole.log('generarDomicilio completo')
    });
  }
 
  generarGasto(){
    if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
      return;
    }
    this.newAbrirDialog.open(NewGastoComponent, { data: null })
    .afterClosed()
    .pipe(
      tap((response: {result : boolean , documento :  DocumentosModel } ) => {
        if (response.result) { 
             Swal.fire("ok" , "gasto generado con exito" , 'info')
             this.documentoRetorno = response.documento;
             this.printer_factura_final()  ;
        }})
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire(JSON.stringify(error)),
      complete: () => CustomConsole.log('busquedaAuxiliarProducto completo')
    });
  }
  busquedaAuxiliarProducto() { 
    if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
      return;
    }
    this.buscarClose = false;
    this.newAbrirDialog.open(BuscarProdDirectoComponent, { data: this.codigoProducto })
      .afterClosed()
      .pipe(
        tap((response: responsePrd) => {
          if ((response.confirmado||false) && response.datoDevolucion !== undefined ) {  
             let precioSinIva =parseFloat( (response.datoDevolucion.precioCompra! / (1+(response.datoDevolucion.porcent_iva! / 100))).toFixed(2))
            let linea:DocumentoListado = {
              orden: this.documentoActivo.orden,
              idProducto:  ( typeof(response.datoDevolucion.id) == 'string')? response.datoDevolucion.id : response.datoDevolucion.id!.toString() ,
              nombreProducto: `${response.datoDevolucion.nombre} | ${response.datoDevolucion.nombre2} | ${response.datoDevolucion.nombre3} ` ,
              presioVenta: response.datoDevolucion.precioCompra!,
              porcent_iva:  response.datoDevolucion.porcent_iva!,
              presioSinIVa: precioSinIva,
              IVA:  parseFloat( (response.datoDevolucion.precioCompra! - precioSinIva ).toFixed(2)),
              cantidadVendida: 0,
              descuento: 0,
              tipoDescuento: 'porcentaje',
              valorTotal: 0,
              cant_real_descontada: 0,
              cant_devuelta: 0,
              estado_linea_venta: 'A'
            }; 
            this.editar(linea);
 
          } else { 
            this.codigoProducto = '';
            
          }
        })
      ).subscribe({
        next: () => {},
        error: (error) => Swal.fire(JSON.stringify(error)),
        complete: () => CustomConsole.log('busquedaAuxiliarProducto completo')
      });
  }

  buscarCliente(){
    if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
      return;
    }
    this.newAbrirDialog.open(FndClienteComponent,{ data: { docActivo : this.documentoActivo , invoker:'compra' } })
    .afterClosed()
    .pipe(
      tap((confirmado: Boolean)=>{
        if (confirmado) { 
          this.getDocumentos();  
          this.codigoProducto = '';
          
          this.buscarClose = true;}
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire(JSON.stringify(error)),
      complete: () => CustomConsole.log('buscarCliente completo')
    });   
  }



  async printer_factura_final() {
    let doc = new DocumentosModel();
    doc = this.documentoRetorno;

    CustomConsole.log('documento retorno',doc,'sucursal ', this.sucursal); 
    let printM =  new PrinterManager(this.serviceCaja);;;
    printM.setDocumento(this.documentoRetorno);
    printM.printReceipt(false);
  }
}
