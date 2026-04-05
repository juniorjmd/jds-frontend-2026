import { Component, OnInit } from '@angular/core';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import { loading } from 'src/app/models/app.loading';
import { select } from 'src/app/interfaces/generales.interface';
import { Establecimientos } from 'src/app/interfaces/establecimientos.interface';
import { caja } from 'src/app/interfaces/caja.interface';
import { TipoDocumento } from 'src/app/interfaces/tipo-documento';
import { Contador } from 'src/app/interfaces/contador';
import { establecimientosRequest } from 'src/app/interfaces/producto-request';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload, GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'app-contadores',
  templateUrl: './contadores.component.html',
  styleUrls: ['./contadores.component.css']
})
export class ContadoresComponent implements OnInit {
  tipContadores :TipoDocumento [] = [];
  contadores :Contador [] = [] ;
  cajas :cajaModel[]  = []; 
  auxnewContador :  Contador = {
    id: 0,
    codContador: '',
    desde : 0 , 
    hasta : 0,
    establecimiento: 0,
    contador: 0,
    tipoContador: 0,
    contador_real_establecimiento: 0,
    estado: 0,
    resolucion : ''
  };
  newContador :  Contador 
  esta : establecimientoModel[] = [];
  constructor( private serviceCaja : cajasServices ,    
    private loading : loading ) { 
      this.newContador={...this.auxnewContador  };
      this.Cancelar();
      this.getTiposDocumentosConContadores(); 
     this.getContadores();
      }
      ngOnInit(): void {
        this.serviceCaja.currentArrEsta.subscribe({next:(esta:establecimientoModel[]|null)=>{
          if(esta) this.esta = esta;
        }})
      }
      Cancelar(){
        this.newContador={...this.auxnewContador  };
        
         
      }
      getTiposDocumentosConContadores(){
        this.tipContadores= [];
        this.serviceCaja.getTiposDocumentosConContadores()
         .subscribe({next:     (datos:any)=>{
             CustomConsole.log(datos); 
        if (datos.ok && datos.data.count > 0 ){  
          datos.data.records.forEach((dato:TipoDocumento , index:number )=>{
            this.tipContadores[index] = dato;
          })  
        }
    
            this.loading.hide()
          } ,error:       error => {this.loading.hide();
            
            this.tipContadores = [];
            alert( error.error.error);
          }}
          );
      } 



      setActualizaCaja(cajaActualizar : Contador){
        this.newContador = cajaActualizar ; 
      }
    getContadores(){ 
      this.contadores = [];
      this.loading.show()
      this.serviceCaja.getContadores()
         .subscribe({next :
          (datos:any)=>{
             CustomConsole.log(datos);
             
        if (datos.ok && datos.data.count > 0 ){ 
          datos.data.records.forEach((dato:Contador  , index:number )=>{ 
            this.contadores[index] = dato ;
          }) 
          CustomConsole.log(this.contadores);
        }else{
          this.contadores = [];
        }
    
            this.loading.hide()
          } , error: error => {this.loading.hide();
            alert( error.error.error);
          }}
          );
    }
    
    
     
       guardarContador(){ 
       if (typeof(this.newContador.codContador) === 'undefined'){
        this.loading.hide();
        alert('Debe ingresar el codigo para el contador');
        return;
       } 
       if (this.newContador.establecimiento === 0){
        this.loading.hide();
        alert('Debe escoger el establecimiento');
        return;
       }
       if (this.newContador.tipoContador === 0){
        this.loading.hide();
        alert('Debe escoger el tipo de contador');
        return;
       }
       if (this.newContador.desde  === 0){
        this.loading.hide();
        alert('Debe escoger el tipo de contador');
        return;
       }
       if (this.newContador.hasta  === 0){
        this.loading.hide();
        alert('Debe escoger el tipo de contador');
        return;
       } 

       if (this.newContador.resolucion !== undefined && (typeof this.newContador.resolucion === 'string' && this.newContador.resolucion.trim() != '' )){
        if (this.newContador.fechaInicioResolucion  === undefined || this.newContador.fechaInicioResolucion.toString() == ''){
                  this.loading.hide();
                  alert('Debe escoger el tipo de contador');
                  return;
                } 
        if (this.newContador.fechaFinResolucion  === undefined || this.newContador.fechaFinResolucion.toString() == ''){
          this.loading.hide();
          alert('Debe escoger el tipo de contador');
          return;
         } 

         if (this.newContador.fechaFinResolucion <= this.newContador.fechaInicioResolucion)
         { this.loading.hide();
          alert('error en el rango de fecha');
          return;}



       } 
       
       this.loading.show(); 
       this.serviceCaja.setConsecutivo(this.newContador).subscribe(
       {next: (respuesta:any)=>{CustomConsole.log(respuesta)
         
        if (respuesta.ok){
          alert('datos ingresados con exito');  
          this.Cancelar();
          this.getContadores();
        }else{
          alert(respuesta.error?.message ?? 'Error interno del servidor');
          this.loading.hide();
        }
        }, error:   error => {this.loading.hide();
          alert( error.error.error);
          this.loading.hide();
        }}
    
       )
      }
     
    
    }
