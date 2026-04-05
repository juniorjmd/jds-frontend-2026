import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; 
import { MediosDePago } from 'src/app/interfaces/medios-de-pago.interface';
import { loading } from 'src/app/models/app.loading'; 
import { CustomConsole } from 'src/app/models/CustomConsole';
import { arrRetorno, documentoDev, } from 'src/app/models/ventas/documento.model';
import { DocpagosModel  } from 'src/app/models/ventas/pagos.model';
import { cajasServices } from 'src/app/services/Cajas.services'; 
import { DocumentoActionPayload, DocumentoService } from 'src/app/services/documento.service';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pagos-venta',
  templateUrl: './pagos-saldo-notas-debito.component.html',
  styleUrls: ['./pagos-saldo-notas-debito.component.css']
})
export class pagosSaldoNotasDebitoComponent implements OnInit {
  pagos:DocpagosModel[] = [];
  indexEfectivo:number = 0;
  MedioP:MediosDePago[]= [];
  listo:boolean = false;
  constructor(
    public loading : loading,private serviceCaja : cajasServices , private documentoService: DocumentoService ,
    public dialogo: MatDialogRef<pagosSaldoNotasDebitoComponent>,
    @Inject(MAT_DIALOG_DATA) public Documento:documentoDev

  ) { 
    
    console.clear();
    CustomConsole.log('datos recibidos modal pagosSaldoNotasDebitoComponent' , this.Documento);
    
    this.getMediosP()}

  ngOnInit(): void {
  }
  adicionarOtroBono(id:number){
    this.pagos[id]
    let pago = {...this.pagos[id]}
    pago.valorPagado = 0;
    pago.referencia = '';

    this.pagos.push(pago)
  } 
  finalizarOk(){ 

    this.Documento.payReturn = this.pagos.map (x=>{let prd:arrRetorno = {
      id: x.idMedioDePago!,
      cnt: x.valorPagado 
    } ; 
    return prd;}).filter(x=> x.cnt > 0 ) ;  

      this.documentoService.crearNotaDebito(this.Documento).subscribe({next:(value:ApiResponse<DocumentoActionPayload>)=>{
        CustomConsole.log('crearNotaDebito',value);   
        if (!value.ok || !value.data.documentoFinal) {
          Swal.fire('error', value.error?.message ?? 'Error interno del servidor', 'error');
          return;
        }
       this.dialogo.close({rep:true,documento:value.data.documentoFinal });
  
       },error:error=>Swal.fire(error.error.error)})
  } 
  
  cancelar(){
    this.dialogo.close(false);
  }
  cambioDeValor( index:number){
    if (this.pagos[index].valorPagado <= this.pagos[this.indexEfectivo].valorPagado){
      this.pagos[this.indexEfectivo].valorPagado = this.pagos[this.indexEfectivo].valorPagado -this.pagos[index].valorPagado ;
    }else{
      this.pagos[index].valorPagado = 0;
    }
    this.pagos[this.indexEfectivo].valorPagado = this.Documento.exedente;
    this.pagos!.forEach((dato:DocpagosModel , index : number )=>{
      if (index !== this.indexEfectivo)
      this.pagos[this.indexEfectivo].valorPagado -= dato.valorPagado;
    })
    this.pagos[this.indexEfectivo].valorRecibido = this.pagos[this.indexEfectivo].valorPagado;
    this.pagos[this.indexEfectivo].vueltos = 0; 

  }
setVueltos(index:number){
  if(this.pagos[index].valorPagado > this.pagos[index].valorRecibido  ) {
    this.pagos[index].valorRecibido = this.pagos[index].valorPagado;
    this.pagos[index].vueltos = 0; 
  }else{
   
    this.pagos[index].vueltos = this.pagos[index].valorRecibido - this.pagos[index].valorPagado;
  } 
  
 
}
getMediosP(){ 
  CustomConsole.log('DocumentoActivo',this.Documento)
  this.listo = false;
  this.loading.show()
  this.serviceCaja.getMediosByEstablecimiento(this.Documento.idEsta)
     .subscribe( {next:(datos:ApiResponse<GenericRecordsPayload<MediosDePago>>)=>{
         CustomConsole.log('getMediosCajaActiva',datos);
      if (datos.ok && datos.data.count > 0 ){ 
        this.pagos = []; 
         
      CustomConsole.log('pagos recibidos' , this.pagos);
      
        datos.data.records.forEach((dato:MediosDePago )=>{  
         let pago = new DocpagosModel();  
         pago.idMedioDePago = dato.id;
          pago.nombreMedio =dato.nombre;
          pago.valorPagado = 0;
          pago.valorRecibido = 0;
          pago.vueltos = 0; 
          pago.valorTotalAPagar = 0; 
          this.pagos.push(pago)
        })  
      this.indexEfectivo =  this.pagos.findIndex(pago => pago.nombreMedio!.toUpperCase() === 'EFECTIVO'); 
        this.pagos[this.indexEfectivo].valorPagado = this.Documento.exedente ;
        this.pagos[this.indexEfectivo].referencia = 'efectivo';
    }else{
      this.pagos = [];
    } 
    CustomConsole.log('pagos realizados' , this.pagos ); 
        this.loading.hide()
        this.listo = true;
      } ,
      error: (error) => {this.loading.hide();
        alert( error.error.error);
      }}
      );
  }
}
