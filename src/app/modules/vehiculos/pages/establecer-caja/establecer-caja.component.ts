import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { caja } from 'src/app/interfaces/caja.interface';
import { select } from 'src/app/interfaces/generales.interface';
import { loading } from 'src/app/models/app.loading'; 
import { CustomConsole } from 'src/app/models/CustomConsole';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import { DocumentoService } from 'src/app/services/documento.service';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';


@Component({
  selector: 'app-establecer-caja',
  templateUrl: './establecer-caja.component.html',
  styleUrls: ['./establecer-caja.component.css']
})
export class EstablecerCajaComponent  {
  cajasActivas:cajaModel[] = [];
  cajas:cajaModel[] = [];
  constructor(public loading : loading, public dialogo: MatDialogRef<EstablecerCajaComponent>,
    private documentoService : DocumentoService ,private serviceCaja:cajasServices,
    @Inject(MAT_DIALOG_DATA) public Documento:DocumentosModel)
    { 
      //this.getCajasActivasEstablecimiento();
      this.getCajas()
    }

getCajas(){
  this.cajas=[] ;
  let cajaAux :cajaModel;
  this.loading.show()
  this.serviceCaja.getCajasActivas()
     .subscribe(
      (datos:ApiResponse<{ records: cajaModel[]; count: number }>)=>{
        let cont = 0;
         CustomConsole.log('getCajas',datos); 
    if (datos.data.count > 0 ){ 
      datos.data.records.forEach((dato) =>{
        cajaAux =  new cajaModel(dato as any); 
        this.cajas.push(cajaAux); 
             
      }) 
      CustomConsole.log('cajas : ' , this.cajas);
    }else{
      this.cajas = [];
    }

        this.loading.hide()
      } ,
      error => {this.loading.hide();
        alert( error.error.error);
      }
      );
}
seleccionarCajaAestablecer(caja:cajaModel){ 
    this.dialogo.close(caja);
}

/*
this.loading.hide();
this.dialogo.close(true);*/
}
