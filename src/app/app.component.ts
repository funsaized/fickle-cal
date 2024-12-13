import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import 'zone.js/plugins/zone-patch-rxjs';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: ` <router-outlet /> `,
  styleUrl: './app.component.scss',
})
// export class AppComponent implements OnInit {
export class AppComponent {
  title = 'feined-client';

  // constructor(private readonly keycloak: KeycloakService) {}

  // public async ngOnInit() {
  //   const isLoggedIn = await this.keycloak.isLoggedIn();

  //   if (isLoggedIn) {
  //     const userProfile = await this.keycloak.loadUserProfile();
  //     const user = {
  //       authStatus: 'AUTH',
  //       name: userProfile.firstName || '',
  //       email: userProfile.email || '',
  //     };
  //     window.sessionStorage.setItem('userdetails', JSON.stringify(user));
  //   } else {
  //     this.keycloak.login();
  //   }
  // }
}
