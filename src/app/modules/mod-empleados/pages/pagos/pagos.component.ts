import { Component, OnInit } from '@angular/core';
import { EmpleadoModel } from 'src/app/models/empleados/empleados.module';
import { EmpleadosService } from 'src/app/services/empleados.service';
import { loading } from 'src/app/models/app.loading';  
import { fechaBusqueda, select } from 'src/app/interfaces/generales.interface';
import Swal from 'sweetalert2'; 
import { AcumuladosEmpleadoModel } from 'src/app/models/acumulados-empleados/acumulados-empleados.module';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})
export class PagosComponent implements OnInit {
  valorAnticipo:number = 0; descripcionAticipo:string='';
  indexEmpleado:number = 0;
  empleado :EmpleadoModel = new EmpleadoModel();
  empleados :EmpleadoModel[] = [this.empleado];
  empleadosConAcumulados :EmpleadoModel[] = [];
  acumulado:AcumuladosEmpleadoModel[] = [] ; 
  listaAcumulados:any = [this.acumulado];

  fechasBusqueda:fechaBusqueda[] = [{
    fechaInicio:Date().toString(),
    fechaFin:Date().toString()}]
  ;
  constructor(private empleadosServices :EmpleadosService ,  private loading : loading ) { 
   this.getEmpleados();
  }
  generarAticipo(){
    if(this.empleado.id != undefined){Swal.fire('Es necesario escoger un empleado para generar el anticipo','')
      return;
    }
    if(this.valorAnticipo <= 0){Swal.fire('Es necesario ingresar un valor mayor a cero para generar el anticipo','')
      return;
    }
    if(this.descripcionAticipo.trim() == ''){Swal.fire('Es necesario ingresar la descripcion para generar el anticipo','')
      return;
    }

    
this.loading.show(); 
this.empleadosServices.guardarAnticipoEmpleado(this.empleado, this.valorAnticipo , this.descripcionAticipo.trim()).subscribe(
 (respuesta:ApiResponse<GenericMutationPayload>)=>{CustomConsole.log(respuesta)
  
 if (respuesta.ok){
  Swal.fire('datos ingresados con exito');  
  this.valorAnticipo =0 ;
  this.descripcionAticipo = '';
  this.getEmpleados();
 }else{ 
  Swal.fire(respuesta.error?.message || 'No fue posible generar el anticipo', '', 'error');
 }
 this.loading.hide(); 
 })
  }
  validarValor(index:number ){ 
  CustomConsole.log(
    this.empleadosConAcumulados[index] ) ;
    /*,item.maximoDescuento, item.valorADescontarEnPago*/
    if( this.empleadosConAcumulados[index].valorADescontarEnPago! < 0 ){
      this.empleadosConAcumulados[index].valorADescontarEnPago  = 0;
    }
    if( this.empleadosConAcumulados[index].valorADescontarEnPago! >  this.empleadosConAcumulados[index].maximoDescuento!  ){
      this.empleadosConAcumulados[index].valorADescontarEnPago  =  this.empleadosConAcumulados[index].maximoDescuento;
    }
  }

  validarElPago(empleado:EmpleadoModel, index:number , fechas:fechaBusqueda){
   let pagosHtml:string =  `<h1>empleado :${empleado.persona?.nombreCompleto}</h1><hr>
   pago de la liquidacion desde el <b>${fechas.fechaInicio}</b> al <b>${fechas.fechaFin}</b><hr>
   <h3>total acumulado : <b>${empleado.TotalAcumuladoPendientes} </b> menos de anticipos <b> ${empleado.valorADescontarEnPago}</b></h3> <hr>
    total a Pagar : <h3><b>${empleado.TotalAcumuladoPendientes! - empleado.valorADescontarEnPago!}</b></h3> 
   `; 
  Swal.fire({html:pagosHtml, width: '900px', showConfirmButton:true, confirmButtonText:'Pagar' ,cancelButtonColor:'red', cancelButtonText :'Cancelar',showCancelButton:true}).then(value=>{
    CustomConsole.log(value);
    if(value.isConfirmed){
      this.generarPago(empleado, index , fechas);
    }
  });
  }
  generarPago(Empleado:EmpleadoModel, index:number , fechas:fechaBusqueda){
this.loading.show(); 
this.empleadosServices.guardarPagoEmpleado(Empleado , fechas).subscribe(
 (respuesta:ApiResponse<GenericMutationPayload>)=>{CustomConsole.log(respuesta)
  
 if (respuesta.ok){
  Swal.fire('datos ingresados con exito');  
  this.getEmpleados();
 }else{ 
  Swal.fire(respuesta.error?.message || 'No fue posible registrar el pago', '', 'error');
 }
 this.loading.hide(); 
 })

  }

  validarEmpleado(){
    this.empleado = this.empleados[this.indexEmpleado]
    CustomConsole.log('empleado',this.empleado);
    
  }
  getEmpleados(){  
     
  this.empleado  = new EmpleadoModel(); 
    this.empleados = [this.empleado];
    this.empleadosConAcumulados = [];  
    let contAcumulados = 0;
    let empleadosAux :EmpleadoModel = new EmpleadoModel(); 
     this.loading.show()
     this.empleadosServices.getEmpleados().subscribe(
      {
        next :
      
       (datos:ApiResponse<GenericRecordsPayload<EmpleadoModel>>)=>{
          CustomConsole.log('getEmpleados' , datos);
          
     if (datos.ok && datos.data.count > 0 ){ 
       datos.data.records.forEach((dato:EmpleadoModel )=>{ 
        this.empleados.push(dato);
        empleadosAux = dato;
        if(empleadosAux.numeroAcumuladosPendientes! > 0 ){
          empleadosAux.valorADescontarEnPago =  empleadosAux.maximoDescuento  
            this.empleadosConAcumulados.push(empleadosAux);
            this.fechasBusqueda[contAcumulados].fechaFin = empleadosAux.fechaMaximaAcumulados! ; 
            this.fechasBusqueda[contAcumulados].fechaInicio = empleadosAux.fechaMinimaAcumulados! ;  
        }
        if(this.indexEmpleado>0){
          this.empleado  = this.empleados[this.indexEmpleado] ;  
        }
       }) 
       CustomConsole.log('empleados',this.empleados);
     }else{
       this.empleados = [];
     }
 
         this.loading.hide();
       } ,
       error : (error:any) => {this.loading.hide();
         CustomConsole.log(error)
         Swal.fire(this.empleadosServices.getErrorMessage(error), '', 'error');
       }}
       );
   }  
   
  removeGetActivo(a:string){
    CustomConsole.log(a);
    $('.likcontPrd').each(function(){
       $(this).removeClass('active')
    }) ;
    
    $('#'+a ).addClass('active') 
    $('.contPrd').css('display' , 'none')
    const elemDiv = document.getElementById(a.trim()+'Div') 
    elemDiv!.style.display = 'block'
  }

liquidarPagos(auxiliar:EmpleadoModel , index :number , fechas:fechaBusqueda){
  this.acumulado = [] ;  
  let porcDescMaximo : number = 0;
  let totalValorAcumulado : number = 0;
   this.loading.show()
   this.empleadosServices.getEmpleadosAcumulados(auxiliar.id! ,fechas ).subscribe(
    { next:
     (datos:ApiResponse<GenericRecordsPayload<{ obj: any; valor: string; porcDescMaximo: number }>>)=>{
        
   if (datos.ok && datos.data.count > 0 ){ 
    
     datos.data.records.forEach((dato:any  )=>{  
      totalValorAcumulado += parseFloat(dato.valor);
      if (porcDescMaximo <= 0)  porcDescMaximo = dato.porcDescMaximo ;

      this.acumulado.push(dato.obj); 
    
     })    }
     this.listaAcumulados[index] = this.acumulado; 
     this.empleadosConAcumulados[index].TotalAcumuladoPendientes = totalValorAcumulado ; 
     totalValorAcumulado =   Math.round(totalValorAcumulado * (porcDescMaximo / 100 )  * 10) / 10 ; 
     
     
     this.empleadosConAcumulados[index].maximoDescuento =  totalValorAcumulado;
     this.empleadosConAcumulados[index].valorADescontarEnPago =  totalValorAcumulado;
     //CustomConsole.log('empleado final',this.empleadosConAcumulados[index]);

       this.loading.hide();
     } ,
     error: ( error) => {this.loading.hide();
       CustomConsole.log(error)
       Swal.fire(this.empleadosServices.getErrorMessage(error), '', 'error');
     }}
     );
}
  
  ngOnInit(): void {
    this.removeGetActivo('liquidarAcumuladosLink');
  }


}
