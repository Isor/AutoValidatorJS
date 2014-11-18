/**
 *  Effect
 */
(function() {
		
	$x.validators.effect.lc = {
		error : function(message) {
			var _id = this.id;
			if (_id) {
				if (!$x.validators.effect.base.isFocus) {
					$("#" + _id).focus();
					$x.validators.effect.base.isFocus = true;
				}
				$("#" + _id).css('border-color', '#ff7575');
			}
		},
		success : function(message) {
			var _id = this.id;
			if (_id) {
				$("#" + _id).css('border-color', '#fff');
			}
		}
	};

})(); 