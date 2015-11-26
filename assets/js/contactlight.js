// Flyout menu

	$(document).ready(function(){

		$('.menuToggle').click(function(){

			$(this).toggleClass('menuVisible');
			$('.site').toggleClass('menuVisible');
			$('.flyout').toggleClass('menuVisible');

		});

	});