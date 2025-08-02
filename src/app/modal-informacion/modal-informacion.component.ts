import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-informacion',
  templateUrl: './modal-informacion.component.html',
  styleUrls: ['./modal-informacion.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ModalInformacionComponent {
  @Input() imagen!: string;
  titulo: string = '';

  constructor(private modalCtrl: ModalController) {}

  guardar(form: any) {
    if (!form.valid) return;

    const datos = {
      titulo: this.titulo,
      imagen: this.imagen,
      fecha: new Date().toISOString()
    };

    this.modalCtrl.dismiss(datos);
  }

  cancelar() {
    this.modalCtrl.dismiss(null);
  }
}


