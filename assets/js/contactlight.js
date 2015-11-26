// Flyout menu

	$(document).ready(function(){

		$('.menuToggle, .siteOverlay').click(function(){

			$(this).toggleClass('menuVisible');
			$('.site').toggleClass('menuVisible');
			$('.flyout').toggleClass('menuVisible');
			$('.siteOverlay').toggleClass('menuVisible');

		});

	});