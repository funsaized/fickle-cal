import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content">
      <h1 class="pre">Fickle Cal is a local first, calendar-centric planner.</h1>
      <div>Keep your data & run offline. Only sign in if you want to sync.</div>
      <div style="margin-top:20px">🚧 This website is under active development 🚧</div>
      <div class="cups"><i class="bi bi-cup"></i><i class="bi bi-cup-fill"></i></div>

      <div class="faq">
        <h3>F.A.Q</h3>
        <div class="question" *ngFor="let question of questions; let i = index">
          <h4
            (click)="toggleInfo(i)"
            [tabindex]="i"
            (keyup)="toggleInfo(i)"
            (keydown)="toggleInfo(i)"
            (keypress)="toggleInfo(i)"
            [ngClass]="{ active: question.expanded }"
          >
            <i class="bi bi-arrow-right-short"></i>
            {{ question.title }}
          </h4>
          <div class="info" *ngIf="question.expanded" [innerHTML]="question.info"></div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  questions = [
    {
      title: 'What is this?',
      info: 'As an engineer, this was built to explore use cases and the developer experience of local first software & Conflict-Free Replicated Data Types (CRDTs)... Also it seemed cool to make my daily planner an app I could extend.',
      expanded: false,
    },
    {
      title: 'What is local first software?',
      info: 'Local first software is a design approach that prioritizes local data ownership & pairs with the advantages of cloud-based applications. Local first is a relatively new term, and formally defined to follow seven principals. <a href="https://www.inkandswitch.com/local-first/#seven-ideals-for-local-first-software">You can read more about it here</a>.',
      expanded: false,
    },
    {
      title: 'Where is my data?',
      info: "Your data is stored in your browser's local storage (currently IndexedDB). It is never sent to a server unless you choose to sync it via login in. Explicit storage options (filestore, cloud, etc) are on the roadmap.",
      expanded: false,
    },
    {
      title: 'What happens when I login?',
      info: 'Login is used to sync your data across devices & browsers. Currently GitHub is the only supported login provider (more are on the roadmap).',
      expanded: false,
    },
  ];

  toggleInfo(index: number) {
    this.questions[index].expanded = !this.questions[index].expanded;
  }
}
