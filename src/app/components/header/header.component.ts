import { CommonModule, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Overlay, OverlayConfig, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { LoginComponent } from '../login/login.component';
import { UserService } from '../../services/user.service';
import { switchMap, tap } from 'rxjs';
import { DbService } from '../../services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule, OverlayModule, LoginComponent],
  template: `
    <div class="container">
      <div class="day">
        <h1>{{ month | date: 'MMMM' }} {{ month | date: 'yyyy' }}</h1>
        <span class="icon-stack">
          <i
            *ngFor="let icon of ['a', 'b', 'c']; let i = index"
            class="bi"
            [class.bi-cup-hot-fill]="(i + this.pagedCount) % 2 === 0"
            [class.bi-cup-hot]="(i + this.pagedCount) % 2 !== 0"
          >
          </i>
        </span>
      </div>
      <nav>
        <ul>
          <ng-container *ngIf="authService.isAuthenticated$ | async; else notAuthenticated">
            <li
              tabindex="0"
              role="button"
              (click)="isUserMenuOpen = !isUserMenuOpen"
              (keydown.enter)="isUserMenuOpen = !isUserMenuOpen"
            >
              <i
                class="bi bi-person"
                cdkOverlayOrigin
                #userTrigger="cdkOverlayOrigin"
                style="color: black"
              ></i>
            </li>
            <li (click)="sync()" (keydown.enter)="sync()" tabindex="0" role="button">
              <i class="bi bi-cloud-download"></i>
            </li>

            <ng-template
              cdkConnectedOverlay
              [cdkConnectedOverlayOrigin]="userTrigger"
              [cdkConnectedOverlayOpen]="isUserMenuOpen"
              (backdropClick)="isUserMenuOpen = false"
              [cdkConnectedOverlayHasBackdrop]="true"
              cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
              [cdkConnectedOverlayPositions]="[
                {
                  originX: 'center',
                  originY: 'bottom',
                  overlayX: 'center',
                  overlayY: 'top',
                },
              ]"
            >
              <div class="menu">
                <span>SN</span>

                <div class="header">
                  <p>
                    {{ userService.userFirstName$ | async }}
                    {{ userService.userLastName$ | async }}
                  </p>
                </div>
                <button (click)="logout()" class="logout">
                  <i class="bi bi-box-arrow-right"></i>Logout
                </button>
              </div>
            </ng-template>
          </ng-container>

          <ng-template #notAuthenticated>
            <li
              tabindex="0"
              role="button"
              [class.isTouched]="isTouched"
              (click)="openLoginModal()"
              (keydown.enter)="openLoginModal()"
            >
              <i class="bi bi-person-add"></i>
            </li>
          </ng-template>
          <li
            tabindex="1"
            role="button"
            (click)="onArrowClick('left')"
            (keydown.enter)="onArrowClick('left')"
          >
            <i class="bi bi-arrow-left"></i>
          </li>
          <li
            tabindex="2"
            role="button"
            (click)="onArrowClick('right')"
            (keydown.enter)="onArrowClick('right')"
          >
            <i class="bi bi-arrow-right"></i>
          </li>
        </ul>
      </nav>
    </div>

    <ng-template #modalTemplate>
      <app-login />
    </ng-template>
  `,
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements AfterViewInit {
  @Input() month: Date | undefined;
  @Output() arrowClick = new EventEmitter<string>();

  @ViewChild('modalTemplate', { read: TemplateRef })
  modalTemplate!: TemplateRef<unknown>;

  templatePortal: TemplatePortal<unknown> | null = null;
  overlayRef!: OverlayRef;

  isTouched = true; // TODO: hook up to some global state
  isUserMenuOpen = false;
  hovered = false;

  pagedCount = 0;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly overlay: Overlay,
    readonly authService: AuthService,
    private readonly router: Router,
    readonly userService: UserService,
    private readonly dbService: DbService,
  ) {}

  ngAfterViewInit(): void {
    this.templatePortal = new TemplatePortal(this.modalTemplate, this.viewContainerRef);
  }

  openLoginModal() {
    const config = new OverlayConfig({
      hasBackdrop: true,
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    });
    this.overlayRef = this.overlay.create(config);
    this.overlayRef.attach(this.templatePortal);
    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef.detach();
    });
  }

  sync() {
    this.dbService.replicationState.reSync();
  }

  onMouseOver() {
    this.hovered = true;
  }

  onMouseLeave() {
    this.hovered = false;
  }

  onArrowClick(direction: string) {
    this.pagedCount += direction === 'left' ? -1 : 1;
    this.arrowClick.emit(direction);
  }

  logout() {
    this.authService
      .logout$()
      .pipe(
        switchMap(() => this.dbService.replicationState.cancel()),
        tap(() => this.router.navigate(['/init'])))
      .subscribe();
  }
}
