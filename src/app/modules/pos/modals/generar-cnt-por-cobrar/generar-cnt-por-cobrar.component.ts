import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MediosDePago } from 'src/app/interfaces/medios-de-pago.interface';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { DocpagosModel } from 'src/app/models/ventas/pagos.model';
import { cajasServices } from 'src/app/services/Cajas.services'; 
import { loading } from 'src/app/models/app.loading'; 
import { DocumentoCierreRequest } from 'src/app/interfaces/producto-request';
import Swal from 'sweetalert2';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'modal-generar-cnt-por-cobrar',
  templateUrl: './generar-cnt-por-cobrar.component.html',
  styleUrls: ['./generar-cnt-por-cobrar.component.css']
})
export class GenerarCntPorCobrarComponent implements OnInit {
  pagoPorCredito:DocpagosModel= new DocpagosModel();
  pagos:DocpagosModel[] = [];
  indexEfectivo:number = 0; 
  listo:boolean  ;
  retorno : {result : boolean , documento :  DocumentosModel } = {
    result: false,
    documento: new DocumentosModel
  };
  constructor(
    public loading : loading,private serviceCaja : cajasServices ,
    public dialogo: MatDialogRef<GenerarCntPorCobrarComponent>,
    @Inject(MAT_DIALOG_DATA) public inData : { Documento:DocumentosModel , origen:string}

  ) { 
    this.listo =  false;
       this.pagoPorCredito = new DocpagosModel();
        this.pagoPorCredito.valorPagado = this.inData.Documento.totalFactura;
        this.pagoPorCredito.valorRecibido = this.pagoPorCredito.valorPagado;
        this.pagoPorCredito.vueltos = 0; 
        this.getMediosP()
      }

  ngOnInit(): void {
  }
  finalizarOk(){
    //documentos_pagos
    this.serviceCaja.setPagoDocumentoCredito(this.inData.origen ,this.inData.Documento.orden ,this.pagos , 
      this.pagoPorCredito.aux1 , this.pagoPorCredito.aux2)
     .subscribe({next: (datos:DocumentoCierreRequest)=>{
        CustomConsole.log(datos); 
        CustomConsole.log('pagos realizados' , this.pagos ); 
        this.loading.hide()
        this.retorno.result = true;
        this.retorno.documento = datos.data.documentoFinal;
        this.dialogo.close(this.retorno);
      } ,
      error: error  => {this.loading.hide();
        Swal.fire('finalizarOk', error.error.error);
      } } 
      );
  }
  cancelar(){
    this.dialogo.close(false);
  }
  cambioDeValor( index:number){

   if(!isNaN( this.pagos[index].valorPagado )){
    let pagoActual:number = this.pagoPorCredito!.valorPagado ; 
    let recibido =  parseFloat(this.pagos[index].valorPagado.toString())
    this.pagos[index].valorPagado = recibido;
    let totalFactura :number= this.inData.Documento.totalFactura;

    if (this.pagos[index].valorPagado > pagoActual)
      {
        this.pagos[index].valorPagado = 0;
      } 
    
      let totalMedios:number =  this.pagos.reduce((acc:number, current) => acc + current.valorPagado, 0);
        CustomConsole.log('totalMedios', totalMedios);
        
      this.pagoPorCredito!.valorPagado =  totalFactura -  totalMedios;
   
  }}
setVueltos(index:number){
  if(this.pagos[index].valorPagado > this.pagos[index].valorRecibido  ) {
    this.pagos[index].valorRecibido = this.pagos[index].valorPagado;
    this.pagos[index].vueltos = 0; 
  }else{ 
    this.pagos[index].vueltos = this.pagos[index].valorRecibido - this.pagos[index].valorPagado;
  } 
  
 
}
getMediosP(){ 
  console.clear();
  CustomConsole.log('DocumentoActivo',this.inData.Documento)
  this.listo = false;
  this.loading.show()
  this.serviceCaja.getMediosCajaActiva()
     .subscribe( {next:(datos:any)=>{
         CustomConsole.log(datos);
        
    if (datos.ok && datos.data.count > 0 ){ 
      let  index : number = this.inData.Documento.pagos.length; 
      if (index <= 0 ) index = -1;
      if (index > 0 )
        { 
          this.pagos = this.inData.Documento.pagos.map(x => {
          if (x.nombreMedio?.toUpperCase() !== 'EFECTIVO') {
            let pago = new DocpagosModel();
            pago.idMedioDePago = x.idMedioDePago || 0;
            pago.nombreMedio = x.nombreMedio || '';
            pago.valorPagado = x.valorPagado || 0;
            pago.valorRecibido = x.valorRecibido || 0;
            pago.vueltos = x.vueltos || 0;
            pago.valorTotalAPagar = x.valorTotalAPagar || 0;
            pago.soloLectura = true
            return pago;
          } else {
            this.pagoPorCredito.valorPagado = x.valorPagado || 0;
            return;}// O puedes devolver un valor específico que indique que no debe incluirse en la lista de pagos
          
      }).filter((pago): pago is DocpagosModel => pago !== undefined);
    CustomConsole.log('pagos recibidos' , this.pagos);
        }
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
    this.pagos[this.indexEfectivo].referencia = 'efectivo';
    }else{
      this.pagos = [];
    } 
    CustomConsole.log('pagos realizados' , this.pagos ); 
        this.loading.hide()
        this.listo = true;
      } ,
      error: (error:any) => {this.loading.hide();
        alert( error.error.error);
      }}
      );
  }
}
