/*
 *
 *  基础JS对象功能扩展
 */

(function() {

	String.prototype.trim = String.prototype.trim || function() {
		return this.replace(/^\s*|\s*$/, '');
	};

})();

/*
 * $x log 模块 ( 真的是需要一个好的js模块载入器)
 * 
 */
(function() {

	var $x = window.$x || (window.$x = {});
	$x.log = {};
	$x.log.config = {
		debug : true,
		info : true,
		error : true
	};
	/*
	 * 是否输出 debug
	 */
	$x.log.isDebug = function() {
		return $x.log.config.debug;
	};
	
	/*
	 * 是否输出 消息
	 */
	$x.log.isInfo = function() {
		return $x.log.config.info;
	};

	/*
	 * 是否输出错误
	 */
	$x.log.isError = function() {
		return $x.log.config.error;
	};

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
		if ($x.log.isError()) {
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

/*
 * 校验器定义 1 此处制定一些通用的校验器方法和函数
 */
(function() {

	var $x = window.$x || (window.$x = {});

	$x.validators = {};
	$x.validators.config = {};

	/* 校验器扩展对象 , 可以通过添加或者修改其属性添加相应的校验器 */
	$x.validators.fn = {};

	/* 校验效果集合, 默认选择base效果 */
	$x.validators.effect = {};
	$x.validators.effect.base = {
		error : function(message) {
			var message = message || "There is a error , please check";
			var _id = this.id;
			if (_id) {
				message = message + " at [ID#" + _id + "]!";
			}
			alert(message);
		},
		success : function() {
		}
	};

	$x.getEffect = function() {
		var configEffect = $x.validators.config.effect || 'base';
		var selectEffect = $x.validators.effect[configEffect];
		return selectEffect ? selectEffect : $x.validators.effect.base;
	};

	/*
	 * 校验器查找函数
	 */
	$x.validators.findValidator = function(methodDefinition) {
		var validator = $x.validators.fn[methodDefinition.name];
		if (!validator) {
			return null;
		}
		var param = methodDefinition.param || [];
		var newParam = [];
		for (var i = 0; i < param.length; i++) {
			newParam[i] = preprocessing(param[i]);
		}
		return {
			validator : validator,
			param : newParam,
			invoke : function(obj) {
				return validator.method.apply(obj, newParam);
			}
		};
	};

	/*
	 * 校验器执行函数
	 */
	$x.validators.exec = function(validatorMeta, ele) {
		var validatorWrapper = $x.validators.findValidator(validatorMeta, ele);
		if (!validatorWrapper) {
			if ($x.log.isError()) {
				$x.log.error("ERROR: Validator name#" + validatorMeta.name
						+ " not found!");
			}
			return false;
		}
		var effect = $x.getEffect();
		var validator = validatorWrapper.validator;
		var status = validatorWrapper.invoke(ele);
		if (status) {
			if (effect.success) {
				effect.success.call(ele, validator.success);
			}
		} else {
			effect.error.call(ele, validator.error);
		}
		return status;
	};

	/*
	 * 通过名称调用其他校验器, 如果指定名称的校验器不存在返回 false. 否则返回其执行结果。
	 */
	$x.validators.call = function(ele, validatorName, arg1, arg2) {
		var validator = $x.validators[validatorName];
		if (!validator) {
			return false;
		}
		var args = Array.prototype.slice.call(arguments, 2);
		return validator.method.apply(ele, args);
	};

	/* 参数预处理函数, 将参数转化为字符串 或数字 ，暂时不支持 true / false 转换. */
	function preprocessing(str) {
		if (str.length == 0) {
			return str;
		}
		if (str.charAt(0) == '\'' || str.charAt(0) == '\"') {
			return str.substring(0, str.length - 1);
		}
		return parseInt(str);
	}

})();

/*
 * 
 * 校验器模块定义
 * 
 */
(function($) {

	/* 判断char 是否为字母 */
	function is_char(ch) {
		return (ch >= 'a' && ch <= 'z') || ('A' <= ch && ch <= 'Z');
	}

	/* 判断指定的字符可否为 方法首字母 . */
	function can_be_first(ch) {
		return is_char(ch) || ch == '$' || ch == '_';
	}

	/* 返回字符是否为数字字符 */
	function is_num(ch) {
		return '0' <= ch && ch <= "9";
	}

	function Analyse(express) {
		var methodParseer = new MethodDefinitionParser(this);
		this.status = 0;
		var index = 0;
		this.analyse = function() {
			var hasException = false;
			try {
				for (index = 0; index < express.length; index++) {
					var ch = express.charAt(index);
					methodParseer.process(ch);
				}
				methodParseer.selfCheck();
			} catch (e) {
				hasException = true;
				exceptionHandle();
			}
			if (hasException) {
				return null;
			} else {
				return methodParseer.methods;
			}
		};

		/* 解析异常处理方法 */
		function exceptionHandle() {
			if ($x.log.isDebug) {
				$x.log.debug("Exception : a error parse at '" + express
						+ "' near index " + index);
			}
		}

	}

	$x.Analyse = Analyse;

	/*
	 * 
	 * 利用 链式 集成方式 不停的 wrapped 加入判断 ， 方便归类, 难道 创建个 对象接收 不是更好么？
	 * 
	 * 是不是思路受限了？ .
	 * 
	 */
	function MethodDefinitionParser(analysor) {

		var methods = this.methods = [];
		var currentStatus = new NameStatus();

		this.selfCheck = function() {
			currentStatus.selfCheck();
			if (!currentStatus.finished && currentStatus.value) {
				methods.push(currentStatus.getValue());
				currentStatus.finished = true;
			}
		};

		this.process = function(ch) {
			if (analysor.status == 0 && ch == ' ') {
				return;
			}
			if (analysor.status == 0) {

				if (!can_be_first(ch)) {
					throw "Unexcept char " + ch;
				}
				var flag = currentStatus.process(ch);
				if (flag == 1) {
					console.err(" success ");
					throw "success " + ch;
				}
				analysor.status = 1;
			} else {
				var flag = currentStatus.process(ch);
				if (flag == 1) {
					methods.push(currentStatus.getValue());
					currentStatus.finished = true;
					currentStatus = new NameStatus();
					currentStatus.beginStatus = 1;
					currentStatus.process(ch);
				} else if (flag == 2) {
					currentStatus = new ParamStatus(currentStatus);
					currentStatus.beginStatus = 2;
				} else if (flag == 3) {
					methods.push(currentStatus.getValue());
					currentStatus.finished = true;
					currentStatus = new NameStatus();
					currentStatus.beginStatus = 3;
				}
			}
		};

	}

	/* 名称解析状态 */
	function NameStatus() {
		this.value = null;
		this.parent = null;
		this.status = 0;
		this.parse_name_status_over = false;
		var pre = null;
		this.process = function(ch) {
			if (this.status == 0) {
				if (ch == ' ') {
					return;
				}
				if (!can_be_first(ch)) {
					throw "Unexcept char " + ch;
				}
				this.value = "" + ch;
				this.status = 1;
			} else {
				if (ch == ' ') {
					this.parse_name_status_over = true;
				}
				if (ch == '(') {
					return 2;
				}
				if (!this.parse_name_status_over && !can_be_first(ch)
						&& !is_num(ch)) {
					throw "Unexcept char " + ch;
				}
				if (can_be_first(ch) || is_num(ch)) {
					if (this.parse_name_status_over) {
						return 1;
					} else {
						this.value += ch;
					}
				}
			}
		};

		this.selfCheck = function() {
		};

		this.getValue = function() {
			return {
				name : this.value
			};
		};

	}// end of function NameStatus()

	function ParamStatus(parent) {
		var parent = parent;
		var param = this.value = null;
		this.parent = parent;
		var begin_flag = false;
		var string_flag = false;
		var first_begin_flag = null;
		var pre = null;
		var tmp = null;
		var self = this;
		var finished = false;
		var lastIndexOfEnd = -1;
		var modifyCount = 0;
		this.beginStatus = null;
		this.process = function(ch) {

			var retValue = null;
			if (begin_flag == false) {
				if (ch == ' ') {
					return;
				}
				begin_flag = true;
				if (ch == '\'') {
					string_flag = true;
					parseString(ch);
				} else {
					parseNum(ch);
				}
			} else {
				if (string_flag) {
					retValue = parseString(ch);
				} else {
					retValue = parseNum(ch);
				}
			}
			pre = ch;
			return retValue;
		};

		/* 状态检查 , 认证解析状态是否正常 */
		this.selfCheck = function() {
			if (modifyCount != 0 && !finished) {
				throw "UnFinished express.";
			}
			if (this.beginStatus == 2 && !finished) {
				throw "UnFinished express.";
			}
		};

		/* 字符串检查状态 */
		function parseString(ch) {

			modifyCount += 1;
			if (first_begin_flag == null) {
				first_begin_flag = ch;
				tmp = "" + ch;
				return;
			} else {
				if (ch == first_begin_flag && pre != null) {
					lastIndexOfEnd = modifyCount;
				}
				if (ch == ',' && lastIndexOfEnd != -1) {
					if (lastIndexOfEnd != -1) {
						self.value = tmp.substring(0, lastIndexOfEnd);
					} else {
						self.value = tmp;
					}
					return 2;
				}

				if (ch == ')') {
					if (lastIndexOfEnd != -1) {
						self.value = tmp.substring(0, lastIndexOfEnd);
					} else {
						self.value = tmp;
					}
					finished = true;
					return 3;
				}
				tmp += ch;
			}
		}

		/* 数字检查状态 */
		function parseNum(ch) {
			if (first_begin_flag == null) {
				first_begin_flag = ch;
				tmp = "" + ch;
			} else {
				if (ch == ')') {
					self.value = tmp;
					return 3;
				}
				if (ch == ',') {
					self.value = tmp;
					return 2;
				}
				if (is_num(ch)) {
					if (pre != ' ') {
						tmp += ch;
					} else {
						throw "Unexcept char " + ch;
					}
				}
			}
		}

		/* 将对象转化为 方法定义 */
		this.getValue = function() {
			var o = parent.getValue();
			o.param = o.param || [];
			o.param.push(this.value);
			return o;
		};
	} // end of function ParamStatus(parent)

})();

/*
 * 
 * 校验应用模块
 * 
 */
(function() {
	$(function() {
		$("form").find("input").each(function(i, e) {
			var verify = $(this).attr("verify");
			if (verify) {
				this._verify = new $x.Analyse(verify).analyse();
			}
		});
		$("form").each(function(i, e) {
			$(this).submit(function() {
				$x.validators.effect.base.isFocus = false;
				var validatorNotFound = [];
				var retValue = true;
				$(this).find("input").each(function(i, e) {
					var verify = this._verify || [];
					if (this._verify) {
						for (var i = 0; i < verify.length; i++) {

							methodReturn = $x.validators.exec(verify[i], this);
							if (!methodReturn) {
								retValue = false;
							}
						}
					} // end of if(this._verify)
				});
				return methodReturn;
			});
		}); // end of $("form").each(function(i, e)
	});
})();
