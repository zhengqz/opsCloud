package com.sdg.cmdb.service;

import com.sdg.cmdb.domain.server.ServerDO;
import com.sdg.cmdb.domain.server.ServerGroupDO;

import java.util.List;

/**
 * Created by liangjian on 2017/5/24.
 */
public interface ConfigServerGroupService {


    /**
     * 查询服务器组属性-项目名称
     * 1. PROJECT_NAME
     * 2. TOMCAT_APP_NAME_OPT
     *
     * @param serverGroupDO
     * @return
     */
    String queryProjectName(ServerGroupDO serverGroupDO);


    /**
     * 查询服务器组属性-nginx upsteam名称
     * 1. NGINX_UPSTREAM_NAME
     *
     * @param serverGroupDO
     * @return
     */
    String queryNginxUpstreamName(ServerGroupDO serverGroupDO);


    /**
     * 查询服务器组属性-nginx url名称
     * 例如 location ~ ^/sdop/
     * 1. NGINX_URL_ALIAS
     *
     * @param serverGroupDO
     * @return
     */
    String queryNginxUrl(ServerGroupDO serverGroupDO);

    /**
     * 查询服务器组属性 location
     * 例如 location ~ ^/sdop/ 中的 ~ ^/sdop/
     * @param serverGroupDO
     * @return
     */
    String getNginxLocation(ServerGroupDO serverGroupDO);

    /**
     * 获取proxy_pass中的配置
     *
     * @param serverGroupDO
     * @param envCode
     * @return
     */
    String queryNginxProxyPass(ServerGroupDO serverGroupDO, int envCode);

    String queryEnvName(int envCode);

    String queryTomcatAppName(ServerGroupDO serverGroupDO);

    String queryUpstreamPort(ServerGroupDO serverGroupDO);





    /**
     * 取check页面路径
     *
     * @param serverGroupDO
     * @return
     */
    String queryHttpCheck(ServerGroupDO serverGroupDO);

    /**
     * 判断是否为manage后台back环境
     * nginx_location_manage_back 参数只作用于gray环境
     *
     * @param serverGroupDO
     * @param envCode
     * @return
     */
    boolean isManageBack(ServerGroupDO serverGroupDO, int envCode);

    /**
     * 是否生成Upsteam中的check模块配置
     * @param serverGroupDO
     * @return
     */
    boolean isBuildNginxCheck(ServerGroupDO serverGroupDO);

    /**
     * 获取location中的limit配置
     *
     * @param serverGroupDO
     * @return
     */
    String queryNginxLocationLimitReq(ServerGroupDO serverGroupDO);

    /**
     * 是否生成标准的location
     *
     * @param serverGroupDO
     * @return
     */
    boolean isbuildLocation(ServerGroupDO serverGroupDO);


    boolean isBuildNginxUpstream(ServerGroupDO serverGroupDO);

    boolean isTomcatServer(ServerGroupDO serverGroupDO);

    void invokeGetwayIp(ServerDO serverDO);

    String queryGetwayIp(ServerDO serverDO);

    String queryTomcatInstallVersion(ServerGroupDO serverGroupDO);

    boolean saveTomcatInstallVersion(ServerGroupDO serverGroupDO, String version);

    String queryJavaInstallVersion(ServerGroupDO serverGroupDO);

    boolean saveJavaInstallVersion(ServerGroupDO serverGroupDO, String version);

    /**
     * 获取系统盘vol
     *
     * @param serverDO
     * @return
     */
    String queryDiskSysVolume(ServerDO serverDO);


    String queryDiskDataVolume(ServerDO serverDO);

    /**
     * 判断upstream中gray是否和prod一致
     *
     * @param serverGroupDO
     * @return
     */
    boolean isIptablesDubboGrayEqProd(ServerGroupDO serverGroupDO);


    /**
     * 查询nginx location中的扩展参数
     *
     * @param serverGroupDO
     * @return
     */
    String queryNginxLocationParam(ServerGroupDO serverGroupDO);

    /**
     * server类型 可选 down  backup
     *
     * @param serverDO
     * @return
     */
    String queryNginxUpstreamServerType(ServerDO serverDO);

    /**
     * 权重
     *
     * @param serverDO
     * @return
     */
    String queryNginxUpstreamWeight(ServerDO serverDO);

    String queryNginxUpstreamFailTimeout(ServerGroupDO serverGroupDO);

    String queryNginxUpstreamMaxFails(ServerGroupDO serverGroupDO);


    String[] queryZabbixTemplates(ServerGroupDO serverGroupDO);

    String queryZabbixProxy(ServerGroupDO serverGroupDO);

    /**
     * MONITOR_IP
     * @param serverDO
     * @return MONITOR_IP
     */
    String queryZabbixMonitorIp(ServerDO serverDO);

    /**
     * 此接口查询服务器组属性 ZABBIX.MONITOR_IP
     * @param serverDO
     * @return ZABBIX_MACROS
     */
    String queryZabbixMacros(ServerDO serverDO);

    /**
     * 取分组配置
     * @param serverGroupDO
     * @return
     */
    int queryAnsibleSubgroup(ServerGroupDO serverGroupDO);

}
