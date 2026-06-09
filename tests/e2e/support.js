Cypress.on('window:before:load', (window) => {
  // Ensure deterministic locale for all e2e tests.
  window.localStorage.setItem('i18nextLng', 'en')

  window.document.head.insertAdjacentHTML(
    'beforeend',
    `
    <style>
      /* Disable CSS transitions. */
      *, *::before, *::after { -webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; transition: none !important; }
      /* Disable CSS animations. */
      *, *::before, *::after { -webkit-animation: none !important; -moz-animation: none !important; -o-animation: none !important; animation: none !important; }
    </style>
  `,
  )
})
