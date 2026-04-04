import { Component, Inject, OnInit  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { loading } from 'src/app/models/app.loading';
import { cajasServices } from 'src/app/services/Cajas.services';
import Swal from 'sweetalert2';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { Router } from '@angular/router';

@Component({
  selector: 'app-definir-base-caja',
  templateUrl: './definir-base-caja.component.html',
  styleUrls: ['./definir-base-caja.component.css']
})
export class DefinirBaseCajaComponent implements OnInit {
 caja:cajaModel ;
 valorIngresar:number= 0;

  constructor( private cajaService : cajasServices,
      private _Router : Router,
    public dialogo: MatDialogRef<DefinirBaseCajaComponent>,
    @Inject(MAT_DIALOG_DATA) public cajaImport:cajaModel,

    public loading : loading) {
      this.caja = this.cajaImport;
    }

  ngOnInit(): void {
  }
  cerrarFormulario(){
    this.dialogo.close(false);
  }
  cerrarFormularioTrue(){
    if(typeof(this.valorIngresar) == 'undefined'){
      Swal.fire('Debe ingresar el Valor inicial de la caja');
    }else{
      this.loading.show()
      this.cajaService.abrirCaja(this.caja, this.valorIngresar).subscribe(
        (respuesta:any)=>{
          CustomConsole.log(respuesta)
         Swal.fire( respuesta.message ).then(()=>{
          this._Router.navigate(["/home","pos","ventas"]);
          location.reload();
         });
         this.dialogo.close(true);
        this.loading.hide();

        },
        (error: any) => {this.loading.hide();
          Swal.fire(this.cajaService.getErrorMessage(error));
        }
        );
    }

  }

}
