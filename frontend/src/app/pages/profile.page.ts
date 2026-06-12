import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonInput, IonItem, IonText } from '@ionic/angular/standalone';
import { ApiService, BootstrapData } from '../core/api.service';
import { OfflineService } from '../core/offline.service';

@Component({
  standalone: true,
  imports: [FormsModule, IonContent, IonButton, IonInput, IonItem, IonText],
  template: `
    <ion-content>
      <main class="page">
        <header class="topbar">
          <div><p class="muted">Account</p><h1 class="title">Profile</h1></div>
          @if (photoPreview || photoDataUrl) {
            <img class="profile-photo" [src]="photoPreview || photoDataUrl" alt="Profile photo">
          } @else {
            <div class="avatar">{{ initials(fullName) }}</div>
          }
        </header>

        <section class="card form">
          <div class="photo-row">
            <div><h2>Personal Details</h2><p class="muted">Update your name, password, and photo.</p></div>
            <label class="photo-button">Upload photo<input type="file" accept="image/*" (change)="onPhotoSelected($event)"></label>
          </div>
          <ion-item><ion-input label="Name" labelPlacement="stacked" [(ngModel)]="fullName" /></ion-item>
          <ion-item><ion-input label="Email" labelPlacement="stacked" type="email" [(ngModel)]="email" /></ion-item>
          @if (role === 'student') {
            <ion-item><ion-input label="Matricule" labelPlacement="stacked" [(ngModel)]="matricule" /></ion-item>
            <ion-item><ion-input label="Level" labelPlacement="stacked" [(ngModel)]="levelLabel" /></ion-item>
            <ion-item><ion-input label="Department" labelPlacement="stacked" [(ngModel)]="department" /></ion-item>
          }
          <ion-item><ion-input label="New password" labelPlacement="stacked" type="password" placeholder="Leave blank to keep current password" [(ngModel)]="password" /></ion-item>
          <ion-button expand="block" class="primary-button" (click)="save()">Save Profile</ion-button>
          <button class="logout-button" type="button" (click)="logout()">Log Out</button>
          @if (message) { <ion-text>{{ message }}</ion-text> }
        </section>
      </main>
    </ion-content>
  `,
  styles: [`
    .profile-photo{width:48px;height:48px;border-radius:14px;object-fit:cover}
    .form{padding:18px}.form h2{margin:0}.form p{margin:4px 0 0}
    .photo-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}
    .photo-button{position:relative;display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 14px;border-radius:14px;background:#edf1f7;color:#215be6;font-weight:800;font-size:13px;white-space:nowrap}
    .photo-button input{position:absolute;inset:0;opacity:0}
    ion-item{--background:#f2f5fb;--border-radius:16px;margin:12px 0}
    .logout-button{width:100%;min-height:54px;margin-top:12px;border:1px solid #fecaca;border-radius:18px;background:#fff1f2;color:#dc2626;font-weight:850;font-size:15px}
    ion-text{display:block;margin-top:12px;font-weight:750}
    @media(max-width:520px){.photo-row{flex-direction:column}.photo-button{width:100%}.form{padding:16px}.topbar{align-items:center}}
  `]
})
export class ProfilePage implements OnInit {
  fullName = '';
  email = '';
  matricule = '';
  levelLabel = '';
  department = '';
  password = '';
  photoDataUrl = '';
  photoPreview = '';
  message = '';
  role = JSON.parse(localStorage.getItem('ests_user') || '{}').role || 'student';

  constructor(private api: ApiService, private offline: OfflineService, private router: Router) {}

  ngOnInit() {
    this.api.bootstrap().subscribe({
      next: async data => { await this.offline.cacheBootstrap(data); this.setProfile(data); },
      error: async () => {
        const cached = await this.offline.get<BootstrapData | undefined>('bootstrap', undefined);
        if (cached) this.setProfile(cached);
      }
    });
  }

  setProfile(data: BootstrapData) {
    this.fullName = data.profile?.full_name || '';
    this.email = data.profile?.email || '';
    this.matricule = data.profile?.matricule || '';
    this.levelLabel = data.profile?.level_label || '';
    this.department = data.profile?.department || '';
    this.photoDataUrl = data.profile?.photo_data_url || '';
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.photoPreview = String(reader.result || '');
    reader.readAsDataURL(file);
  }

  save() {
    this.message = '';
    if (!this.fullName.trim() || !this.email.trim()) {
      this.message = 'Please enter your name and email.';
      return;
    }
    this.api.updateProfile({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      photoDataUrl: this.photoPreview,
      matricule: this.matricule,
      levelLabel: this.levelLabel,
      department: this.department
    }).subscribe({
      next: profile => {
        this.message = 'Profile updated.';
        this.password = '';
        this.photoDataUrl = profile.photo_data_url || this.photoDataUrl;
        const stored = JSON.parse(localStorage.getItem('ests_user') || '{}');
        stored.fullName = profile.full_name;
        stored.email = profile.email;
        stored.photoDataUrl = profile.photo_data_url;
        localStorage.setItem('ests_user', JSON.stringify(stored));
      },
      error: err => this.message = err.error?.message || 'Could not update profile.'
    });
  }

  logout() {
    localStorage.removeItem('ests_token');
    localStorage.removeItem('ests_user');
    localStorage.removeItem('active_round');
    void this.router.navigateByUrl('/login');
  }

  initials(name = '?') {
    return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  }
}
