document.addEventListener("DOMContentLoaded", function () {
    let e = document.querySelectorAll(".feature-label"); e.forEach(t => { t.addEventListener("mouseenter", function () { this.style.transform = "scale(1.05)", this.style.transition = "transform 0.3s ease" }), t.addEventListener("mouseleave", function () { this.style.transform = "scale(1)" }), t.addEventListener("click", function (t) { t.stopPropagation(); let o = this.querySelector(".label-text").textContent; Array.from(e).indexOf(this); let a = "true" === this.dataset.hasDropdown; document.querySelectorAll(".feature-dropdown").forEach(e => { e.remove() }), e.forEach(e => { e.dataset.hasDropdown = "false" }), a || function e(t, o) { let a = ""; switch (o) { case "HIGH-RES DISPLAY": a = "Ultra-high resolution display with vibrant colors and crystal-clear graphics."; break; case "FORGED IN METAL": a = "Premium metal construction for durability and a luxurious feel."; break; case "30 DIFFERENT PROVIDERS": a = "Access to games from 30 different providers for endless entertainment options."; break; case "PREMIUM BUTTONS": a = "Responsive, high-quality buttons for precise control and enhanced gameplay."; break; default: a = "Feature information not available." }let r = document.createElement("div"); r.className = "feature-dropdown show-dropdown", r.textContent = a, r.style.zIndex = "9999", document.body.appendChild(r); let s = t.getBoundingClientRect(), n = window.pageYOffset || document.documentElement.scrollTop, l = window.pageXOffset || document.documentElement.scrollLeft; t.classList.contains("right-label") ? (r.style.position = "absolute", r.style.top = s.bottom + n - 1 + "px", r.style.right = document.body.clientWidth - s.right + l - 20 + "px") : (r.style.position = "absolute", r.style.top = s.bottom + n - 1 + "px", r.style.left = s.left + l + "px"), t.dataset.hasDropdown = "true", r.dataset.forLabel = Array.from(document.querySelectorAll(".feature-label")).indexOf(t), setTimeout(() => { r.classList.add("show-dropdown") }, 10) }(this, o) }) }), document.addEventListener("click", function () { document.querySelectorAll(".feature-dropdown").forEach(e => { e.remove() }), e.forEach(e => { e.dataset.hasDropdown = "false" }) }); let t = document.createElement("style"); t.textContent = `
      @keyframes drawLine {
        to {
          stroke-dashoffset: 0;
        }
      }
      .feature-dropdown {
        position: absolute;
        background-color: rgba(0, 0, 0, 1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 12px;
        color: white;
        font-size: 14px;
        max-width: 250px;
        z-index: 9999;
        opacity: 0;
        transform: translateY(-5px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: auto;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 1);
        text-align: center;
      }
      .feature-dropdown.show-dropdown {
        opacity: 1;
        transform: translateY(0);
      }
      .left-label .feature-dropdown {
        left: 25px;
        top: 100%;
      }
      .right-label .feature-dropdown {
        right: 0;
        top: 100%;
      }
    `, document.head.appendChild(t); let o = document.getElementById("craftsmanship"); if (o) { let a = new IntersectionObserver(e => { e.forEach(e => { if (e.isIntersecting) { let t = document.querySelectorAll(".product-svg .animated-line"); t.forEach(e => { let t = e.getTotalLength ? e.getTotalLength() : 500; e.style.strokeDasharray = t, e.style.strokeDashoffset = t, e.style.animation = "drawLine 1.5s ease-out forwards" }), a.unobserve(e.target) } }) }, { threshold: .2 }); a.observe(o) }
});