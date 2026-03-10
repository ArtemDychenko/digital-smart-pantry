import { Component, inject, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { ConversationService } from '../../services/conversation.service';

@Component({
  selector: 'app-header',
  imports: [Button],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  encapsulation: ViewEncapsulation.None,
})
export class Header {
  readonly router = inject(Router);
  private readonly conversationService = inject(ConversationService);

  onNewChat(): void {
    this.conversationService.startNewChat();
  }

  onOpenProductsList() {
    this.router.navigate([{ outlets: { sidebar: ['products-list'] } }], {
      queryParamsHandling: 'preserve',
    });
    return;
  }
}
