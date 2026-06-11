import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonTabBar,
  IonTabButton,
  IonTabs,
  MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  busOutline,
  cardOutline,
  gridOutline,
  locationOutline,
  logOutOutline,
  menuOutline,
  notificationsOutline,
  peopleOutline,
  personOutline,
  qrCodeOutline,
  scanOutline
} from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-tabs',
  imports: [
    RouterLink,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonTabs,
    IonTabBar,
    IonTabButton
  ],
  template: `
    <ion-menu contentId="main-tabs" type="overlay" class="app-menu">
      <ion-content>
        <div class="menu-head">
          <div class="menu-avatar">{{ initials(user.fullName || role) }}</div>
          <div>
            <strong>{{ user.fullName || roleLabel }}</strong>
            <span>{{ roleLabel }}</span>
          </div>
        </div>

        <ion-list lines="none">
          @for (item of menuItems; track item.path) {
            <ion-menu-toggle autoHide="true">
              <ion-item button [routerLink]="item.path" routerDirection="root">
                <ion-icon slot="start" [name]="item.icon"></ion-icon>
                <ion-label>{{ item.label }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          }
          <ion-item button class="logout-item" (click)="logout()">
            <ion-icon slot="start" name="log-out-outline"></ion-icon>
            <ion-label>Log Out</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <nav class="app-navbar">
      <button class="menu-button" type="button" aria-label="Open navigation menu" (click)="openMenu()">
        <ion-icon name="menu-outline"></ion-icon>
      </button>
      <div class="nav-title">
        <strong>Eyang Transport</strong>
        <span>{{ roleLabel }} Portal</span>
      </div>
      <a class="nav-profile" [routerLink]="profilePath" aria-label="Open profile">
        {{ initials(user.fullName || role) }}
      </a>
    </nav>

    <ion-tabs id="main-tabs" [class]="'app-tabs role-' + role">
      <ion-tab-bar slot="bottom" [class]="'role-' + role">
        @if (role === 'student') {
          <ion-tab-button tab="student" href="/app/student"><ion-icon name="grid-outline" /><ion-label>Home</ion-label></ion-tab-button>
          <ion-tab-button tab="qr" href="/app/qr"><ion-icon name="qr-code-outline" /><ion-label>My QR</ion-label></ion-tab-button>
          <ion-tab-button tab="track" href="/app/track"><ion-icon name="location-outline" /><ion-label>Track</ion-label></ion-tab-button>
          <ion-tab-button tab="reservation" href="/app/reservation"><ion-icon name="bus-outline" /><ion-label>Reserve</ion-label></ion-tab-button>
          <ion-tab-button tab="profile" href="/app/profile"><ion-icon name="person-outline" /><ion-label>Profile</ion-label></ion-tab-button>
        }
        @if (role === 'driver') {
          <ion-tab-button tab="driver" href="/app/driver"><ion-icon name="scan-outline" /><ion-label>Scan</ion-label></ion-tab-button>
          <ion-tab-button tab="track" href="/app/track"><ion-icon name="location-outline" /><ion-label>Map</ion-label></ion-tab-button>
          <ion-tab-button tab="profile" href="/app/profile"><ion-icon name="person-outline" /><ion-label>Profile</ion-label></ion-tab-button>
        }
        @if (role === 'admin') {
          <ion-tab-button tab="admin" href="/app/admin"><ion-icon name="grid-outline" /><ion-label>Overview</ion-label></ion-tab-button>
          <ion-tab-button tab="students" href="/app/students"><ion-icon name="people-outline" /><ion-label>Students</ion-label></ion-tab-button>
          <ion-tab-button tab="payments" href="/app/payments"><ion-icon name="card-outline" /><ion-label>Payments</ion-label></ion-tab-button>
          <ion-tab-button tab="drivers" href="/app/drivers"><ion-icon name="people-outline" /><ion-label>Drivers</ion-label></ion-tab-button>
          <ion-tab-button tab="admin-profile" href="/app/admin-profile"><ion-icon name="person-outline" /><ion-label>Account</ion-label></ion-tab-button>
        }
      </ion-tab-bar>
    </ion-tabs>
  `
})
export class TabsPage {
  user = JSON.parse(localStorage.getItem('ests_user') || '{}');
  role = this.user.role || 'student';

  get roleLabel() {
    return this.role.charAt(0).toUpperCase() + this.role.slice(1);
  }

  get profilePath() {
    return this.role === 'admin' ? '/app/admin-profile' : '/app/profile';
  }

  get menuItems() {
    if (this.role === 'driver') {
      return [
        { label: 'Scan Students', path: '/app/driver', icon: 'scan-outline' },
        { label: 'Live Map', path: '/app/track', icon: 'location-outline' },
        { label: 'Profile', path: '/app/profile', icon: 'person-outline' }
      ];
    }
    if (this.role === 'admin') {
      return [
        { label: 'Overview', path: '/app/admin', icon: 'grid-outline' },
        { label: 'Students', path: '/app/students', icon: 'people-outline' },
        { label: 'Payments', path: '/app/payments', icon: 'card-outline' },
        { label: 'Drivers', path: '/app/drivers', icon: 'bus-outline' },
        { label: 'Account', path: '/app/admin-profile', icon: 'person-outline' }
      ];
    }
    return [
      { label: 'Home', path: '/app/student', icon: 'grid-outline' },
      { label: 'My QR Pass', path: '/app/qr', icon: 'qr-code-outline' },
      { label: 'Track Bus', path: '/app/track', icon: 'location-outline' },
      { label: 'Reservation', path: '/app/reservation', icon: 'bus-outline' },
      { label: 'Notifications', path: '/app/notifications', icon: 'notifications-outline' },
      { label: 'Profile', path: '/app/profile', icon: 'person-outline' }
    ];
  }

  constructor(private menu: MenuController, private router: Router) {
    addIcons({
      gridOutline,
      qrCodeOutline,
      locationOutline,
      busOutline,
      cardOutline,
      peopleOutline,
      scanOutline,
      personOutline,
      menuOutline,
      logOutOutline,
      notificationsOutline
    });
  }

  openMenu() {
    void this.menu.open();
  }

  logout() {
    localStorage.removeItem('ests_token');
    localStorage.removeItem('ests_user');
    localStorage.removeItem('active_round');
    void this.menu.close();
    void this.router.navigateByUrl('/login');
  }

  initials(name = '?') {
    return name.split(' ').map((part: string) => part[0]).slice(0, 2).join('').toUpperCase();
  }
}
