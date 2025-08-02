import { Injectable } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Preferences } from '@capacitor/preferences'; // Para almacenamiento local
import { ToastController, ModalController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics'; // Vibración como retroalimentación
import { ModalQrComponent } from '../modal-qr/modal-qr.component'; // Modal para mostrar resultado del QR
import { Subject } from 'rxjs'; // Para emitir eventos

@Injectable({
  providedIn: 'root'
})
export class QrService {

  scan: boolean = false;
  scanResult: any = "";
  flashOn: boolean = false;

  public onQrSaved: Subject<void> = new Subject<void>();

  constructor(
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) { }

  async StartScan() {

    if (!this.scan) {
      this.scan = true;

      try {
        // Solicita permisos y oculta el fondo para mejor visibilidad del escáner
        await BarcodeScanner.checkPermission({ force: true });
        await BarcodeScanner.hideBackground();
        document.querySelector('body')?.classList.add('scanner-active');

        const result = await BarcodeScanner.startScan();
        this.scan = false;

        // Si hay contenido válido, se procesa
        if (result && result.content && result.content.trim() !== '') {
          this.scanResult = result.content;

          // Se restablece el escáner
          document.querySelector('body')?.classList.remove('scanner-active');
          BarcodeScanner.showBackground();

          // Muestra el modal con el contenido escaneado
          const modal = await this.modalCtrl.create({
            component: ModalQrComponent,
            componentProps: {
              contenido: result.content
            }
          });

          await modal.present();

          const { data } = await modal.onDidDismiss();

          if (data) {
            // Crea un objeto con los datos del escaneo
            const registro = {
              tipo: 'qr',
              contenido: data.contenido,
              fecha: data.fecha
            };

            // Guarda el registro con un ID único en Preferences (almacenamiento local)
            const id = 'qr-' + Date.now();
            await Preferences.set({
              key: id,
              value: JSON.stringify(registro)
            });

            
            this.onQrSaved.next();

            // Muestra retroalimentación (vibración con toast)
            await this.mostrarRetroalimentacion('Código QR guardado correctamente.');
          }
        }

      } catch (e) {
        console.error("Error durante el escaneo:", e);
        this.scanResult = "Error durante el escaneo";
        this.scan = false;
      }

    } else {
      // Si ya está escaneando, se detiene
      this.StopScan();
    }
  }

  // Detiene el escaneo y restablece la interfaz
  StopScan() {
    document.querySelector('body')?.classList.remove('scanner-active');
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    this.scan = false;
    this.scanResult = "";
  }

  // Muestra retroalimentación visual y toast
  private async mostrarRetroalimentacion(mensaje: string) {
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
}