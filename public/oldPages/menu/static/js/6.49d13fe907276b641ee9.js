webpackJsonp([6],{"326z":function(t,e){},KAV1:function(t,e){},lFOQ:function(t,e,s){"use strict";var a={props:{itemData:{type:Object,required:!0,default:{}}}},i={render:function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("mdc-layout-grid",{staticClass:"timeItem"},[s("mdc-layout-cell",{attrs:{desktop:"2"}},[s("mdc-checkbox",{attrs:{label:t.itemData.name},model:{value:t.itemData.choose,callback:function(e){t.$set(t.itemData,"choose",e)},expression:"itemData.choose"}})],1),t._v(" "),s("mdc-layout-cell",{attrs:{desktop:"3"}},[s("mdc-layout-grid",{staticClass:"timeRange"},[s("mdc-layout-cell",{staticClass:"timeLabel",attrs:{desktop:"5"}},[t._v(t._s(t.itemData.from))]),t._v(" "),s("mdc-layout-cell",{staticClass:"toLabel",attrs:{desktop:"2"}},[t._v(t._s(t.$t("fields.to")))]),t._v(" "),s("mdc-layout-cell",{staticClass:"timeLabel",attrs:{desktop:"5"}},[t._v(t._s(t.itemData.to))])],1)],1),t._v(" "),s("mdc-layout-cell",{staticClass:"wekContent",attrs:{desktop:"7"}},[s("span",{staticClass:"wekLabel",class:{wekActive:!t.itemData.fromDayOfTheWeek||6==t.itemData.toDayOfTheWeek}},[t._v(t._s(t.$t("fields.sun")))]),t._v(" "),s("span",{staticClass:"wekLabel",class:{wekActive:!t.itemData.fromDayOfTheWeek||t.itemData.fromDayOfTheWeek<=0&&t.itemData.toDayOfTheWeek>=0}},[t._v(t._s(t.$t("fields.mon")))]),t._v(" "),s("span",{staticClass:"wekLabel",class:{wekActive:!t.itemData.fromDayOfTheWeek||t.itemData.fromDayOfTheWeek<=1&&t.itemData.toDayOfTheWeek>=1}},[t._v(t._s(t.$t("fields.tue")))]),t._v(" "),s("span",{staticClass:"wekLabel",class:{wekActive:!t.itemData.fromDayOfTheWeek||t.itemData.fromDayOfTheWeek<=2&&t.itemData.toDayOfTheWeek>=2}},[t._v(t._s(t.$t("fields.wed")))]),t._v(" "),s("span",{staticClass:"wekLabel",class:{wekActive:!t.itemData.fromDayOfTheWeek||t.itemData.fromDayOfTheWeek<=3&&t.itemData.toDayOfTheWeek>=3}},[t._v(t._s(t.$t("fields.thu")))]),t._v(" "),s("span",{staticClass:"wekLabel",class:{wekActive:!t.itemData.fromDayOfTheWeek||t.itemData.fromDayOfTheWeek<=4&&t.itemData.toDayOfTheWeek>=4}},[t._v(t._s(t.$t("fields.fri")))]),t._v(" "),s("span",{staticClass:"wekLabel",class:{wekActive:!t.itemData.fromDayOfTheWeek||t.itemData.fromDayOfTheWeek<=5&&t.itemData.toDayOfTheWeek>=5}},[t._v(t._s(t.$t("fields.sat")))])])],1)},staticRenderFns:[]};var o=s("vSla")(a,i,!1,function(t){s("326z")},"data-v-35f40980",null);e.a=o.exports},qY9A:function(t,e,s){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var a=s("3cXf"),i=s.n(a),o=s("lC5x"),n=s.n(o),c=s("rVsN"),r=s.n(c),l=s("J0Oq"),u=s.n(l),p=s("VbKi"),d=s("JahA"),m=s("WVI2"),f=s("2ntA"),h=s("lFOQ"),v=s("P8AZ"),_={components:{ColorPicker:m.a,Chip:f.a,TimeItem:h.a,commonDialog:v.a,Bubble:p.a},data:function(){return{responseMsg:"",choose:!0,menuId:this.$route.params.menuId,menuName:this.$route.query.menuName||"",restaurantName:this.$route.query.rn||"",groupId:this.$route.params.groupId||"",name:"",description:"",restaurantHoursList:[],appInstanceList:[],productLine:this.$route.query?this.$route.query.l:"",showDevice:!1}},mounted:function(){var t,e=(t=u()(n.a.mark(function t(){var e;return n.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,r.a.all([s.$$fetch_group_restaurantHours(),s.$$fetch_group_appInstance({data:{productLine:s.productLine}})]);case 2:(e=t.sent)&&e[0]&&(s.restaurantHoursList=e[0].restaurantHoursList,s.restaurantHoursList.forEach(function(t){return t.choose=!1})),e&&e[1]&&(s.appInstanceList=e[1].appInstanceList,s.appInstanceList&&s.appInstanceList.length>0&&s.appInstanceList.forEach(function(t){return t.choose=!0})),"new"!==s.groupId&&s.getGroupDetail();case 6:case"end":return t.stop()}},t,this)})),function(){return t.apply(this,arguments)}),s=this;e()},computed:{language:function(){return this.$store.state.language}},methods:{getGroupDetail:function(){var t=this;this.$$fetch_group_groupDetail({opts:{afterData:this.groupId,getTpye:"afterUrl"}}).then(function(e){if(e&&e.group){var s=e.group;s.fieldDisplayNameGroups&&s.fieldDisplayNameGroups.length>0&&s.fieldDisplayNameGroups.forEach(function(t){s=d.a.getObjLangField(t.fieldName,t.fieldDisplayNames,s,"en")}),t.name=s.name,t.description=s.description||"",t.restaurantHoursList.forEach(function(t){s.restaurantHourIds&&-1!==s.restaurantHourIds.indexOf(t.id)&&(t.choose=!0)}),t.restaurantHoursList=JSON.parse(i()(t.restaurantHoursList)),t.appInstanceList.forEach(function(t){s.appInstanceIds&&-1!==s.appInstanceIds.indexOf(t.id)?t.choose=!0:t.choose=!1}),t.showDevice=t.appInstanceList&&t.appInstanceList.filter(function(t){return!0===t.choose}).length}})},save:function(){var t=this;if(this.name){var e=[],s=[];this.restaurantHoursList.forEach(function(t){t.choose&&e.push(t.id)}),this.appInstanceList.forEach(function(t){t.choose&&s.push(t.id)}),"new"===this.groupId?this.$$fetch_group_menuGroup({data:{menuId:this.menuId,name:this.name,restaurantHourIds:e,appInstanceIds:s,description:this.description}}).then(function(e){e&&e.group&&(t.groupId=e.group.id,t.$refs.successCategotyDialog.show())},function(e){t.responseMsg=e.error.msg,t.$refs.responseDialog.show()}):this.groupId&&this.$$fetch_group_updateGroup({data:{id:this.groupId,menuId:this.menuId,name:this.name,restaurantHourIds:e,appInstanceIds:s,description:this.description}}).then(function(e){e&&e.group&&t.$refs.successCategotyDialog.show()},function(e){t.responseMsg=e.error.msg,t.$refs.responseDialog.show()})}},chipChange:function(t,e){t.choose=!t.choose,this.appInstanceList.splice(e,1,t)},creatNew:function(){this.$router.push({path:"/group/"+this.menuId+"/new?l="+this.productLine+"&rn="+this.restaurantName+"&mn="+this.menuName}),location.reload()},backToMenu:function(){this.$router.push({path:"/"})}}},D={render:function(){var t=this,e=this,s=e.$createElement,a=e._self._c||s;return a("mdc-layout-app",{staticClass:"groupContent"},[a("mdc-toolbar",{staticClass:"blackheader",attrs:{slot:"toolbar"},slot:"toolbar"},[a("mdc-headline",[a("span",{on:{click:e.backToMenu}},[a("mdc-icon",{attrs:{icon:"keyboard_arrow_left"}})],1),e._v(e._s(e.$t("fields.backToMenu"))+" : "+e._s(e.menuName)+"\r\n    ")])],1),e._v(" "),a("main",{staticClass:"panel"},[a("section",{staticClass:"sectionPanel baseInfo"},[a("mdc-layout-grid",[a("mdc-layout-cell",{attrs:{desktop:"12",tablet:"8",phone:"4"}},[a("mdc-title",[e._v(e._s(e.$t("fields.name")))])],1),e._v(" "),a("mdc-layout-cell",{attrs:{desktop:"3"}},[a("mdc-textfield",{attrs:{label:e.$t("fields.groupName"),required:""},model:{value:e.name,callback:function(t){e.name=t},expression:"name"}})],1),e._v(" "),a("mdc-layout-cell",{attrs:{desktop:"4"}},[a("mdc-textfield",{attrs:{label:e.$t("fields.description")},model:{value:e.description,callback:function(t){e.description=t},expression:"description"}})],1)],1)],1),e._v(" "),a("section",{staticClass:"sectionPanel hour"},[a("mdc-layout-grid",[a("mdc-layout-cell",{attrs:{desktop:"12",tablet:"8",phone:"4"}},[a("mdc-title",[e._v("\r\n            "+e._s(e.$t("fields.menuGroupHours"))+"\r\n            "),a("bubble",{attrs:{cssText:"width:500px;left:100px;"}},[a("div",[e._v(e._s(e.$t("tips.groupHourSetting.tip")))]),e._v(" "),a("p",[e._v(e._s(e.$t("tips.groupHourSetting.ps")))])])],1)],1)],1),e._v(" "),a("div",e._l(e.restaurantHoursList,function(t){return a("time-item",{key:t.id,attrs:{itemData:t}})}))],1),e._v(" "),a("section",{staticClass:"sectionPanel device"},[a("mdc-layout-grid",[a("mdc-layout-cell",{attrs:{desktop:"11",tablet:"7",phone:"3"}},[a("mdc-title",[e._v("\r\n            "+e._s(e.$t("fields.deviceSelection"))+"\r\n            "),a("bubble",{attrs:{cssText:"width:500px;left:100px;"}},[a("div",[e._v(e._s(e.$t("tips.DeviceSelection.tip")))])])],1)],1),e._v(" "),a("mdc-layout-cell",{attrs:{desktop:"1"}},[a("i",{staticClass:"material-icons",staticStyle:{"font-size":"30px",cursor:"pointer","-user-select":"none"},on:{click:function(t){e.showDevice=!e.showDevice}}},[e._v(e._s(e.showDevice?"expand_less":"expand_more"))])])],1),e._v(" "),a("mdc-layout-grid",{directives:[{name:"show",rawName:"v-show",value:e.showDevice,expression:"showDevice"}]},e._l(e.appInstanceList,function(t,s){return a("mdc-layout-cell",{key:t.id,attrs:{desktop:"2"}},[a("chip",{attrs:{name:t.displayName,isChoose:t.choose},on:{change:function(a){e.chipChange(t,s)}}})],1)}))],1)]),e._v(" "),a("footer",{staticClass:"whitefooter"},[a("div",{staticClass:"mdl-mini-footer__right-section"},[a("mdc-button",{on:{click:function(){t.$router.go(-1)}}},[e._v(e._s(e.$t("btns.cancel")))]),e._v(" "),a("mdc-button",{staticClass:"btnColor",on:{click:e.save}},[e._v(e._s(e.$t("btns.save")))])],1)]),e._v(" "),a("section",{staticClass:"successCategoty"},[a("commonDialog",{ref:"successCategotyDialog",attrs:{title:e.$t("fields.successSaved"),accept:e.$t("fields.creatAnother"),receive:e.$t("fields.backToList"),cancel:e.$t("btns.ok")},on:{accept:function(){e.creatNew()},receive:function(){e.backToMenu()}}})],1),e._v(" "),a("section",[a("mdc-dialog",{ref:"responseDialog",staticClass:"responseDialog",attrs:{title:"",accept:"",cancel:e.$t("btns.ok"),"accept-disabled":""}},[a("p",{staticClass:"msg"},[e._v(e._s(e.responseMsg))])])],1)],1)},staticRenderFns:[]};var g=s("vSla")(_,D,!1,function(t){s("KAV1")},"data-v-6c028e90",null);e.default=g.exports}});