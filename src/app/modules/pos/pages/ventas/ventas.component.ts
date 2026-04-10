import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { loading } from 'src/app/models/app.loading'; 
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { DocumentoService } from 'src/app/services/documento.service';
import { MatDialog } from '@angular/material/dialog'; 
import { MoverDocumentosComponent } from '../../modals/mover-documentos/mover-documentos.component'; 
import { DocumentoListado } from 'src/app/interfaces/documento.interface';
import { ProductoService } from 'src/app/services/producto.service';
import { errorOdoo, responsePrd } from 'src/app/interfaces/odoo-prd';
import { MediosDePago } from 'src/app/interfaces/medios-de-pago.interface';
import { cajasServices } from 'src/app/services/Cajas.services';
import { DocpagosModel, pagosModel } from 'src/app/models/ventas/pagos.model';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { PagosVentaComponent } from '../../modals/pagos-venta/pagos-venta.component'; 
import { BuscarProdDirectoComponent } from '../../modals/buscar-prod-directo/buscar-prod-directo.component'; 
import { productoDocumento } from 'src/app/interfaces/clientes-odoo';
import { RecursoDetalle, Usuario } from 'src/app/interfaces/usuario.interface';
import { LoginService } from 'src/app/services/login.services';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs'; 
import Swal from 'sweetalert2';
import { IngresarProductoVentaComponent } from '../../modals/ingresar-producto-venta/ingresar-producto-venta.component';
import { DtoDocumentoProducto } from 'src/app/interfaces/dto-documento-producto';
import { cajaRequest } from 'src/app/interfaces/producto-request';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { vwsucursal } from 'src/app/models/app.db.interfaces';
import { NewGastoComponent } from '../../modals/new-gasto/new-gasto.component';
import { PrinterManager } from 'src/app/models/printerManager';  
import { BusquedaPersona } from 'src/app/interfaces/busqueda-persona';
import { FndClienteComponent } from 'src/app/modules/shared/modals/fnd-cliente/fnd-cliente.component';
import { AbonosCuentasXCobrarComponent } from '../../modals/abonos-cuentas-xcobrar/abonos-cuentas-xcobrar.component';
import { GenerarCntPorCobrarComponent } from '../../modals/generar-cnt-por-cobrar/generar-cnt-por-cobrar.component';
import { EmpleadoModel } from 'src/app/models/empleados/empleados.module';
import { ModalUpdateProductoVentaComponent } from '../../modals/ModalUpdateProductoVenta/ModalUpdateProductoVenta.component';
import { IngresoServicioVehiculoComponent } from '../../modals/ingreso_servicio_vehiculos/ingreso.component';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { DocumentoActionPayload, DocumentoMutationPayload, DocumentoRecordsPayload } from 'src/app/services/documento.service';
import { InventarioProductResponse, InventarioReturnResponse } from 'src/app/interfaces/inventario-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
import { ModuleBannerService } from 'src/app/services/module-banner.service';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements AfterViewInit, OnInit, OnDestroy {

  cotiza = false; 
  libranza = false; 
  pasaAotraCaja = false;
  planSepare = false;
  CrtGasto = false;
  domicilio = false;
  ingresoServicio = false;
  showQuickActions = false;
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
  documentoActivo:DocumentosModel | null = null;
  empleadoActivo:EmpleadoModel  = new EmpleadoModel();
  documentoRetorno: DocumentosModel = new DocumentosModel();
  documentoSeleccionadoActivo: DocumentosModel = new DocumentosModel(); 
  sucursal?:vwsucursal;
  @ViewChild('codProd') codProdlement!: ElementRef;
  continuar:boolean;

  constructor(
    public loading: loading, 
    private serviceCaja: cajasServices,
    private newAbrirDialog: MatDialog,
    private documentoService: DocumentoService,
    private productoService: ProductoService,
    private _ServLogin: LoginService, 
    private _Router : Router,
    private dInicialServ: DatosInicialesService,
    private moduleBannerService: ModuleBannerService
  ) {    
          this.getUsuarioLogueado();
          this.continuar =  true;

      
  }

  ngOnInit(): void {   
    this.dInicialServ.getParametroValidarExistencia().subscribe({next:value=>{
      CustomConsole.log('validar existencia en venta', value ); 
      this.dInicialServ.setParametroExistencia(value.data.records[0]);
    }});
    this.dInicialServ.currentVendedores.subscribe({next:value=>{
      this.empleados = value??[];
    }}); 
    this.dInicialServ.continueVenta.subscribe({next:(value)=>{
      this.continuar = value;
      CustomConsole.log('continuar => continueVenta',this.continuar);

      if ( this.continuar ){
        
        this.serviceCaja.getCajasActivasUsuarioActivo().subscribe({next:(value: ApiResponse<{ records: cajaModel[]; count: number }>)=>{
          CustomConsole.log('CAJA USUARIO LOGUEADO',JSON.stringify(value))
          if(value.data.count > 0 ){
            this.getMediosP();
            this.getAsyncDocumentos();
          }else{
            //home/pos/abrir
            this._Router.navigate(['home','pos','abrir']);
          }
        },error:e=>Swal.fire(JSON.stringify(e))})
      
      }
      else{
        
        this.serviceCaja.getCajasActivasUsuarioActivo().subscribe({next:(value: ApiResponse<{ records: cajaModel[]; count: number }>)=>{
          CustomConsole.log('CAJA USUARIO LOGUEADO',JSON.stringify(value))
          if(value.data.count <= 0 ){  
            this._Router.navigate(['home','pos','abrir']);
          }
        },error:e=>Swal.fire(JSON.stringify(e))})
      }
      
    }})
    this.dInicialServ.currentSucursal.subscribe({next:(suc)=>{ 
       this.sucursal =  suc;
       PrinterManager.setSucursal(this.sucursal!);

    }})
  
  }

  ngOnDestroy(): void {
    this.moduleBannerService.clear();
  }

  toggleQuickActions() {
    this.showQuickActions = !this.showQuickActions;
  }

  closeQuickActions() {
    this.showQuickActions = false;
  }

  private syncModuleBanner() {
    this.moduleBannerService.setTitle('Punto de venta', {
      helpText: 'Administra el documento activo, agrega productos y cierra la venta sin salir del flujo operativo.',
      meta: [
        { label: 'Establecimiento', value: this.documentoActivo?.nombreEsta || '-' },
        { label: 'Caja activa', value: this.documentoActivo?.nombreCaja || '-' }
      ]
    });
  }

  getDatosContables(){
    this.serviceCaja.getCuentasContablesEstablecimientoUsuario().subscribe({next:(value:ApiResponse<{ records: cajaModel[]; count: number }>)=>{
      CustomConsole.log('getCuentasContablesEstablecimientoUsuario' , value)
      this.dInicialServ.validarCuentasContablesEstablecimiento(value.data.records[0] ) 
    }})
  }

  ngAfterViewInit(): void {
    if(this.documentoActivo!=null){
      setTimeout(() => {
        if (!this.continuar){this.getDatosContables();}
        this.irbuscarProducto();
      }, 5000);
    }
  }
  getUsuarioLogueado(){
    this._ServLogin.getUsuarioLogeado().subscribe(
      {
        next:(request) => {
          this.getMenuImage(request.usuario)
        } ,
        error: error=>{Swal.fire('Error getUsuarioLogeado', this._ServLogin.getErrorMessage(error) ) ;} 
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
         case 'ingresoServicio':
            this.ingresoServicio = true;
            break; 
          case 'crearGastoPV':
            this.CrtGasto = true;
            break;
        }
       
    });

    return menuCard;
  }

  async getAsyncDocumentos() { 
    this.loading.show();
    await this.documentoService.getDocumentosCaja().subscribe({
      next:(response: ApiResponse<DocumentoRecordsPayload>) => {
        this.documentos = [];
        let documentoSeleccionado: DocumentosModel[] ;
        CustomConsole.log('getDocumentos', response.data.count); 
        if (response.data.count > 0) {
          this.documentos = response.data.records ; 
          CustomConsole.log('getDocumentos_recuest', this.documentos);
          if (response.data.count === 1) {
            this.documentoActivo = response.data.records[0];
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
          this.asignarMediosDePagoValoresIniciales();  
          this.syncModuleBanner();
        } else {
          this.crearDocumento();
        }
        this.loading.hide();
      },
      error: (error) =>{ Swal.fire('getAsyncDocumentos - Error:', this.documentoService.getErrorMessage(error) ) ;  this.loading.hide();},
      complete: () =>this.loading.hide()
    });
  }

  
   getDocumentos() {  
    this.loading.show();
     this.documentoService.getDocumentosCaja().subscribe({
      next: (response: ApiResponse<DocumentoRecordsPayload>) => 
        {
        this.documentos = [];
        let documentoSeleccionado: DocumentosModel[] ;
        CustomConsole.log('getDocumentos', response.data.count);
        CustomConsole.log('getDocumentos_recuest', response);

        if (response.data.count > 0) {
          this.documentos = response.data.records ; 
          CustomConsole.log('getDocumentos_recuest', this.documentos);
          if (response.data.count === 1) {
            this.documentoActivo = response.data.records[0];
          } else {
            documentoSeleccionado = this.documentos.filter((x: DocumentosModel) => x.estado == 1) ; 
          CustomConsole.log('documentoSeleccionado' , documentoSeleccionado);
            this.documentoActivo = (documentoSeleccionado.length > 0) ?  documentoSeleccionado[0] :  this.documentos[0]; 
          }
          this.empleadoActivo = (this.empleados.filter(x=> x.id == this.documentoActivo?.cod_vendedor )[0] )??[]
          if(this.empleadoActivo.id == undefined){
            this.empleadoActivo.nombreCompleto =  this.documentoActivo?.vendedorNombre!;
            this.empleadoActivo.idPersona = this.documentoActivo?.cod_vendedor!;
        }
          this.asignarMediosDePagoValoresIniciales(); 
          this.syncModuleBanner();
          
          this.irbuscarProducto();
        } else {
          this.crearDocumento();
        }
        
      },
      error: (error) => {Swal.fire('getDocumentos - Error:', this.documentoService.getErrorMessage(error) ) ;
        this.loading.hide();},
      complete: () =>
        this.loading.hide() 
    });
  }

  asignarMediosDePagoValoresIniciales(){

    this.MedioP = this.MedioPInicial.map(x=>x);
    CustomConsole.log('documentoActivo' , this.documentoActivo); 
          if (this.documentoActivo!.pagos === undefined ){
            this.documentoActivo!.pagos = this.MedioP.map((value: any , index) => {
              let valorPago = 0;
               if (value.nombre.toUpperCase() == 'EFECTIVO'){
                 valorPago = this.documentoActivo!.totalFactura
               }
                let auxpago:DocpagosModel = {
                  idDocumento: this.documentoActivo!.orden,
                  idMedioDePago: value.id,
                  valorPagado: valorPago,
                  valorTotalAPagar: valorPago,
                  valorRecibido: valorPago,
                  vueltos: 0,
                  referencia: '' , refDoc : '',
                  soloLectura : false,
                } ; 
              return auxpago;
            })
          } 
           let docPagos:DocpagosModel[]  = (this.documentoActivo!.pagos !== undefined )?[...this.documentoActivo!.pagos] : [] ; 
                      CustomConsole.log("asignar pagos" , docPagos)
           this.MedioP.forEach(medio => {
           CustomConsole.log(medio.id);
            const pago:DocpagosModel[] = docPagos.filter((p: DocpagosModel) => p.idMedioDePago == medio.id)!;
            let sum = pago ? pago.reduce((total, p) => total + p.valorPagado, 0) : 0;
            CustomConsole.log('get pagos iteracion ' , pago )
           
              medio.valor_aux = sum ;
            
          }); 

            this.pagos = this.documentoActivo!.pagos!;
            CustomConsole.log('pagos factura', this.pagos,'medios de pagos ', this.MedioP);




  }

  crearDocumento() {
    this.loading.show();
    this.documentoService.crearDocumento().pipe(
      tap((response: ApiResponse<DocumentoMutationPayload>) => {
        const respuesta = response.data;
        CustomConsole.log('crearDocumento', respuesta); 
        if (response.ok) {
          this.getDocumentos();
        } else {
          Swal.fire('error en el servidor', '', 'error');
        }
        this.loading.hide();
        this.irbuscarProducto();
      }),
      catchError((error: any) => {
        this.loading.hide(); 
        Swal.fire(this.documentoService.getErrorMessage(error), '', 'error');
        return of(null);
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire( JSON.stringify(error) ) ,
      complete: () => CustomConsole.log('crearDocumento completo')
    });
  }

  buscarProducto() { 
    CustomConsole.log('buscarProducto', this.codigoProducto);
    let dataAuxEnvio: productoDocumento = {
      'idproducto': this.codigoProducto,
      'documento': this.documentoActivo!
    }; 
    if (this.codigoProducto.trim() !== '' ) {
      
      this.loading.show();
      this.productoService.getProductoByIdOrCodBarra(this.codigoProducto).subscribe({
        next:(value)=>{CustomConsole.log(value)
          if(value.data.count > 0 ){
          if(value.data.count > 1 ){
            this.buscarClose = false;
            this.newAbrirDialog.open(BuscarProdDirectoComponent, { data: value.data.products })
            .afterClosed()
                  .pipe(
                    tap((response: responsePrd) => {
                      if ((response.confirmado||false) && response.datoDevolucion !== undefined ) {  

                        let datoAsignacion:DtoDocumentoProducto = {
                          'producto': response.datoDevolucion   ,
                           'documento':this.documentoActivo!
                         } 

                         this.newAbrirDialog.open(IngresarProductoVentaComponent, { data:  datoAsignacion })
                         .afterClosed()
                         .pipe(
                           tap((confirmado: Boolean) => {
                             if (confirmado) { 
                               this.getDocumentos();
                             }
                           })
                         ).subscribe({
                           next: () => {},
                           error: (error) => Swal.fire( JSON.stringify(error) ) ,
                           complete: () => CustomConsole.log('moverDocumentoCaja completo')
                         }); 

            
                      } else { 
                        this.codigoProducto = '';
                        
                      }
                    })
                  ).subscribe({
                    next: () => {},
                    error: (error) => Swal.fire( JSON.stringify(error) ) ,
                    complete: () => CustomConsole.log('busquedaAuxiliarProducto completo')
                  });
     
            }else{
          let datoAsignacion:DtoDocumentoProducto = {
            'producto': value.data.products[0]    ,
             'documento':this.documentoActivo!
           }
           this.newAbrirDialog.open(IngresarProductoVentaComponent, { data:  datoAsignacion })
           .afterClosed()
           .pipe(
             tap((confirmado: Boolean) => {
               if (confirmado) { 
                 this.getDocumentos();
               }
             })
           ).subscribe({
             next: () => {},
             error: (error) => Swal.fire( JSON.stringify(error) ) ,
             complete: () => CustomConsole.log('moverDocumentoCaja completo')
           }); 
          } 
        }else{
          Swal.fire('No existen datos con el codigo ' + this.codigoProducto )
        }
      },
      error:error=>Swal.fire(error),complete:()=>
        this.loading.hide() 
      })
     
    }
  }

  moverDocumentoCaja() {
    this.newAbrirDialog.open(MoverDocumentosComponent, { data: this.documentoActivo })
      .afterClosed()
      .pipe(
        tap((confirmado: Boolean) => {
          if (confirmado) { 
            this.getDocumentos();
          }
        })
      ).subscribe({
        next: () => {},
        error: (error) => Swal.fire( JSON.stringify(error) ) ,
        complete: () => CustomConsole.log('moverDocumentoCaja completo')
      });
  }
  editar(linea: DocumentoListado){
    
    this.newAbrirDialog.open(ModalUpdateProductoVentaComponent, { data: {...linea} })
      .afterClosed()
      .pipe(
        tap((confirmado: Boolean) => {
          if (confirmado) { 
            this.getDocumentos();
          }
        })
      ).subscribe({
        next: () => {},
        error: (error) => Swal.fire( JSON.stringify(error) ) ,
        complete: () => CustomConsole.log('editar linea completo')
      });
  }
  eliminarLinea(linea: DocumentoListado) {
    CustomConsole.log(linea);
    this.loading.show();
    this.productoService.devolverPrdCompra(linea).pipe(
      tap((respuesta: InventarioReturnResponse) => {
        CustomConsole.log(JSON.stringify(respuesta));
        if (!respuesta.ok) { 
          try {
            Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
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
      error: (error) => Swal.fire( JSON.stringify(error) ) ,
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

             this.documentoService.getDocumentoActivo().subscribe({next:(value:ApiResponse<GenericRecordsPayload<DocumentosModel>>)=>{
              if (!value.ok || value.data.count === 0) { return; }
              CustomConsole.log('docuemento activo actual',value.data.records[0])
              this.documentoActivo = value.data.records[0]
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
        error: (error) => Swal.fire( JSON.stringify(error) ) ,
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

             this.documentoService.getDocumentoActivo().subscribe({next:(value:ApiResponse<GenericRecordsPayload<DocumentosModel>>)=>{
              if (!value.ok || value.data.count === 0) { return; }
              CustomConsole.log('docuemento activo actual',value.data.records[0])
              this.documentoActivo = value.data.records[0]
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
        error: (error) => Swal.fire( JSON.stringify(error) ) ,
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
              error: (error) => Swal.fire( JSON.stringify(error) ) ,
              complete: () => CustomConsole.log('AbonosCuentasXCobrarComponent completo')
            });
        }
      })      ).subscribe({
        next: () => {},
        error: (error) => Swal.fire( JSON.stringify(error) ) ,
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
      Swal.fire('error en cliente', 'Debe incluir incluir al cliente', 'error');
      return;
    } 
    this.newAbrirDialog.open(GenerarCntPorCobrarComponent, {   data:{ Documento:this.documentoActivo , origen:'venta'} })
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
        error: (error) => Swal.fire( JSON.stringify(error) ) ,
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
        error: (error) => Swal.fire( JSON.stringify(error) ) ,
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
    this.documentoService.cerrarDocumento(this.documentoActivo!.orden).subscribe({next:(respuesta: ApiResponse<DocumentoActionPayload>) => {
      console.clear();
      CustomConsole.log("respuesta cierre documento =>" , respuesta)
      if (respuesta.ok && respuesta.data.documentoFinal) {  
        this.documentoRetorno = Object.assign(new DocumentosModel(), respuesta.data.documentoFinal); 
        CustomConsole.log('facturarDocumento =>>>>>', this.documentoRetorno);
        this.printer_factura_final();
        this.crearDocumento();
      } else {
        try {
          Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }
      }
      this.loading.hide();
      this.irbuscarProducto();
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
    this.documentoService.cerrarDocumentoRemision(this.documentoActivo!.orden).subscribe({next:(respuesta: ApiResponse<DocumentoActionPayload>) => {
      //console.clear();
      CustomConsole.log("respuesta cierre documento =>" , respuesta)
      if (respuesta.ok && respuesta.data.documentoFinal) {  
        this.documentoRetorno = Object.assign(new DocumentosModel(), respuesta.data.documentoFinal); 
        CustomConsole.log('facturarDocumento =>>>>>', this.documentoRetorno);
        this.printer_factura_final();
        this.crearDocumento();
      } else {
        try {
          Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }
      }
      this.loading.hide();
      this.irbuscarProducto();
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
    this.documentoService.cambiarDocumento(this.documentoActivo!.orden).pipe(
      tap((response: ApiResponse<{ message: string; documentId: number }>) => {
        if (!response.ok) {  
          Swal.fire('error en el servidor', '', 'error');
        } else {  
          this.empleadoActivo = (this.empleados.filter(x=> x.id == this.documentoActivo?.cod_vendedor )[0])??[] 

          if(this.empleadoActivo.id == undefined){
            this.empleadoActivo.nombreCompleto =  this.documentoActivo?.vendedorNombre!;
            this.empleadoActivo.idPersona = this.documentoActivo?.cod_vendedor!;
        }



          try {
            this.asignarMediosDePagoValoresIniciales();
            this.syncModuleBanner();
          } catch (error: any) {
            Swal.fire('Error setting pagos', JSON.stringify(error) ) ;
          }
        }
        this.loading.hide();
        this.irbuscarProducto();
      }),
      catchError((error: any) => {
        this.loading.hide();
        Swal.fire(this.documentoService.getErrorMessage(error), '', 'error');
        return of(null);
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire( JSON.stringify(error) ) ,
      complete: () => CustomConsole.log('cambiarDocumentoActivo completo')
    });
  }

  cancelarDocumento() {
    this.loading.show();
    this.documentoService.cancelarDocumento(this.documentoActivo!.orden).pipe(
      tap((respuesta: ApiResponse<DocumentoActionPayload>) => {
        if (respuesta.ok) {
          this.getDocumentos(); 
        } else {
          this.getDocumentos();
          try {
            Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
           } catch (error : any) {
            Swal.fire('error en el servidor', '', 'error');
           }
        }
        this.loading.hide();
        this.irbuscarProducto();
      }),
      catchError((error: any) => {
        this.loading.hide();
        try {
          Swal.fire(this.documentoService.getErrorMessage(error), '', 'error');
         } catch (error : any) {
          Swal.fire('error en el servidor', '', 'error');
         }
        return of(null);
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire( JSON.stringify(error) ) ,
      complete: () => CustomConsole.log('cancelarDocumento completo')
    });
  }
  crearCotizacion() {
    if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
      return;
    }
    this.loading.show();
    this.documentoService.convertirDocumentoEnCotizacion(this.documentoActivo!.orden).pipe(
      tap((respuesta: ApiResponse<DocumentoActionPayload>) => {
        if (respuesta.ok && respuesta.data.documentoFinal) {
          this.documentoRetorno = Object.assign(new DocumentosModel(), respuesta.data.documentoFinal); 
          CustomConsole.log('facturarCotizacion =>>>>>', this.documentoRetorno);
          this.printer_factura_final();
          this.crearDocumento();
        } else {
          this.getDocumentos();
          try {
            Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
           } catch (error : any) {
            Swal.fire('error en el servidor', '', 'error');
           }
        }
        this.loading.hide();
        this.irbuscarProducto();
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
      error: (error) => Swal.fire( JSON.stringify(error) ) ,
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
    if (typeof(this.documentoActivo!.cliente) === 'undefined' || this.documentoActivo!.clienteNombre == "CLIENTE GENERICO") {
      this.newAbrirDialog.open(FndClienteComponent, { data: { docActivo : this.documentoActivo , invoker:'ventas' }})
        .afterClosed()
        .pipe(
          tap((confirmado: Boolean) => {
            this.generarDomicilio();
            this.buscarClose = true;
          })
        ).subscribe({
          next: () => {},
          error: (error) => Swal.fire( JSON.stringify(error) ) ,
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
      tap((respuesta: ApiResponse<DocumentoActionPayload>) => {
        if (respuesta.ok) {
          this.getDocumentos(); 
        } else {
          this.getDocumentos();
          try {
            Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
           } catch (error : any) {
            Swal.fire('error en el servidor', '', 'error');
           }
        }
        this.loading.hide();
        this.irbuscarProducto();
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
      error: (error) => Swal.fire( JSON.stringify(error) ) ,
      complete: () => CustomConsole.log('generarDomicilio completo')
    });
  }

  getMediosP() { 
    this.loading.show();
    this.serviceCaja.getMediosCajaActiva().pipe(
      tap((datos: any) => {
        if (datos.ok && datos.data.count > 0) { 
          this.MedioP = datos.data.records ;
          this.MedioPInicial = datos.data.records ;
          this.getDocumentos();
        } else {
          this.MedioP = [];
          Swal.fire('error en el servidor', 'No hay medios de pago disponible', 'error');    
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
      error: (error) => Swal.fire( JSON.stringify(error) ) ,
      complete: () => CustomConsole.log('getMediosP completo')
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
      error: (error) => Swal.fire( JSON.stringify(error) ) ,
      complete: () => CustomConsole.log('busquedaAuxiliarProducto completo')
    });
  }
  busquedaAuxiliarProducto() { 
    if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
      return;
    }
    this.buscarClose = false;
    this.newAbrirDialog.open(BuscarProdDirectoComponent, { data: undefined })
      .afterClosed()
      .pipe(
        tap((response: responsePrd) => {
          if (response.confirmado && response.datoDevolucion !== undefined ) { 

            let datoAsignacion:DtoDocumentoProducto = {
             'producto': response.datoDevolucion    ,
              'documento':this.documentoActivo!
            }
            this.newAbrirDialog.open(IngresarProductoVentaComponent, { data:  datoAsignacion })
            .afterClosed()
            .pipe(
              tap((confirmado: Boolean) => {
                if (confirmado) { 
                  this.getDocumentos();
                }
              })
            ).subscribe({
              next: () => {},
              error: (error) => Swal.fire( JSON.stringify(error) ) ,
              complete: () => CustomConsole.log('moverDocumentoCaja completo')
            });  
          } else { 
            this.codigoProducto = '';
            this.irbuscarProducto();
          }
        })
      ).subscribe({
        next: () => {},
        error: (error) => Swal.fire( JSON.stringify(error) ) ,
        complete: () => CustomConsole.log('busquedaAuxiliarProducto completo')
      });
  }

  buscarCliente(){
    if (this.documentoActivo?.campo_info_5 != undefined && this.documentoActivo?.campo_info_5 == 'NO_FACTURABLE'){
      return;
    }
    this.newAbrirDialog.open(FndClienteComponent,{ data: { docActivo : this.documentoActivo , invoker:'ventas' } })
    .afterClosed()
    .pipe(
      tap((confirmado: Boolean)=>{
        if (confirmado) { 
          this.getDocumentos();  
          this.codigoProducto = '';
          this.irbuscarProducto();
          this.buscarClose = true;}
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire( JSON.stringify(error) ) ,
      complete: () => CustomConsole.log('buscarCliente completo')
    });   
  }

  ingresarServicio(){ 
    CustomConsole.log('documentoActivo- ingresarServicio' ,  this.documentoActivo);
    
    this.newAbrirDialog.open(IngresoServicioVehiculoComponent,{ data: this.documentoActivo?.caja})
    .afterClosed()
    .pipe(
      tap((confirmado: Boolean)=>{
        if (confirmado) { 
          this.getDocumentos();  
          this.codigoProducto = '';
          this.irbuscarProducto();
          this.buscarClose = true;}
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire( JSON.stringify(error) ) ,
      complete: () => CustomConsole.log('buscarCliente completo')
    });   
  }


  async printer_factura_final() {
    let doc = new DocumentosModel();
    doc = this.documentoRetorno;

    CustomConsole.log('documento retorno',doc,'sucursal ', this.sucursal); 
    let printM =  new PrinterManager(this.serviceCaja);;;
    printM.setDocumento(this.documentoRetorno);
    printM.printReceipt();
  }
}
