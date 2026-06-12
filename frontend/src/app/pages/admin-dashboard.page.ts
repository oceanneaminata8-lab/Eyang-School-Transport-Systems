import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonItem, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { busOutline, cardOutline, checkmarkCircleOutline, peopleOutline } from 'ionicons/icons';
import { AdminDashboard, ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [FormsModule, IonContent, IonButton, IonIcon, IonInput, IonItem, IonText, RouterLink],
  template: `
    <ion-content class="admin-content">
      <main class="page admin-page">
        <header class="dashboard-hero">
          <div class="hero-copy">
            <p class="eyebrow">Transport Management</p>
            <h1>Good morning, {{ profileName || 'Admin' }}</h1>
            <p>{{ monthLabel }} <span aria-hidden="true">•</span> Active period</p>
          </div>
          <a class="profile-link" routerLink="/app/admin-profile" aria-label="Open admin profile">
            @if (photoPreview || data?.profile?.photo_data_url) {
              <img class="profile-photo" [src]="photoPreview || data?.profile?.photo_data_url" alt="Admin photo">
            } @else {
              <div class="avatar">AD</div>
            }
          </a>
        </header>

        @if (error) {
          <div class="dashboard-message dashboard-message--error">{{ error }}</div>
        }

        @if (!data && !error) {
          <div class="dashboard-message">Loading dashboard...</div>
        } @else if (data) {
          <section class="overview-section" aria-labelledby="overview-title">
            <div class="section-heading">
              <div>
                <p class="section-kicker">Live summary</p>
                <h2 id="overview-title">Overview</h2>
              </div>
            </div>
            <div class="metric-grid">
              <article class="metric metric--blue"><span class="metric-icon"><ion-icon name="people-outline" /></span><strong>{{ data.students || 0 }}</strong><span>Students</span><small>Registered accounts</small></article>
              <article class="metric metric--green"><span class="metric-icon"><ion-icon name="checkmark-circle-outline" /></span><strong>{{ data.active || 0 }}</strong><span>Active payments</span><small>Paid this month</small></article>
              <article class="metric metric--amber"><span class="metric-icon"><ion-icon name="card-outline" /></span><strong>{{ data.pending || 0 }}</strong><span>Pending payments</span><small>Need validation</small></article>
              <article class="metric metric--purple"><span class="metric-icon"><ion-icon name="bus-outline" /></span><strong>{{ assignedBuses.length }}</strong><span>Assigned buses</span><small>{{ unassignedBuses.length }} unassigned</small></article>
            </div>
          </section>

          <section class="quick-section" aria-labelledby="quick-title">
            <div class="section-heading">
              <div>
                <p class="section-kicker">Shortcuts</p>
                <h2 id="quick-title">Quick Actions</h2>
              </div>
            </div>
            <div class="quick">
              <ion-button routerLink="/app/students" class="action-button action-button--primary"><ion-icon name="people-outline" /><span>Add Student</span></ion-button>
              <ion-button routerLink="/app/payments" class="action-button"><ion-icon name="card-outline" /><span>Validate Payment</span></ion-button>
              <ion-button routerLink="/app/drivers" class="action-button"><ion-icon name="bus-outline" /><span>Add Driver</span></ion-button>
            </div>
          </section>

          <div class="dashboard-grid">
            <div class="dashboard-main">
              <section class="dashboard-panel">
                <div class="section-heading">
                  <div><p class="section-kicker">Fleet</p><h2>Assigned Buses</h2></div>
                  <span class="count-badge">{{ assignedBuses.length }}</span>
                </div>
                <div class="card list-card">
                  @for (bus of assignedBuses; track bus.id) {
                    <div class="row bus-row">
                      <div class="icon-pill"><ion-icon name="bus-outline" /></div>
                      <div class="row-main">
                        <h3>{{ bus.plate_number }}</h3>
                        <div class="detail-list">
                          <span>{{ bus.driver_name }}</span>
                          <span>{{ bus.pickup_point || 'No pickup assigned' }}</span>
                          <span>{{ bus.capacity }} seats</span>
                        </div>
                      </div>
                    </div>
                  } @empty {
                    <div class="empty-state">No buses are currently assigned.</div>
                  }
                </div>
              </section>

              <section class="dashboard-panel">
                <div class="section-heading">
                  <div><p class="section-kicker">Routes</p><h2>Pickup Points</h2></div>
                  <span class="count-badge">{{ data.pickupPoints.length }}</span>
                </div>
                <div class="card pickup-grid">
                  @for (point of data.pickupPoints; track point.id) {
                    <div class="pickup-card">
                      <div class="icon-pill">P</div>
                      <div><h3>{{ point.name }}</h3><p>{{ point.latitude }}, {{ point.longitude }}</p></div>
                    </div>
                  } @empty {
                    <div class="empty-state">No pickup points have been configured.</div>
                  }
                </div>
              </section>
            </div>

            <aside class="dashboard-side">
              <section class="dashboard-panel">
                <div class="section-heading">
                  <div><p class="section-kicker">Attention</p><h2>Unassigned Buses</h2></div>
                  <span class="count-badge count-badge--warning">{{ unassignedBuses.length }}</span>
                </div>
                <div class="card list-card">
                  @for (bus of unassignedBuses; track bus.id) {
                    <div class="row bus-row bus-row--unassigned">
                      <div class="icon-pill"><ion-icon name="bus-outline" /></div>
                      <div class="row-main">
                        <h3>{{ bus.plate_number }}</h3>
                        <div class="detail-list">
                          <span>{{ bus.color }}</span>
                          <span>{{ bus.pickup_point || 'No pickup assigned' }}</span>
                          <span>{{ bus.capacity }} seats</span>
                        </div>
                      </div>
                      <span class="tag pending">No driver</span>
                    </div>
                  } @empty {
                    <div class="empty-state empty-state--success">Every bus has a driver assigned.</div>
                  }
                </div>
              </section>
            </aside>
          </div>
        }
      </main>
    </ion-content>
  `,
  styles: [`
    :host { display: block; }
    .admin-page { display: flex; flex-direction: column; gap: 26px; }
    .dashboard-hero {
      min-height: 190px;
      padding: clamp(24px, 5vw, 42px);
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,.35);
      border-radius: 30px;
      background:
        radial-gradient(circle at 88% 10%, rgba(105, 163, 255, .42), transparent 32%),
        linear-gradient(135deg, rgba(7, 32, 70, .98), rgba(25, 85, 180, .92));
      box-shadow: 0 24px 60px rgba(3, 15, 34, .28);
      color: #fff;
    }
    .hero-copy { min-width: 0; }
    .hero-copy h1 { margin: 6px 0 8px; font-size: clamp(28px, 5vw, 48px); line-height: 1.06; letter-spacing: -.035em; }
    .hero-copy > p:last-child { margin: 0; color: rgba(255,255,255,.78); font-size: clamp(13px, 2vw, 16px); }
    .eyebrow, .section-kicker { margin: 0; font-size: 12px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
    .eyebrow { color: #9fc4ff; }
    .profile-link { flex: 0 0 auto; text-decoration: none; }
    .profile-photo, .profile-link .avatar { width: 64px; height: 64px; border-radius: 20px; border: 3px solid rgba(255,255,255,.55); box-shadow: 0 12px 30px rgba(0,0,0,.22); }
    .profile-photo { display: block; object-fit: cover; }
    .profile-link .avatar { background: #fff; color: #174da5; }
    .overview-section, .quick-section, .dashboard-panel { min-width: 0; }
    .section-heading { margin-bottom: 14px; display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
    .section-heading h2 { margin: 3px 0 0; color: #fff; font-size: clamp(20px, 3vw, 25px); line-height: 1.15; }
    .section-kicker { color: #abc7f4; font-size: 10px; }
    .metric-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
    .metric {
      min-height: 160px;
      padding: 20px;
      display: grid;
      grid-template-columns: 46px 1fr;
      grid-template-rows: auto auto auto;
      column-gap: 14px;
      align-content: center;
      border: 1px solid rgba(255,255,255,.72);
      border-radius: 24px;
      background: rgba(255,255,255,.94);
      box-shadow: 0 18px 42px rgba(3,15,34,.19);
    }
    .metric-icon { grid-row: 1 / 4; width: 46px; height: 46px; display: grid; place-items: center; border-radius: 15px; }
    .metric-icon ion-icon { font-size: 24px; }
    .metric strong { margin: 0; font-size: clamp(26px, 4vw, 34px); line-height: 1; color: #10213e; }
    .metric > span:not(.metric-icon) { margin-top: 7px; color: #24324b; font-weight: 850; line-height: 1.15; }
    .metric small { margin-top: 4px; color: #71809a; line-height: 1.2; }
    .metric--blue .metric-icon { background: #e1ebff; color: #215be6; }
    .metric--green .metric-icon { background: #dff8e9; color: #159b4a; }
    .metric--amber .metric-icon { background: #fff0c7; color: #ce7900; }
    .metric--purple .metric-icon { background: #eee7ff; color: #7248d6; }
    .quick { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .quick .action-button {
      min-width: 0;
      height: 66px;
      margin: 0;
      --border-radius: 20px;
      --background: rgba(255,255,255,.93);
      --color: #183052;
      --box-shadow: 0 16px 34px rgba(3,15,34,.18);
      font-weight: 850;
    }
    .quick .action-button--primary { --background: #2c6ee8; --color: #fff; }
    .quick ion-icon { margin-right: 9px; font-size: 22px; }
    .dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(280px, .85fr); gap: 22px; align-items: start; }
    .dashboard-main, .dashboard-side { min-width: 0; display: grid; gap: 26px; }
    .count-badge { min-width: 34px; height: 34px; padding: 0 10px; display: grid; place-items: center; border-radius: 12px; background: rgba(220,234,255,.95); color: #215be6; font-weight: 900; }
    .count-badge--warning { background: #fff0c7; color: #ad6500; }
    .list-card { border-radius: 24px; }
    .row { gap: 14px; padding: 17px 18px; }
    .bus-row { align-items: flex-start; }
    .row-main h3, .pickup-card h3 { margin: 0; color: #17233a; font-size: 16px; }
    .detail-list { margin-top: 7px; display: flex; flex-wrap: wrap; gap: 6px; }
    .detail-list span { padding: 5px 8px; border-radius: 8px; background: #edf2fa; color: #65738b; font-size: 12px; line-height: 1.2; }
    .bus-row .tag { margin-left: auto; flex: 0 0 auto; }
    .pickup-grid { padding: 8px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .pickup-card { min-width: 0; padding: 13px; display: flex; align-items: center; gap: 12px; border-radius: 17px; background: #f3f6fb; }
    .pickup-card > div:last-child { min-width: 0; }
    .pickup-card p { margin: 5px 0 0; color: #7a879d; font-size: 12px; overflow-wrap: anywhere; }
    .empty-state { padding: 28px 18px; color: #738098; text-align: center; }
    .empty-state--success { color: #168b48; }
    .dashboard-message { padding: 18px 20px; border-radius: 18px; background: rgba(255,255,255,.92); color: #27405f; font-weight: 750; box-shadow: 0 14px 36px rgba(3,15,34,.18); }
    .dashboard-message--error { background: #fff0f0; color: #ba2636; }

    @media (max-width: 900px) {
      .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .dashboard-grid { grid-template-columns: 1fr; }
      .dashboard-side { grid-row: auto; }
    }

    @media (max-width: 620px) {
      .admin-page { gap: 22px; }
      .dashboard-hero { min-height: 168px; padding: 24px 20px; border-radius: 24px; align-items: center; }
      .profile-photo, .profile-link .avatar { width: 52px; height: 52px; border-radius: 17px; }
      .metric { min-height: 142px; padding: 16px; grid-template-columns: 40px 1fr; column-gap: 10px; border-radius: 20px; }
      .metric-icon { width: 40px; height: 40px; border-radius: 13px; }
      .quick { grid-template-columns: 1fr; }
      .quick .action-button { height: 58px; }
      .pickup-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 390px) {
      .dashboard-hero { align-items: flex-start; }
      .hero-copy h1 { max-width: 230px; font-size: 27px; }
      .metric-grid { gap: 10px; }
      .metric { min-height: 135px; padding: 14px 12px; display: flex; flex-direction: column; align-items: flex-start; gap: 5px; }
      .metric-icon { width: 38px; height: 38px; margin-bottom: 4px; }
      .metric strong { font-size: 27px; }
      .metric > span:not(.metric-icon), .metric small { margin-top: 0; }
      .row { padding: 15px 13px; }
      .bus-row--unassigned { flex-wrap: wrap; }
      .bus-row--unassigned .tag { margin-left: 60px; }
    }
  `]
})
export class AdminDashboardPage implements OnInit {
  data?: AdminDashboard;
  profileName = '';
  photoPreview = '';
  error = '';
  monthLabel = new Date().toLocaleString('en', { month: 'long', year: 'numeric' });
  get assignedBuses() { return (this.data?.buses || []).filter(bus => !!bus.driver_id); }
  get unassignedBuses() { return (this.data?.buses || []).filter(bus => !bus.driver_id); }

  constructor(private api: ApiService) {
    addIcons({ peopleOutline, checkmarkCircleOutline, cardOutline, busOutline });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.error = '';
    this.api.adminDashboard().subscribe({
      next: data => {
        this.data = data;
        this.profileName = data.profile?.full_name || 'Admin';
      },
      error: error => {
        this.error = error?.status === 0
          ? 'The dashboard server could not be reached. Check your connection and try again.'
          : error?.error?.message || 'The dashboard could not be loaded.';
      }
    });
  }
}
