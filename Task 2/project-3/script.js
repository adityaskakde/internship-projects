gsap.registerPlugin(ScrollTrigger);

// ===== HERO ANIMATIONS =====
gsap.from(".hero-content h1", {
  y:100,
  opacity:0,
  duration:1.2,
  ease:"back.out"
});

gsap.from(".hero-content p", {
  y:50,
  opacity:0,
  duration:1,
  delay:0.3,
  ease:"power2.out"
});

gsap.from(".hero-buttons", {
  scale:0,
  opacity:0,
  duration:0.8,
  delay:0.5,
  ease:"elastic.out(1, 0.5)"
});

// ===== EMOJI FLOAT ANIMATIONS =====
gsap.to(".emoji-float", {
  y:-50,
  x:30,
  rotationZ:360,
  duration:4,
  repeat:-1,
  yoyo:true,
  ease:"sine.inOut"
});

gsap.to(".emoji-float2", {
  y:50,
  x:-30,
  rotationZ:-360,
  duration:5,
  repeat:-1,
  yoyo:true,
  ease:"sine.inOut"
});

gsap.to(".emoji-float3", {
  y:-40,
  x:50,
  rotationZ:360,
  duration:4.5,
  repeat:-1,
  yoyo:true,
  ease:"sine.inOut"
});

// ===== MISSION CARDS - SIDE ANIMATIONS =====
gsap.from(".mission-card.left-slide", {
  scrollTrigger:{
    trigger:".mission-content",
    start:"top 60%"
  },
  x:-150,
  opacity:0,
  duration:0.8,
  stagger:0.15
});

gsap.from(".mission-card.bottom-slide", {
  scrollTrigger:{
    trigger:".mission-content",
    start:"top 60%"
  },
  y:150,
  opacity:0,
  duration:0.8,
  delay:0.2,
  stagger:0.15
});

gsap.from(".mission-card.right-slide", {
  scrollTrigger:{
    trigger:".mission-content",
    start:"top 60%"
  },
  x:150,
  opacity:0,
  duration:0.8,
  delay:0.4,
  stagger:0.15
});

// ===== CARDS ANIMATION - ROTATE & BOUNCE =====
gsap.from(".card-rotate", {
  scrollTrigger:{
    trigger:".cards",
    start:"top 70%"
  },
  y:100,
  opacity:0,
  rotationY:90,
  duration:0.8,
  stagger:0.2,
  ease:"back.out(1.7)"
});

// ===== STATS - SCALE & BOUNCE ANIMATION =====
gsap.from(".stat-bounce", {
  scrollTrigger:{
    trigger:".stats",
    start:"top 70%"
  },
  scale:0,
  opacity:0,
  duration:0.7,
  stagger:0.15,
  ease:"elastic.out(1.2, 0.8)"
});

// ===== STATS COUNTER ANIMATION =====
document.querySelectorAll(".stat h3").forEach((el, index)=>{
  let text = el.innerText;
  let val = parseInt(text);
  
  gsap.to(el, {
    scrollTrigger:{
      trigger:el,
      start:"top 80%"
    },
    textContent:val,
    duration:2.5,
    delay:index * 0.2,
    snap:{textContent:1},
    onComplete:() => {
      el.innerText = val + "+";
    }
  });
});

// ===== GALLERY ANIMATION - FROM ALL SIDES =====
const galleryItems = document.querySelectorAll(".gallery-item");

galleryItems.forEach((item, index) => {
  let direction = index % 4;
  let fromVars = {};
  
  if(direction === 0) fromVars = { x:-200, opacity:0 }; // From left
  if(direction === 1) fromVars = { x:200, opacity:0 }; // From right
  if(direction === 2) fromVars = { y:-200, opacity:0 }; // From top
  if(direction === 3) fromVars = { y:200, opacity:0 }; // From bottom
  
  gsap.from(item, {
    scrollTrigger:{
      trigger:".gallery-grid",
      start:"top 70%"
    },
    ...fromVars,
    duration:0.8,
    stagger:0.1,
    ease:"back.out(1.5)"
  });
  
  // Hover rotation effect
  item.addEventListener("mouseenter", () => {
    gsap.to(item, { rotationZ:5, duration:0.3 });
  });
  
  item.addEventListener("mouseleave", () => {
    gsap.to(item, { rotationZ:0, duration:0.3 });
  });
});

// ===== DONATION PLANS - FLOAT UP ANIMATION =====
gsap.from(".plan-float", {
  scrollTrigger:{
    trigger:".plans",
    start:"top 70%"
  },
  y:100,
  opacity:0,
  duration:0.8,
  stagger:0.2,
  ease:"back.out(1.5)"
});

// ===== MAGNETIC BUTTON EFFECT =====
document.querySelectorAll(".magnetic").forEach(btn => {
  btn.addEventListener("mousemove", (e) => {
    let rect = btn.getBoundingClientRect();
    let x = e.clientX - rect.left - rect.width/2;
    let y = e.clientY - rect.top - rect.height/2;
    
    gsap.to(btn, {
      x:x * 0.3,
      y:y * 0.3,
      duration:0.3,
      overwrite:"auto"
    });
  });

  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, {
      x:0,
      y:0,
      duration:0.4,
      ease:"elastic.out(1, 0.5)"
    });
  });
});

// ===== SECTION TITLES - FADE & SCALE =====
gsap.from("section h2", {
  scrollTrigger:{
    trigger:"section h2",
    start:"top 80%"
  },
  y:50,
  opacity:0,
  scale:0.8,
  duration:0.8,
  each:0.2
});

// ===== SMOOTH SCROLL =====
gsap.registerPlugin(ScrollToPlugin);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if(target) {
      gsap.to(window, {
        scrollTo:{y:target, offsetY:80},
        duration:1.2,
        ease:"power2.inOut"
      });
    }
  });
});

// ===== SCROLL PARALLAX EFFECT =====
gsap.to(".hero-content", {
  scrollTrigger:{
    trigger:".hero",
    start:"top top",
    end:"bottom top",
    scrub:1
  },
  y:100,
  opacity:0.7
});

// ===== ANIMATION ON PAGE LOAD =====
window.addEventListener('load', () => {
  gsap.to("body", { duration:0.5, opacity:1 });
});