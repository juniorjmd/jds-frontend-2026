import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { VendedorModel } from 'src/app/models/empleados/empleados.module';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'elemt-empVendDropdown',
  templateUrl: './vendedores-dropdown.component.html',
  styleUrls: ['./vendedores-dropdown.component.css']
})
export class vendedoresDropdownComponent implements OnInit{

   options: VendedorModel[] = [];
   @Input() selectedValue: VendedorModel| null = null;
   @Input() conVentas: boolean  = false;
  @Output() selectionChange: EventEmitter<VendedorModel> = new EventEmitter(); 
  @Output() clickBtnRefress: EventEmitter<void> = new EventEmitter(); // Even
  vueltas :boolean =  false;
  private inicioService= inject(DatosInicialesService) ;
  
  ngOnInit(): void { 
    CustomConsole.log('opciones : ',this.options);
   
   if(!this.conVentas){
    this.inicioService.currentVendedores.subscribe(vendedores => {
      if (vendedores) {
        // Aquí puedes trabajar con el array de vendedores
        CustomConsole.log('Vendedores actualizados:', vendedores);
        this.options = vendedores;
      }
    });}else{

      
      this.inicioService.getVendedoresConVentas().subscribe(vendedores => {
        if (vendedores.ok && vendedores.data.count > 0) {
          // Aquí puedes trabajar con el array de vendedores
          CustomConsole.log('Vendedores actualizados:', vendedores);
          this.options = vendedores.data.records;
        }
      });
    }



  } 

  selectOption(option: VendedorModel) {
    this.selectedValue = option;
    this.selectionChange.emit({...this.selectedValue}); 
  }
  triggerExternalFunction() {
    this.clickBtnRefress.emit(); // Emitir el evento
  }
}
