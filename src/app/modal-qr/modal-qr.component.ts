import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-qr',
  templateUrl: './modal-qr.component.html',
  styleUrls: ['./modal-qr.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ModalQrComponent {
  @Input() contenido!: string;

  constructor(private modalCtrl: ModalController) {}

  guardar() {
    const registro = {
      contenido: this.contenido,
      fecha: new Date().toISOString()
    };

    this.modalCtrl.dismiss(registro);
  }

  cancelar() {
    this.modalCtrl.dismiss(null);
  }
}
