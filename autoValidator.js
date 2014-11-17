(function($){

			/* 判断char 是否为字母 */
			function is_char(ch){
				return (ch >= 'a' && ch <= 'z') || ('A' <= ch && ch <= 'Z');
			}
			/* 判断指定的字符可否为 方法首字母 . */
			function can_be_first(ch) {
				return is_char(ch) || ch == '$' || ch == '_';
			};
			/* 返回字符是否为数字字符 */
			function is_num(ch){
				return '0' <= ch  && ch <= "9";
			}
			function Analyse(express){
				var  methodParseer = new MethodDefinitionParser(this);
				this.status =  0 ; 
				var index = 0 ;					
				this.analyse =function(){
					var hasException = false;
					try{
						for( index = 0 ; index< express.length ;index++){
							var ch = express.charAt(index);
							methodParseer.process(ch);
						}
						methodParseer.selfCheck();
					}catch(e){
							hasException = true;
							exceptionHandle();							
					}
					if(hasException){
						return null;
					}else{
						return methodParseer.methods;
					}	

				}
				/* 解析异常处理方法 */
				function exceptionHandle(){
					console.log("Exception : a error parse at '"+express +"' near index "+index);
				}

			}

			/*

				利用 链式 集成方式 不停的 wrapped 加入判断 ， 方便归类,  难道 创建个 对象接收 不是更好么？ 

				是不是思路受限了？ .

			*/
			function MethodDefinitionParser(analysor){
				
				var methods = this.methods = [];
				var currentStatus = new NameStatus();

				this.selfCheck = function(){
					currentStatus.selfCheck();
				}
				this.process = function(ch){
					if(analysor.status == 0 && ch  == ' ' ){ 
						return;
					}					
					if(analysor.status == 0){

						if(!can_be_first(ch)){ 
							throw  "Unexcept char " +ch ;
						}
						var flag =currentStatus.process(ch);
						if(flag == 1){
							console.err(" success ");
							throw "success " +ch;
						}
						analysor.status = 1;
					}else{
						var flag =currentStatus.process(ch);
						if(flag == 1){						
							methods.push(currentStatus.getValue());							
							currentStatus = new NameStatus();
							currentStatus.beginStatus = 1;
							currentStatus.process(ch);
						}else if(flag ==2){
							currentStatus = new ParamStatus(currentStatus);
							currentStatus.beginStatus = 2;
						}else if(flag ==3 ){
							methods.push(currentStatus.getValue());
							currentStatus = new NameStatus();
							currentStatus.beginStatus = 3;
						}

					}
				}

			}

			/* 名称解析状态 */
			function NameStatus(){
				this.value = null; 
				this.parent= null;
				this.status = 0;
				this.parse_name_status_over =false;
				var pre = null;
				this.process = function(ch){					
					if(this.status == 0) {
						if(ch == ' '){ return ;}
						if(!can_be_first(ch)){
							throw "Unexcept char "+ch;
						}
						this.value =""+ch;
						this.status = 1;						
					}else{
						if(ch == ' '){							
							this.parse_name_status_over = true;
						}
						if(ch  == '('){
							return 2;
						}
						if(!this.parse_name_status_over && !can_be_first(ch)
								&& !is_num(ch)){
							throw "Unexcept char "+ch;
						}						
						if(can_be_first(ch) || is_num(ch)){
							 if(this.parse_name_status_over){
							 		return 1;
							 }else{
							 	this.value += ch;
							 }
						}

					}					

				} ;
				this.selfCheck=function(){};

				this.getValue =function(){

					return {name:this.value};

				};


			}

			function ParamStatus (parent){
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
				this.process = function(ch){
						//console.log(ch)
						var retValue = null;
						if(begin_flag == false){
							if( ch == ' ' ){
								return ;
							}
							begin_flag =true;
							if(ch == '\''){
								string_flag = true;
								parseString(ch);
							}else {
								parseNum(ch);
							}							
						}else{
							if(string_flag){
								retValue =  parseString(ch);
							}else{
								retValue =  parseNum(ch);
							}
						}
						pre = ch;
						return retValue;
						

				};
				/* 状态检查 , 认证解析状态是否正常 */
				this.selfCheck=function(){
					
					if(modifyCount != 0 && !finished){
						throw "UnFinished express.";
					}
					if(this.beginStatus == 2 && !finished){
						throw "UnFinished express.";
					}
				}
				/* 字符串检查状态 */
				function parseString(ch){
					//console.log(ch);
					modifyCount += 1 ;
					if(first_begin_flag  == null){
							first_begin_flag = ch;
							tmp = ""+ch;
							return;
					}else{
						if(ch == first_begin_flag  && pre != null){						 
							 	lastIndexOfEnd  = modifyCount;
						}						
						if(ch == ',' && lastIndexOfEnd != -1 ){	
							if(lastIndexOfEnd!=-1){
								self.value = tmp.substring(0,lastIndexOfEnd);	
							}else{
								self.value = tmp;
							}												
							return 2;
						}

						if(ch == ')'){
							if(lastIndexOfEnd!=-1){								
								self.value = tmp.substring(0,lastIndexOfEnd);									
							}else{
								self.value = tmp;
							}	
							finished = true;
							return 3;
						}					
						tmp += ch;

					}

				}

				/* 数字检查状态 */
				function parseNum(ch){
					if(first_begin_flag == null){
						first_begin_flag =ch;
						tmp  =""+ch;
					}else{
						if(ch == ')' ){
							self.value = tmp;
							return 3;
						} 
						if(ch == ','){
							self.value = tmp;
							return 2;
						} 
						if(is_num(ch)){
							if(pre != ' '){
								tmp += ch;
							}else {
								throw "Unexcept char " + ch ;
							}							
						}
					}
				}

				/*  将对象转化为 方法定义 */
				this.getValue =function(){

					var  o = parent.getValue();
					o.param = o.param || [];
					o.param.push(this.value);
					return o;

				}


			}

			/*  参数预处理函数, 将参数转化为字符串 或数字 ，暂时不支持 true / false 转换. */
			function preprocessing(str){
				if(str.length > 0){
					str.charAt(0) == '\''
					return str.substring(0,str.length-1);
				}
				return parseInt(str);
			}

			

			var $x = window.$x || (window.$x={});
					$x.validators ={fn:{}};
					$x.validators.fn.required =function(){
						 var val= $(this).val();
						 if(!val){
						 	$x.validators.error.call( this ,"Cant  required");
						 }
					};
					$x.validators.error=function(message){
						var message  = message || "There is a error , please check";
						alert(message);
					}
					
					$x.findValidator = function(methodDefinition){
						var  method = $x.validators.fn[methodDefinition.name] ;
						if(!method ){
								return null;
						}
						var param = methodDefinition.param || [];
						var newParam = [];
						for(var i = 0 ; i< param.length ; i++){
							newParam[i] = preprocessing(param[i]);
						}
						return {
							method:method,
							param:newParam,
							invock:function(obj){
								method.apply(obj,this.param);
							}
						}
					}



			$(function(){

					

					$("form").find("input").each(function(i,e){
											
						var verify = $(this).attr("verify") ;
						if(verify){
							this._verify = new Analyse(verify).analyse();
						}
						
					});
					$("form").each(function(i ,e){
						$(this).submit(function(){
							var validatorNotFound = [];
							var retValue = true;
							$(this).find("input").each(function(i,e){
								var verify = this._verify || [];
								if(this._verify){
									for(var i = 0 ; i < verify.length ; i++ ){
										//console.log(verify[i]);
										var validator = $x.findValidator(verify[i]);
											if(validator == null){
												validatorNotFound.push(verify[i].name);																							
											}else{
												var methodReturn = validator.invock(this);
												if(!methodReturn){
													retValue = false;
												}
												
											}
									}	
									
								}

							});	
							if(validatorNotFound.length > 0 ){
								console.warn("validator '"+validatorNotFound.join(",") +"' not exists ...");
								return false;
							}
							return false;;
						});	
						
					});

			



			});










})($);