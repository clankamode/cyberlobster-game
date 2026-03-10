import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const BOOT_LINES: string[] = [
  'CYBERLOBSTER BIOS v3.7.2',
  'CPU: SYNTH-CORE 9000 ...... OK',
  'MEM: 32768KB .............. OK',
  'NET: LOOPBACK GRID ........ OK',
  'MOUNT /vault .............. OK',
  'INIT HACKSTACK ............ OK',
  'WELCOME, OPERATOR',
];

export interface BootRunOptions {
  seed: string;
}

const LOGO = String.raw`
   ______      __              __              __             __           
  / ____/_  __/ /_  ___  _____/ /   ____  ____/ /___  ____   / /____  _____
 / /   / / / / __ \/ _ \/ ___/ /   / __ \/ __  / __ \/ __ \ / __/ _ \/ ___/
/ /___/ /_/ / /_/ /  __/ /  / /___/ /_/ / /_/ / /_/ / / / // /_/  __/ /    
\____/\__, /_.___/\___/_/  /_____/\____/\__,_/\____/_/ /_/ \__/\___/_/     
     /____/                                                                  
`;

@customElement('boot-screen')
export class BootScreen extends LitElement {
  @property({ type: Boolean, attribute: 'has-continue' })
  hasContinue = false;

  @state()
  private displayedLines: string[] = [];

  @state()
  private logoVisible = false;

  @state()
  private isReady = false;

  @state()
  private seedInput = '';

  private timers: number[] = [];

  static styles = css`
    :host {
      display: block;
      background: #010201;
      color: #62ff7d;
      border: 1px solid #174b1f;
      min-height: 320px;
      padding: 12px;
      font-family: 'Courier New', Courier, monospace;
    }

    .line {
      margin: 2px 0;
      white-space: pre-wrap;
    }

    .logo {
      margin-top: 10px;
      color: #8cff9e;
      white-space: pre;
      opacity: 0;
      animation: fadeIn 350ms ease forwards;
    }

    .seed-row {
      margin-top: 12px;
      display: grid;
      gap: 6px;
      max-width: 280px;
    }

    .seed-label {
      font-size: 0.78rem;
      letter-spacing: 0.08em;
      opacity: 0.82;
    }

    .seed-input {
      border: 1px solid #2f8a3f;
      background: #031006;
      color: inherit;
      font: inherit;
      padding: 0.4rem 0.5rem;
    }

    .seed-input:focus-visible {
      outline: none;
      background: #0a2310;
    }

    .actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    button {
      border: 1px solid #2f8a3f;
      background: #031006;
      color: inherit;
      font: inherit;
      padding: 0.4rem 0.65rem;
      cursor: pointer;
      text-transform: uppercase;
    }

    button:hover,
    button:focus-visible {
      background: #0a2310;
      outline: none;
    }

    @keyframes fadeIn {
      to {
        opacity: 1;
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.startBoot();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearTimers();
  }

  render() {
    return html`
      ${this.displayedLines.map((line) => html`<div class="line">${line}</div>`)}
      ${this.logoVisible ? html`<div class="logo">${LOGO}</div>` : null}
      ${this.isReady
        ? html`
            <div class="seed-row">
              <label class="seed-label" for="run-seed">RUN SEED (OPTIONAL)</label>
              <input
                id="run-seed"
                class="seed-input"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                autocorrect="off"
                spellcheck="false"
                placeholder="auto"
                .value=${this.seedInput}
                @input=${this.onSeedInput}
              />
            </div>
            <div class="actions">
              <button type="button" @click=${this.onNewGame}>Start New Run</button>
              ${this.hasContinue
                ? html`<button type="button" @click=${this.onContinueGame}>Continue Saved Run</button>`
                : null}
            </div>
          `
        : null}
    `;
  }

  private startBoot(): void {
    this.clearTimers();
    this.displayedLines = [];
    this.logoVisible = false;
    this.isReady = false;

    const totalDurationMs = 3000;
    const lineSpacing = Math.floor((totalDurationMs * 0.55) / BOOT_LINES.length);

    BOOT_LINES.forEach((line, index) => {
      const timer = window.setTimeout(() => {
        this.typeLine(line);
      }, index * lineSpacing);
      this.timers.push(timer);
    });

    const logoTimer = window.setTimeout(() => {
      this.logoVisible = true;
    }, Math.floor(totalDurationMs * 0.62));
    this.timers.push(logoTimer);

    const readyTimer = window.setTimeout(() => {
      this.isReady = true;
    }, totalDurationMs);
    this.timers.push(readyTimer);
  }

  private typeLine(line: string): void {
    let cursor = 0;
    const partial = '';
    this.displayedLines = [...this.displayedLines, partial];
    const targetIndex = this.displayedLines.length - 1;

    const typer = window.setInterval(() => {
      cursor += 1;
      const lines = [...this.displayedLines];
      lines[targetIndex] = line.slice(0, cursor);
      this.displayedLines = lines;
      if (cursor >= line.length) {
        window.clearInterval(typer);
      }
    }, 14);
    this.timers.push(typer);
  }

  private onSeedInput = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    this.seedInput = target.value;
  };

  private onNewGame = (): void => {
    this.dispatchEvent(
      new CustomEvent<BootRunOptions>('start-new-game', {
        detail: { seed: this.seedInput.trim() },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private onContinueGame = (): void => {
    this.dispatchEvent(
      new CustomEvent<BootRunOptions>('continue-game', {
        detail: { seed: this.seedInput.trim() },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private clearTimers(): void {
    for (const timer of this.timers) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    }
    this.timers = [];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'boot-screen': BootScreen;
  }
}
