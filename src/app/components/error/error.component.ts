import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [],
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
