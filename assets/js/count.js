(function ($) {

    // Variable to track if the action has been performed
    var actionPerformed = false;

    // Function to check if an element is fully in the viewport
    function isElementFullyInViewport(el) {
        var rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Run this code when the window is scrolled
    $(window).scroll(function() {
        // Check if the target element is fully in the viewport and the action has not been performed
        var targetElement = $('.nb__counter-section');
        if (isElementFullyInViewport(targetElement[0]) && !actionPerformed) {
            // Your code to run when the element is fully in the viewport
            $(".count").each(function () {
                $(this)
                    .prop("Counter", 0)
                    .animate(
                        {
                            Counter: $(this).text(),
                        },
                        {
                            duration: 4000,
                            easing: "swing",
                            step: function (now) {
                                now = Number(Math.ceil(now)).toLocaleString('en');
                                $(this).text(now);
                            },
                        }
                    );
            });

            // Set the variable to true to prevent further actions
            actionPerformed = true;
        }
    });
})(jQuery);

