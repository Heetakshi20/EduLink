// navigation-control.js
(function () {
  const maxNavigations = 1;

  // Get current count
  let navCount = sessionStorage.getItem("navCount");
  if (!navCount) {
    navCount = 0;
    sessionStorage.setItem("navCount", navCount);
  }

  window.history.pushState(null, null, window.location.href); // push initial

  window.onpopstate = function (event) {
    navCount = parseInt(sessionStorage.getItem("navCount") || "0");

    if (navCount < maxNavigations) {
      sessionStorage.setItem("navCount", navCount + 1);
      console.log("Back/forward allowed once.");
    } else {
      alert("Back/forward navigation is restricted.");
      history.go(1); // Prevent going back again
    }
  };
})();
