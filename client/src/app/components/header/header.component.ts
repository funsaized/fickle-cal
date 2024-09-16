import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <h1>September 2024</h1>
      <nav>
        <ul>
          <li>
            <a routerLink="/user">
              <i class="bi bi-person"></i>
            </a>
          </li>
          <li>
            <a href="#"><i class="bi bi-three-dots-vertical"></i></a>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styleUrl: './header.component.scss',
})
export class HeaderComponent {}
