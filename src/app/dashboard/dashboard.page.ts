import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastController, ModalController, IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ModalUbicacionComponent } from '../modal-ubicacion/modal-ubicacion.component';
import { ModalInformacionComponent } from '../modal-informacion/modal-informacion.component';
import { Haptics, ImpactStyle } from '@capacitor/haptics'; // Vibración háptica para retroalimentación del usuario
import { Geolocation } from '@capacitor/geolocation'; // Geolocalización del dispositivo (latitud y longitud)
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; // Acceso a la cámara y captura de fotos
import { Preferences } from '@capacitor/preferences'; // Almacenamiento local
import { QrService } from '../services/qr.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule
  ]
})
export class DashboardPage implements OnInit {

  foto?: string;
  registros: any[] = [];
  escaneando: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    public qr: QrService
  ) { }

  async ngOnInit() {
    await this.cargarHistorial();

    // Si se guarda un nuevo QR, actualiza el historial
    this.qr.onQrSaved.subscribe(() => {
      this.cargarHistorial();
    });
  }

  // Captura una foto con la cámara
  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      this.foto = image.dataUrl;

      const modal = await this.modalCtrl.create({
        component: ModalInformacionComponent,
        componentProps: {
          imagen: this.foto
        }
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();

      if (data) {
        const id = 'registro-' + Date.now();
        await Preferences.set({
          key: id,
          value: JSON.stringify(data)
        });

        await this.mostrarRetroalimentacion('Registro guardado correctamente.');
        this.foto = undefined;
        await this.cargarHistorial();
      }

    } catch (error) {
      console.error('Error al tomar foto:', error);
    }
  }

  // Obtiene la ubicación actual
  async registrarUbicacion() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const latitud = position.coords.latitude;
      const longitud = position.coords.longitude;

      const modal = await this.modalCtrl.create({
        component: ModalUbicacionComponent,
        componentProps: {
          latitud,
          longitud
        }
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();

      if (data) {
        const id = 'ubicacion-' + Date.now();
        await Preferences.set({
          key: id,
          value: JSON.stringify(data)
        });

        await this.mostrarRetroalimentacion('Registro guardado correctamente.');
        await this.cargarHistorial();
      }
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
    }
  }

  // Carga todos los registros almacenados (foto, ubicación o QR)
  async cargarHistorial() {
    const { keys } = await Preferences.keys();
    const registros: any[] = [];

    for (const key of keys) {
      if (key.startsWith('registro-') || key.startsWith('ubicacion-') || key.startsWith('qr-')) {
        const { value } = await Preferences.get({ key });
        if (value) {
          const item = JSON.parse(value);
          item.tipo = key.startsWith('registro-') ? 'foto' : key.startsWith('ubicacion-') ? 'ubicacion' : 'qr';
          registros.push(item);
        }
      }
    }

    this.registros = registros.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }

  // Muestra retroalimentación con vibración y toast
  async mostrarRetroalimentacion(mensaje: string) {
    await Haptics.impact({ style: ImpactStyle.Medium });

    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      positionAnchor: 'header',
      icon: 'save'
    });

    await toast.present();
  }

  result = null;
  scanActive = false;
}
