import { Component, OnInit } from '@angular/core';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { ApiService, QrPass } from '../core/api.service';
import { OfflineService } from '../core/offline.service';

@Component({
  standalone: true,
  imports: [IonContent, IonButton],
  template: `
    <ion-content>
      <main class="page">
        <h1 class="title">My QR Pass</h1><p class="muted">{{ monthKey }} · saved for offline checks</p>
        <section class="card qr-full">
          <img [src]="pass?.imageDataUrl" alt="QR pass">
          <h2>{{ pass?.student?.full_name || 'Student' }}</h2>
          <p class="muted">{{ pass?.student?.matricule || 'Monthly transport pass' }}</p>
          <span class="status">Available offline</span>
        </section>
        <ion-button expand="block" class="primary-button" (click)="refresh()">Refresh QR</ion-button>
      </main>
    </ion-content>
  `,
  styles: [`
    .qr-full{padding:clamp(20px,6vw,34px);text-align:center;margin:24px 0;border-radius:28px}
    .qr-full img{width:min(100%,320px);aspect-ratio:1;object-fit:contain}
    .qr-full h2{margin:16px 0 4px;font-size:clamp(20px,6vw,28px)}
    .qr-full .status{display:inline-flex;margin-top:12px}
    @media(min-width:800px){main.page{max-width:680px}}
  `]
})
export class QrPassPage implements OnInit {
  monthKey = new Date().toISOString().slice(0, 7);
  pass?: QrPass;
  constructor(private api: ApiService, private offline: OfflineService) {}
  ngOnInit() { this.refresh(); }
  async refresh() {
    this.api.monthlyQr(this.monthKey).subscribe({
      next: async pass => { this.pass = pass; await this.offline.cacheQr(pass); },
      error: async () => this.pass = await this.offline.get<QrPass | undefined>(`qr:${this.monthKey}`, undefined)
    });
  }
}
