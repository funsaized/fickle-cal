import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'modal',
  template: `
    <div class="modal {{ size }}">
      <div class="modal-header">
        {{ title }}
        <span class="modal-close" (click)="close()">✕</span>
      </div>
      <div class="modal-content">
        <ng-content></ng-content>
      </div>
      <div class="modal-footer">
        <button (click)="submit()">Submit</button>
      </div>
    </div>

    <div class="modal-backdrop" (click)="close()"></div>
  `,
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() size? = 'md';
  @Input() title? = 'Modal title';

  @Output() closeEvent = new EventEmitter();
  @Output() submitEvent = new EventEmitter();

  constructor(private elementRef: ElementRef) {}

  close(): void {
    this.elementRef.nativeElement.remove();
    this.closeEvent.emit();
  }

  submit(): void {
    this.elementRef.nativeElement.remove();
    this.submitEvent.emit();
  }
}
