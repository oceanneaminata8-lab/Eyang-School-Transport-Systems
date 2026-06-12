import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { carOutline, qrCodeOutline, locationOutline, checkmarkCircleOutline, alertCircleOutline, shieldCheckmarkOutline, cameraOutline, refreshOutline } from 'ionicons/icons';
import { Html5Qrcode } from 'html5-qrcode';
import { ApiService, BootstrapData, PickupRound } from '../core/api.service';
import { OfflineService } from '../core/offline.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
  template: `
    <ion-content class="driver-content">
      <main class="page driver-page">
        <section class="hero">
          <header class="topbar">
            <div class="user-info">
              <div class="avatar-container">
                <div class="avatar-fallback">{{ initials(driverName) }}</div>
              </div>
              <div class="welcome-text">
                <p class="greeting">Welcome,</p>
                <h2 class="user-name">{{ driverName }}</h2>
              </div>
            </div>
            <div class="role-badge">Driver</div>
          </header>

          <section class="info-card">
            <div class="info-icon">
              <ion-icon name="shield-checkmark-outline"></ion-icon>
            </div>
            <div class="info-text">
              <h3>Security Boarding</h3>
              <p>Scan student QR passes to verify payment and reservation.</p>
            </div>
          </section>

          <section class="bus-config">
            <div class="section-header light">
              <h3><ion-icon name="car-outline"></ion-icon> Bus Details</h3>
            </div>
            <div class="config-card">
              <label class="bus-field plate-field">
                <span>Plate Number</span>
                <input [(ngModel)]="plate" placeholder="LT 0000 X" />
              </label>
              <label class="bus-field">
                <span>Color</span>
                <input [(ngModel)]="color" placeholder="Blue" />
              </label>
              <label class="bus-field">
                <span>Capacity</span>
                <input type="number" [(ngModel)]="capacity" placeholder="30" />
              </label>
            </div>
          </section>
        </section>

        <section class="lower-panel">
          <div class="main-actions">
            <button class="btn-primary" type="button" [disabled]="startingRound || !assignedBus" (click)="startRound()">
              <ion-icon name="qr-code-outline"></ion-icon>
              {{ startingRound ? 'Starting Round...' : (round ? 'Pickup Round Active' : 'Start Pickup Round') }}
            </button>
            <button class="btn-secondary" type="button" [disabled]="!assignedBus" (click)="sendGps()">
              <ion-icon name="location-outline"></ion-icon>
              Send GPS
            </button>
          </div>

          <section class="scanner-section">
            <div class="section-header light">
              <h3><ion-icon name="qr-code-outline"></ion-icon> QR Scanner</h3>
            </div>
            <div class="scanner-container">
              <div id="reader"></div>
              @if (!cameraActive) {
                <div class="camera-placeholder">
                  <ion-icon name="camera-outline"></ion-icon>
                  <p>{{ cameraStatus }}</p>
                  <button type="button" class="camera-button" [disabled]="cameraStarting" (click)="initScanner()">
                    <ion-icon [name]="cameraStarting ? 'refresh-outline' : 'camera-outline'"></ion-icon>
                    {{ cameraStarting ? 'Opening Camera...' : 'Enable Camera' }}
                  </button>
                </div>
              }
            </div>
          </section>

          @if (message) {
            <div class="scan-result" [class.granted]="lastScanValid === true" [class.denied]="lastScanValid === false">
              <ion-icon [name]="lastScanValid ? 'checkmark-circle-outline' : 'alert-circle-outline'"></ion-icon>
              <div class="result-text">
                <h4>{{ lastScanValid === true ? 'Access Granted' : (lastScanValid === false ? 'Access Denied' : 'Notice') }}</h4>
                <p>{{ message }}</p>
              </div>
            </div>
          }
        </section>
      </main>
    </ion-content>
  `,
  styles: [`
    :host {
      --driver-blue: #2f75f4;
      --driver-navy: #07162c;
    }

    .driver-content {
      --background: #6f6b67;
    }

    .driver-page {
      max-width: 760px;
      padding: 0 0 32px;
      background: #726e69;
      min-height: 100%;
      overflow: hidden;
    }

    .hero {
      position: relative;
      min-height: 720px;
      padding: 112px 56px 32px;
      background:
        linear-gradient(180deg, rgba(0, 100, 180, .18) 0%, rgba(3, 19, 42, .03) 42%, rgba(3, 16, 34, .7) 100%),
        url('/assets/ChatGPT Image May 25, 2026, 08_40_04 PM.png') center top / cover no-repeat;
    }

    .hero::after {
      content: '';
      position: absolute;
      inset: auto 0 0;
      height: 250px;
      background: url('/assets/student-dashboard-bus.png') 62% 58% / cover no-repeat;
      opacity: .92;
      mask-image: linear-gradient(to bottom, transparent, #000 28%);
      -webkit-mask-image: linear-gradient(to bottom, transparent, #000 28%);
    }

    .topbar, .info-card, .bus-config {
      position: relative;
      z-index: 1;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .avatar-fallback {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: rgba(5, 20, 43, .95);
      border: 1px solid rgba(255,255,255,.9);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 23px;
      box-shadow: 0 12px 28px rgba(3, 15, 35, .25);
    }

    .welcome-text .greeting {
      margin: 0;
      font-size: 16px;
      color: white;
      font-weight: 600;
      text-shadow: 0 2px 8px rgba(0,0,0,.4);
    }

    .user-name {
      margin: 2px 0 0;
      font-size: 24px;
      font-weight: 900;
      color: white;
      text-shadow: 0 2px 8px rgba(0,0,0,.45);
    }

    .role-badge {
      background: rgba(255,255,255,.9);
      color: #3474e8;
      padding: 10px 22px;
      border-radius: 99px;
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      box-shadow: 0 8px 20px rgba(15, 53, 96, .14);
    }

    .info-card {
      background: rgba(4, 18, 39, .96);
      color: white;
      padding: 26px 30px;
      border-radius: 30px;
      display: flex;
      align-items: center;
      gap: 22px;
      margin: 54px 0 34px;
      box-shadow: 0 18px 40px rgba(2, 10, 23, .32);
    }

    .info-icon {
      width: 54px;
      height: 54px;
      flex: 0 0 54px;
      background: rgba(255,255,255,.1);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #3f83f8;
    }

    .info-text h3 {
      margin: 0;
      font-size: 21px;
      font-weight: 900;
    }

    .info-text p {
      margin: 6px 0 0;
      font-size: 16px;
      color: #cbd5e1;
      font-weight: 500;
    }

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 14px;
    }

    .section-header h3 {
      margin: 0;
      font-size: 21px;
      font-weight: 900;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-header.light h3 {
      color: white;
      text-shadow: 0 2px 8px rgba(0,0,0,.55);
    }

    .config-card {
      background: rgba(255,255,255,.88);
      border-radius: 28px;
      padding: 18px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      border: 1px solid rgba(255,255,255,.7);
      box-shadow: 0 16px 36px rgba(10, 26, 48, .2);
      backdrop-filter: blur(15px);
    }

    .bus-field {
      min-width: 0;
      padding: 13px 17px;
      background: rgba(255,255,255,.6);
    }

    .plate-field {
      grid-column: 1 / -1;
    }

    .bus-field span {
      display: block;
      font-size: 13px;
      color: #111827;
      margin-bottom: 4px;
    }

    .bus-field input {
      width: 100%;
      border: 0;
      outline: 0;
      padding: 0;
      background: transparent;
      color: #090f1c;
      font: inherit;
      font-size: 19px;
    }

    .lower-panel {
      position: relative;
      z-index: 2;
      margin-top: -1px;
      padding: 28px 56px 32px;
      background:
        linear-gradient(rgba(61, 60, 59, .56), rgba(61, 60, 59, .56)),
        url('/assets/driver-bus-interior.png') center / cover fixed;
    }

    .main-actions {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 16px;
      margin-bottom: 34px;
    }

    .main-actions button {
      min-height: 68px;
      padding: 16px 20px;
      border-radius: 24px;
      font-weight: 900;
      font-size: 17px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .main-actions button:disabled {
      opacity: .6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #377ff6, #2f6fe9);
      color: white;
      box-shadow: 0 12px 26px rgba(35, 101, 235, .4);
    }

    .btn-secondary {
      background: rgba(255,255,255,.95);
      color: #0f172a;
    }

    .scanner-section {
      margin-bottom: 22px;
    }

    .scanner-container {
      position: relative;
      min-height: 255px;
      background: rgba(255,255,255,.97);
      border-radius: 28px;
      padding: 18px;
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(24, 24, 27, .18);
    }

    .camera-placeholder {
      min-height: 280px;
      padding: 32px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      text-align: center;
      color: #dbe8ff;
    }

    .camera-placeholder > ion-icon {
      font-size: 54px;
      color: #79a9ff;
    }

    .camera-placeholder p {
      max-width: 440px;
      margin: 0;
      line-height: 1.5;
    }

    .camera-button {
      min-height: 46px;
      padding: 0 22px;
      border: 0;
      border-radius: 14px;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      background: #2f75f4;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .camera-button:disabled {
      opacity: .65;
      cursor: wait;
    }

    #reader {
      border: none !important;
      border-radius: 18px;
      overflow: hidden;
      min-height: 215px;
    }

    .scan-result {
      background: rgba(255,255,255,.96);
      border-radius: 20px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .scan-result ion-icon {
      font-size: 32px;
      color: #64748b;
    }

    .result-text h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }

    .result-text p {
      margin: 2px 0 0;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    .scan-result.granted {
      background: #f0fdf4;
      border-color: #bcf2ce;
    }

    .scan-result.granted ion-icon, .scan-result.granted h4 {
      color: #22c55e;
    }

    .scan-result.denied {
      background: #fef2f2;
      border-color: #fecaca;
    }

    .scan-result.denied ion-icon, .scan-result.denied h4 {
      color: #ef4444;
    }

    @media (max-width: 600px) {
      .hero {
        min-height: 680px;
        padding: 104px 22px 26px;
      }

      .avatar-fallback {
        width: 54px;
        height: 54px;
        border-radius: 17px;
        font-size: 19px;
      }

      .user-name { font-size: 20px; }
      .welcome-text .greeting { font-size: 14px; }
      .role-badge { padding: 8px 15px; font-size: 12px; }
      .info-card { margin-top: 48px; }
      .info-card { padding: 22px; border-radius: 25px; }
      .info-text h3 { font-size: 18px; }
      .info-text p { font-size: 14px; }
      .section-header h3 { font-size: 19px; }
      .lower-panel { padding: 26px 22px 30px; background-attachment: scroll; }
      .main-actions button { min-height: 62px; font-size: 14px; border-radius: 21px; }
    }

    @media (max-width: 390px) {
      .hero { padding-left: 16px; padding-right: 16px; }
      .lower-panel { padding-left: 16px; padding-right: 16px; }
      .main-actions { grid-template-columns: 1fr; gap: 10px; }
      .main-actions button { padding: 12px 8px; font-size: 12px; }
      .info-icon { display: none; }
      .config-card { grid-template-columns: 1fr; }
      .plate-field { grid-column: auto; }
      .scanner-container { padding: 10px; }
      .camera-placeholder { min-height: 230px; padding-inline: 12px; }
    }
  `]
})
export class DriverPage implements OnInit, OnDestroy {
  data?: BootstrapData; round?: PickupRound; message = '';
  lastScanValid?: boolean;
  scanning = false;
  lastToken = '';
  lastScanAt = 0;
  startingRound = false;
  cameraActive = false;
  cameraStarting = false;
  cameraStatus = 'Select Enable Camera, then choose Allow in Chrome.';
  private scanner?: Html5Qrcode;
  driverName = 'Driver';
  plate = 'LT 4892 A'; color = 'Blue'; capacity = 30;
  get currentUser() { return JSON.parse(localStorage.getItem('ests_user') || '{}'); }
  get assignedBus() { return this.data?.buses.find(bus => bus.driver_id === this.currentUser.id); }
  get busId() { return this.assignedBus?.id || ''; }

  constructor(private api: ApiService, private offline: OfflineService) {
    addIcons({ carOutline, qrCodeOutline, locationOutline, checkmarkCircleOutline, alertCircleOutline, shieldCheckmarkOutline, cameraOutline, refreshOutline });
  }

  ngOnInit() {
    this.api.bootstrap().subscribe({
      next: data => {
        this.data = data;
        this.driverName = data.profile?.full_name || this.currentUser.fullName || 'Driver';
        this.plate = this.assignedBus?.plate_number || this.plate;
        this.color = this.assignedBus?.color || this.color;
        this.capacity = this.assignedBus?.capacity || this.capacity;
        if (!this.assignedBus) {
          this.lastScanValid = false;
          this.message = 'No bus is assigned to this driver account. Ask an administrator to assign a bus before starting a pickup round.';
        }
      },
      error: error => {
        this.lastScanValid = false;
        this.message = this.apiErrorMessage(error, 'Could not load the driver account. Please sign in again and retry.');
      }
    });
    window.addEventListener('online', () => this.offline.syncQueuedScans());
  }

  ngOnDestroy() {
    if (this.scanner?.isScanning) {
      void this.scanner.stop().catch(() => undefined);
    }
  }

  startRound() {
    if (this.startingRound || this.round) return;
    if (!this.busId) {
      this.lastScanValid = false;
      this.message = 'A bus must be assigned to your driver account before you can start a pickup round.';
      return;
    }

    this.startingRound = true;
    this.lastScanValid = undefined;
    this.message = 'Starting pickup round...';
    this.api.startRound(this.busId).subscribe({
      next: round => {
        this.round = round;
        localStorage.setItem('active_round', round.id);
        this.lastScanValid = true;
        this.message = `Pickup round started. ${round.notifiedStudents || 0} students notified.`;
        this.startingRound = false;
      },
      error: error => {
        this.lastScanValid = false;
        this.message = this.apiErrorMessage(error, 'Could not start the pickup round. Check your connection and try again.');
        this.startingRound = false;
      }
    });
  }

  async sendGps() {
    if (!this.busId) return;
    const pos = await Geolocation.getCurrentPosition();
    this.api.gps(this.busId, pos.coords.latitude, pos.coords.longitude).subscribe(() => {
      this.lastScanValid = undefined;
      this.message = 'GPS location sent successfully.';
    });
  }

  async initScanner() {
    if (this.cameraStarting || this.cameraActive) return;

    this.cameraStarting = true;
    this.lastScanValid = undefined;
    this.message = '';

    try {
      if (!window.isSecureContext && location.hostname !== 'localhost') {
        throw new Error('Camera scanning requires a secure context');
      }

      if (this.scanner) {
        this.clearScanner();
      }

      this.scanner = new Html5Qrcode('reader');
      await this.scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        token => this.handleScan(token),
        () => undefined
      );
      this.cameraActive = true;
      this.cameraStatus = 'Camera is active.';
    } catch (error) {
      this.cameraActive = false;
      this.lastScanValid = false;
      this.message = this.cameraErrorMessage(error);
      this.cameraStatus = this.message;
      this.clearScanner();
      this.scanner = undefined;
    } finally {
      this.cameraStarting = false;
    }
  }

  private clearScanner() {
    try {
      this.scanner?.clear();
    } catch {
      // The scanner may already have released the video element after a failed start.
    }
  }

  private apiErrorMessage(error: any, fallback: string) {
    if (error?.status === 0) {
      return 'The server could not be reached. Check that the backend is running and try again.';
    }
    if (error?.status === 401) {
      return 'Your session has expired. Sign in again before starting a pickup round.';
    }
    return error?.error?.message || fallback;
  }

  private cameraErrorMessage(error: unknown) {
    const detail = String(error || '').toLowerCase();
    if (detail.includes('permission') || detail.includes('notallowed')) {
      return 'Chrome blocked the camera. Select the camera or site-controls icon beside the address, set Camera to Allow, reload this page, then select Enable Camera.';
    }
    if (!window.isSecureContext && location.hostname !== 'localhost') {
      return 'Camera scanning requires HTTPS or localhost.';
    }
    return 'Could not start the camera. Check that another app is not using it, then reopen this page.';
  }

  private async handleScan(token: string) {
    const roundId = this.round?.id || localStorage.getItem('active_round') || '';
    const now = Date.now();
    if (this.scanning || (token === this.lastToken && now - this.lastScanAt < 3500)) return;
    this.scanning = true;
    this.lastToken = token;
    this.lastScanAt = now;
    this.lastScanValid = undefined;
    this.message = 'Checking QR pass...';

    if (!roundId || !this.busId) {
      this.lastScanValid = false;
      this.message = 'Start a pickup round before scanning.';
      this.scanning = false;
      return;
    }

    if (!navigator.onLine) {
      await this.offline.queueScan({ token, roundId, busId: this.busId });
      this.message = 'Offline scan saved. Will sync when online.';
      this.scanning = false;
      return;
    }

    this.api.validateBoarding({ token, roundId, busId: this.busId }).subscribe(result => {
      this.lastScanValid = result.valid;
      this.message = result.valid
        ? `Access granted for ${result.studentName || 'Student'}.`
        : `Access denied: ${result.reason}`;
      setTimeout(() => this.scanning = false, 1200);
    }, err => {
      this.lastScanValid = false;
      this.message = err.error?.message || 'Scan failed.';
      this.scanning = false;
    });
  }

  initials(name = '?') {
    return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  }
}
