import { OfferCreateFirstStage } from '../components/OfferCreate/OfferCreateFirstStage/OfferCreateFirstStage.js';
import { OfferCreateSecondStage } from  '../components/OfferCreate/OfferCreateSecondStage/OfferCreateSecondStage.js';
import { OfferCreateThirdStage } from  '../components/OfferCreate/OfferCreateThirdStage/OfferCreateThirdStage.js';
import { OfferCreateFourthStage } from  '../components/OfferCreate/OfferCreateFourthStage/OfferCreateFourthStage.js';
import { OfferCreateFifthStage } from  '../components/OfferCreate/OfferCreateFifthStage/OfferCreateFifthStage.js';

export class OfferCreateWidget {
  constructor(parent, state, app, options = {}) {
    this.parent = parent;
    this.state = state;
    this.app = app;
    this.step = options.step || 1;
    this.eventListeners = [];
  }

  resolveStepFromLocation() {
    const path = window.location.pathname;
    if (path.includes('/step-5')) return 5;
    if (path.includes('/step-4')) return 4;
    if (path.includes('/step-3')) return 3;
    if (path.includes('/step-2')) return 2;
    return 1;
  }

  async render() {
    this.cleanup();
    this.step = this.resolveStepFromLocation();

    let stageEl;
    switch (this.step) {
      case 2:
        stageEl = new OfferCreateSecondStage(this.state, this.app).render();
        break;
      case 3:
        stageEl = new OfferCreateThirdStage(this.state, this.app).render();
        break;
      case 4:
        stageEl = new OfferCreateFourthStage(this.state, this.app).render();
        break;
      case 5:
        stageEl = new OfferCreateFifthStage(this.state, this.app).render();
        break;
      default:
        stageEl = new OfferCreateFirstStage(this.state, this.app).render();
        break;
    }

    this.parent.appendChild(stageEl);
    this.attachEventListeners();
  }

  attachEventListeners() {
    const prevBtn = this.parent.querySelector('[data-action="prev"]');
    const nextBtn = this.parent.querySelector('[data-action="next"]');
    const publishBtn = this.parent.querySelector('[data-action="publish"]');

    if (prevBtn) {
      this.addEventListener(prevBtn, 'click', (e) => {
        e.preventDefault();
        const prev = Math.max(1, this.step - 1);
        this.navigateToStep(prev);
      });
    }

    if (nextBtn) {
      this.addEventListener(nextBtn, 'click', (e) => {
        e.preventDefault();
        const next = Math.min(5, this.step + 1);
        this.navigateToStep(next);
      });
    }

    if (publishBtn) {
      this.addEventListener(publishBtn, 'click', (e) => {
        e.preventDefault();
        this.app?.router?.navigate('/profile/myoffers');
      });
    }
  }

  navigateToStep(step) {
    const route = step === 1 ? '/create-ad' : `/create-ad/step-${step}`;
    this.app?.router?.navigate(route);
  }

  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  removeEventListeners() {
    this.eventListeners.forEach(({ element, event, handler }) =>
      element.removeEventListener(event, handler)
    );
    this.eventListeners = [];
  }

  cleanup() {
    this.removeEventListeners();
    this.parent.innerHTML = '';
  }
}