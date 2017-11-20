"app.common";

angular.module('app.common',[])

.service('consts',
['$log',
	function($log){
		//js获取项目根路径，如： http://localhost:8083/uimcardprj
		
		function getHostPath(suffix){
			//获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp
			var curWwwPath=window.document.location.href;
			//获取主机地址之后的目录，如： uimcardprj/share/meun.jsp
			var pathName=window.document.location.pathname;
			var pos=curWwwPath.indexOf(pathName);
			//获取主机地址，如： http://localhost:8083
			var localhostPath=curWwwPath.substring(0,pos)+'/';

			//静态本地调试时打开注释
			//localhostPath='http://192.168.0.196:8080/';
			
			return(localhostPath+suffix);
		}
		
		var homepath = getHostPath('wjshop2');
		var pichomepath = getHostPath('fileserver');

		var isVStr = function(target){
			return (typeof target === 'string'&&target.length>0);
		};
		
		var fmtUrl = function(target){
			var url = '#';
			if(isVStr(target)){
				var head4 = target.substring(0,4);
				var head1 = target.substring(0,1);
				
				if('http'==head4){
					url = target;
				}else if('/'==head1){
					url = homepath+target;
				}else{
					url = homepath+'/'+target;
				}
			}
			return url;
		};

		

		this.fmt = fmtUrl;
		this.host = homepath;
		this.pichost = pichomepath;
	}
])

.service('Utile',
['$log',
	function($log){
		
		/**
		 * 去除字符串两边的空格
		 * @param str
		 * @returns
		 */
		function delectTrim(str){
			return str.replace(/^\s*/, "").replace(/\s*$/, "");
		}

		/**
		 * 判断字符串是否输入
		 * @param str
		 * @returns {Boolean}
		 */
		function checkString(str){
			if(typeof(str) != "undefined" && null != str && "" != str ){
				return true;
				/*var strOne = delectTrim(str);
				if( "" != strOne ){
					return true;
				}else{
					return true;
				}*/
			}else{
				return false;
			}
		}

		/**
		 * 只保留数字，并且去除字符串两边的空格
		 * @param str
		 */
		function getNumTrim(str){
			return str.replace(/\D/g,'').replace(/(^s*)|(s*$)/g, "");
		}




		this.checkString = checkString;
	}
])

.service('IsLogin',
['DeviceApi','Toast','JSONHttp','$log','$window','$timeout','KeepLogin',
	function(DeviceApi,Toast,JSONHttp,$log,$window,$timeout,KeepLogin){
	
		//保持登陆状态
		this.isLogin = function(succFn,errorFn){
			var dstParams = {
				success:function(result){
					Toast.toast('default:keepLogin success!');
				},
				error:function(result){
					Toast.toast('default:keepLogin error!');
				}
			};
			
	    	angular.merge(dstParams, {success:succFn,error:errorFn});
	    	
	    	
	    	$timeout(function(){
	    		//获取token
				DeviceApi.getTokenAndDevice({
			        callBack: function (result) {
			        	//终端用户登录
			            if (result.token) {
			            	KeepLogin.keepLogin(dstParams.success);
						} 
			            //终端用户未登录
			            else {
			            	angular.isFunction(dstParams.error)&&dstParams.error();
							DeviceApi.openLoginUI({
								callBack:function(result){
									
								}
							});
						}
			        }
			    });
	    	},1000);
	    	
		};

	}
])

.service('KeepLogin',
['DeviceApi','Toast','JSONHttp','$log','$window','$timeout',
	function(DeviceApi,Toast,JSONHttp,$log,$window,$timeout){
	
		//保持登陆状态
		this.keepLogin = function(callback){
			var dstParams = {
				success:function(result){
					Toast.toast('default:keepLogin success!');
				}
			};
			
	    	angular.merge(dstParams, {success:callback});
	    	
	    	
	    	//获取token
			DeviceApi.getTokenAndDevice({
		        callBack: function (result) {
		        	//终端用户登录
		            if (result.token) {
		            	login(result.token,dstParams);
					} 
		            //终端用户未登录
		            else {
						
					}
		        }
		    });
	    	
			function login(token,dstParams){
				//后台登录同步用户
            	var path = '/user/login/'+token;
    			var params = {};
    			JSONHttp.post(path,params,function(guide){
    				//done
    				guide.clear();
    				guide.when('200').dothis(function(httpjson){
    					angular.isFunction(dstParams.success)&&dstParams.success();
    				}).exe();
    			});
			}
		};

	}
])

.service('UrlQuery',
['$log',
	function($log){
		var _params = null;
		var _url = window.location.href;
		var _regurl = new RegExp("(\\?(.*))?$");
		var _regkvps = new RegExp("([^&=]+)=([^=&]+)","g");
		var _regkvp = new RegExp("([^&=]+)=([^=&]+)");

		var query = function(key,url,decode){
			//_url = url?url:_url;
			_url = url?url:window.location.href;
			//if(!_params){
				_params = {};
				if(_regurl.test(_url)){
					var searchStr = _url.match(_regurl)[2];
					if(searchStr){
						var kvps = searchStr.match(_regkvps);
						for(var i  in kvps){
							var kvp = kvps[i].match(_regkvp);

							if(kvp&&kvp.length>2){
								if('unescape'==decode){
									_params[unescape(kvp[1])] = unescape(kvp[2]);
								}else if('decodeURI'==decode){
									_params[decodeURI(kvp[1])] = decodeURI(kvp[2]);
								}else if('decodeURIComponent'==decode){
									_params[decodeURIComponent(kvp[1])] = decodeURIComponent(kvp[2]);
								}else{
									_params[decodeURIComponent(kvp[1])] = decodeURIComponent(kvp[2]);
								}
							}
						}
					}
				}
			//}
			//$log.log(JSON.stringify(_params));
			return _params[key];
		};

		this.q = query;
		/*
		alert(UrlQuery.q('wd','?wd=我/','decodeURIComponent'));
		alert(UrlQuery.q('a','decodeURIComponent'));
		*/
	}
])

.service('Toast',
['$timeout','$log',
	function($timeout,$log){
		var globalToastBox = null;
		
		this.toast = function(info,callback){
			if(!globalToastBox){
				globalToastBox = angular.element('<div style="display:none;background-color:#12c3b1;position:fixed;top:0;left:0;width:100%;height:auto;line-height:50px;font-size:16px;text-align:center;color:#fff;margin:0;z-index:3000;"></div>');
				angular.element(window.document.body).append(globalToastBox);
			}
			globalToastBox.html('<b style="margin:auto;width:auto;">'+info+'</b>');
			globalToastBox.css({'display':'block'});
			$timeout(function(){
				globalToastBox.css({'display':'none'});
				globalToastBox.html('<b style="margin:auto;width:auto;"></b>');
				angular.isFunction(callback)&&callback();
			},1500);
		};
	}
])

.service('Prompting',
['$timeout','$log',
	function($timeout,$log){
		var globalToastBox = null;
		
		this.prompt = function(info,callback){
			if(!globalToastBox){
				globalToastBox = angular.element('<div style="display:none;background-color:#333333;position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);-moz-transform:translate(-50%,-50%);-webkit-transform:translate(-50%,-50%);-o-transform:translate(-50%,-50%);width:40%;height:auto;line-height:50px;font-size:16px;text-align:center;color:#fff;z-index:3000;"></div>');
				angular.element(window.document.body).append(globalToastBox);
			}
			globalToastBox.html('<b style="margin:auto;width:auto;">'+info+'</b>');
			globalToastBox.css({'display':'block'});
			$timeout(function(){
				globalToastBox.css({'display':'none'});
				globalToastBox.html('<b style="margin:auto;width:auto;"></b>');
				angular.isFunction(callback)&&callback();
			},1500);
		};
	}
])

.service('ModelPop',
['$timeout','$compile','$log',
	function($timeout,$compile,$log){
		var globalToastBox = null;
		
		this.pop = function(popParams){
			var currPayParams = {title:'提示',info:'提示',okClickHandler:function(){},onCancelClickHandler:function(){}, buttonText1: '確定', buttonText2: "取消"};
			angular.extend(currPayParams, popParams);                                                                                                                                           
			
			if(!globalToastBox){
				
				var title = '';
				title += ' <div style="display:none;position:fixed;top:0px; left:0px; min-height:100%;width:100%;z-index:3000;background-color:rgba(0,0,0,0.5);">';				
				title += '   <div class="fix_translate_xy" style="width:80%;background:rgba(255,255,255,0.9);border-radius:5px;font-size:16px">';
				title += '     <div style="text-align:center;padding:24px 10px;color:#333333;border-bottom:1px solid #bcbcbc">'+ currPayParams.info +'</div>';
				title += '     <div style="text-align:center;padding-bottom:20px;">';
				
				if(currPayParams.onCancelClickHandler != null){
					title += '       <span style="display:inline-block;width:50%;float:left;padding:12px 0;text-align:center;color:#12c3b1;border-right:1px solid #bcbcbc;" ng-click="onCancelClick()">'+currPayParams.buttonText2+'</span> 		';
				}
				if(currPayParams.okClickHandler != null){
					title += '       <span style="display:inline-block;width:50%;float:left;padding:12px 0;text-align:center;color:#12c3b1;" ng-click="onOKClick()">'+currPayParams.buttonText1+'</span>                         ';
				}
				title += '     </div>';
				title += '   </div>';
				title += ' </div>';

				globalToastBox = angular.element(title);
				angular.element(window.document.body).append(globalToastBox);
				
				var pscope = globalToastBox.scope();
				
				
				var scope = pscope.$new();
				scope.onOKClick = function(){
					globalToastBox.css({'display':'none'});
					currPayParams.okClickHandler();
				};
				
				scope.onCancelClick = function(){
					globalToastBox.css({'display':'none'});
					currPayParams.onCancelClickHandler();
				};
				
				if(currPayParams.onCancelClickHandler == null && currPayParams.okClickHandler == null){
					$timeout(function(){
						globalToastBox.css({'display':'none'});
					},1500);
				}
				
				$compile(globalToastBox)(scope);
			}
			
			globalToastBox.css({'display':'block'});
//			$timeout(function(){
//				globalToastBox.css({'display':'none'});
//			},1500);
		};
	}
])
.service('ModelPop1',
['$timeout','$compile','$log',
	function($timeout,$compile,$log){
		var globalToastBox = null;
		
		this.pop = function(popParams){
			var currPayParams = {info:'提示',okClickHandler:function(){}, buttonText: '知道了'};
			angular.extend(currPayParams, popParams);                                                                                                                                              
			
			if(!globalToastBox){
				var title = '';
				title += ' <div style="display:none;position:fixed;top:0px;left:0px;min-height:100%;width:100%;z-index:3000;background-color:rgba(0,0,0,0.5);">															';				
				title += '   <div class="fix_translate_xy"style="width:80%;background:rgba(255,255,255,0.95);border-radius:5px;font-size:16px">';
				title += '     <div style="text-align:center;padding:30px 10px;color:#060606;border-bottom:1px solid #bcbcbc;font-size:16px;">'+ currPayParams.info +'</div>';
				title += '     <div style="text-align:center;padding-bottom:10px;">';
				
				if(currPayParams.okClickHandler != null){
					title += '       <span style="display:inline-block;width:100%;font-size:18px;padding-top:10px;text-align:center;color:#12c3b1;" ng-click="onOKClick()">'+currPayParams.buttonText+'</span> 		';
				}
				title += '     </div>                                                                                                                                                       ';
				title += '   </div>                                                                                                                                                         ';
				title += ' </div>                                                                                                                                                           ';

				globalToastBox = angular.element(title);
				angular.element(window.document.body).append(globalToastBox);
				
				var pscope = globalToastBox.scope();
				
				
				var scope = pscope.$new();
				scope.onOKClick = function(){
					globalToastBox.css({'display':'none'});
					currPayParams.okClickHandler();
				};
				
				if(currPayParams.okClickHandler == null){
					$timeout(function(){
						globalToastBox.css({'display':'none'});
					},1500);
				}
				
				$compile(globalToastBox)(scope);
			}
			
			globalToastBox.css({'display':'block'});
//			$timeout(function(){
//				globalToastBox.css({'display':'none'});
//			},1500);
		};
	}
])
.service('ModelPop2',
['$timeout','$compile','$log',
	function($timeout,$compile,$log){
		var globalToastBox = null;
		
		this.pop = function(popParams){
			var currPayParams = {okClickHandler:function(){},onCancelClickHandler:function(){},buttonText1: '立即查看', buttonText2: '暫不查看'};
			angular.extend(currPayParams, popParams);                                                                                                                                           
			
			if(!globalToastBox){
				var title = '';
				title += '<div style="display:none;position:fixed;top:0px;left:0px;min-height:100%;width:100%;z-index:3000;background-color:rgba(0,0,0,0.5);padding:0 10px;">';				
				title += '	<div class="fix_translate_xy" style="background:#fff;width:95%;border-radius:4px;padding:0 5px;">';
				title += '		<div style="text-align:center;font-size:18px;padding:22px 0;">'+
						 '			<p>查看優惠券后，</p>'+
						 '			<p>就<span class="fix_clfe5a4c">不能取消訂單了，</span>確定查看嗎？</p>'+
						 '		</div>';
				title += '     <div class="fix_border_bottom"></div>';
				if(currPayParams.onCancelClickHandler != null){
					title += '<div style="color:#888888;font-size:16px;padding:12px 0;text-align:center;" ng-click="onCancelClick()">'+currPayParams.buttonText2+'</div>';
				}
				title += '     <div class="fix_border_bottom"></div>';
				if(currPayParams.okClickHandler != null){
					title += '<div style="color:#fe5a4c;font-size:16px;padding:12px 0;text-align:center;" ng-click="onOKClick()">'+currPayParams.buttonText1+'</div>';
				}
				title += '  </div>';
				title += '</div>';
				globalToastBox = angular.element(title);
				angular.element(window.document.body).append(globalToastBox);
				
				var pscope = globalToastBox.scope();
				
				
				var scope = pscope.$new();
				scope.onOKClick = function(){
					globalToastBox.css({'display':'none'});
					currPayParams.okClickHandler();
				};
				
				scope.onCancelClick = function(){
					globalToastBox.css({'display':'none'});
					currPayParams.onCancelClickHandler();
				};
				
				if(currPayParams.onCancelClickHandler == null && currPayParams.okClickHandler == null){
					$timeout(function(){
						globalToastBox.css({'display':'none'});
					},1500);
				}
				
				$compile(globalToastBox)(scope);
			}
			
			globalToastBox.css({'display':'block'});
//			$timeout(function(){
//				globalToastBox.css({'display':'none'});
//			},1500);
		};
	}
])

.service('ModelPop4',
['$timeout','$compile',
	function($timeout,$compile){
        var globalToastBox = null;
		this.pop = function(popParams){
            var currPayParams = {
                title:'',
                productName:'',
                exp:'',
                user:'',
                okClickHandler:function(){},
                cancelClickHandler:function(){},
                buttonText1: '取消',
                buttonText2: '確定兌換'
            };
            angular.extend(currPayParams, popParams);

            if(!globalToastBox){
                var title = '';
                title += '<div style="display:none;position:fixed;top:0px; left:0px; min-height:100%;width:100%;z-index:6000;background-color:rgba(0,0,0,0.5);color:#1e1e1e;">';
                title += '  <div class="fix_bgf8f8f8 fix_translate_xy" style="width:84%;border-radius:8px;">';
                title += '      <div class="fix_tc fix_font16" style="padding:22px 10px 20px 10px;font-weight:600;">'+currPayParams.title+'</div>';
                title += '      <div style="padding:0px 10px;margin-bottom:18px;">';
                title += '          <div class="fix_parent_flex" style="margin-bottom:10px;">';
                title += '              <div class="fix_font16 fix_child1_flex">'+currPayParams.productName+'</div>';
                title += '          </div>';
                title += '          <div class="fix_parent_flex" style="margin-bottom:6px;">';
                title += '              <div class="fix_row fix_font14" style="width:54px;height:20px;">';
                title += '                  <span class="fix_fl fix_family" style="width:42px;display:inline-block;">E X P</span><em class="fix_normal fix_fl">:</em>';
                title += '              </div>';
                title += '              <div class="fix_font14 fix_child1_flex" style="line-height:18px;">'+currPayParams.exp+'</div>';
                title += '          </div>';
                title += '          <div class="fix_parent_flex" style="margin-bottom:6px;">';
                title += '              <div class="fix_row fix_font14" style="width:54px;height:20px;">';
                title += '                  <span class="fix_fl fix_family" style="width:42px;display:inline-block;">USER</span><em class="fix_normal fix_fl">:</em>';
                title += '              </div>';
                title += '              <div class="fix_font14 fix_child1_flex" style="line-height:18px;">'+currPayParams.user+'</div>';
                title += '          </div>';
                title += '      </div>';
                title += '      <div>';
                title += '          <div class="fix_border_bottom"></div>';
                title += '          <div class="fix_row">';
                title += '              <div class="fix_fl fix_tc fix_cl2eb6a8 fix_font18" style="width:50%;position:relative;height:45px;line-height:45px;" ng-click="onCancelClick()">'+currPayParams.buttonText1+'';
                title += '                  <div class="fix_border_right" style="position:absolute;top:0;right:0;height:100%;"></div>';
                title += '              </div>';
                title += '              <div class="fix_fl fix_tc fix_cl2eb6a8 fix_font18 fix_weight" style="width:50%;height:45px;line-height:45px;" ng-click="onOKClick()">'+currPayParams.buttonText2+'</div>';
                title += '          <div>';
                title += '      <div>';
                title += '  <div>';
                title += '<div>';

				globalToastBox = angular.element(title);
                angular.element(window.document.body).append(globalToastBox);

				var pscope = globalToastBox.scope();

                var scope = pscope.$new();
                scope.onOKClick = function(){
                    globalToastBox.css({'display':'none'});
                    currPayParams.okClickHandler();
                };

				scope.onCancelClick = function () {
                    globalToastBox.css({'display':'none'});
                    currPayParams.cancelClickHandler();
                };

				if(currPayParams.okClickHandler == null && currPayParams.cancelClickHandler == null){
                    $timeout(function(){
                        globalToastBox.css({'display':'none'});
                    },1500);
                }
                $compile(globalToastBox)(scope);
            }
            globalToastBox.css({'display':'block'});
        };
    }
])

.service('alertPop',
['$timeout','$compile','$log',
    function($timeout,$compile){
        var globalToastBox = null;

        this.pop = function(popParams){
            var currPayParams = {
                imgSrc:'imgs/icon_alert.png',
                info1:'',
                info2:'',
                okClickHandler:function(){},
                buttonText: '確定'
            };
            angular.extend(currPayParams, popParams);
 
			var creatObj = function () {
				var title = '';
                title += '<div style="display:none;position:fixed;top:0px; left:0px; min-height:100%;width:100%;z-index:6000;background-color:rgba(0,0,0,0.5);color:#1e1e1e;">';
                title += '  <div class="fix_translate_xy" style="width:84%;background:#f8f8f8;border-radius:6px;font-size:16px">';
                title += '      <img ng-src="'+currPayParams.imgSrc+'" src="" alt="" style="display:block;width:58px;height:auto;margin:32px auto 16px auto;"/>';
                title += '      <p style="font-weight:600;text-align:center;">'+currPayParams.info1+'</p>';
                title += '      <p style="margin-bottom:30px;text-align:center;">'+currPayParams.info2+'</p>';
                title += '      <div class="fix_border_bottom"></div>';
                title += '      <p class="fix_font18 fix_tc" style="padding:10px 0;color:blue;" ng-click="onOKClick()">'+currPayParams.buttonText+'</p>';
                title += '  </div>';
                title += ' </div>';

                globalToastBox = angular.element(title);
                angular.element(window.document.body).append(globalToastBox);

				var pscope = globalToastBox.scope();

                var scope = pscope.$new();
                scope.onOKClick = function(){
                    globalToastBox.css({'display':'none'});
                    //currPayParams.okClickHandler();
                };

				if(currPayParams.okClickHandler == null){
                    $timeout(function(){
                        globalToastBox.css({'display':'none'});
                    },1500);
                }

				$compile(globalToastBox)(scope);
				globalToastBox.css({'display':'block'});
            }

			if(globalToastBox){
				globalToastBox.remove();
				globalToastBox = null;
			}
			
			creatObj();
        };
    }
])

.service('JSONHttp',
['$http','consts','Toast','$log','$location',
	function($http,consts,Toast,$log,$location){
		var _debug = false;
		
		this.fmturl = consts.fmt;
		this.post = function(path,params,doneFn){
			var gd = new guide({'code':'400','info':"網絡繁忙，請稍後...",'params':{},'result':[]});
			gd.when('400').dothis(function(jsondata){
					Toast.toast(jsondata.info);
				})
				.when('401').dothis(function(jsondata){
					Toast.toast('未登錄，需要登錄后才能操作');
					$location.url('ucenter/land');
				})
				.when('500').dothis(function(jsondata){
					Toast.toast('不好意思，出錯了');
				})
				.any(function(){
					$log.log('this is do any');
				})
				.other(function(){
					$log.log('this is do other');
				});
			//var logTmp = '_dopost['+path+']:=';
			//$log.log(logTmp+'>['+JSON.stringify(params)+']');
			if(_debug){
				//var response = {'code':'400','info':"网络繁忙，请稍候[debug]...",'params':{},'result':[]};
				var response = {'code':'200','info':"数据请求成功[debug]...",'params':{},'result':[]};
				gd.setData(response);
				//$log.log(logTmp+'<['+JSON.stringify(response)+']');
				_isFn(doneFn)&&doneFn(gd);
			}else{
				var postConfig = {headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/x-www-form-urlencoded'},transformRequest:_paramJSON};
				return $http.post(consts.fmt(path),params).then(
					function(response){
						//success
						//$log.log(logTmp+'<['+JSON.stringify(response)+']');
						response = response?response:{};
						gd.setData(response.data);
						_isFn(doneFn)&&doneFn(gd);
						
					},function(response){
						//failure
						//$log.log(logTmp+'<['+JSON.stringify(response)+']');
						_isFn(doneFn)&&doneFn(gd);
					}
				);
			}
		};

		function _paramJSON(json){

			if(!_isJSON(json)){
				return 'target is not json...';
			}
			//serialize json
			var reg20 = /%20/g;
			var v,tmp = [];
			var encodeFn = encodeURIComponent;
			for(var k in json){
				v = json[k];
				v = _isFn(v) ? v() : ( v == null ? "" : v );
				tmp[ tmp.length ] = encodeFn( k ) + "=" + encodeFn( v );
			}
			return tmp.join('&').replace(reg20,'+');
		}

		function _isJSON(target){
			return typeof(target) == "object" && Object.prototype.toString.call(target).toLowerCase() == "[object object]" && !target.length;
		}

		function _isFn(target){
			return (typeof target === 'function');
		}

		function guide(data){
			var _data = data?data:{};
			var _ways = [];
			var _handles = {};
			var _otherHandle = function(){};
			var _anyHandle = function(){};
			var _actived = false;

			function _isFn(target){
				return (typeof target === 'function');
			}

			var _dothis = function(handle){
				if(_ways.length>0&&_isFn(handle)){
					_handles[_ways[_ways.length-1]] = handle;
				}else{$log.error('error:params unsuited[01] ...');}
				return doHandle;
			};

			var _when = function(code){
				_ways.push(code);
				return whenHandle;
			};

			var _any = function(handle){
				if(_isFn(handle)){
					_anyHandle = handle;
				}else{$log.error('error:params unsuited[02] ...');}
				return doHandle;
			};

			var _other = function(handle){
				if(_isFn(handle)){
					_otherHandle = handle;
				}else{$log.error('error:params unsuited[03] ...');}
				return exeHandle;
			};

			var _exe = function(){
				//console.log(_handles);
				if(_data&&_data.code){
					if(_isFn(_handles[_data.code])){
						_handles[_data.code](_data);
						_actived = true;
					}else{$log.error('error:params unsuited[04] ...');}
				}else{$log.error('error:params unsuited[05] ...');}
				
				!_actived&&_isFn(_otherHandle)&&_otherHandle(_data);

				return null;
			};

			var _setData = function(data){
				_data = data?data:{};
				return doHandle;
			};

			var _clear = function(){
				_ways = [];
				_handles = {};
				_otherHandle = function(){};
				_anyHandle = function(){};
				_actived = false;
				return doHandle;
			};

			var whenHandle = {dothis:_dothis};
			var doHandle = {when:_when,any:_any,other:_other,exe:_exe};
			var exeHandle = {exe:_exe};
			this.when = _when;
			this.any = _any;
			this.other = _other;
			this.exe = _exe;
			this.setData = _setData;
			this.clear = _clear;
		}
	}
])

.service('DeviceApi',
['$document','$timeout','Toast','consts','$route','$log',
	function($document,$timeout,Toast,consts,$route,$log){

		//订阅设备事件
		function _bindDevEvent(eventType,eventHandle){
			var eventDictionary = {
				'hookRightBtnClick':{modName:'HSQApp',fnName:'hookRightBtnClick'}
			};
			var handle = eventDictionary[eventType];
			if(!angular.isDefined(handle)){
				Toast.toast('bindDevEvent:eventType['+eventType+'] is unsuited');
				return;
			}

			var dstParams = {
				callBack:function(result){
					Toast.toast('default:[eventType] callBack!');
				}
			};
			angular.merge(dstParams, {callBack:function(){
				_execdv(handle.modName,handle.fnName,dstParams);
				$timeout(function(){
					angular.isFunction(eventHandle)&&eventHandle();
				},400);
				
			}});

			_execdv(handle.modName,handle.fnName,dstParams);
		
		}
		

		function _execdv(modName,fnName,params,callBack){

			//Toast.toast('调用设备...');
			if(angular.isDefined(window.cordova)&&angular.isFunction(window.cordova.exec)){
				window.cordova.exec(
					function(result,others){
						//onSuccess
						//Toast.toast('调用设备['+modName+'.'+fnName+']:onSuccess');
						params&&angular.isFunction(params.callBack)&&params.callBack(result,others);
					},
					function(result,others){
						//onFault
						//Toast.toast('调用设备['+modName+'.'+fnName+']:onFault');
						Toast.toast('休息，休息一会儿...');
						params&&angular.isFunction(params.callBack)&&params.callBack(result,others);
					},modName,fnName,[params]
				);
			}else{
				//Toast.toast('调用设备未准备好...');
				Toast.toast('休息，休息一会儿....');
			}
		}


		//安全订阅设备事件
		this.bindDevEvent = function(eventType,eventHandle){
			
			//deviceready
			$timeout(function(){
				_bindDevEvent(eventType,eventHandle);
			},600);

			//$document.on('load',function(){
			//	Toast.toast('$document loaded...');
				//_bindDevEvent(eventType,eventHandle);
			//});
		};


		//微信支付
		this.wxPay = function(params){
			var dstParams = {
					callBack:function(result){
						Toast.toast('default:wxPay callBack!');
						// errCode        errStr
						// -100           微信支付加密串解密失敗
						// -101           未安裝微信  
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQPay','wxPay',dstParams);
		};

		//支付宝钱包支付
		this.aliPay = function(params){
			var dstParams = {
					callBack:function(result){
						Toast.toast('default:aliPay callBack!');
						//resultStatus     result                        memo
						// -100            支付寶支付加密串解析錯誤       ""
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQPay','aliPay',dstParams);
		};

		//呼出号码盘
		this.callPhone = function(params){
			var dstParams = {
					number:'10086',//拨叫号码
					callBack:function(result){
						//Toast.toast('default:callPhone callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','callPhone',dstParams);
		};
		//*打電話
		this.callNewsPhone = function(params){
			var dstParams = {
					"phone":"10086",//拨叫号码
					callBack:function(result){
						//Toast.toast('default:callNewsPhone callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQNews','callNewsPhone',dstParams);
		};
		//*私信客服
		this.sendMessageUI = function(params){
			var dstParams = {
					"type":"1", //私信客服    "type":"2" 私信商家
                    "contactid":"01",//客服id    "type":"2" contactid:"商户uid"  16852

					callBack:function(result){
						//Toast.toast('default:sendMessageUI callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','sendMessageUI',dstParams);
		};

		//呼出私信
		this.callService = function(params){
			var dstParams = {
					callBack:function(result){
						//Toast.toast('default:callService callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','callService',dstParams);
		};

		//*分享
		this.shareUI = function(params){
			var dstParams = {
					"title":"",//分享标题
					"desc":"",//分享摘要
					"url":"",//分享链接
					"img":"",//分享图片链接
					callBack:function(result){
						//Toast.toast('default:shareUI callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','shareUI',dstParams);
		};
		
		//*呼出登录
		this.openLoginUI = function(params){
			var dstParams = {
					callBack:function(result){
						//Toast.toast('default:openLoginUI callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQUser','openLoginUI',dstParams);
		};

		//*获取终端信息
		this.getTokenAndDevice = function(params){
			var dstParams = {
					//获取参数"uid":"用户Id",nickname":"用户昵称","icon":"用户头像","countrycode":"国家码","username":"用户手机号","token":"用户token","deviceId":"设备标识"
					callBack:function(result){
						Toast.toast('default:getTokenAndDevice callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','getTokenAndDevice',dstParams);
		};

		//*打开商户主页
		this.openUserIndexUI = function(params){
			var dstParams = {
					"type":"",//商户类型:type:0未认领商户,userid为商户id;type:1认领商户,userid为商户用户id
					"userid":"",// must string
					callBack:function(result){
						//Toast.toast('default:openUserIndexUI callBack!');
					}
			};
	    	angular.merge(dstParams, params);
	    	
			_execdv('HSQUser','openUserIndexUI',dstParams);
		};
		
		//*打开地址
		this.openNewsAddressUI = function(params){
			var dstParams = {
					"latitude":"",//纬度
					"longitude":"",//经度
					"address":"",//地址
					callBack:function(result){
						//Toast.toast('default:openNewsAddressUI callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQNews','openNewsAddressUI',dstParams);
		};
		
		//*退出当前商城频道
		this.popToCurrentApp = function(params){
			var dstParams = {
					callBack:function(result){
						//Toast.toast('default:popToCurrentApp callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','popToCurrentApp',dstParams);
		};
			
		//设置页面title
		this.setTitleText = function(params){
			var dstParams = {
					title:'风火食客',
					callBack:function(result){
						//Toast.toast('default:setTitleText callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','setTitleText',dstParams);
		};
		//*设置当前页面标题 
		this.setAppTitle = function(params){
			var dstParams = {
					title:'',
					callBack:function(result){
						//Toast.toast('default:setAppTitle callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','setAppTitle',dstParams);
		};

		//发送邮件
		this.sendEmail = function(params){
			var dstParams = {
					email:'3133044943@qq.com',
					callBack:function(result){
						//Toast.toast('default:sendEmail callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','sendEmail',dstParams);
		};

		//呼出APP设置
		this.openSettingPage = function(params){
			var dstParams = {
					callBack:function(result){
						//Toast.toast('default:openSettingPage callBack!');
						$route.reload();
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','openSettingPage',dstParams);
		};

		//打开新窗口
		this.openLink = function(params,isNotTest){
			var dstParams = {
					url:'',//要打开的url
					newWindowMode:'3',//[0:在当前窗口打开url,无回调|1:在当前窗口内打开url,加载完成后回调|2:在新窗口内打开url，无回掉|3:在新窗口内打开url，新窗口被关闭时回掉]
					titleBarMode:'0',//[0:红色背景的TitleBar|1:透明背景的TitleBar]
					titleBarStyle:{
						left:'1',//[0:无返回按钮并屏蔽app【返回键】事件|1:有返回按钮不屏蔽app【返回键】事件]
						center:'惠生活',//如果center为''则不显示文本，否则显示center
						right:{text:'',color:'000000'}//json:{text:'',color:''},如果 text 为''则不显示，否则显示text;color 描述text颜色 eg: #ffffff
					},	//json:{left:'1',center:null,right:{text:null,color:'#000000'}}
					
					callBack:function(result){
						//Toast.toast('default:openLink callBack!');
					}
			};
	    	angular.merge(dstParams, params);
			
			isNotTest = true;
			if(isNotTest){
				
				//Toast.toast('openLink:['+dstParams.url+']',function(){
					dstParams.url = consts.fmt(dstParams.url);
					_execdv('HSQApp','openLink',dstParams);
				//});

			}else{
				window.location.href='/fzshop'+dstParams.url;
			}
		};

		//打开新窗口
		this.openShopviewUI = function(params){
			var dstParams = {
					content:{
						"url":"",//要打开的url
						"top":{"title":"","btn_icon":"","btn_words":""}//btn_icon和btn_words均为空,右键不显示
					},
					callBack:function(result){
						//Toast.toast('default:openLink callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','openShopviewUI',dstParams);
		};

		//选择图片并上传
		this.selectPicture = function(params){
			var dstParams = {
					callBack:function(result){
						//Toast.toast('default:selectPicture callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','selectPicture',dstParams);
		};

		
		//退出当前界面
		this.popToCurrentPage = function(params){
			var dstParams = {
					"params":"",
					callBack:function(result){
						Toast.toast('default:popToCurrentPage callBack!');
					}
			};
	    	angular.merge(dstParams, params);

			_execdv('HSQApp','popToCurrentPage',dstParams);
		};
		

		this.openKF = function(params){
			var url = 'http://kefu.easemob.com/webim/im.html?tenantId=13212';
			this.openLink({url:url,titleBarStyle:{center:'客服'}});
		};

		this.getCurrentPosition = function(params,isTest){

			

			var dstParams = {
					"options":{
						enableHighAccuracy: true,
						maximumAge: 3000,
						timeout: 2000
					},
					callBack:function(result){
						Toast.toast('default:getCurrentPosition callBack!');
					}
			};
	    	angular.merge(dstParams, params);
			if(isTest){
				//result:null|{latitude: 40.1451, longitude: -99.6680}
				angular.isFunction(dstParams.callBack)&&dstParams.callBack({latitude: 40.1451, longitude: -99.6680});
			}else if(navigator&&navigator.geolocation&&navigator.geolocation.getCurrentPosition){
				navigator.geolocation.getCurrentPosition(
					function(position){
						angular.isFunction(dstParams.callBack)&&dstParams.callBack({latitude:position.coords.latitude,longitude:position.coords.longitude});
					}, function(error){
						angular.isFunction(dstParams.callBack)&&dstParams.callBack(null);
						switch (error.code) {
							case error.TIMEOUT:
								Toast.toast("连接超时，请重试...");
								break;
							case error.PERMISSION_DENIED:
								Toast.toast("您拒绝了使用位置共享服务，查询已取消...");
								break;
							case error.POSITION_UNAVAILABLE:
								Toast.toast("获取位置信息失败...");
								break;
						}
					}, dstParams.options);
			}else{
				Toast.toast("获取位置信息失败....");
				angular.isFunction(dstParams.callBack)&&dstParams.callBack(null);
			}
		};

	}
])

.service('selectBox', ['$compile', '$timeout', 
	function ($compile, $timeout) {
		var globalToastBox = null;

		this.open = function (leftJSON, rightJSON, selectParams) {
			var currParams = {
				leftIndex: "2", //设置左侧默认index值
				rightIndex: "2", //设置右侧默认index值
				onDone: function () {},//回调函数
				onOpen: function () {},
				height:44
			};

			angular.extend(currParams, selectParams);

			currParams.onOpen&&angular.isFunction(currParams.onOpen)&&currParams.onOpen();

			if (!globalToastBox) {

				var box = '';
				box += '<div style="position:fixed;top:0;left:0;height:100%;width:100%;background:rgba(0,0,0,0.5);">';
				box += '  <div style="position:absolute;bottom:0;left:0;width:100%;background-color:#fff;">';
				box += '      <div ng-click="done()" style="text-align:right;padding:20px 14px 0 14px;font-size:14px;">完成</div>';
				box += '      <div style="height:'+(currParams.height)*5+'px;overflow:hidden;position:relative;margin:20px 14px;">';
				box += '          <div style="font-family:Arial;position:relative;z-index:100;">';
				box += '              <div style="width:50%;float:left;">';
				box += '                  <ul id="leftSelect" style="list-style:none;position:relative;top:0;left:0;text-align:center;">';
				box += '                      <li style="list-style:none;height:'+currParams.height+'px;line-height:'+currParams.height+'px;font-family:Arial;" ng-repeat="l in  leftData" ng-bind="l.month"></li>';
				box += '                  </ul>';
				box += '              </div>';
				box += '              <div style="width:50%;float:left;">';
				box += '                  <ul id="rightSelect" style="list-style:none;position:relative;top:0;left:0;text-align:center;">';
				box += '                      <li style="list-style:none;height:'+currParams.height+'px;line-height:'+currParams.height+'px;font-family:Arial;" ng-repeat="r in rightData" ng-bind="r.year"></li>';
				box += '                  </ul>';
				box += '              </div>';
				box += '              <div style="clear:both;"></div>';
				box += '          </div>';
				box += '          <div style="position:absolute;top:'+(currParams.height)*2+'px;left:0;width:100%;height:'+currParams.height+'px;z-index:1;">';
				box += '		      <div style="position:absolute;top:0;left:0;   height:1px;width:100%;background:#dcdcdc;-webkit-transform:scaleY(0.3333);-moz-transform:scaleY(0.3333);-ms-transform:scaleY(0.3333);-o-transform:scaleY(0.3333);transform:scaleY(0.3333);"></div>';
				box += '			  <div style="position:absolute;bottom:0;left:0;height:1px;width:100%;background:#dcdcdc;-webkit-transform:scaleY(0.3333);-moz-transform:scaleY(0.3333);-ms-transform:scaleY(0.3333);-o-transform:scaleY(0.3333);transform:scaleY(0.3333);"></div>';
				box += '		  </div>';
				box += '      </div>';
				box += '  </div>';
				box += '</div>';

				globalToastBox = angular.element(box);
				angular.element(window.document.body).append(globalToastBox);

				var pscope = globalToastBox.scope();
				var scope = pscope.$new();

				scope.leftData = leftJSON;
				scope.rightData = rightJSON;

				var leftIndex = currParams.leftIndex;
				var rightIndex = currParams.rightIndex;

				var leftZoo = document.getElementById('leftSelect');
				var rightZoo = document.getElementById('rightSelect');

				var leftTop = leftZoo.style.top; //获取ul相对定位top[string]
				var lTop = Number(leftTop.substring(0, leftTop.length - 2)); //获取ul相对定位top[number]

				var rightTop = rightZoo.style.top; //获取ul相对定位top[string]
				var rTop = Number(rightTop.substring(0, rightTop.length - 2)); //获取ul相对定位top[number]
				
				var h = currParams.height;
				//左侧滑动事件
				scope.zooScrollLeft = function () {
					if (leftZoo) {
						var startY = 0; // 初始位置
						var lastY = 0; // 上一次位置

						var top = leftTop;
						var topY = lTop;

						var zooHeight = h*3 - leftJSON.length * h; //ul的高度

						leftZoo.addEventListener('touchstart', function (e) {
							lastY = startY = e.touches[0].pageY; //手指接触屏幕时的Y值
							//重新获取高度
							top = leftZoo.style.top;
							topY = Number(top.substring(0, top.length - 2));
						});
						leftZoo.addEventListener('touchmove', function (e) {
							e.preventDefault();
							var nowY = e.touches[0].pageY; //手指移动时的Y值
							var currY = nowY - lastY;
							e.target.parentNode.style.top = topY + currY + "px";
						});
						leftZoo.addEventListener('touchend', function (e) {
							var top = e.target.parentNode.style.top;
							var topY = Number(top.substring(0, top.length - 2));

							if (topY >= 0) {
								topY = topY % h >= h/2 ? topY + (h - topY % h) : topY - topY % h;
								topY = topY > h*2 ? h*2 : topY;
							} else {
								topY = topY % h < -h/2 ? topY - (h + topY % h) : topY - topY % h;
								topY = topY < zooHeight ? zooHeight : topY;
							}

							e.target.parentNode.style.top = topY + "px";

							var topL = topY / h;
							if (topL == 0) {
								leftIndex = 2;
							} else if (topL == 1) {
								leftIndex = 1;
							} else if (topL == 2) {
								leftIndex = 0;
							} else if (topL < 0) {
								leftIndex = -topL + 2;
							}
							scope.clearStyleLeft();
							scope.calculateLeft(leftIndex);
						});
					}
				};
				//右侧滑动事件
				scope.zooScrollRight = function () {
					if (rightZoo) {
						var startY = 0; // 初始位置
						var lastY = 0; // 上一次位置

						var top = rightTop;
						var topY = rTop;

						var zooHeight = h*3 - rightJSON.length * h; //ul的高度

						rightZoo.addEventListener('touchstart', function (e) {
							lastY = startY = e.touches[0].pageY; //手指接触屏幕时的Y值
							//重新获取高度
							top = rightZoo.style.top;
							topY = Number(top.substring(0, top.length - 2));
						});
						rightZoo.addEventListener('touchmove', function (e) {
							e.preventDefault();
							var nowY = e.touches[0].pageY; //手指移动时的Y值
							var currY = nowY - lastY;
							e.target.parentNode.style.top = topY + currY + "px";
						});
						rightZoo.addEventListener('touchend', function (e) {
							var top = e.target.parentNode.style.top;
							var topY = Number(top.substring(0, top.length - 2));

							if (topY >= 0) {
								topY = topY % h >= h/2 ? topY + (h - topY % h) : topY - topY % h;
								topY = topY > h*2 ? h*2 : topY;
							} else {
								topY = topY % h < -h/2 ? topY - (h + topY % h) : topY - topY % h;
								topY = topY < zooHeight ? zooHeight : topY;
							}

							e.target.parentNode.style.top = topY + "px";

							var topL = topY / h;
							if (topL == 0) {
								rightIndex = 2;
							} else if (topL == 1) {
								rightIndex = 1;
							} else if (topL == 2) {
								rightIndex = 0;
							} else if (topL < 0) {
								rightIndex = -topL + 2;
							}
							scope.clearStyleRight();
							scope.calculateRight(rightIndex);
						});
					}
				};
				//清除左侧样式
				scope.clearStyleLeft = function () {
					var len = leftZoo.children.length;
					for (var i = 0; i < len; i++) {
						leftZoo.children[i].style.color = "#1e1e1e";
					}
				};
				//清除右侧样式
				scope.clearStyleRight = function () {
					var len = rightZoo.children.length;
					for (var i = 0; i < len; i++) {
						rightZoo.children[i].style.color = "#1e1e1e";
					}
				};
				//通过当前li index值计算position top  左侧
				scope.calculateLeft = function (left) {
					left = parseInt(left);
					scope.clearStyleLeft();
					if (leftZoo) {
						if (left < 0) {
							left = 0;
						} else if (left >= leftZoo.children.length) {
							left = leftZoo.children.length - 1;
						}
						var top = h*2 - left * h;
						leftZoo.style.top = top + 'px';
						leftZoo.children[left].style.color = "#fe5a4c";
					}
				};
				//通过当前li index值计算position top  右侧
				scope.calculateRight = function (right) {
					right = parseInt(right);
					scope.clearStyleRight();
					if (rightZoo) {
						if (right < 0) {
							right = 0;
						} else if (right >= rightZoo.children.length) {
							right = rightZoo.children.length - 1;
						}
						var top = h*2 - right * h;
						rightZoo.style.top = top + 'px';
						rightZoo.children[right].style.color = "#fe5a4c";
					}
				};

				scope.zooScrollLeft();
				scope.zooScrollRight();

				$timeout(function () {
					scope.calculateLeft(leftIndex);
					scope.calculateRight(rightIndex);
				}, 200);

				scope.$watch('leftIndex', function (newVal, oldVal, scope) {
					if (newVal) {
						scope.calculateLeft(newVal);
					}
				});
				scope.$watch('rightIndex', function (newVal, oldVal, scope) {
					if (newVal) {
						scope.calculateRight(newVal);
					}
				});
				//点击完成事件
				scope.done = function () {
					globalToastBox.css({'display': 'none'});
					currParams.onDone && angular.isFunction(currParams.onDone) && currParams.onDone(leftIndex,rightIndex);
				};

				$compile(globalToastBox)(scope);
			}

			globalToastBox.css({'display': 'block'});
		}
	}
])


.filter("fmt",
['consts','$log',
	function(consts,$log){
		return function(target,fmtflag,defaultValue){
			if('imgsrc'==fmtflag){
				if(target&&(typeof target === 'string')&&target.length>0&&target.indexOf('null')<0){
					var head = target.substr(0,1);
					if('/'!=head){
						return target;
					}else{
						return consts.pichost+target;
					}
				}else{
					return defaultValue?defaultValue:"imgs/default.png";
				}
			}else{
				return target;
			}
		}
}])

.filter('to_trusted', ['$sce', function ($sce) {
	return function (text) {
	    return $sce.trustAsHtml(text);
	};
}])
;