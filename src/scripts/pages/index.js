import BurgerMenu from '../components/BurgerMenu.js';
import initCitySelection from '../components/initCitySelection.js';
import errorHandler from '../helpers/errorHandler.js';

errorHandler(() => {
  const burgerMenu = new BurgerMenu({
    container: '.burger-menu',
    trigger: '.header .burger-trigger',
    body: '.burger-menu__body',
    breakpoints: {
      768: () => {
        if (burgerMenu.isOpen()) {
          burgerMenu.close();
        }
      },
    },
  });
  burgerMenu.init();

  initCitySelection();
});
