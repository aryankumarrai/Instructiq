(function ($) {

  //1. Data Background Set
  $('[data-background]').each(function () {
    $(this).css('background-image', 'url(' + $(this).attr('data-background') + ')');
  });

  //2. Offcanvus toggle
  $(".offcanvus-toggle").on("click", function () {
    $(".offcanvus-box").addClass("active");
  });

  $(".offcanvus-close").on("click", function () {
    $(".offcanvus-box").removeClass("active");
  });

  $(document).on("mouseup", function (e) {
    var offCanvusMenu = $(".offcanvus-box");

    if (!offCanvusMenu.is(e.target) && offCanvusMenu.has(e.target).length === 0) {
      $(".offcanvus-box").removeClass("active");
    }
  });

  //3. Mobile Menu
  $(".mobile-menu-toggle").on("click", function () {
    $(".mobile-menu").addClass("active");
  });

  $(".mobile-menu .close").on("click", function () {
    $(".mobile-menu").removeClass("active");
  });

  $(".mobile-menu ul li.has-submenu i").each(function () {
    $(this).on("click", function () {
      $(this).siblings('ul').slideToggle();
      $(this).toggleClass("icon-rotate");
    });
  });

  $(document).on("mouseup", function (e) {
    var offCanvusMenu = $(".mobile-menu");

    if (!offCanvusMenu.is(e.target) && offCanvusMenu.has(e.target).length === 0) {
      $(".mobile-menu").removeClass("active");
    }
  });

  //4.Brand logo slider
  var swiper = new Swiper(".nb__brand-logo-items", {
    slidesPerView: 1,
    loop: true,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 4,
        spaceBetween: 40,
      },
      1024: {
        slidesPerView: 5,
        spaceBetween: 50,
      },
    },
    centeredSlides: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
  });

  //5. case study hover function
  $(".case-study-single").each(function () {

    $(this).hover(function () {
      $(this).parents(".case-study-box").find(".case-study-single.active").removeClass("active");
      $(this).addClass("active");
      var case_active = $(this).data("case");

      $(".case-study-box img.active").removeClass("active");
      $(".case-study-box ." + case_active + "").addClass("active");
    });

  });

  // Team Section 
  var swiper = new Swiper(".nb__team-slider", {
    slidesPerView: 3,
    spaceBetween: 30,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    scrollbar: {
      el: ".swiper-scrollbar",
      dragSize: 100

    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      640: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
  });
  
  // Testimonial Section 
  var swiper = new Swiper(".nb__testimonial-slider", {
    slidesPerView: 3,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      1024: {
        slidesPerView: 2,
      },
    },
  });


  $('.nbv2_project_wrapper_slider_main').slick({
    dots: false,
    arrows: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      }
    ],
  });

//Testimonial hover function
  $('.nb1-testimonial-slider-row').slick({
    dots: true,
    arrows: false,
    slidesToShow: 2,
    slidesToScroll: 2,
    centerMode: false,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      }
    ],

  });

//Marquees hover function
  nodeMarquee({
    parent: 'div.marquees',
    speed: 1
  });
//Team hover function
  $(".case-study-single").each(function(){
    $(this).hover(function(){
      $(this).parents(".case-study-box").find(".case-study-single.active").removeClass("active");
      $(this).addClass("active");
      var case_active = $(this).data("case");

      $(".case-study-box img.active").removeClass("active");
      $(".case-study-box ." + case_active + "").addClass("active");
    });

  });
// nb-accordion Tab
  const mainDiv = document.querySelector('.nb-accordion-1');

  if (mainDiv != null) {
    const tabs = mainDiv.querySelectorAll('.nb-accordion-tab-1');
    const reset = () => tabs.forEach((tab) => tab.classList.remove('nb_open'));
    function activate(e) {
      if (!e.target.matches('.nb-accordion-tab-1 > h2')) return;
      reset();
      tabs[e.target.dataset.index].classList.add('nb_open');
    }
    const init = () => tabs[0].classList.add('nb_open');
    window.addEventListener('load',init,false);
    window.addEventListener('click',activate,false);
  }
  const mainDiv2 = document.querySelector('.nb-accordion-2');
  if (mainDiv2 != null) {
    const tabs2 = mainDiv2.querySelectorAll('.nb-accordion-tab-2');
    const reset_second = () => tabs2.forEach((tab) => tab.classList.remove('nb_open2'));
    function activates(e) {
      if (!e.target.matches('.nb-accordion-tab-2 > h2')) return;
      reset_second();
      tabs2[e.target.dataset.index].classList.add('nb_open2');
    }
    const init2 = () => tabs2[1].classList.add('nb_open2');
    window.addEventListener('load',init2,false);
    window.addEventListener('click',activates,false);
  }



 
  // PRELOADER
  let settings = {
    progressSize: 320,
    progressColor: '#DCF9F5',
    lineWidth: 2,
    lineCap: 'round',
    preloaderAnimationDuration: 800,
    startDegree: -90,
    finalDegree: 270
  }

  function setAttributes(elem, attrs) {

    for (let key in attrs) {
      elem.setAttribute(key, attrs[key]);
    }

  }

  let preloader = document.createElement('div'),
    canvas = document.createElement('canvas'),
    size;

  (function () {

    let width = window.innerWidth,
      height = window.innerHeight;

    if (width > height) {

      size = Math.min(settings.progressSize, height / 2);

    } else {

      size = Math.min(settings.progressSize, width - 50);

    }

  })();

  setAttributes(preloader, {
    class: "preloader",
    id: 'preloader',
    style: 'transition: opacity ' + settings.preloaderAnimationDuration / 1000 + 's'
  });
  setAttributes(canvas, {
    class: 'progress-bar',
    id: 'progress-bar',
    width: settings.progressSize,
    height: settings.progressSize
  });


  preloader = document.getElementById('preloader');

  let progressBar = document.getElementById('progress-bar'),
    images = document.images,
    imagesAmount = images.length,
    imagesLoaded = 0,
    barCtx = progressBar.getContext('2d'),
    circleCenterX = progressBar.width / 2,
    circleCenterY = progressBar.height / 2,
    circleRadius = circleCenterX - settings.lineWidth,
    degreesPerPercent = 3.6,
    currentProgress = 0,
    showedProgress = 0,
    progressStep = 0,
    progressDelta = 0,
    startTime = null,
    running;

  (function () {

    return requestAnimationFrame
      || mozRequestAnimationFrame
      || webkitRequestAnimationFrame
      || oRequestAnimationFrame
      || msRequestAnimationFrame
      || function (callback) {
        setTimeout(callback, 1000 / 60);
      };

  })();

  Math.radians = function (degrees) {
    return degrees * Math.PI / 180;
  };


  progressBar.style.opacity = settings.progressOpacity;
  barCtx.strokeStyle = settings.progressColor;
  barCtx.lineWidth = settings.lineWidth;
  barCtx.lineCap = settings.lineCap;
  let angleMultiplier = (Math.abs(settings.startDegree) + Math.abs(settings.finalDegree)) / 360;
  let startAngle = Math.radians(settings.startDegree);
  document.body.style.overflowY = 'hidden';
  preloader.style.backgroundColor = settings.preloaderBackground;


  for (let i = 0; i < imagesAmount; i++) {

    let imageClone = new Image();
    imageClone.onload = onImageLoad;
    imageClone.onerror = onImageLoad;
    imageClone.src = images[i].src;

  }

  function onImageLoad() {

    if (running === true) running = false;

    imagesLoaded++;

    if (imagesLoaded >= imagesAmount) hidePreloader();

    progressStep = showedProgress;
    currentProgress = ((100 / imagesAmount) * imagesLoaded) << 0;
    progressDelta = currentProgress - showedProgress;

    setTimeout(function () {

      if (startTime === null) startTime = performance.now();
      running = true;
      animate();

    }, 10);

  }

  function animate() {

    if (running === false) {
      startTime = null;
      return;
    }

    let timeDelta = Math.min(1, (performance.now() - startTime) / settings.preloaderAnimationDuration);
    showedProgress = progressStep + (progressDelta * timeDelta);

    if (timeDelta <= 1) {


      barCtx.clearRect(0, 0, progressBar.width, progressBar.height);
      barCtx.beginPath();
      barCtx.arc(circleCenterX, circleCenterY, circleRadius, startAngle, (Math.radians(showedProgress * degreesPerPercent) * angleMultiplier) + startAngle);
      barCtx.stroke();
      requestAnimationFrame(animate);

    } else {
      startTime = null;
    }

  }

  function hidePreloader() {
    setTimeout(function () {
      $("body").addClass("page-loaded");
      document.body.style.overflowY = '';
    }, settings.preloaderAnimationDuration + 100);
  }
  var resizeTimer;


 
   

    

})(jQuery);


