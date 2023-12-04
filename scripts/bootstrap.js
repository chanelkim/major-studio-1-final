// --------------------------------------------------------
// BOOTSTRAP FUNCTIONS
// --------------------------------------------------------

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
