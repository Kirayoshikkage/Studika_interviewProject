export default function render(container, elements) {
  setTimeout(() => {
    container.insertAdjacentHTML('beforeend', elements);
  }, 0);
}
