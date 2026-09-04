const button = document.getElementById('teamButton');
button.addEventListener('click', () => {
  button.textContent = button.textContent.includes('Blue') ? 'Showing Orange' : 'Showing Blue';
});

const markupButton = document.getElementById('markupButton');
markupButton.addEventListener('click', () => {
  const enabled = markupButton.getAttribute('aria-pressed') === 'true';
  markupButton.setAttribute('aria-pressed', String(!enabled));
  markupButton.textContent = enabled ? 'Markup mode' : 'Markup on';
});
