//var  originalPoints=[];
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/array',
        'dojo/dom',
        'dojo/on',
        'dojo/topic',
        'dijit/form/Form',
        'dojox/layout/TableContainer',
        'dijit/form/Button',
        'dijit/form/TextBox',
        'esri/tasks/query',
        'esri/tasks/QueryTask',
        'esri/tasks/FeatureSet',
        'esri/tasks/Geoprocessor',
        'esri/geometry/Point',
        'esri/graphic',
        'esri/SpatialReference',
        'esri/geometry/Geometry',
        'esri/layers/FeatureLayer',
        'jimu/BaseWidget'],
    function (declare, lang, array, dom, on,topic,
              Form, TableContainer, Button, TextBox,
              Query, QueryTask, FeatureSet, Geoprocessor, Point, Graphic,SpatialReference,Geometry,FeatureLayer,
              BaseWidget) {
        //To create a widget, you need to derive from BaseWidget.
        return declare([BaseWidget], {

            // Custom widget code goes here

            baseClass: 'gas-monitor',
            // this property is set by the framework when widget is loaded.
            // name: 'GasMonitor',
            // add additional properties here
            gasTable: null,
            gp: null,
            originalPoints: null,
            nowPoints: [],
            newPoint: null,
            windowInterval: null,
            i: null,
            pointValue: null,
            obj:null,


            //methods to communication with app container:
            postCreate: function () {
                this.inherited(arguments);
                console.log('GasMonitor::postCreate');
                this.iniWidget();
                this.initData();
                this.doGP();
            },

            startup: function () {
                this.inherited(arguments);
                console.log('GasMonitor::startup');
            },

            onOpen: function () {
                console.log('GasMonitor::onOpen');
            },

            onClose: function () {
                console.log('GasMonitor::onClose');
                //退出的时候将底图之上的的动态要素清空
                //clearInterval();
                //map.clear();
            },

            onMinimize: function () {
                console.log('GasMonitor::onMinimize');
            },

            onMaximize: function () {
                console.log('GasMonitor::onMaximize');
            },

            onSignIn: function (credential) {
                console.log('GasMonitor::onSignIn', credential);
            },

            onSignOut: function () {
                console.log('GasMonitor::onSignOut');
            },

            onPositionChange: function () {
                console.log('GasMonitor::onPositionChange');
            },

            resize: function () {
                console.log('GasMonitor::resize');
            },
            iniWidget: function () {
                this.gasTable = TableContainer({
                    cols: 2,//共两列
                    labelWidth: '100px'
                }, this.gasTableNode);
                this.gasTable.addChild(
                    new TextBox({
                        label: this.config.nameofMonitor,
                        value: this.config.nameofMonitor,
                        //name: feature.attributes.value,
                        trim: true,
                        disabled: true,
                        propercase: true,
                        colspan: 0,//占据两列
                        style: {width: '150px', margin: '5px 0 0 0;'}
                    })
                );
                this.gasTable.addChild(
                    new TextBox({
                        label: this.config.currentValue,
                        value: this.config.currentValue,
                        //name: feature.attributes.value,
                        trim: true,
                        disabled: true,
                        propercase: true,
                        colspan: 0,//占据两列
                        style: {width: '150px', margin: '5px 0 0 0;'}
                    })
                );
            },
            initData: function () {
                this.queryFeatureSet(this.config.queryConditions, this.returnFeatureSet);

            },
            /*
             * @con=this.config.queryConditions
             * @fun=function(){}*/
            queryFeatureSet: function (con, fun) {
                var query = new Query();
                query.outFields = ["*"];
                query.outSpatialReference = this.map.spatialReference;
                query.returnGeometry = con.returnGeometry;
                query.where = con.queryWhere;
                var queryTask = new QueryTask(con.queryTaskUrl);
                queryTask.execute(query,
                    lang.hitch(this, fun),
                    lang.hitch(this, function (error) {
                        alert("出错了  " + error);
                    }));

            },
            returnFeatureSet: function (featureSet) {
                var that = this;
                array.forEach(featureSet.features, function (feature) {
                    //监测站点
                    that.gasTable.addChild(
                        new TextBox({
                            label: feature.attributes.NAME,
                            value: feature.attributes.NAME,
                            name: feature.attributes.NAME,
                            trim: true,
                            disabled: true,
                            propercase: true,
                            colspan: 0,//占据两列
                            style: {width: '150px', margin: '5px 0 0 0;'}
                        })
                    );
                    //站点浓度
                    that.gasTable.addChild(
                        new TextBox({
                            label: feature.attributes.value,
                            value: feature.attributes.value,
                            //name: feature.attributes.value,
                            trim: true,
                            disabled: true,
                            propercase: true,
                            colspan: 0,//占据两列
                            style: {width: '150px', margin: '5px 0 0 0;'}
                        })
                    );
                });
            },
            doGP: function () {
                //根据随机value来生成gp动态效果
                this.queryFeatureSet(this.config.gp, this.processResult);
                this.asyncGP();

                /*var params={"point":featureset};
                 this.gp.execute(params);*/

            },
            processResult: function (featureSet) {
                console.log(featureSet);
                //处理point
                this.originalPoints = [];
                var that=this;
                array.forEach(featureSet.features, function (feature) {
                    lang.hitch(that.originalPoints.push(feature));
                });
                console.log("originalPoints的值："+that.originalPoints);
            },
            asyncGP: function () {
                //gp执行10次
                this.i = 0;
                var that = this;
                topic.subscribe('to interval',function(){
                    clearInterval(that.windowInterval);
                });
                this.windowInterval = setInterval(function (i) {
                    that.i++;
                    console.log(that.i);
                    that.intervalDO();
                    if (that.i > 10) {
                        topic.publish("to interval");
                    }
                }, 3000);

            },
            intervalDO: function () {
                var that = this;

                this.nowPoints=[];
                array.forEach(this.originalPoints, function (point) {
                    var gra = new Graphic();
                    gra.setAttributes({
                        "OBJECTID":point.attributes.OBJECTID,
                        "ID":point.attributes.ID,
                        "value":point.attributes.value += 5 * (Math.random().toFixed(2)),
                        "NAME":point.attributes.NAME
                    });
                    //gra.attributes["spatialReference"] = point.geometry.spatialReference.wkid;
                    var geometry=new Geometry();
                    geometry.spatialReference= new SpatialReference(2413);
                    geometry.type = "point";
                    geometry.x = point.geometry.x;
                    geometry.y = point.geometry.y;
                    gra.setGeometry(geometry);
                    that.nowPoints.push(gra);
                });
                var featureSet = new FeatureSet(this.nowPoints);
                /*featureSet.features = ;*/
                featureSet.geometryType='point';
                featureSet.spatialReference =new SpatialReference(2413);
                /*that.obj=null;
                that.obj=new Object();
                that.obj['point']=featureSet;*/
                var layerDefinition={
                    "geometryType": "esriGeometryPoint",
                    "fields": [
                        {
                            "name": "OBJECTID",
                            "type": "esriFieldTypeOID",
                            "alias": "OBJECTID"
                        },
                        {
                            "name": "ID",
                            "type": "esriFieldTypeString",
                            "alias": "标识",
                            "length": 255
                        },
                        {
                            "name": "value",
                            "type": "esriFieldTypeDouble",
                            "alias": "瓦斯浓度值"
                        },
                        {
                            "name": "NAME",
                            "type": "esriFieldTypeString",
                            "alias": "监测站名称",
                            "length": 50
                        }
                    ]
                };
                var featureCollection={
                    layerDefinition: layerDefinition,
                    featureSet: featureSet
                };
                var featureLayer=new FeatureLayer("http://localhost:6080/arcgis/rest/services/ESRI/HymnData201306051812/MapServer/27",
                    {
                        mode: FeatureLayer.MODE_ONDEMAND,
                        outFields:"[*]"
                    }
                );
                this.gp = new Geoprocessor(this.config.gp.gpUrl);
                var params = {"point": featureLayer};
                console.log(params,featureLayer);
                this.gp.execute(params,
                    lang.hitch(this,function displayResult(results){
                    console.log("执行成功结果："+results);
                }),
                    lang.hitch(this,function (error) {
                        alert("GP执行出错！！" + error);
                    }))
            }/*,
             //对得到的结果加以显示 然后在隐藏 刷新，
             displayResult: function (results) {

             }*/



//methods to communication between widgets:

        });

    });
