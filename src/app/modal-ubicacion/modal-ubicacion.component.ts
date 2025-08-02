import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-ubicacion',
  templateUrl: './modal-ubicacion.component.html',
  styleUrls: ['./modal-ubicacion.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ModalUbicacionComponent {
  actividad: string = '';
  actividades: string[] = [
    'Voluntariado ecológico',
    'Recolección de basura',
    'Siembra de árboles',
    'Educación ambiental',
    'Cuidado de animales',
    'Reciclaje'
  ];

  @Input() latitud!: number;
  @Input() longitud!: number;

  constructor(private modalCtrl: ModalController) {}

  guardar(form: any) {
  if (!form.valid) return;

  const registro = {
    actividad: this.actividad,
    latitud: this.latitud,
    longitud: this.longitud,
    fecha: new Date().toISOString()
  };

  this.modalCtrl.dismiss(registro);
}

  cancelar() {
    this.modalCtrl.dismiss(null);
  }
}
