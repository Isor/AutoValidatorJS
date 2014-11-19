/**
 * @author Luochengor
 * 定义具体的校验方法
 */
(function() {
	
	/**
	 * 参数必填校验器
	 */
	$x.validators.fn.required = {
		error : "input value can't be null",
		success : '',
		method : function() {
			var value = $(this).val();
			return value.trim().length > 0 ;
		}
	};
	
	/**
	 * 数字校验器
	 */
	$x.validators.fn.number = {
		error : "input must be number",
		success : '',
		method : function() {
			var value = $(this).val();
			var reg = /^[0-9]+$/;
			return reg.test(value);
		}
	};
	
	/**
	 * 长度校验器
	 */
	$x.validators.fn.length = {
		error : "input length error",
		success : "",
		method : function(min, max) {
			var value = $(this).val();
			if (min != 0 && !min) {
				return false;
			} else {
				if (value.length < min) {
					return false;
				}
			}
			if (max != 0 && !max) {
				return false;
			} else {
				if (value.length > max) {
					return false;
				}
			}
			return true;
		}
	};
	
	/**
	 * 最大长度校验器
	 */
	$x.validators.fn.maxLength = {
		error : "input length should be more shorter",
		success : "",
		method : function(maxLength) {
			var value = $(this).val();
			return value.length <= maxLength;
		}
	};
	
	/**
	 * 最小长度校验器
	 */
	$x.validators.fn.minLength = {
		error : "input length should be more longer",
		success : "",
		method : function(minLength) {
			var value = $(this).val();
			return value.length >= minLength;
		}
	};
	
	/**
	 * 最大值校验器
	 */
	$x.validators.fn.max = {
		error : "input should be more smaller",
		success : "",
		method : function(arg) {
			var value = $(this).val();
			return (value * 1)  <= arg;
		}
	};
	
	/**
	 * 最小值校验器
	 */
	$x.validators.fn.min = {
		error : "input should be more larger",
		success : "",
		method : function(arg) {
			var value = $(this).val();
			return (value * 1) >= arg;
		}
	};
	
	/**
	 * 数字区间校验器，值必须介于 min 和max 之间（闭区间）
	 */
	$x.validators.fn.range = {
		error : "input should between [min, max]",
		success : "",
		method : function(min, max) {
			var value = $(this).val();
			return min <= (value * 1) && (value * 1) <= max;
		}
	};
	
	/**
	 * EMAIL校验器
	 */
	$x.validators.fn.email = {
		error : "input is not an email address",
		success : "",
		method : function() {
			var value = $(this).val();
			var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
			return reg.test(value);
		}
	};
	
	/**
	 * 手机号码校验器
	 */
	$x.validators.fn.phone = {
		error : "input is not a mobile phone number",
		success : "",
		method : function(arg) {
			var value = $(this).val();
			var reg = /^1[3|4|5|8]\d{9}$/;
			return reg.test(value);
		}
	};
	
	/**
	 * 固定电话校验器
	 */
	$x.validators.fn.tel = {
		error : "input is not a fixed phone number",
		success : "",
		method : function(arg) {
			var value = $(this).val();
			var reg = /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/;
			return reg.test(value);
		}
	};
	
	/**
	 * IP地址校验器
	 */
	$x.validators.fn.ip = {
		error : "input is not a ip address",
		success : "",
		method : function(arg) {
			var value = $(this).val();
			var reg = /\b(([01]?\d?\d|2[0-4]\d|25[0-5])\.){3}([01]?\d?\d|2[0-4]\d|25[0-5])\b/;
			return reg.test(value);
		}
	};
})();
	