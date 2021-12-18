
//监听错误，vue监听在此监听之前
window.onerror = function(errorMessage, scriptURI, lineNumber,columnNumber,errorObj) {
   alert("错误信息：" + errorMessage+"\n出错文件：" + scriptURI+"\n出错行号：" +lineNumber+"\n出错列号：" +columnNumber+"\n错误详情："+errorObj);
   return true;
};
 
//vue初始化
function vueInit(){
app	= new Vue({el: '#app',	vuetify: new Vuetify(),
data:()=>({
	sysName:'',	homepage:'',	varWin:{},
	ACC:'',truename:'[未登录]',
	vueToLoad:'',vueToLoadACC:'',		//LoadVueACC中应用，登录后跳转
	drawer:true,
	fullWidth:document.documentElement.clientWidth,	bigWidth:document.documentElement.clientWidth>=1264,//屏幕宽度 bigWidth
	alert:false,alertMsg:'提示',alertTitle:'温馨提示！',alertType:'info',//信息提示dialog
	dateDialog:false,dateStr:"2021-02-03", //选择日期
	myCall:false,myCallTitle:'在线呼叫：',myCallType:'info',myCallMsg:'',calleeID:'',calleeName:'',//呼叫框的属性
	sysWin:false,sysWinCom:'', sysWintitle:'',//系统窗口，非ifr
	snackbar:false,snackMsg:'snack',timeout:3000,snackcolor:'success',
	ifrDialog:false,ifrTitle:'',ifrUrl:'',//ifr框
	vueParm:'',
	isBusy:false,isBusyMsg:'努力工作中',
	cardmode:false,EditDialog: false,//卡片模式、为了统一
	logo:'/images/man2.jpg',	mem_ID:'',
	
	tab:0,//当前tabs页面
	tabname:[],	tabcom:	[],	tabobj:	[],//tab标题，控件名称 str，控件实例object
	menus1:[],menus2:[],
	geostart:false,	geocount:0,geoReport:1, //连续定位 

	cur_obj:{},tmpField:'',cur_items:{},cur_items2:{},//当前打开的Vue-obj，当前打开编辑的items		
	tmpObj:{},tmpStr1:'', tmpStr2:'',tmpStr3:'', //用于传递对象参数，  uid, name,Title 
	TopTab:appSN,TopRow:'',d_type:'',d_title:'信息列表', //LoadVueParm参数传递

	editedItem:{d_date1:'2021-02-28'},url_s:'',//承接Crud操作数据结构
	browserDD:false,	browserWX:false,	browserQYWX:false, //浏览器类型
	panel1: [0], //drawer折叠菜单
  	}),

created(){ g_log+='\n*VueCreated'; this.cur_obj=this;
	this.menus1=TopMenu1;this.menus2=TopMenu2; this.homepage=homepage;
	this.sysName=g_sysName;
	this.varWin =window;//H5的window全局变量
	if(!this.bigWidth){this.drawer=false;tabmax=3;}; //手机等小界面，最多3个tab
},
mounted(){ g_log+='\n*VueMounted';	
		this.browserDD=navigator.userAgent.indexOf('DingTalk')>0;
		this.browserWX=navigator.userAgent.indexOf('WeChat')>0;		
		this.browserQYWX=navigator.userAgent.indexOf('wxwork')>0;
	
		if((this.browserDD)||(this.browserQYWX)) //如钉钉或企业微信浏览器，进行免登
			{this.ShowBusy('系统加载中，请稍后！');		setTimeout(()=>{SDK_start()},500); //延迟执行钉钉 
			setTimeout(()=>{isDDReady()},8000);//因为bug，8秒后再次判断钉钉是否正常 
			 }	
		if(SysTmp!=indexQS){gv_db='1';	//判断QS =vue正式库 
			if((this.browserDD)||(this.browserQYWX)){ // this.LoadVue('系统首页',homepage)
				}else{this.LoadVue('系统登录','vt_login');}	//不是钉钉与企业微信，就转到登录界面	 		
		}else{gv_db='';  this.LoadVue('测试首页',homepage);}  //QS = vuetest测试, 测试数据来自html文件，testpage
		},

watch: { isBusy(val) {if (!val)	return;	let _this=this; setTimeout(()=>{_this.isBusy=false},8000);}, }, //限制isBusy为6秒，6秒后自动关闭
methods: {
RegCom(vueName,filename,parm){	
	var	myfile=	(filename==null) ? vueName+'.shtm?sn='+sn	 : filename; 		this.vueParm=parm;
	if(vue_class_arr.indexOf(vueName)==-1){//控件是否存在，不存在就创建控件	
		Vue.component(vueName,httpVueLoader(myfile));
		vue_class_arr.push(vueName);
		this.ShowBusy('控件加载中！');
		}	//if(gv_db!='')this.postLog('Vue控件加载',myfile);		
},
//Vue加载到Tab页面
LoadVue(tabtitle,vueName,filename,parm){
	this.RegCom(vueName,filename,parm); //注册class
	var	ipos=this.tabcom.indexOf(vueName);//tab是否存在，不存在就push
	if(ipos==-1){ //tab不存在
		if(this.tabcom.length>=tabmax){this.tabcom.shift();	this.tabname.shift();this.tabobj.shift();}	 //满了就删除第一个
		this.tabcom.push(vueName);	   this.tabname.push(tabtitle);	this.tabobj.push({}); //注意此时tabobj为空，在created里赋值
		ipos=this.tabcom.length	-1;
		window.scrollTo(0,0);	//新页面滚动到顶
	}else if(parm=='Refresh'){this.tabobj[ipos].setParm();	this.tabobj[ipos].init()} //刷新数据
	
	this.tab=ipos;	//切换显示当前tab
	if(!this.bigWidth){	this.drawer=false; } //小屏幕自动关闭drawer		
	},
//Parm指TopTab、TopRow、d_type。LoadVueParm(Top表,行，dtype	， 相当于initParm + LoadVue
LoadVueParm(TopTab,TopRow,d_type,tabtitle,vueName,filename,parm){this.TopTab=TopTab;this.TopRow=TopRow;this.d_type=d_type;this.d_title=tabtitle;
													 this.LoadVue(tabtitle,vueName+d_type,filename?filename:vueName+'.shtm','Refresh');},
LoadVueMemID(TopTab,TopRow,tabtitle,vueName,filename,parm){LoadVueParm(TopTab,TopRow,g_mem_ID,tabtitle,vueName,filename,parm)},	//mem_ID代替d_type												 
LoadVue2Win(tabtitle,vueName,filename,parm){this.RegCom(vueName,filename,parm);	this.sysWinCom=vueName;	this.sysWintitle=tabtitle;	this.sysWin=true;},
//相当于initParm + LoadVue2Win
LoadVue2WinParm(TopTab,TopRow,d_typ,tabtitle,vueName,filename,parm){this.TopTab=TopTab;this.TopRow=TopRow;this.d_type=d_typ;this.d_title=tabtitle;  //参数
														 this.LoadVue2Win(tabtitle,vueName,filename,parm)},

//删除当前页
DelTab(){this.tabcom.splice(this.tab,1);this.tabname.splice(this.tab,1);this.tabobj.splice(this.tab,1);this.tab=this.tabname.length -1; 
	if(!this.bigWidth){this.drawer=false;} //关闭drawer菜单
	//if(this.tab<0){this.LoadVue('系统首页',homepage)}  //至少打开首页
	}, 
ClosePage(){if(app.sysWin){app.sysWin=false;app.sysWinCom=''}else{app.DelTab()}}, 
//删除全部页
DelAllTab(){this.tabcom.splice(0,20);this.tabname.splice(0,20);this.tabobj.splice(0,20);this.tab=-1; 
	if(!this.bigWidth){this.drawer=false;}}, 

//带权限验证的LoadVue(tabtitle,vueName,filename,parm)		
LoadVueACC(tabtitle,vueName,NeededACC,filename,parm)
		{if(this.ACC==''){this.LoadVue(tabtitle,'vt_login') ; this.vueToLoad=vueName;this.vueToLoadACC=NeededACC;}//没有登录
			else if(this.ACC.indexOf(NeededACC)==-1){app.ShowAlert('warning','温馨提示：','您的权限不足！'+NeededACC+'/'+this.ACC)}
				else{this.LoadVue(tabtitle,vueName,filename,parm)}
					  },

//一键呼叫的入口,钉钉使用telno，微信使用calleeID
MyCall(telno,Title,Msg,calleeID){if(this.browserDD){quickCall(telno,Title,Msg)}else{//openUserProfile(calleeID);    //二选一
																					this.ShowCall(calleeID,Title,'请选择互动方式！')
								}}, 	
MyCallMulti(calleeIDdd,calleeIDwx,Title,Msg){if(this.browserDD){SdkMeeting(Title,calleeIDdd,1,0);}else{SdkMeeting(Title,calleeIDwx,1,0);}}, //SdkMeeting在SDK
//一键呼叫到转企业微信界面，展示三种选择
ShowCall(calleeID,Title,Msg){this.myCallTitle=Title;this.myCallMsg=Msg;this.myCall=true;this.calleeID=calleeID},

sendMsg(uid){sendMsg(uid)},	//在钉钉或微信sdk中定义
CallMemID(memID){
	axios.post('/common/data_member_gps.asp?ID='+mem_ID).then(response=>{
		MyCall(response.data.rows[0].tel,'呼叫'+response.data.rows[0].mem_Url,'请选择呼叫方式！',response.data.rows[0].WXuserid);
    }).catch((err)=>{alert("读取data_member_gps出错:"+JSON.stringify(err));})  
},

ShowAlert(Type,Title,Msg){this.alertTitle=Title;this.alertMsg=Msg;this.alertType=Type;this.alert=true;},
myAlert(Msg,t){app.ShowAlert('warning',t?t:'温馨提示：',Msg)},
ShowSnack(Msg,color){this.snackbar=false;this.snackMsg=Msg;if(color){this.snackcolor=color}else{this.snackcolor='success'};this.snackbar=true;},
CloseSnack(Msg,color){this.snackbar=false;},
ShowBusy(Msg){this.isBusy=true;if(Msg){this.isBusyMsg=Msg}else{this.isBusyMsg='努力工作中'};},
HideBusy(){this.isBusy=false},
OpenIfr(title,url){this.ifrTitle=title;this.ifrUrl=url;this.ifrDialog=true;},

wangEditor( colName){this.OpenIfr('编辑器',  '/common/fd_wang.asp?colName='+colName);},
UploadPhoto(colName){this.OpenIfr('照片上传','/common/fd_UploadPhoto.asp?colName='+colName);},
UploadFile( colName){this.OpenIfr('附件上传','/common/fd_UploadFile.asp?colName='+colName);},
fd_LatLng(colName){this.OpenIfr('获取经纬度','/common/fd_LatLng.asp?colName='+colName);},
fd_date(colName){app.dateStr=this.cur_obj.editedItem[colName];		app.tmpField=colName;	app.dateDialog=true;},
fd_date_save(dateStr){this.cur_obj.editedItem[app.tmpField]=dateStr;this.cur_obj.EditDialog=false; app.dateDialog=false; this.cur_obj.EditDialog=true;},


//以下是crud--------crud
count(obj){obj.count=obj.count+1},
	//数组数据编辑
editItem(obj,item) {obj.editedIndex=obj.d_items.indexOf(item); 		Object.assign(obj.editedItem,item);		this.cur_obj=obj;},
newItem(obj){obj.addcount ++;obj.editedIndex=-1;Object.assign(obj.editedItem,obj.defaultItem);obj.editedItem.ID=-obj.addcount;this.cur_obj=obj;},
//检索数据
getData(obj){app.ShowBusy('读取数据中！');
	axios.post(obj.url_r,qs.stringify(obj.parm_r)+'&init=yes' ).then(response=>{ //init=yes，指首页
	if(response.data.Message=='登录超时'){this.toLogin();
	}else if(!response.data.IsSuccess){	app.ShowAlert('warning','查询数据出错！',obj.url_r+'：'+response.data.Message);
	}else{obj.d_items =response.data.rows;	if(obj.d_items.length){obj.parm_r.r_MinID=obj.d_items[obj.d_items.length -1].ID;}
		  obj.afterData();}	
	app.HideBusy();}).catch((err)=>{app.ShowAlert('warning','读取数据失败：',obj.url+'->'+err);	app.HideBusy();})
},
	
//重新检索是getData，追加检索是moreItem
moreItem(obj){app.ShowBusy('读取数据中！');
	axios.post(obj.url_r,qs.stringify(obj.parm_r)+'&init=no' ).then(response=>{ //init=no，非首页
	if(response.data.Message=='登录超时'){this.toLogin();
	}else if(!response.data.IsSuccess){	app.ShowAlert('warning','查询数据出错！',obj.url_r+'：'+response.data.Message);app.HideBusy();
	}else{ if(obj.d_items.length){for (var i=0; i <response.data.rows.length; i++) {obj.d_items.push( response.data.rows[i] );}
			obj.parm_r.r_MinID=obj.d_items[obj.d_items.length -1].ID;}
		  	obj.afterData();	app.HideBusy();}	
			}).catch((err)=>{app.ShowAlert('warning','读取数据失败：',obj.url+'->'+err); })
	},//从数据库中读取Data

Asp2Arr(url,obj,fd){ //url,对象，字段名称
	axios.post(url).then(response=>{	obj[fd]=response.data.rows;
    	}).catch((err)=>{alert('读取'+url+'出错:'	+JSON.stringify(err));	})  
},
	
//登录前提示，然后转到登录的入口	
toLogin(){if(this.browserDD){alert('钉钉免登超时，重新进入！');window.location.reload();
		}else if(this.browserQYWX){alert('微信免登超时，重新进入！');window.location.href='http://hmxx.0752app.cn/login_qywx/toAuth.asp';
		}else{app.ShowAlert('warning','登录超时！','请重新登录！');this.LoadVue('系统登录','vt_login')}	//不是免登就到登录界面
	},
//读取数据，赋值给数组（parm_r,返回的数组，提示，url）
//例如：parm_r={page:1,rows:20,r_order:'ID$desc',searchdb:'',r_where:'',r_tab:'cm_',r_fd:'ID$d_cat$d_name'}	
obj2Arr(obj,vueObj,field,msg,url){var url_r=(url==null)?	'/common/data_r.asp':url;
		axios.post(url_r,qs.stringify(obj) ).then(response=>{vueObj[field]=response.data.rows;
			}).catch((err)=>{app.ShowAlert('warning','读取数据出错:'+msg,err); })
	},//obj2Arr
getTestData(obj){axios.get(obj.test_data+'?sn='+sn).then(response=>{obj.d_items	=response.data.rows;	obj.afterData();
			app.HideBusy();}).catch((err)=>{app.ShowAlert('warning','读取测试文件失败！',err);	app.HideBusy(); })
	},//gettestData

//deleteItem删除数据
deleteItem(obj,item){ if( confirm('确认删除该记录吗？ID='+item.ID)==0){return 0}
	var	i=obj.d_items.indexOf(item);	obj.d_items.splice(i,1);
	if(gv_db==''){this.ShowSnack('已删除！')}
	else{axios.post(obj.url_d,qs.stringify({r_tab:obj.parm_r.r_tab,ID:item.ID})).then(response=>{
		if(response.data.IsSuccess){app.ShowAlert('info','温馨提示：','删除成功！');
　　　　		}else{app.ShowAlert('warning','删除失败！',response.data.Message);}
			}).catch((err)=>{app.ShowAlert('warning','数据库操作失败！',err); })
		} //if gv_db!=''
	},//deleteItem

saveData(obj){
		this.ShowSnack('正在保存数据');
		if(gv_db==''){//测试数据库
			if (obj.editedIndex	> -1) {Object.assign(obj.d_items[obj.editedIndex],obj.editedItem)
					}else{obj.d_items.unshift(obj.editedItem) ;	obj.editedIndex=0;	obj.editedItem=Object.assign({},obj.defaultItem); }//obj.create
			obj.EditDialog=false;	return 0;}
		this.post2DB(obj.url_s+'?r_tab='+obj.parm_r.r_tab+'&r_fd0='+obj.parm_r.r_fd0+'&r_fd1='+obj.parm_r.r_fd1,	obj);
	},//saveData
	
//	post2DB(数据库操作url,vue的obj)
//post到数据库，url=/common/data_s.asp?r_tab=cm_callObj&fd0=&r_fd1=d_title$d_names$d_depts$d_ids$d_uids$d_memo
//editedData={ID:-1,d_title:'会议' ,d_names:g_truename,vid:''}
post2DB(url,obj){var editedData=obj.editedItem;
	axios.post(url,qs.stringify(editedData)).then(response=>{	  //url含r_tab
		obj.cardmode=!obj.cardmode;	//强制刷新
		if(response.data.IsSuccess){
			if (obj.editedIndex	> -1) {Object.assign(obj.d_items[obj.editedIndex],editedData)     //更新d_items
					}else{editedData.ID=response.data.ID;
						obj.d_items.unshift(editedData) ;	obj.editedIndex=0;	obj.editedItem=Object.assign({},obj.defaultItem); 	}
			//app.ShowAlert('info','数据库操作成功！','成功：'+'\n'+response.data.Message); 
			app.ShowSnack('数据库操作成功！')
			obj.EditDialog=false;
　　　　}else{app.ShowAlert('warning','数据保存失败！',response.data.Message);}
			}).catch((err)=>{app.ShowAlert('warning','更新数据库失败！',err); })
		obj.cardmode=!obj.cardmode;//强制刷新
		},
//	post2DB

//app.Json2DB('/common/data_s.asp?r_tab=cm_meeting&r_fd1=d_title$d_names$vid',editedData);
Json2DB(url,editedData){
	axios.post(url,qs.stringify(editedData)).then(response=>{
		if(response.data.IsSuccess){//alert(JSON.stringify(response.data)) //保存成功
　　　　	}else{app.myAlert('Json2DB保存数据失败！'+response.data.Message)}
	}).catch((err)=>{app.myAlert('Json2DB-Post失败！'+err); })		
},	
postLog(msg1,msg2){axios.post('/common/data_s.asp?r_tab=cm_log&r_fd1=d_title$d_detail',qs.stringify({ID:-1,d_title:msg1,d_detail:msg2})); 	},	

saveFlow(obj){this.ShowSnack('正在提交流程');	if(gv_db==''){return 0}	
	this.post2DB(obj.url_f+'?r_tab='+obj.parm_r.r_tab+'&tips='+obj.cur_yijian,		obj);
	},//saveFlow
	
MapByLatLng(title,lat,lng ){app.OpenIfr(title,'/common/MapByLatLng.asp?lat='+lat+'&lng='+lng+'&title='+title);	},
//根据字段，发送信息给相关人员。
SdkMsg(item){
	if(typeof(item)=='undefined'){
		if(app.browserDD){sendDing('','');}else{this.tmpStr1='';this.tmpStr2='';this.tmpStr3='';this.LoadVueParm(appSN,0,0,'信息推送','vt_msg')}
		return 0 }
	if(typeof(item.d_head)!='undefined'){
		if(app.browserDD){sendDing(item.d_head+item.d_mem,item.d_title);}
		else{this.tmpStr1=item.d_head+item.d_mem;this.tmpStr2=item.d_head_name+item.d_mem_name;this.tmpStr3='【'+item.d_title+'】，请阅知！';
			this.LoadVueParm(appSN,0,0,'信息推送','vt_msg')}
		return 0 }			
	if(typeof(item.d_mem)!='undefined'){
		if(app.browserDD){sendDing(item.d_mem,item.d_title);}
		else{this.tmpStr1=item.d_mem;this.tmpStr2=item.d_mem_name;this.tmpStr3='【'+item.d_title+'】，请阅知！';this.LoadVueParm(appSN,0,0,'信息推送','vt_msg')}
		return 0 	}	
	if(typeof(item.d_xmjl)!='undefined'){	
		if(app.browserDD){sendDing(item.d_xmjl+item.d_khjl+item.d_fajl+item.d_jfjl,item.d_title);}
		else{this.tmpStr1=item.d_xmjl+item.d_khjl+item.d_fajl+item.d_jfjl;
			 this.tmpStr2=item.d_xmjl_name+item.d_khjl_name+item.d_fajl_name+item.d_jfjl_name;
			 this.tmpStr3='【'+item.d_title+'】，请阅知！';  this.LoadVueParm(appSN,0,0,'信息推送','vt_msg')	 }
		return 0		}
	if(typeof(item.d_zbr)!='undefined'){	
		if(app.browserDD){sendDing(item.d_zbr+item.d_xbr,item.d_title);}
		else{this.tmpStr1=item.d_zbr+item.d_xbr;
			 this.tmpStr2=item.d_zbr_name+item.d_xbr_name;	 this.tmpStr3='【'+item.d_title+'】，请阅知！'; this.LoadVueParm(appSN,0,0,'信息推送','vt_msg')			 }
		return 0	}		
	if(app.browserDD){sendDing('','');}else{this.tmpStr1='';this.tmpStr2='';this.tmpStr3='【'+item.d_title+'】，请阅知！';this.LoadVueParm(appSN,0,0,'信息推送','vt_msg')}	
	},
SdkMsg2(item){app.TmpStrByItem(item);	
	if(app.browserDD){sendDing(this.tmpStr1,this.tmpStr3);}else{this.LoadVueParm(appSN,0,0,'信息推送','vt_msg')}
	},
TmpStrByItem(item){
	if(typeof(item)=='undefined'){this.tmpStr1='';this.tmpStr2='';this.tmpStr3='';return 0}
		else if(typeof(item.d_head)!='undefined'){this.tmpStr1=item.d_head+item.d_mem;this.tmpStr2=item.d_head_name+item.d_mem_name;}
		else if(typeof(item.d_mem)!='undefined'){this.tmpStr1=item.d_mem;this.tmpStr2=item.d_mem_name;}
		else if(typeof(item.d_xmjl)!='undefined'){this.tmpStr1=item.d_xmjl+item.d_khjl+item.d_fajl+item.d_jfjl;
												  this.tmpStr2=item.d_xmjl_name+item.d_khjl_name+item.d_fajl_name+item.d_jfjl_name}
		else if(typeof(item.d_zbr)!='undefined'){this.tmpStr1=item.d_zbr+item.d_xbr; this.tmpStr2=item.d_zbr_name+item.d_xbr_name;	 }	
		else{this.tmpStr1='';this.tmpStr2='';}
	if(!item.d_title){this.tmpStr3=''}else{this.tmpStr3=item.d_title}
	},
SdkMsg2Uid(uid,uname,msg){if(app.browserDD){sendDing(uid,msg);
						}else{this.tmpStr1=uid;this.tmpStr2=uname;this.tmpStr3=msg;this.LoadVueParm(appSN,0,0,'信息推送','vt_msg')}},	
//已读
postReadeded(tab,row,msg){var tmp=msg;
	if(!msg){var input=prompt('请输入意见：','已阅知。'); //不带msg参数，则提示输入
		if (input==null){return 0} //按取消
		if (input==''){tmp='已阅知'}else{tmp=input}}
	axios.post('/common/row_readed.asp?TopTab='+tab+'&TopRow='+row,qs.stringify({msg:tmp}));	app.ShowSnack('阅签已提交！')
},	
//log 

//sdk_dd,sdk_wx的函数引入vue.app里面	
openUserProfile(uid){openUserProfile(uid)},
SdkMeeting(Title,CalleeID,dtype,save){SdkMeeting(Title,CalleeID,dtype,save)},

//为字段上传照片,crud_method中addr4fd(fd)调用   
addr4fd(obj,fd,latlng){var url='/common/latlng2addr.asp?latlng='+latlng;	
	axios.post(url).then(response=>{//alert(JSON.stringify(response.data.result.address))
		obj.editedItem[fd]=response.data.result.address	+'，'+response.data.result.formatted_addresses.recommend;   //赋值给字段
		obj.EditDialog=false;obj.EditDialog=true;//强制刷新					
	}).catch((err)=>{app.ShowAlert('warning','地址转换失败：',err); })	
} ,


	} //method的定义结束---------------
})		//vue.app定义结束
}  		//vueInit() 函数里面进行vue.app 定义




//------------------------------------------------------------下面是全局函数
function ShowJson(res){app.myAlert(JSON.stringify(res))}
function LoadVueParm(TopTab,TopRow,d_typ,tabtitle,vueName,filename,parm){app.LoadVueParm(TopTab,TopRow,d_typ,tabtitle,vueName,filename,parm)}


//根据mem_ID，查询显示user位置
function ShowUserPos(mem_ID){ //if(!isDDReady()){return 0} 
    axios.post('/common/data_member_gps.asp?ID='+mem_ID).then(response=>{	//dd_alert(JSON.stringify(response.data));
		app.MapByLatLng(response.data.rows[0].mem_Url+'@'+response.data.rows[0].gpstime,response.data.rows[0].d_lat,response.data.rows[0].d_lng );	   	
    	}).catch((err)=>{alert("从数据库读取GPS信息出错:"+JSON.stringify(err));})  //xios.post	
}
//获取文件后缀
function FileType(myfile){var k1=myfile.lastIndexOf('.'); var k2=myfile.length;  return	myfile.substring(k1,k2);}

 
 
//博罗街景
function boluoStreet(){var url='';
	if(app.browserDD){		 url='/common/pano_search_dd.asp'}
	else if(app.browserQYWX){url='/common/pano_search_qywx.asp'}
	else{					 url='/common/pano_search.asp'}		
	app.OpenIfr('点击地图搜索附近街景','/common/pano_search.asp');
} 
//防止页面后退
history.pushState(null,null,document.URL);
window.addEventListener('popstate',()=>{
	//alert(document.URL);
	history.pushState(null,null,document.URL);
	if(app.alert||app.dateDialog){}		//如信息框已打开，则不响应，不后退
		else if(app.myCall){app.myCall=false;}		//如呼叫diaolog打开，则关闭	
		else if(app.ifrDialog){app.ifrDialog=false;}		//如ifr打开，则关闭ifr
		else if(app.sysWin){app.sysWin=false;}		//如sysWin打开，则关闭sysWin
		else if(app.drawer){app.drawer=false;}		//关闭drawer
		else if(app.cur_obj.FlowDialog){app.cur_obj.FlowDialog=false;}  //关闭流程框
		else if(app.cur_obj.EditDialog){app.cur_obj.EditDialog=false;} //关闭编辑框		
		else if(app.tab>0){app.tab --} 
		//tab页面，转到上页。else{if(app.tab>0&&(app.tabcom[app.tab]!='vt_home')){app.tab --} }	//tab前一页, home页不转移
		else if(app.tabcom.length>1	){app.tab=app.tabcom.length	-1}	//tab循环到最后一页
	}
);	//addEventListener

history.pushState(null,null,document.URL);

//温馨提示的框,第一空格用&emsp;其他直接使用空格，  换行用：&#10;	
Vue.component('tips',{props:['msg1'],template:'<v-alert dense outlined color="warning" border="left" dismissible style="white-space:pre-wrap;">{{msg1}}</v-alert>'});
Vue.component('typemsg',{props:['msg1'],template:'<v-card-text class="pa-0 ma-4"><span class="lstick"></span><span class="title font-weight-regular">{{msg1}}</span></v-card-text>'});

