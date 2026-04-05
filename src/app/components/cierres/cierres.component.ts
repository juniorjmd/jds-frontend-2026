import { Component, OnInit } from '@angular/core';
import { CortesDeCajaModule } from 'src/app/models/cortes-de-caja/cortes-de-caja.module';
import { CortesDeCajaService } from 'src/app/services/cortes-de-caja.service';
import { loading } from 'src/app/models/app.loading'; 
import { CortesDeCajaPagosModule } from 'src/app/models/cortes-de-caja-pagos/cortes-de-caja-pagos.module';
import Swal from 'sweetalert2';
import { CortesDeCajaProductosVendidosModule } from 'src/app/models/cortes-de-caja-productos-vendidos/cortes-de-caja-productos-vendidos.module';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMultiRecordsPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-cierres',
  templateUrl: './cierres.component.html',
  styleUrls: ['./cierres.component.css']
})
export class CierresComponent implements OnInit {
  cierres:CortesDeCajaModule[] = []
  cierresP:CortesDeCajaModule[] = []
  cierresPagos:CortesDeCajaPagosModule[] = [] 
  constructor( public loading : loading, private _serviceCierre:CortesDeCajaService) {this.getCierresTotalesYparciales() }

  ngOnInit(): void {
    
  }

  getCierresTotalesYparciales(){
    this.loading.show();
  this._serviceCierre.getCierresTotalesYparciales().subscribe({next:
    (respuesta:ApiResponse<GenericMultiRecordsPayload<any>>)=>{
       if (!respuesta.ok){
        Swal.fire(respuesta.error?.message || 'No fue posible consultar los cierres')
        this.loading.hide();
        return;
       }
       this.cierres = (respuesta.data.records[0] as CortesDeCajaModule[]) ?? [];
       this.cierresP = (respuesta.data.records[1] as CortesDeCajaModule[]) ?? [];
       this.cierresPagos = (respuesta.data.records[2] as CortesDeCajaPagosModule[]) ?? [];
        

        
       this.loading.hide();
       
  }, error:(error)=>{Swal.fire(error.error.error);this.loading.hide();}
}) 

  }

mostrarProductosVendidosPorCierre(cierreActual:CortesDeCajaModule){
  
  this.loading.show();
  this._serviceCierre.getProductosPorCierres(cierreActual.id).subscribe(
    (respuesta:ApiResponse<GenericRecordsPayload<CortesDeCajaProductosVendidosModule>>)=>{
       if (respuesta.ok ){ 
         if (respuesta.data.count > 0)
         {//respuesta.data[0]; 
        ////console.log('datos cierres',respuesta.data);

 
        let pagosHtml:string =  `<h1>Cierre de caja # ${cierreActual.id} <br>de la caja ${cierreActual.nombreCajaCierre}</h1>
        <h3>Productos Vendidos</h3>
        <table class='table' style='font-size:12px'>  
        <tr>
        <td>Producto</td>
        <td>Codigo</td>
        <td>Cantidad</td>
        <td>precio sin iva</td>
        <td>Descuento</td>
        <td>IVA</td>
        <td>Total</td> 
        </tr>`;
          ;
        respuesta.data.records.forEach((item:CortesDeCajaProductosVendidosModule)=>{
          pagosHtml +=`<tr> `;
         pagosHtml +=` <td style="text-align: left;">${item.nombreProducto}</td> `;
         pagosHtml +=` <td>${item.idProducto}</td> `;
         pagosHtml +=` <td>${item.cant_real_descontada}</td> `;
         pagosHtml +=` <td>${item.total_presioSinIVa}</td> `;
         pagosHtml +=` <td>${item.descuento}</td> `;
         pagosHtml +=` <td>${item.total_IVA}</td> `;
         pagosHtml +=` <td>${item.valorTotal}</td> `; 
         pagosHtml +=`</tr> `;
         
       });       
       pagosHtml += '</table>';
       Swal.fire({html:pagosHtml, width: '800px'});
      }

       }else{
        Swal.fire(respuesta.error?.message || 'No fue posible consultar los productos del cierre' , "error");
       }
       this.loading.hide();
  }) 
}

  mostrarCierresParciales(item2:CortesDeCajaModule){

 
   let pagosHtml:string =  `<h1>Cierre de caja # ${item2.id} <br>de la caja ${item2.nombreCajaCierre}</h1>
   <h3>Cierres Parciales</h3>
   <table class='table' style='font-size:12px'>  
   <tr>
   <td>fecha inicio</td>
   <td>fecha cierre</td>
   <td>Base</td>
   <td>Subtotal</td>
   <td>IVA</td>
   <td>Descuento</td>
   <td>Total</td>
   <td>caja</td>
   <td>Usuario Abre</td>
   <td>Usuario cierre</td>
   </tr>`;

   this.cierresP!.forEach(item=>{
    if(item2.id === item.id_cierre_total){pagosHtml +=`<tr> `;
    pagosHtml +=` <td>${item.fecha_apertura}</td> `;
    pagosHtml +=` <td>${item.fecha_cierre}</td> `;
    pagosHtml +=` <td>${item.base}</td> `;
    pagosHtml +=` <td>${item.sub_total_venta}</td> `;
    pagosHtml +=` <td>${item.total_iva}</td> `;
    pagosHtml +=` <td>${item.total_descuento}</td> `;
    pagosHtml +=` <td>${item.total_venta}</td> `;
    pagosHtml +=` <td>${item.nombreCajaCierre}</td> `;
    pagosHtml +=` <td>${item.nombreUsuarioApertura}</td> `;
    pagosHtml +=` <td>${item.nombreUsuarioCierre}</td> `;
    pagosHtml +=`</tr> `;}
    
  });
  
  pagosHtml += '</table>'



  Swal.fire({html:pagosHtml, width: '1000px'});

  }
  mostrarCierresPagos(item2:CortesDeCajaModule){ 
   let pagosHtml:string =  `<h1>Total de pagos relizados en el Cierre de caja # ${item2.id} <br>de la caja${item2.nombreCajaCierre}</h1>
   <h3>Pagos Realizados en el cierre</h3>
   <table class='table' style='font-size:12px'>  
   <tr>
   <td>Medio de Pago</td>
   <td>Total</td>
   </tr>`;

   let pagos = this.cierresPagos.filter(x=> x.cod_cierre == item2.id)
    pagos!.forEach(item=>{
    pagosHtml +=`<tr> `;
    pagosHtml +=` <td>${item.nombre}</td> `;
    pagosHtml +=` <td>${item.valor}</td> `; 
    pagosHtml +=`</tr> `;
  });
  
  pagosHtml += '</table>'



  Swal.fire({html:pagosHtml, width: '400px'});

  }
}
