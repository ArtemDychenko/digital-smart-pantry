import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LLMApi } from '@api/llm.api';
import { ProductsApi } from '@api/products.api';
import { AssistantChatMessage } from '@components/assistant-chat/assistant-chat-message/assistant-chat-message';
import { ProductEditDialog } from '@components/product-edit-dialog/product-edit-dialog';
import { ChatMessage, createChatMessage, resetChatMessageId } from '@models/chat-message';
import { UserRole } from '@models/user-role';
import { ConversationService } from '../../services/conversation.service';
import { Button } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DispatchedEvent, MessageProcessor } from '@a2ui/angular';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-assistant-chat',
  imports: [FormsModule, AssistantChatMessage, Button, ProductEditDialog, ToastModule],
  templateUrl: './assistant-chat.html',
  styleUrl: './assistant-chat.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantChat {
  private readonly llmApi = inject(LLMApi);
  private readonly productsApi = inject(ProductsApi);
  private readonly conversationService = inject(ConversationService);
  private readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');
  private readonly messageProcessor = inject(MessageProcessor);
  private readonly messageService = inject(MessageService);

  initialState = signal(true);
  chatHistory = signal<ChatMessage[]>([]);
  userPrompt: string = '';
  loading = signal(false);

  // Edit dialog state
  editDialogVisible = signal(false);
  editDialogProductName = signal('');
  editDialogProductQuantity = signal(0);
  private editDialogSourceSurfaceId = '';

  constructor() {
    effect(() => {
      this.chatHistory();
      this.scrollToBottom();
    });

    effect(() => {
      this.conversationService.conversationId();
      this.chatHistory.set([]);
      this.initialState.set(true);
      this.userPrompt = '';
      resetChatMessageId();
      this.messageProcessor.clearSurfaces();
    });

    this.messageProcessor.events.subscribe((event: DispatchedEvent) => {
      this.handleA2UIAction(event);
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollContainer()?.nativeElement;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    });
  }

  sendPrompt(): void {
    const text = this.userPrompt.trim();
    if (!text || this.loading()) return;

    this.initialState.set(false);
    this.userPrompt = '';
    this.sendQueryToLLM(text);
  }

  private handleA2UIAction(event: DispatchedEvent): void {
    const action = event.message.userAction;
    if (!action) {
      event.completion.complete();
      return;
    }

    event.completion.next([]);
    event.completion.complete();

    const productName = (action.context?.['productName'] as string) ?? '';

    if (action.name === 'editProduct') {
      const rawQty = action.context?.['productQuantity'] as string | undefined;
      const quantity = rawQty !== undefined ? parseInt(rawQty, 10) || 0 : 0;
      this.editDialogSourceSurfaceId = action.surfaceId;
      this.editDialogProductName.set(productName);
      this.editDialogProductQuantity.set(quantity);
      this.editDialogVisible.set(true);
      return;
    }

    if (action.name === 'deleteProduct') {
      this.deleteProductDirectly(productName, action.surfaceId);
    }
  }

  private deleteProductDirectly(productName: string, surfaceId: string): void {
    this.loading.set(true);
    this.productsApi.search().subscribe({
      next: (result) => {
        const product = result.result.find((p) => p.name === productName);
        if (!product) {
          this.messageService.add({
            severity: 'error',
            summary: 'Not found',
            detail: `"${productName}" was not found in the pantry.`,
          });
          this.loading.set(false);
          return;
        }
        this.productsApi.delete(String(product.id)).subscribe({
          next: () => {
            this.chatHistory.update((h) =>
              h.map((msg) =>
                msg.a2uiSurfaceIds?.includes(surfaceId)
                  ? { ...msg, a2uiSurfaceIds: msg.a2uiSurfaceIds.filter((id) => id !== surfaceId) }
                  : msg,
              ),
            );
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `"${productName}" has been removed from your pantry.`,
            });
            this.loading.set(false);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete failed',
              detail: err?.message ?? 'An unexpected error occurred.',
            });
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.message ?? 'Could not load pantry data.',
        });
        this.loading.set(false);
      },
    });
  }

  onEditAccepted(value: { name: string; quantity: number }): void {
    const originalName = this.editDialogProductName();
    const surfaceId = this.editDialogSourceSurfaceId;

    this.loading.set(true);
    this.productsApi.search().subscribe({
      next: (result) => {
        const product = result.result.find((p) => p.name === originalName);
        if (!product) {
          this.messageService.add({
            severity: 'error',
            summary: 'Not found',
            detail: `"${originalName}" was not found in the pantry.`,
          });
          this.loading.set(false);
          return;
        }
        this.productsApi
          .update(String(product.id), { name: value.name, quantity: value.quantity })
          .subscribe({
            next: () => {
              this.messageProcessor.processMessages([
                {
                  dataModelUpdate: {
                    surfaceId,
                    contents: [
                      {
                        key: 'product',
                        valueMap: [
                          { key: 'name', valueString: value.name },
                          { key: 'quantity', valueString: `Quantity: ${value.quantity}` },
                          { key: 'quantityRaw', valueString: String(value.quantity) },
                        ],
                      },
                    ],
                  },
                },
              ]);
              this.editDialogProductName.set(value.name);
              this.editDialogProductQuantity.set(value.quantity);
              this.messageService.add({
                severity: 'success',
                summary: 'Updated',
                detail: `"${value.name}" has been updated successfully.`,
              });
              this.loading.set(false);
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Update failed',
                detail: err?.message ?? 'An unexpected error occurred.',
              });
              this.loading.set(false);
            },
          });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.message ?? 'Could not load pantry data.',
        });
        this.loading.set(false);
      },
    });
  }

  /**
   * Core method that sends any query to the LLM through the streaming endpoint.
   * @param query  The actual prompt sent to the backend.
   * @param displayText  What to show in the chat as the user's message (defaults to query).
   */
  private sendQueryToLLM(query: string, displayText?: string): void {
    this.loading.set(true);

    this.chatHistory.update((h) => [...h, createChatMessage(displayText ?? query, UserRole.USER)]);

    const placeholder = createChatMessage('Thinking\u2026', UserRole.ASSISTANT);
    this.chatHistory.update((h) => [...h, placeholder]);

    this.llmApi.commandStream({ userPrompt: query }).subscribe({
      next: (event) => {
        if (event.type === 'complete' && event.message !== undefined) {
          let surfaceIds: string[] | undefined;
          if (event.a2uiMessages?.length) {
            this.messageProcessor.processMessages(event.a2uiMessages);
            surfaceIds = event.a2uiMessages
              .filter((m: any) => m.beginRendering)
              .map((m: any) => m.beginRendering.surfaceId);
            if (!surfaceIds.length) surfaceIds = undefined;
          }
          const finalMsg = createChatMessage(event.message, UserRole.ASSISTANT, surfaceIds);
          this.chatHistory.update((h) => h.map((m) => (m.id === placeholder.id ? finalMsg : m)));
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.message ?? 'Failed to get a response. Please try again.',
        });
        this.chatHistory.update((h) => h.filter((m) => m.id !== placeholder.id));
        this.loading.set(false);
      },
    });
  }
}
