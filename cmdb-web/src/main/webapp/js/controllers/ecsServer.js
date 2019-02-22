/**
 * Created by liangjian on 2017/8/29.
 */
'use strict';
app.controller('ecsServerCtrl', function ($scope, $state, $uibModal, $sce, httpService, toaster, staticModel) {
    $scope.envType = staticModel.envType;
    //登录类型
    $scope.logType = staticModel.logType;

    //服务器类型
    $scope.serverType = staticModel.serverType;

    $scope.authPoint = $state.current.data.authPoint;

    //server表关联
    $scope.ecsStatus = staticModel.serverStatus;

    //ECS服务器计费类型
    $scope.ecsServerInternetChargeType = staticModel.ecsServerInternetChargeType;

    //ECS服务器是否io优化实例
    $scope.ecsServerIoOptimized = staticModel.ecsServerIoOptimized;

    //导航条按钮控制
    $scope.butSearchDisabled = false;
    $scope.butRepeatDisabled = false;
    $scope.butSyncDisabled = false;
    $scope.butSyncSpinDisabled = false;
    //$scope.butCheckSpinDisabled = false;


    var butSyncRunning = function (isRun) {
        $scope.butSyncDisabled = isRun;
        $scope.butSearchDisabled = isRun;
        $scope.butSyncSpinDisabled = isRun;
    }


    $scope.ecsStatistics = function () {
        var url = "/server/ecsStatistics";
        httpService.doGet(url).then(function (data) {
            if (data.success) {
                var body = data.body;
                $scope.ecsData = body;
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }

    $scope.ecsStatistics();

    $scope.ecsSync = function (type) {
        butSyncRunning(true);

        var url = "/server/ecsSync?type=" + type;
        httpService.doGet(url).then(function (data) {
            if (data.success) {
                toaster.pop("success", "列表已更新！");
                butSyncRunning(false);
            } else {
                toaster.pop("warning", data.msg);
                butSyncRunning(false);
            }
        }, function (err) {
            toaster.pop("error", err);
            butSyncRunning(false);
        });

    }

    $scope.allocateIp = function (item) {
        var url = "/server/ecsAllocateIp?instanceId=" + item.instanceId;
        httpService.doGet(url).then(function (data) {
            if (data.success) {
                toaster.pop("success", "列表已更新！");
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }


    // $scope.ecsCheck = function () {
    //     butCheckRunning(true);
    //     var url = "/server/ecsCheck";
    //     httpService.doGet(url).then(function (data) {
    //         if (data.success) {
    //             toaster.pop("success", "校验完毕！");
    //             butCheckRunning(false);
    //         } else {
    //             toaster.pop("warning", data.msg);
    //             butCheckRunning(false);
    //         }
    //     }, function (err) {
    //         toaster.pop("error", err);
    //         butCheckRunning(false);
    //     });
    // }

    $scope.ecsDump = function () {
        var url = "/server/ecsDump";
        httpService.doGet(url).then(function (data) {
            if (data.success) {
                toaster.pop("success", data.msg);
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }


    /**
     * 标记ecs状态为删除
     * @param serverId
     */
    $scope.setDelEcs = function (item) {
        var url = "/server/setStatus?insideIp=" + item.insideIp;
        httpService.doGet(url).then(function (data) {
            if (data.success) {
                toaster.pop("success", "删除成功！");
                $scope.doQuery();
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("warning", err);
        });
    }

    /**
     * 标记ecs状态为删除
     * @param serverId
     */
    $scope.delEcs = function (item) {
        var url = "/server/delEcs?insideIp=" + item.insideIp;
        httpService.doGet(url).then(function (data) {
            if (data.success) {
                toaster.pop("success", "删除成功！");
                $scope.doQuery();
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("warning", err);
        });
    }


    $scope.queryName = "";
    $scope.queryIp = "";
    //关联
    $scope.nowStatus = -1;
    $scope.nowPublicGroup = [];
    $scope.nowInternalGroup = [];

    $scope.reSet = function () {
        $scope.queryName = "";
        $scope.queryIp = "";
        //关联
        $scope.nowAssociate = 1;
    }

    /////////////////////////////////////////////////

    $scope.pageData = [];
    $scope.totalItems = 0;
    $scope.currentPage = 0;
    $scope.pageLength = 20;

    $scope.pageChanged = function () {
        $scope.doQuery();
    };

    /////////////////////////////////////////////////

    $scope.doQuery = function () {
        var url = "/server/ecsPage?"
            + "&serverName=" + $scope.queryName
            + "&queryIp=" + $scope.queryIp
            + "&status=" + ($scope.nowStatus == null ? -1 : $scope.nowStatus)
            + "&page=" + ($scope.currentPage <= 0 ? 0 : $scope.currentPage - 1)
            + "&length=" + $scope.pageLength;

        httpService.doGet(url).then(function (data) {
            if (data.success) {
                var body = data.body;
                $scope.totalItems = body.size;
                $scope.pageData = body.data;
                $scope.refreshInfo();
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }

    $scope.doQuery();

    // 生成ecs规格详情
    $scope.refreshInfo = function () {
        for (var i = 0; i < $scope.pageData.length; i++) {
            var item = $scope.pageData[i];
            // "<b style='color: red'>I can</b> have <div class='label label-success'>HTML "
            var ioOptimized = "";
            if (item.ioOptimized) {
                ioOptimized = "<b style='color: green'>(I/O优化)</b><br/>";
            }

            var network = "";
            if (item.networkTypePropertyDO != null && item.networkTypePropertyDO.propertyValue != null) {
                network = "网络类型:  " + item.networkTypePropertyDO.propertyValue + "<br/>";
                if (item.networkTypePropertyDO.propertyValue == 'vpc') {
                    network += ">VPC:  " + item.vpcPropertyDO.propertyValue + "<br/>";
                    network += ">VSW:  " + item.vswitchPropertyDO.propertyValue + "<br/>";
                }
            }
            if (item.securityGroupPropertyDO != null) {
                network += "安全组:  " + item.securityGroupPropertyDO.propertyValue + "<br/>";
            }
            if (item.imagePropertyDO != null) {
                network += "镜像:  " + item.imagePropertyDO.propertyValue + "<br/>";
            }

            var memory = item.memory / 1024;
            if (memory >= 8) {
                memory = "<b style='color: red'>" + memory + "GB</b><br/>";
            } else {
                memory = "<b style='color: green'>" + memory + "GB</b><br/>";
            }

            var disk = "";
            disk = "系统盘:" + item.systemDiskSize + "GB";
            switch (item.systemDiskCategory) {
                case 'cloud':
                    disk += "(普通云盘)<br/>";
                    break;
                case 'cloud_efficiency':
                    disk += "<b style='color: green'>(高效云盘)</b><br/>";
                    2
                    break;
                case 'cloud_ssd':
                    disk += "<b style='color: #d99a53'>(SSD云盘)</b><br/>";
                    break;
                case 'ephemeral_ssd':
                    disk += "<b style='color: #d9534f'>(本地SSD盘)</b><br/>";
                    break;
                default:
            }

            disk += "数据盘:" + item.dataDiskSize + "GB";
            switch (item.dataDiskCategory) {
                case 'cloud':
                    disk += "(普通云盘)<br/>";
                    break;
                case 'cloud_efficiency':
                    disk += "<b style='color: green'>(高效云盘)</b><br/>";
                    2
                    break;
                case 'cloud_ssd':
                    disk += "<b style='color: #d99a53'>(SSD云盘)</b><br/>";
                    break;
                case 'ephemeral_ssd':
                    disk += "<b style='color: #d9534f'>(本地SSD盘)</b><br/>";
                    break;
                default:
            }

            item.info = $sce.trustAsHtml(
                "CPU:  " + item.cpu + "核<br/>"
                + "内存:   " + memory
                + "带宽:    " + item.internetMaxBandwidthOut + "Mbps<br/>"
                + ioOptimized
                + network
                + disk
            );
        }
    }

    ///////////////////////////////////////////////////////////

    $scope.addServer = function (item) {

        //$scope.queryInternalIPGroup();

        //$scope.queryPublicIPGroup();

        var serverItem = {
            id: 0,
            serverGroupDO: "",
            serverName: item.serverName,
            serverType: 2,
            loginType: 0,
            loginUser: "root",
            envType: 4,
            area: item.area,
            publicIP: "",
            insideIP: "",
            serialNumber: "",
            ciGroup: "",
            content: ""
        }

        saveItem(serverItem, item);
    }

    var saveItem = function (serverItem, item) {

        serverItem.publicIP = {
            ipNetworkDO: $scope.nowPublicGroup.selected,
            ip: item.publicIp
        }

        serverItem.insideIP = {
            ipNetworkDO: $scope.nowInternalGroup.selected,
            ip: item.insideIp
        }

        var modalInstance = $uibModal.open({
            templateUrl: 'serverInfo',
            controller: 'ecsServerInstanceCtrl',
            size: 'lg',
            resolve: {
                httpService: function () {
                    return httpService;
                },
                envType: function () {
                    return $scope.envType;
                },
                logType: function () {
                    return $scope.logType;
                },
                serverType: function () {
                    return $scope.serverType;
                },
                serverItem: function () {
                    return serverItem;
                }
            }
        });

        modalInstance.result.then(function () {
            $scope.doQuery();
        }, function () {
            $scope.doQuery();
        });
    }

    //////////////////////////////
    $scope.publicGroupList = [];

    /**
     * 查询公网网段
     * @param ipNetwork
     */
    $scope.queryPublicIPGroup = function (ipNetwork) {
        queryIPGroup(ipNetwork, 0);
    }

    $scope.internalGroupList = [];

    /**
     * 查询内网网段
     * @param ipNetwork
     */
    $scope.queryInternalIPGroup = function (ipNetwork) {
        queryIPGroup(ipNetwork, 1);
    }

    var queryIPGroup = function (ipNetwork, ipType) {
        var url = "/ipgroup/query?" + "page=" + 0 + "&length=" + 10;

        var queryBody = {
            ipNetwork: ipNetwork,
            serverGroupId: 0,
            ipType: ipType
        }
        httpService.doPostWithJSON(url, queryBody).then(function (data) {
            if (data.success) {
                var body = data.body;
                if (ipType == 0) {   //公网
                    $scope.publicGroupList = body.data;
                    $scope.nowPublicGroup = {
                        selected: $scope.publicGroupList[0]
                    };
                } else if (ipType == 1) {   //内网
                    $scope.internalGroupList = body.data;
                    $scope.nowInternalGroup = {
                        selected: $scope.internalGroupList[0]
                    };
                }
            } else {
                $scope.alert.type = 'warning';
                $scope.alert.msg = data.msg;
            }
        }, function (err) {
            $scope.alert.type = 'danger';
            $scope.alert.msg = err;
        });
    }

});

/**
 * 续费
 */
app.controller('ecsServerRenewCtrl', function ($scope, $state, $uibModal, $sce, httpService, toaster, staticModel) {
    $scope.envType = staticModel.envType;
    //登录类型
    $scope.logType = staticModel.logType;

    //服务器类型
    $scope.serverType = staticModel.serverType;

    $scope.authPoint = $state.current.data.authPoint;

    // 全选服务器
    $scope.choose = false;

    //server表关联
    $scope.ecsStatus = staticModel.serverStatus;

    //ECS服务器计费类型
    $scope.ecsServerInternetChargeType = staticModel.ecsServerInternetChargeType;

    //ECS服务器是否io优化实例
    $scope.ecsServerIoOptimized = staticModel.ecsServerIoOptimized;

    //导航条按钮控制
    $scope.butSearchDisabled = false;
    $scope.butRepeatDisabled = false;
    $scope.butSyncDisabled = false;
    $scope.butSyncSpinDisabled = false;
    //$scope.butCheckSpinDisabled = false;


    var butSyncRunning = function (isRun) {
        $scope.butSyncDisabled = isRun;
        $scope.butSearchDisabled = isRun;
        $scope.butSyncSpinDisabled = isRun;
    }

    $scope.queryName = "";
    $scope.queryIp = "";
    $scope.queryDay = 30;
    //关联
    $scope.nowStatus = -1;
    $scope.nowPublicGroup = [];
    $scope.nowInternalGroup = [];

    $scope.reSet = function () {
        $scope.queryName = "";
        $scope.queryIp = "";
        //关联
        $scope.nowAssociate = 1;
    }
    /////////////////////////////////////////////////
    $scope.chooseAll = function () {
        // $scope.chooseAll = !$scope.chooseAll;
        for (var i = 0; i < $scope.pageData.length; i++) {
            $scope.pageData[i].choose = $scope.choose;
        }
    };

    $scope.renewEcs = function () {

        var ecsInstances = [];
        for (var i = 0; i < $scope.pageData.length; i++) {
            if ($scope.pageData[i].choose != null && $scope.pageData[i].choose)
                ecsInstances.push($scope.pageData[i])
        }
        if (ecsInstances.length == 0) {
            toaster.pop("warning", "未选择续费的ECS服务器实例");
            return;
        }

        var modalInstance = $uibModal.open({
            templateUrl: 'renewEcsInstance',
            controller: 'renewEcsInstanceCtrl',
            size: 'lg',
            resolve: {
                httpService: function () {
                    return httpService;
                },
                ecsInstances: function () {
                    return ecsInstances;
                }
            }
        });

        modalInstance.result.then(function () {
            $scope.doQuery();
        }, function () {
            $scope.doQuery();
        });
    }
    /////////////////////////////////////////////////

    $scope.pageData = [];
    $scope.totalItems = 0;
    $scope.currentPage = 0;
    $scope.pageLength = 20;

    $scope.pageChanged = function () {
        $scope.choose = false;
        $scope.doQuery();
    };

    /////////////////////////////////////////////////

    $scope.doQuery = function () {
        var day = 30;
        if( $scope.queryDay != null && $scope.queryDay != '' ){
            day = $scope.queryDay;
        }

        var url = "/server/ecsRenewPage?"
            + "&serverName=" + $scope.queryName
            + "&queryIp=" + $scope.queryIp
            + "&status=" + ($scope.nowStatus == null ? -1 : $scope.nowStatus)
            + "&day=" + day
            + "&page=" + ($scope.currentPage <= 0 ? 0 : $scope.currentPage - 1)
            + "&length=" + $scope.pageLength;

        httpService.doGet(url).then(function (data) {
            if (data.success) {
                var body = data.body;
                $scope.totalItems = body.size;
                $scope.pageData = body.data;
                $scope.refreshInfo();
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }

    $scope.doQuery();

    // 生成ecs规格详情
    $scope.refreshInfo = function () {
        for (var i = 0; i < $scope.pageData.length; i++) {
            var item = $scope.pageData[i];
            // "<b style='color: red'>I can</b> have <div class='label label-success'>HTML "
            var ioOptimized = "";
            if (item.ioOptimized) {
                ioOptimized = "<b style='color: green'>(I/O优化)</b><br/>";
            }

            var network = "";
            if (item.networkTypePropertyDO != null && item.networkTypePropertyDO.propertyValue != null) {
                network = "网络类型:  " + item.networkTypePropertyDO.propertyValue + "<br/>";
                if (item.networkTypePropertyDO.propertyValue == 'vpc') {
                    network += ">VPC:  " + item.vpcPropertyDO.propertyValue + "<br/>";
                    network += ">VSW:  " + item.vswitchPropertyDO.propertyValue + "<br/>";
                }
            }
            if (item.securityGroupPropertyDO != null) {
                network += "安全组:  " + item.securityGroupPropertyDO.propertyValue + "<br/>";
            }
            if (item.imagePropertyDO != null) {
                network += "镜像:  " + item.imagePropertyDO.propertyValue + "<br/>";
            }

            var memory = item.memory / 1024;
            if (memory >= 8) {
                memory = "<b style='color: red'>" + memory + "GB</b><br/>";
            } else {
                memory = "<b style='color: green'>" + memory + "GB</b><br/>";
            }

            var disk = "";
            disk = "系统盘:" + item.systemDiskSize + "GB";
            switch (item.systemDiskCategory) {
                case 'cloud':
                    disk += "(普通云盘)<br/>";
                    break;
                case 'cloud_efficiency':
                    disk += "<b style='color: green'>(高效云盘)</b><br/>";
                    2
                    break;
                case 'cloud_ssd':
                    disk += "<b style='color: #d99a53'>(SSD云盘)</b><br/>";
                    break;
                case 'ephemeral_ssd':
                    disk += "<b style='color: #d9534f'>(本地SSD盘)</b><br/>";
                    break;
                default:
            }

            disk += "数据盘:" + item.dataDiskSize + "GB";
            switch (item.dataDiskCategory) {
                case 'cloud':
                    disk += "(普通云盘)<br/>";
                    break;
                case 'cloud_efficiency':
                    disk += "<b style='color: green'>(高效云盘)</b><br/>";
                    2
                    break;
                case 'cloud_ssd':
                    disk += "<b style='color: #d99a53'>(SSD云盘)</b><br/>";
                    break;
                case 'ephemeral_ssd':
                    disk += "<b style='color: #d9534f'>(本地SSD盘)</b><br/>";
                    break;
                default:
            }

            item.info = $sce.trustAsHtml(
                "CPU:  " + item.cpu + "核<br/>"
                + "内存:   " + memory
                + "带宽:    " + item.internetMaxBandwidthOut + "Mbps<br/>"
                + ioOptimized
                + network
                + disk
            );
        }
    }

    ///////////////////////////////////////////////////////////

    $scope.addServer = function (item) {

        //$scope.queryInternalIPGroup();

        //$scope.queryPublicIPGroup();

        var serverItem = {
            id: 0,
            serverGroupDO: "",
            serverName: item.serverName,
            serverType: 2,
            loginType: 0,
            loginUser: "root",
            envType: 4,
            area: item.area,
            publicIP: "",
            insideIP: "",
            serialNumber: "",
            ciGroup: "",
            content: ""
        }

        saveItem(serverItem, item);
    }

    var saveItem = function (serverItem, item) {

        serverItem.publicIP = {
            ipNetworkDO: $scope.nowPublicGroup.selected,
            ip: item.publicIp
        }

        serverItem.insideIP = {
            ipNetworkDO: $scope.nowInternalGroup.selected,
            ip: item.insideIp
        }

        var modalInstance = $uibModal.open({
            templateUrl: 'serverInfo',
            controller: 'ecsServerInstanceCtrl',
            size: 'lg',
            resolve: {
                httpService: function () {
                    return httpService;
                },
                envType: function () {
                    return $scope.envType;
                },
                logType: function () {
                    return $scope.logType;
                },
                serverType: function () {
                    return $scope.serverType;
                },
                serverItem: function () {
                    return serverItem;
                }
            }
        });

        modalInstance.result.then(function () {
            $scope.doQuery();
        }, function () {
            $scope.doQuery();
        });
    }

    //////////////////////////////
    $scope.publicGroupList = [];

    /**
     * 查询公网网段
     * @param ipNetwork
     */
    $scope.queryPublicIPGroup = function (ipNetwork) {
        queryIPGroup(ipNetwork, 0);
    }

    $scope.internalGroupList = [];

    /**
     * 查询内网网段
     * @param ipNetwork
     */
    $scope.queryInternalIPGroup = function (ipNetwork) {
        queryIPGroup(ipNetwork, 1);
    }

    var queryIPGroup = function (ipNetwork, ipType) {
        var url = "/ipgroup/query?" + "page=" + 0 + "&length=" + 10;

        var queryBody = {
            ipNetwork: ipNetwork,
            serverGroupId: 0,
            ipType: ipType
        }
        httpService.doPostWithJSON(url, queryBody).then(function (data) {
            if (data.success) {
                var body = data.body;
                if (ipType == 0) {   //公网
                    $scope.publicGroupList = body.data;
                    $scope.nowPublicGroup = {
                        selected: $scope.publicGroupList[0]
                    };
                } else if (ipType == 1) {   //内网
                    $scope.internalGroupList = body.data;
                    $scope.nowInternalGroup = {
                        selected: $scope.internalGroupList[0]
                    };
                }
            } else {
                $scope.alert.type = 'warning';
                $scope.alert.msg = data.msg;
            }
        }, function (err) {
            $scope.alert.type = 'danger';
            $scope.alert.msg = err;
        });
    }

});

app.controller('ecsServerInstanceCtrl', function ($scope, $uibModalInstance, httpService, envType, logType, serverType, serverItem) {

    $scope.envType = envType;
    $scope.logType = logType;
    $scope.serverType = serverType;

    $scope.serverItem = serverItem;

    $scope.alert = {
        type: "",
        msg: ""
    };

    $scope.closeAlert = function () {
        $scope.alert = {
            type: "",
            msg: ""
        };
    }

    $scope.insideip = "";
    $scope.publicip = "";

    /**
     * 初始化环境
     */
    var initEnv = function () {
        if ($scope.serverItem.serverGroupDO == null) {
            $scope.nowServerGroup = {};
        } else {
            $scope.nowServerGroup = {
                selected: $scope.serverItem.serverGroupDO
            };
        }

        if ($scope.serverItem.publicIP == null) {
            $scope.nowPublicGroup = {};
        } else {
            $scope.nowPublicGroup = {
                selected: $scope.serverItem.publicIP.ipNetworkDO
            };
        }

        if ($scope.serverItem.insideIP == null) {
            $scope.nowInternalGroup = {};
        } else {
            $scope.nowInternalGroup = {
                selected: $scope.serverItem.insideIP.ipNetworkDO
            };
        }

        $scope.insideip = $scope.serverItem.insideIP != null ? $scope.serverItem.insideIP.ip : "";
        $scope.publicip = $scope.serverItem.publicIP != null ? $scope.serverItem.publicIP.ip : "";
    }

    initEnv();

    /**
     * 重置
     */
    $scope.resetServerItem = function () {
        $scope.serverItem = {
            id: 0,
            serverGroupDO: null,
            serverName: "",
            serverType: -1,
            loginType: -1,
            loginUser: "",
            envType: -1,
            area: "",
            publicIP: null,
            insideIP: null,
            serialNumber: "",
            ciGroup: "",
            content: ""
        }

        initEnv();
    }

    /**
     * 保存server item信息
     */
    $scope.saveServerItem = function (insideIP, publicIP) {
        var url = "/server/save";

        if ($scope.nowServerGroup.selected == null) {
            $scope.alert.type = 'warning';
            $scope.alert.msg = "必须指定服务器组";
            return;
        } else {
            $scope.serverItem.serverGroupDO = $scope.nowServerGroup.selected;
        }

        if ($scope.serverItem.envType == -1) {
            $scope.alert.type = 'warning';
            $scope.alert.msg = "必须指定服务器环境";
            return;
        }

        if ($scope.serverItem.loginType == -1) {
            $scope.alert.type = 'warning';
            $scope.alert.msg = "必须指定服务器登录类型";
            return;
        }

        if ($scope.nowPublicGroup.selected != null) {
            $scope.serverItem.publicIP = {
                ipNetworkDO: $scope.nowPublicGroup.selected,
                ip: publicIP
            };
        }
        if ($scope.nowInternalGroup.selected != null) {
            $scope.serverItem.insideIP = {
                ipNetworkDO: $scope.nowInternalGroup.selected,
                ip: insideIP
            };
        }

        httpService.doPostWithJSON(url, $scope.serverItem).then(function (data) {
            var serverName = $scope.serverItem.serverName + "-" + $scope.serverItem.serialNumber + "(" + $scope.serverItem.insideIP.ip + ")";
            if (data.success) {
                $scope.alert.type = 'success';
                $scope.alert.msg = "服务器：" + serverName + "保存成功!";
            } else {
                $scope.alert.type = 'warning';
                $scope.alert.msg = data.msg;
            }
        }, function (err) {
            $scope.alert.type = 'danger';
            $scope.alert.msg = err;
        });
    }

    //////////////////////////////////////////////////////////

    $scope.serverGroupList = [];

    $scope.queryServerGroup = function (queryParam) {
        var url = "/servergroup/query/page?page=0&length=10&name=" + queryParam + "&useType=0";

        httpService.doGet(url).then(function (data) {
            if (data.success) {
                var body = data.body;
                $scope.serverGroupList = body.data;
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }

    //////////////////////////////////////////////////////////

    $scope.publicGroupList = [];

    /**
     * 查询公网网段
     * @param ipNetwork
     */
    $scope.queryPublicIPGroup = function (ipNetwork) {
        queryIPGroup(ipNetwork, 0);
    }

    $scope.internalGroupList = [];

    /**
     * 查询内网网段
     * @param ipNetwork
     */
    $scope.queryInternalIPGroup = function (ipNetwork) {
        queryIPGroup(ipNetwork, 1);
    }

    var queryIPGroup = function (ipNetwork, ipType) {
        var url = "/ipgroup/query?" + "page=" + 0 + "&length=" + 10;

        var queryBody = {
            ipNetwork: ipNetwork,
            serverGroupId: 0,
            ipType: ipType
        }
        httpService.doPostWithJSON(url, queryBody).then(function (data) {
            if (data.success) {
                var body = data.body;
                if (ipType == 0) {   //公网
                    $scope.publicGroupList = body.data;
                    $scope.nowPublicGroup = {
                        selected: $scope.publicGroupList[0]
                    };
                } else if (ipType == 1) {   //内网
                    $scope.internalGroupList = body.data;
                    $scope.nowInternalGroup = {
                        selected: $scope.internalGroupList[0]
                    };
                }
            } else {
                $scope.alert.type = 'warning';
                $scope.alert.msg = data.msg;
            }
        }, function (err) {
            $scope.alert.type = 'danger';
            $scope.alert.msg = err;
        });
    }

    $scope.checkIPUse = function (groupId, ip) {
        if (ip == null || ip == '') {
            $scope.alert.type = 'warning';
            $scope.alert.msg = "IP未指定!";
            return;
        }

        var url = "/ip/use/check?"
            + "groupId=" + groupId
            + "&ip=" + ip
            + "&serverId=" + $scope.serverItem.id;

        httpService.doGet(url).then(function (data) {
            if (data.success) {
                $scope.alert.type = 'success';
                $scope.alert.msg = ip + "未被其它服务器使用!";
            } else {
                $scope.alert.type = 'warning';
                $scope.alert.msg = data.msg;
            }
        }, function (err) {
            $scope.alert.type = 'danger';
            $scope.alert.msg = err;
        });
    }
});

/**
 * 模版管理
 */
app.controller('ecsTemplateCtrl', function ($scope, $state, $uibModal, httpService, toaster, staticModel) {

    $scope.zoneIds = staticModel.zoneIds;


    //服务器类型
    $scope.serverType = staticModel.serverType;

    $scope.authPoint = $state.current.data.authPoint;


    //ECS服务器计费类型
    $scope.ecsServerInternetChargeType = staticModel.ecsServerInternetChargeType;

    //ECS服务器是否io优化实例
    $scope.ecsServerIoOptimized = staticModel.ecsServerIoOptimized;

    $scope.allocatePublicIpAddress = true;


    $scope.queryZoneId = "";

    $scope.reSet = function () {
        $scope.queryZoneId = "";
    }

    /////////////////////////////////////////////////

    $scope.pageData = [];
    $scope.totalItems = 0;
    $scope.currentPage = 0;
    $scope.pageLength = 10;

    $scope.pageChanged = function () {
        $scope.doQuery();
    };

    /////////////////////////////////////////////////

    $scope.doQuery = function () {
        var url = "/server/template/ecs/page?"
            + "&zoneId=" + $scope.queryZoneId
            + "&page=" + ($scope.currentPage <= 0 ? 0 : $scope.currentPage - 1)
            + "&length=" + $scope.pageLength;

        httpService.doGet(url).then(function (data) {
            if (data.success) {
                var body = data.body;
                $scope.totalItems = body.size;
                $scope.pageData = body.data;
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }

    $scope.doQuery();

    ///////////////////////////////////////////////////////////

    $scope.expansion = function (item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'expansionEcsInstance',
            controller: 'expansionEcsInstanceCtrl',
            size: 'lg',
            resolve: {
                httpService: function () {
                    return httpService;
                },
                template: function () {
                    return item;
                }
            }
        });

        modalInstance.result.then(function () {
            $scope.doQuery();
        }, function () {
            $scope.doQuery();
        });
    }

    ///////////////////////////////////////////////////////////

    $scope.addTemplate = function () {

        var item = {
            id: 0,
            zoneId: "",
            name: "",
            instanceType: "",
            networkSupport: 0,
            cpu: 0,
            memory: 0,
            systemDiskSize: 100,
            dataDiskSize: 0,
            ioOptimized: "",
            systemDiskCategory: "",
            dataDisk1Category: ""
        }
        $scope.editTemplate(item);
    }


    $scope.editTemplate = function (item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'ecsTemplateInfo',
            controller: 'ecsTemplateInstanceCtrl',
            size: 'lg',
            resolve: {
                httpService: function () {
                    return httpService;
                },
                item: function () {
                    return item;
                }
            }
        });

        modalInstance.result.then(function () {
            $scope.doQuery();
        }, function () {
            $scope.doQuery();
        });
    }

    ///////////////////////////////////////////////////////////

    $scope.create = function (item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'createEcsInstance',
            controller: 'createEcsInstanceCtrl',
            size: 'lg',
            resolve: {
                httpService: function () {
                    return httpService;
                },
                template: function () {
                    return item;
                }
            }
        });

        modalInstance.result.then(function () {
            $scope.doQuery();
        }, function () {
            $scope.doQuery();
        });
    }


    $scope.delTemplate = function (id) {
        var url = "/aliyun/template/del?id=" + id;
        httpService.doDelete(url).then(function (data) {
            if (data.success) {
                toaster.pop("success", "删除成功！");
                $scope.doQuery();
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }
});

/**
 * ECS配置项，image，vpc
 */
app.controller('ecsConfigCtrl', function ($scope, $state, $uibModal, $sce, httpService, toaster) {

        // api查询到的images
        $scope.images = [];

        $scope.aliyunEcsImage = {};

        // 保存到本地的数据
        $scope.imageList = [];

        $scope.vpcList = [];

        $scope.queryImagePage = function () {
            var url = "/aliyun/image?queryName=";
            httpService.doGet(url).then(function (data) {
                if (data.success) {
                    $scope.imageList = data.body;
                } else {
                    toaster.pop("warning", data.msg);
                }
            }, function (err) {
                toaster.pop("error", err);
            });
        }

        $scope.queryImagePage();

        var getImages = function () {
            var url = "/aliyun/api/describeImages";

            httpService.doGet(url).then(function (data) {
                if (data.success) {
                    $scope.images = data.body;
                    $scope.addImage();
                } else {
                    toaster.pop("warning", data.msg);
                }
            }, function (err) {
                toaster.pop("error", err);
            });
        }

        $scope.addImage = function () {
            if ($scope.images.length == 0) {
                getImages();
            } else {
                var modalInstance = $uibModal.open({
                    templateUrl: 'imagesInfo',
                    controller: 'imagesInstanceCtrl',
                    size: 'lg',
                    resolve: {
                        httpService: function () {
                            return httpService;
                        },
                        images: function () {
                            return $scope.images;
                        }
                    }
                })

                modalInstance.result.then(function () {
                    $scope.queryImagePage();
                }, function () {
                    $scope.queryImagePage();
                });
            }
        }

        $scope.delImage = function (id) {
            var url = "/aliyun/image/del?id=" + id;
            httpService.doDelete(url).then(function (data) {
                if (data.success) {
                    toaster.pop("success", "删除成功！");
                    $scope.queryImagePage();
                } else {
                    toaster.pop("warning", data.msg);
                }
            }, function (err) {
                toaster.pop("error", err);
            });
        }

        /////////////////////////////////////////////

        $scope.queryVpcsPage = function () {
            var url = "/aliyun/vpc/get";
            httpService.doGet(url).then(function (data) {
                if (data.success) {
                    $scope.vpcList = data.body;
                } else {
                    toaster.pop("warning", data.msg);
                }
            }, function (err) {
                toaster.pop("error", err);
            });
        }

        $scope.delVpc = function (id) {
            var url = "/aliyun/vpc/del?id=" + id;
            httpService.doDelete(url).then(function (data) {
                if (data.success) {
                    toaster.pop("success", "删除成功！");
                    $scope.queryVpcsPage();
                } else {
                    toaster.pop("warning", data.msg);
                }
            }, function (err) {
                toaster.pop("error", err);
            });
        }

        $scope.rsyncVpcNetwork = function () {
            var url = "/aliyun/vpc/rsync";
            httpService.doGet(url).then(function (data) {
                if (data.success) {
                    toaster.pop("success", "同步成功！");
                    $scope.queryVpcsPage();
                } else {
                    toaster.pop("warning", data.msg);
                }
            }, function (err) {
                toaster.pop("error", err);
            });
        }

        $scope.queryVpcsPage();

        $scope.alert = {
            type: "",
            msg: ""
        };

        $scope.closeAlert = function () {
            $scope.alert = {
                type: "",
                msg: ""
            };
        }

    }
);

/**
 * 创建ECS
 */
app.controller('createEcsInstanceCtrl', function ($scope, $uibModalInstance, toaster, staticModel, httpService, template) {
    $scope.envType = staticModel.envType;
    $scope.logType = staticModel.logType;
    $scope.serverType = staticModel.serverType;

    $scope.templateConfig = 1;

    $scope.nowImage = {};
    $scope.nowNetwork = {};
    $scope.nowVpc = {};
    $scope.nowVswitch = {};
    $scope.nowSecurityGroup = {};
    $scope.nowServerGroup = {};
    $scope.nowChargeType = {};
    $scope.template = template;


    $scope.pageData = [];
    $scope.totalItems = 0;
    $scope.currentPage = 0;
    $scope.pageLength = 10;

    $scope.butCreatingEcs = false;

    //$scope.loginUser = "";

    /**
     * 初始化环境
     */
    var initEnv = function () {

        // TODO 获取登录用户

        var url = "/server/getLoginUser";
        var loginUser = "";
        httpService.doGet(url).then(function (data) {
            if (data.success) {
                loginUser = data.body;
                var serverItem = {
                    id: 0,
                    serverGroupDO: null,
                    serverName: "",
                    serverType: 2,
                    loginType: 0,
                    loginUser: loginUser,
                    envType: 4,
                    area: "",
                    publicIP: null,
                    insideIP: null,
                    serialNumber: "",
                    ciGroup: "",
                    content: ""
                }

                var templateItem = {
                    serverVO: serverItem,
                    systemDiskSize: $scope.template.systemDiskSize,
                    dataDiskSize: $scope.template.dataDiskSize,
                    cnt: 1,
                    ecsTemplateId: $scope.template.id,
                    allocatePublicIpAddress: false,
                    chargeType: "PrePaid",
                    period: 3,
                    imageId: 0,
                    networkType: "",
                    vpcId: 0,
                    vswitchId: 0,
                    securityGroupId: 0
                }

                $scope.templateItem = templateItem;
            }
        }, function (err) {
            toaster.pop("error", err);
        });

    }

    initEnv();


    $scope.alert = {
        type: "",
        msg: ""
    };

    $scope.closeAlert = function () {
        $scope.alert = {
            type: "",
            msg: ""
        };
    }

    $scope.insideip = "";
    $scope.publicip = "";


    /**
     * 扩容
     */
    $scope.createServer = function () {
        $scope.butCreatingEcs = true;

        var url = "/server/template/ecs/create";

        $scope.templateItem.serverVO.serverGroupDO = $scope.nowServerGroup.selected;
        if ($scope.nowPublicGroup.selected != null) {
            $scope.templateItem.serverVO.publicIP = {
                ipNetworkDO: $scope.nowPublicGroup.selected,
                ip: "255.255.255.255"
            }
        }
        if ($scope.nowInternalGroup.selected != null) {
            $scope.templateItem.serverVO.insideIP = {
                ipNetworkDO: $scope.nowInternalGroup.selected,
                ip: "255.255.255.255"
            }
        }

        if ($scope.nowImage.selected != null) {
            $scope.templateItem.imageId = $scope.nowImage.selected.id
        }


        // 设置网络属性
        if ($scope.nowNetwork.selected != null) {
            $scope.templateItem.networkType = $scope.nowNetwork.selected
            if ($scope.templateItem.networkType == "vpc") {
                // vpc
                if ($scope.nowVpc.selected != null) {
                    $scope.templateItem.vpcId = $scope.nowVpc.selected.id
                }
                // vswitch
                if ($scope.nowVswitch.selected != null) {
                    $scope.templateItem.vswitchId = $scope.nowVswitch.selected.id
                }
                // securityGroup
                if ($scope.nowSecurityGroup.selected != null) {
                    $scope.templateItem.securityGroupId = $scope.nowSecurityGroup.selected.id
                }
            }
        }


        httpService.doPostWithJSON(url, $scope.templateItem).then(function (data) {
            if (data.success) {
                var body = data.body;
                $scope.totalItems = body.size;
                $scope.pageData = body.data;

                $scope.templateConfig = 0
                $scope.butCreatingEcs = false;
            }
            else {
                toaster.pop("warning", data.msg);
                $scope.butCreatingEcs = false;
            }
        }, function (err) {
            toaster.pop("error", err);
            $scope.butCreatingEcs = false;
        });
    }

    //////////////////////////////////////////////////////////

    $scope.imageList = [];

    $scope.queryImage = function (queryParam) {
        var url = "/aliyun/image?queryName=" + queryParam;

        httpService.doGet(url).then(function (data) {
            if (data.success) {
                var body = data.body;
                $scope.imageList = body;
                $scope.nowImage.selected = $scope.imageList[0];
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }

    $scope.networkList = [];

    $scope.queryNetwork = function () {
        var url = "/aliyun/network";

        httpService.doGet(url).then(function (data) {
            if (data.success) {
                var body = data.body;
                $scope.networkList = body;
                $scope.nowNetwork = {
                    selected: $scope.networkList[1].networkType
                };

                //$scope.nowNetwork.selected = $scope.networkList[0];
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }

    $scope.queryNetwork();


    //////////////////////////////////////////////////////////

    $scope.vpcList = [];

    $scope.queryVpc = function (queryParam) {
        var url = "/aliyun/vpc?"
            + "networkType=" + ($scope.nowNetwork.selected == null ? "" : $scope.nowNetwork.selected)
            + "&queryName=" + queryParam;

        httpService.doGet(url).then(function (data) {
            if (data.success) {
                var body = data.body;
                $scope.vpcList = body;
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }

    $scope.changeNetwork = function () {
        $scope.queryVpc("");
    }

    /**
     * 触发联动
     */
    $scope.changeVpc = function () {
        $scope.queryVswitch("");
        $scope.querySecurityGroup("");
    }

    //////////////////////////////////////////////////////////

    $scope.vswitchList = [];

    $scope.queryVswitch = function (queryParam) {
        var url = "/aliyun/vswitch?"
            + "vpcId=" + ($scope.nowVpc.selected == null ? -1 : $scope.nowVpc.selected.id)
            + "&queryName=" + queryParam;

        httpService.doGet(url).then(function (data) {
            if (data.success) {
                var body = data.body;
                $scope.vswitchList = body;
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }

    //////////////////////////////////////////////////////////
    $scope.securityGroupList = [];

    $scope.querySecurityGroup = function (queryParam) {
        var url = "/aliyun/securityGroup?"
            + "vpcId=" + ($scope.nowVpc.selected == null ? -1 : $scope.nowVpc.selected.id)
            + "&queryName=" + queryParam;

        httpService.doGet(url).then(function (data) {
            if (data.success) {
                var body = data.body;
                $scope.securityGroupList = body;
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }
    //////////////////////////////////////////////////////////

    $scope.serverGroupList = [];

    $scope.queryServerGroup = function (queryParam) {
        var url = "/servergroup/query/page?page=0&length=10&name=" + queryParam + "&useType=0";

        httpService.doGet(url).then(function (data) {
            if (data.success) {
                var body = data.body;
                $scope.serverGroupList = body.data;
            } else {
                toaster.pop("warning", data.msg);
            }
        }, function (err) {
            toaster.pop("error", err);
        });
    }

    //////////////////////////////////////////////////////////

    $scope.publicGroupList = [];

    /**
     * 查询公网网段
     * @param ipNetwork
     */
    $scope.queryPublicIPGroup = function (ipNetwork) {
        queryIPGroup(ipNetwork, 0);
    }

    $scope.internalGroupList = [];

    /**
     * 查询内网网段
     * @param ipNetwork
     */
    $scope.queryInternalIPGroup = function (ipNetwork) {
        queryIPGroup(ipNetwork, 1);
    }

    var queryIPGroup = function (ipNetwork, ipType) {
        var url = "/ipgroup/query?" + "page=" + 0 + "&length=" + 10;

        var queryBody = {
            ipNetwork: ipNetwork,
            serverGroupId: 0,
            ipType: ipType
        }
        httpService.doPostWithJSON(url, queryBody).then(function (data) {
            if (data.success) {
                var body = data.body;
                if (ipType == 0) {   //公网
                    $scope.publicGroupList = body.data;
                    $scope.nowPublicGroup = {
                        selected: $scope.publicGroupList[0]
                    };
                } else if (ipType == 1) {   //内网
                    $scope.internalGroupList = body.data;
                    $scope.nowInternalGroup = {
                        selected: $scope.internalGroupList[0]
                    };
                }
            } else {
                $scope.alert.type = 'warning';
                $scope.alert.msg = data.msg;
            }
        }, function (err) {
            $scope.alert.type = 'danger';
            $scope.alert.msg = err;
        });
    }

    $scope.checkIPUse = function (groupId, ip) {
        if (ip == null || ip == '') {
            $scope.alert.type = 'warning';
            $scope.alert.msg = "IP未指定!";
            return;
        }

        var url = "/ip/use/check?"
            + "groupId=" + groupId
            + "&ip=" + ip
            + "&serverId=" + $scope.serverItem.id;

        httpService.doGet(url).then(function (data) {
            if (data.success) {
                $scope.alert.type = 'success';
                $scope.alert.msg = ip + "未被其它服务器使用!";
            } else {
                $scope.alert.type = 'warning';
                $scope.alert.msg = data.msg;
            }
        }, function (err) {
            $scope.alert.type = 'danger';
            $scope.alert.msg = err;
        });
    }

    $scope.changeServerGroup = function (serverGroup) {
        if (serverGroup == null)
            return;
        var groupName = serverGroup.name;
        var serverName = groupName.replace(/^group_/, "");
        $scope.templateItem.serverVO.serverName = serverName;
    }

    $scope.closeModal = function () {
        $uibModalInstance.dismiss('cancel');
    }

});

app.controller('aliyunConfigCtrl', function ($scope, $state, $uibModal, $sce, httpService, toaster) {

        $scope.authPoint = $state.current.data.authPoint;

        $scope.configMap = {};

        $scope.itemGroup = "ALIYUN_ECS";

        /**
         * 获取配置
         */
        $scope.getConfig = function () {
            var url = "/config/center/get?itemGroup=" + $scope.itemGroup +
                "&env=";
            httpService.doGet(url).then(function (data) {
                if (data.success) {
                    $scope.configMap = data.body;
                } else {
                    toaster.pop("warning", data.msg);
                }
            }, function (err) {
                toaster.pop("error", err);
            });
        }


        /**
         * 更新配置
         */
        $scope.updateConfig = function () {
            var url = "/config/center/update";
            httpService.doPostWithJSON(url, $scope.configMap).then(function (data) {
                if (data.success) {
                    toaster.pop("success", "配置保存成功!");
                    $scope.getConfig();
                } else {
                    toaster.pop("warning", data.msg);
                }
            }, function (err) {
                toaster.pop("error", err);
            });
        }

        $scope.getConfig();

        $scope.describeRegions = function () {
            var url = "/aliyun/api/describeRegions";

            httpService.doGet(url).then(function (data) {
                if (data.success) {
                    var regions = data.body;
                    viewRegions(regions);
                } else {
                    toaster.pop("warning", data.msg);
                }
            }, function (err) {
                toaster.pop("error", err);
            });
        }


        // 查看regions
        var viewRegions = function (regions) {
            var modalInstance = $uibModal.open({
                templateUrl: 'regionsInfo',
                controller: 'regionsInstanceCtrl',
                size: 'lg',
                resolve: {
                    httpService: function () {
                        return httpService;
                    },
                    regions: function () {
                        return regions;
                    }
                }
            })
        };


        $scope.alert = {
            type: "",
            msg: ""
        };

        $scope.closeAlert = function () {
            $scope.alert = {
                type: "",
                msg: ""
            };
        }

    }
);

app.controller('regionsInstanceCtrl', function ($scope, $uibModalInstance, $state, $uibModal, regions) {

        $scope.regions = {};

        $scope.alert = {
            type: "",
            msg: ""
        };

        $scope.checkErr = function () {
            $scope.regions = regions;
            if ($scope.regions == null || $scope.regions == '')
                $scope.alert = {
                    type: "warning",
                    msg: "AliyunAPI查询失败！"
                };
        }

        $scope.checkErr();

        $scope.closeAlert = function () {
            $scope.alert = {
                type: "",
                msg: ""
            };
        }

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        }

    }
);

app.controller('imagesInstanceCtrl', function ($scope, $uibModalInstance, $state, $uibModal, httpService, images) {

        $scope.images = {};

        $scope.aliyunEcsImage = {};

        var init = function () {
            $scope.aliyunEcsImage = {
                id: 0,
                imageId: "",
                imageDesc: "",
                imageType: 1,
                version: "1.0.0"
            };
        }

        init();

        $scope.alert = {
            type: "",
            msg: ""
        };


        $scope.checkErr = function () {
            $scope.images = images;
            if ($scope.images == null || $scope.images == '')
                $scope.alert = {
                    type: "warning",
                    msg: "AliyunAPI查询失败！"
                };
        }

        $scope.checkErr();

        $scope.closeAlert = function () {
            $scope.alert = {
                type: "",
                msg: ""
            };
        }

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        }


        $scope.addImageItem = function (image) {

            $scope.aliyunEcsImage.imageId = image.imageId;

            if ($scope.aliyunEcsImage.imageDesc == null || $scope.aliyunEcsImage.imageDesc == "") {
                $scope.aliyunEcsImage.imageDesc = image.imageName;
            }

            var url = "/aliyun/image/save";

            httpService.doPostWithJSON(url, $scope.aliyunEcsImage).then(function (data) {
                if (data.success) {
                    $scope.alert = {
                        type: "success",
                        msg: "保存成功！"
                    }
                } else {
                    $scope.alert = {
                        type: "warning",
                        msg: data.msg
                    }
                }
            }, function (err) {
                $scope.alert = {
                    type: "error",
                    msg: err
                }
            });
        }

    }
);

//ecsTemplateInstanceCtrl
app.controller('ecsTemplateInstanceCtrl', function ($scope, $uibModalInstance, $state, $uibModal, httpService, item) {

        $scope.template = item;

        // ALIYUN_ECS_REGION_ID
        $scope.regronIds = [];
        $scope.regronId = {};
        $scope.aliyunEcsRegionId = "";

        $scope.zones = [];


        $scope.configMap = {};

        $scope.itemGroup = "ALIYUN_ECS";

        /**
         * 获取配置
         */
        $scope.getConfig = function () {
            var url = "/config/center/get?itemGroup=" + $scope.itemGroup +
                "&env=";
            httpService.doGet(url).then(function (data) {
                if (data.success) {
                    $scope.configMap = data.body;
                    $scope.aliyunEcsRegionId = $scope.configMap.ALIYUN_ECS_REGION_ID.value;

                    $scope.regronIds = $scope.aliyunEcsRegionId.split(",");
                } else {
                    toaster.pop("warning", data.msg);
                }
            }, function (err) {
                toaster.pop("error", err);
            });
        }

        $scope.getConfig();


        $scope.types = [];
        $scope.typeList = [];
        $scope.pageData = [];
        $scope.totalItems = 0;
        $scope.currentPage = 0;
        $scope.pageLength = 10;


        var queryInstanceTypes = function () {
            if ($scope.types != null && $scope.types.length != 0) return;

            var url = "/aliyun/api/describeInstanceTypes?regionId=" + $scope.regronId.selected;

            httpService.doGet(url).then(function (data) {
                if (data.success) {
                    $scope.types = data.body;
                } else {
                    toaster.pop("warning", data.msg);
                }
            }, function (err) {
                toaster.pop("error", err);
            });
        }

        var reset = function () {

            $scope.template = {
                id: 0,
                zoneId: "",
                name: "",
                instanceType: "",
                networkSupport: 0,
                cpu: 0,
                memory: 0,
                systemDiskSize: 100,
                dataDiskSize: 0,
                ioOptimized: "",
                systemDiskCategory: "",
                dataDisk1Category: ""
            }

            $scope.pageData = [];

        }

        // queryZones
        $scope.doQuery = function () {
            var url = "/aliyun/api/describeZones?regionId=" + $scope.regronId.selected;
            httpService.doGet(url).then(function (data) {
                if (data.success) {
                    $scope.zones = data.body;
                    queryInstanceTypes();
                    reset();
                } else {
                    toaster.pop("warning", data.msg);
                }
            }, function (err) {
                toaster.pop("error", err);
            });
        }


        //$scope.zoneList = [];
        // 当前选择的zone
        $scope.zone = {};
        // io优化选择
        $scope.ioList = [];

        $scope.none = {
            type: "none",
            name: "非I/O优化"
        }

        $scope.optimized = {
            type: "optimized",
            name: "I/O优化"
        }


        var initIoList = function () {
            $scope.ioList = [];
            $scope.ioList.push($scope.none);
        }


        $scope.pageChanged = function (currentPage) {
            $scope.pageData = [];
            for (var i = 0; i < $scope.pageLength; i++) {
                var index = i + (currentPage - 1) * $scope.pageLength;
                if (index > $scope.totalItems - 1) break;
                var item = $scope.typeList[i + (currentPage - 1) * $scope.pageLength];
                $scope.pageData.push(item);
            }
        };

        // 初始化zone数据
        $scope.zoneSelected = function () {
            if ($scope.zones == null || $scope.zones.length == 0) return;
            if ($scope.zone == null || $scope.zone.zoneId == "") return;
            initIoList();
            if ($scope.zone.selected != null && $scope.zone.selected.availableResourceCreation != null && $scope.zone.selected.availableResourceCreation.length != 0) {
                for (var i = 0; i < $scope.zone.selected.availableResourceCreation.length; i++) {
                    if ($scope.zone.selected.availableResourceCreation[i] == "VSwitch") {
                        $scope.template.networkSupport = 1;
                    }
                    // IoOptimized
                    if ($scope.zone.selected.availableResourceCreation[i] == "IoOptimized") {
                        $scope.ioList.push($scope.optimized);
                    }
                }
            }

            if ($scope.zone.selected == null) return;
            if ($scope.zone.selected.availableInstanceTypes == null) return;
            $scope.typeList = [];
            for (var i = 0; i < $scope.types.length; i++) {
                var type = $scope.types[i];
                for (var j = 0; j < $scope.zone.selected.availableInstanceTypes.length; j++) {
                    if (type.instanceTypeId == $scope.zone.selected.availableInstanceTypes[j]) {
                        $scope.typeList.push(type);
                        break;
                    }
                }
            }

            $scope.totalItems = $scope.zone.selected.availableInstanceTypes.length;
            $scope.currentPage = 1;
            $scope.pageChanged(1);
            //$scope.queryZones();

        };


        /////////////////////////////////////////////////


        $scope.alert = {
            type: "",
            msg: ""
        };


        $scope.closeAlert = function () {
            $scope.alert = {
                type: "",
                msg: ""
            };
        }

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        }


        $scope.addTypeItem = function (type) {
            $scope.template.instanceType = type.instanceTypeId;
            $scope.template.cpu = type.cpuCoreCount;
            $scope.template.memory = type.memorySize;
        }

        $scope.saveTemplate = function () {

            if ($scope.template.name == "") {
                $scope.alert.type = 'warning';
                $scope.alert.msg = "必须指定模版名称";
                return;
            }

            if ($scope.template.ioOptimized == "") {
                $scope.alert.type = 'warning';
                $scope.alert.msg = "必须指定是否I/O优化实例";
                return;
            }

            if ($scope.template.dataDisk1Category == "") {
                $scope.alert.type = 'warning';
                $scope.alert.msg = "必须指定数据盘类型";
                return;
            }

            if ($scope.template.systemDiskCategory == "") {
                $scope.alert.type = 'warning';
                $scope.alert.msg = "必须指定系统盘类型";
                return;
            }

            $scope.template.zoneId = $scope.zone.selected.zoneId;
            var url = "/aliyun/template/save";

            httpService.doPostWithJSON(url, $scope.template).then(function (data) {
                if (data.success) {
                    $scope.alert = {
                        type: "success",
                        msg: "保存成功！"
                    }
                } else {
                    $scope.alert = {
                        type: "warning",
                        msg: data.msg
                    }
                }
            }, function (err) {
                $scope.alert = {
                    type: "error",
                    msg: err
                }
            });
        }

    }
);

app.controller('renewEcsInstanceCtrl', function ($scope, $uibModalInstance, $state, $uibModal, httpService, ecsInstances) {
        $scope.ecsInstances = ecsInstances;
        $scope.period = 3;

        $scope.butRenewing = false;
        /////////////////////////////////////////////////

        $scope.alert = {
            type: "",
            msg: ""
        };

        $scope.closeAlert = function () {
            $scope.alert = {
                type: "",
                msg: ""
            };
        }

        $scope.closeModal = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.renew = function () {

            if ($scope.period <= 0) {
                $scope.alert.type = 'warning';
                $scope.alert.msg = "包月时长参数非法，参考值:1,2,3,4,5,6,7,8,9,12,24,36,48,60";
                return;
            }

            if ($scope.ecsInstances.length == 0) {
                $scope.alert.type = 'warning';
                $scope.alert.msg = "没有续费实例";
                return;
            }

            var aliyunRenewInstances = {
                period: $scope.period,
                ecsInstances: []
            };
            for (var i = 0; i < $scope.ecsInstances.length; i++) {
                var aliyunRenewInstance = {
                    instanceId: $scope.ecsInstances[i].instanceId,
                    serverName: $scope.ecsInstances[i].serverName,
                    period: 0
                }
                aliyunRenewInstances.ecsInstances.push(aliyunRenewInstance)
            }

            $scope.butRenewing = true;
            var url = "/server/ecsRenew";

            httpService.doPostWithJSON(url, aliyunRenewInstances).then(function (data) {
                if (data.success) {
                    $scope.alert = {
                        type: "success",
                        msg: "续费成功！"
                    }
                    $scope.butRenewing = false;
                } else {
                    $scope.alert = {
                        type: "warning",
                        msg: data.msg
                    }
                    $scope.butRenewing = false;
                }
            }, function (err) {
                $scope.alert = {
                    type: "error",
                    msg: err
                }
                $scope.butRenewing = false;
            });
        }

    }
);