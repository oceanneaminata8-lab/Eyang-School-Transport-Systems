import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, logInOutline, personAddOutline, qrCodeOutline, shieldCheckmarkOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  imports: [IonButton, IonContent, IonIcon],
  template: `
    <ion-content fullscreen>
      <main class="splash">
        <section class="actions">
          <ion-button class="login-button"  (click)="goToLogin()">
            <ion-icon name="log-in-outline" slot="start" />
            Login
          </ion-button>
          <ion-button class="signup-button" expand="block" (click)="goToSignup()">
            <ion-icon name="person-add-outline" slot="start" />
            Sign Up
          </ion-button>
        </section>

        <section class="features">
          <div class="feat-item"><ion-icon name="shield-checkmark-outline" /><span>Secure Access</span></div>
          <div class="feat-item"><ion-icon name="location-outline" /><span>Live Tracking</span></div>
          <div class="feat-item"><ion-icon name="qr-code-outline" /><span>QR Boarding</span></div>
        </section>
      </main>
    </ion-content>
  `,
  styles: [`
    .splash {
      position: relative;
      min-height: 100%;
      padding: max(32px, env(safe-area-inset-top)) clamp(18px, 5vw, 48px) max(28px, env(safe-area-inset-bottom));
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      color: #fff;
      overflow: hidden;
    }

    .splash::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.9)), url('/assets/Splash_Screen.jpg') center/cover no-repeat;
      z-index: 0;
    }

    .splash > * {
      position: relative;
      z-index: 1;
    }

    .brand-block {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .crest {
      width: 60px;
      height: 60px;
      background: white;
      padding: 6px;
      border-radius: 14px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    }

    .institute {
      margin: 0;
      font-size: 18px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .system-name {
      margin: 2px 0 0;
      font-size: 12px;
      color: #3b82f6;
      font-weight: 700;
      text-transform: uppercase;
    }

    .hero-copy {
      margin: 40px 0;
      text-align: center;
      padding: 0 20px;
    }

    .hero-copy h1 {
      font-size: 42px;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 16px;
    }

    .hero-copy h1 span {
      display: block;
      color: #3b82f6;
    }

    .hero-copy p {
      font-size: 18px;
      line-height: 1.5;
      color: rgba(255,255,255,0.8);
      font-weight: 500;
    }

    .actions {
      width: min(100%, 460px);
      display: flex;
      justify-content: center;
      gap: 14px;
      margin: auto 0 36px;
    }

    .actions ion-button {
      flex: 1;
      height: 60px;
      --border-radius: 18px;
      font-weight: 800;
      font-size: 16px;
      text-transform: none;
      margin: 0;
    }

    .login-button {
      --background: #fff;
      --color: #0f172a;
    }

    .signup-button {
      --background: rgba(255,255,255,0.15);
      --color: #fff;
      backdrop-filter: blur(10px);
    }

    .features {
      width: min(100%, 620px);
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    .feat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .feat-item ion-icon {
      font-size: 24px;
      color: #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      padding: 10px;
      border-radius: 50%;
    }

    .feat-item span {
      font-size: 11px;
      font-weight: 700;
      color: rgba(255,255,255,0.7);
    }

    @media (max-height: 700px) {
      .hero-copy h1 { font-size: 32px; }
      .hero-copy p { font-size: 16px; }
      .features { display: none; }
    }

    @media (max-width: 520px) {
      .actions {
        flex-direction: column;
        margin-bottom: 26px;
      }

      .actions ion-button {
        width: 100%;
        flex: none;
      }

      .features {
        gap: 4px;
      }

      .feat-item span {
        font-size: 10px;
        text-align: center;
      }
    }

    @media (orientation: landscape) and (max-height: 540px) {
      .splash {
        justify-content: center;
        gap: 20px;
      }

      .actions {
        margin: 0;
      }

      .features {
        display: none;
      }
    }
  `]
})
export class SplashPage {
  constructor(private router: Router) {
    addIcons({ logInOutline, personAddOutline, shieldCheckmarkOutline, locationOutline, qrCodeOutline });
  }

  goToLogin() {
    this.router.navigate(['/login'], { queryParams: { mode: 'login' } });
  }

  goToSignup() {
    this.router.navigate(['/login'], { queryParams: { mode: 'signup' } });
  }
}
