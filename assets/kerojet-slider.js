(function () {
  "use strict";

  var slider = document.querySelector("[data-kerojet-slider]");
  if (!slider) return;

  var slides = Array.prototype.slice.call(slider.querySelectorAll(".kerojet-slider__slide"));
  var dots = Array.prototype.slice.call(slider.querySelectorAll(".kerojet-slider__dot"));
  var previous = slider.querySelector("[data-slider-prev]");
  var next = slider.querySelector("[data-slider-next]");
  var status = slider.querySelector(".kerojet-slider__status");
  var index = 0;
  var timer = null;
  var paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function render(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      var active = itemIndex === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
    dots.forEach(function (dot, itemIndex) {
      dot.setAttribute("aria-current", itemIndex === index ? "true" : "false");
    });
    if (status) status.textContent = "Showing slide " + (index + 1) + " of " + slides.length;
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function start() {
    stop();
    if (!paused && slides.length > 1) timer = window.setInterval(function () { render(index + 1); }, 5000);
  }

  function move(step) {
    render(index + step);
    start();
  }

  previous.addEventListener("click", function () { move(-1); });
  next.addEventListener("click", function () { move(1); });
  dots.forEach(function (dot, itemIndex) {
    dot.addEventListener("click", function () { render(itemIndex); start(); });
  });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  slider.addEventListener("focusin", stop);
  slider.addEventListener("focusout", function (event) {
    if (!slider.contains(event.relatedTarget)) start();
  });

  var touchStartX = null;
  slider.addEventListener("touchstart", function (event) {
    touchStartX = event.changedTouches[0].clientX;
    stop();
  }, { passive: true });
  slider.addEventListener("touchend", function (event) {
    if (touchStartX === null) return;
    var distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
    touchStartX = null;
    start();
  }, { passive: true });

  slider.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
  });

  render(0);
  start();
}());
