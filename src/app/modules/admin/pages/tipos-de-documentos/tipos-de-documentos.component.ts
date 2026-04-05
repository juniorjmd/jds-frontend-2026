import { Component, OnInit } from '@angular/core';
import { TipoDeDocumentos } from 'src/app/interfaces/tipo-de-documentos';
import { ProductoService } from 'src/app/services/producto.service';
import { loading } from 'src/app/models/app.loading';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-tipos-de-documentos',
  templateUrl: './tipos-de-documentos.component.html',
  styleUrls: ['./tipos-de-documentos.component.css']
})
export class TiposDeDocumentosComponent implements OnInit {
  tiposDeDocumento : TipoDeDocumentos[] = [];
  constructor( private servicePrd : ProductoService ,  private loading : loading ) {
    this.loading.show();
    this.servicePrd.getTiposDeDocumentos().subscribe(
      (respuesta:ApiResponse<GenericRecordsPayload<TipoDeDocumentos>>)=>{CustomConsole.log(respuesta)
       
      if (respuesta.ok){
         this.tiposDeDocumento = respuesta.data.records;
      }else{
        alert(respuesta.error?.message || 'No fue posible consultar los tipos de documento');
      }
      
      this.loading.hide();
      }
  
     )
   }

  ngOnInit(): void {
  }

}
