import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [FormsModule],
  template: `
    <p>ERROR</p>
  `,
  styleUrl: './error.component.scss',
})
export class ErrorComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
      console.error('ERROR')
  }
}
