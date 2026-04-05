import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { catchError, of, tap } from 'rxjs';
import { DocumentoCierreRequest } from 'src/app/interfaces/producto-request';
import { ValuesFormuGasto } from 'src/app/interfaces/valuesFormularios';
import { loading } from 'src/app/models/app.loading';
import { ClientesModel } from 'src/app/models/clientes/clientes.module';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';
import { FndClienteComponent } from 'src/app/modules/shared/modals/fnd-cliente/fnd-cliente.component';
import { DocumentoService } from 'src/app/services/documento.service';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { DocumentoActionPayload } from 'src/app/services/documento.service';

@Component({
  selector: 'modal-new-gasto',
  templateUrl: './new-gasto.component.html',
  styleUrls: ['./new-gasto.component.css']
})
export class NewGastoComponent {

  private newAbrirDialog = inject(MatDialog)
  gastoForm?: FormGroup;
  private fb = inject(FormBuilder);
  private documentoService = inject(DocumentoService);
  private loading = inject(loading); 
  private dialogo=inject( MatDialogRef<NewGastoComponent>);
  private newGasto?:ValuesFormuGasto;
  private response = {result : false , documento : new DocumentosModel()} ;
  ngOnInit(): void {
    this.gastoForm = this.fb.group({
      nombre: ['', Validators.required],
      valor: ['', [Validators.required, Validators.pattern(/^\d*\.?\d+$/)]],
      descripcion: ['', Validators.required],
      tercero: ['', Validators.required],
      idTercero: [0, Validators.required]
    });
  }


  buscarTerceroGasto (){

    this.newAbrirDialog.open(FndClienteComponent,{ data: {  invoker:'gasto' } })
    .afterClosed()
    .pipe(
      tap((resp:{response: Boolean , persona:ClientesModel})=>{
        if (resp.response) { 
            this.gastoForm?.get('tercero')?.setValue(   resp.persona.nombreCompleto );
          this.gastoForm?.get('idTercero')?.setValue(
            typeof resp.persona.id === 'string' ? parseInt(resp.persona.id, 10) : resp.persona.id
          );
        }
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire('Error:', JSON.stringify(error)),
      complete: () => CustomConsole.log('buscarCliente completo')
    });   
  }
  crearDocumento() {
    if(this.newGasto != undefined){
    if(this.newGasto.idTercero <= 0 ){
      Swal.fire('info' , 'debe escoger el tercero para el gasto' , 'warning')
      return ;
    }  
    this.loading.show();
    this.documentoService.crearDocumentoGasto  
    (this.newGasto).pipe(
      tap((respuesta: ApiResponse<DocumentoActionPayload>) => {
        CustomConsole.log('crearDocumento', respuesta); 
        if (respuesta.ok && respuesta.data.documentoFinal) {
          this.response.result = true;
          this.response.documento = respuesta.data.documentoFinal
          this.dialogo.close(this.response);
        } else {
          try {
            Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
           } catch (error : any) {
            Swal.fire('error en el servidor', '', 'error');
           }
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
      error: (error) => Swal.fire(JSON.stringify(error)),
      complete: () => CustomConsole.log('crearDocumento completo')
    });}
  }

  onSubmit(): void {
    if (this.gastoForm?.valid) {
      CustomConsole.log(this.gastoForm.value);
      this.newGasto = this.gastoForm.value;
      this.crearDocumento();
    }


  }
}
