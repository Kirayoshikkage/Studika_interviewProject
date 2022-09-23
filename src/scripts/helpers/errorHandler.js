export default function errorHandler(cb) {
  window.addEventListener('error', () => {
    alert('Произошла ошибка, перезагрузите страницу!');
  });

  try {
    cb();
  } catch (error) {
    alert('Произошла ошибка, перезагрузите страницу!');
  }
}
