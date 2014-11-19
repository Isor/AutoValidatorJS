/**
 * @author xm
 *
 * 建立一个js log 日志功能, 用来辅助完善 js调试
 *
 */

(function() {

	var $x = window.$x || (window.$x = {});

	$x.config = {};
	$x.config.log = {
		debug : true,
		info : true,
		error : true
	};
	
	/*
	 * 是否输出 debug
	 */
	$x.isDebug = function() {
		return $x.config.log.debug;
	};
	
	/*
	 * 是否输出 消息
	 */
	$x.isInfo = function() {
		return $x.config.log.info;
	};

	/*
	 * 是否输出错误
	 */
	$x.isError = function() {
		return $x.config.error;
	};

	$x.log = {};
	
	/*
	 * 输出调试信息
	 */
	$x.log.debug = function(message) {
		if ($x.isDebug()) {
			log(message);
		}
	};
	
	/*
	 * 输出提示信息
	 */
	$x.log.info = function(message) {
		log(message);
	};

	/*
	 * 输出错误信息
	 */
	$x.log.error = function(message) {
		if ($x.isError()) {
			alert(message);
		}
	};
	
	function _alert(message) {
		alert(message);
	}

	function log(message) {
		if (console && console.log) {
			console.log(message);
		} else {
			alert(message);
		}
	}

})(); 