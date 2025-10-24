export class ComplexCard {
  constructor(data = {}, state = {}, app = null) {
    this.state = state || {};
    this.app = app || null;
    this.data = data || {};
    this.eventListeners = [];
  }

  async render() {
    const template = Handlebars.templates['Complex.hbs'];
    const html = template(this.data);
    
    const container = document.createElement('div');
    container.innerHTML = html;
    const element = container.firstElementChild;

    this.attachEventListeners(element);
    return element;
  }

  attachEventListeners(element) {
    const apartmentBlocks = element.querySelectorAll('.complex__apartment');
    apartmentBlocks.forEach(block => {
      const apartmentId = block.dataset.apartmentId;
      this.addEventListener(block, 'click', () => this.handleApartmentClick(apartmentId));
    });
  }

  handleApartmentClick(apartmentId) {
    const path = `/offers/${apartmentId}`;
    if (this.app?.router?.navigate) {
      this.app.router.navigate(path);
    } else {
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }

  addEventListener(element, event, handler) {
    if (element) {
      element.addEventListener(event, handler);
      this.eventListeners.push({ element, event, handler });
    }
  }

  cleanup() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
}