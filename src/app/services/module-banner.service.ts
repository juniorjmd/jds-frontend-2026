import { Injectable, Signal, signal } from '@angular/core';

export interface ModuleBannerMetaItem {
  label: string;
  value: string;
}

export interface ModuleBannerState {
  title: string;
  helpText?: string;
  meta?: ModuleBannerMetaItem[];
}

@Injectable({ providedIn: 'root' })
export class ModuleBannerService {
  private readonly stateSignal = signal<ModuleBannerState | null>(null);
  readonly state: Signal<ModuleBannerState | null> = this.stateSignal.asReadonly();

  setState(state: ModuleBannerState | null) {
    this.stateSignal.set(state);
  }

  setTitle(title: string, extras?: Omit<ModuleBannerState, 'title'>) {
    this.stateSignal.set({
      title,
      helpText: extras?.helpText,
      meta: extras?.meta
    });
  }

  clear() {
    this.stateSignal.set(null);
  }
}
