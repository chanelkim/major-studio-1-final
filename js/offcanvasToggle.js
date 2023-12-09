// --------------------------------------------------------
// OFFCANVAS MENU FUNCTION
// source: https://getbootstrap.com/docs/5.3/examples/offcanvas-navbar/
// --------------------------------------------------------
// Convert to vanilla JS
// $(function () {
//   'use strict'

//   $('[data-toggle="offcanvas"]').on('click', function () {
//     $('.offcanvas-collapse').toggleClass('open')
//   })
// })

// Offcanvas menu
document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var offcanvasToggle = document.querySelectorAll('[data-toggle="offcanvas"]');
  var offcanvasCollapse = document.querySelector(".offcanvas-collapse");

  offcanvasToggle.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      console.log("Click event triggered");
      offcanvasCollapse.classList.toggle("open");
      console.log("Offcanvas class toggled");
    });
  });
});
