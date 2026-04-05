import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { select } from 'src/app/interfaces/generales.interface';
import { loading } from 'src/app/models/app.loading';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { DocumentoService } from 'src/app/services/documento.service';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-mover-documentos',
  templateUrl: './mover-documentos.component.html',
  styleUrls: ['./mover-documentos.component.css']
})
export class MoverDocumentosComponent implements OnInit {
 cajasActivas: cajaModel[] = [];
  constructor(public loading : loading,
    private documentoService : DocumentoService ,
     public dialogo: MatDialogRef<MoverDocumentosComponent>,
    @Inject(MAT_DIALOG_DATA) public Documento:DocumentosModel) { this.getCajasActivasEstablecimiento()}

  ngOnInit(): void {
  }
  asignarACaja(caja:cajaModel){
    CustomConsole.log(caja);
    caja.documentoActivoCaja = this.Documento.orden
    this.loading.show();
  this.documentoService.cambiarDocumentoDeCaja(caja).subscribe(
    (datos)=>{ 
       CustomConsole.log('asignarACaja',datos);  
       this.loading.hide();
       this.dialogo.close(true);
} )
    
  }
  getCajasActivasEstablecimiento(){
    this.documentoService.getCajasActivas(this.Documento.establecimiento).
    subscribe(
      (datos:ApiResponse<GenericRecordsPayload<cajaModel>>)=>{
         CustomConsole.log('getCajasActivas',datos); 
         this.cajasActivas = []; 
    if (datos.ok && datos.data.count > 0 ){ 
      datos.data.records.forEach((dato:cajaModel)=>{  
       this.cajasActivas.push(dato); 
       
       CustomConsole.log(dato);
      }) 
   }
} )
}}  
