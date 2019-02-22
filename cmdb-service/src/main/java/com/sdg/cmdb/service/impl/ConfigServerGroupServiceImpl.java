package com.sdg.cmdb.service.impl;

import com.sdg.cmdb.dao.cmdb.ConfigDao;
import com.sdg.cmdb.dao.cmdb.ServerDao;
import com.sdg.cmdb.dao.cmdb.ServerGroupDao;
import com.sdg.cmdb.dao.cmdb.UserDao;
import com.sdg.cmdb.domain.server.ServerDO;
import com.sdg.cmdb.domain.server.ServerGroupDO;
import com.sdg.cmdb.service.ConfigServerGroupService;
import com.sdg.cmdb.service.ConfigService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;


/**
 * Created by liangjian on 2017/5/24.
 */
@Service
public class ConfigServerGroupServiceImpl implements ConfigServerGroupService {

    public static final String tomcat_app_name = "TOMCAT_APP_NAME_OPT";

    public static final String http_check_url = "NGINX_CHECK_URL";

    public static final String NGINX_UPSTREAM_PORT ="NGINX_UPSTREAM_PORT";

    public static final String project_name = "PROJECT_NAME";

    public static final String nginx_location_build = "NGINX_LOCATION_BUILD";

    public static final String nginx_url_alias = "NGINX_URL_ALIAS";

    public static final String nginx_upstream_name = "NGINX_UPSTREAM_NAME";

    public static final String nginx_upstream_build = "NGINX_UPSTREAM_BUILD";

    public static final String nginx_location_manage_back = "NGINX_LOCATION_MANAGE_BACK";

    public static final String nginx_check = "NGINX_CHECK";


    /**
     * down 表示单前的server暂时不参与负载;backup 备用服务器, 其它所有的非backup机器down或者忙的时候，请求backup机器。所以这台机器压力会最轻。
     */
    public static final String nginx_upstream_server_type = "NGINX_UPSTREAM_SERVER_TYPE";

    /**
     * server权重
     */
    public static final String nginx_upstream_weight = "NGINX_UPSTREAM_WEIGHT";

    public static final String nginx_upstream_fail_timeout = "NGINX_UPSTREAM_FAIL_TIMEOUT";

    public static final String nginx_upstream_max_fails = "NGINX_UPSTREAM_MAX_FAILS";

    public static final String nginx_location_limit_req = "NGINX_LOCATION_LIMIT_REQ";

    public static final String nginx_proxy_pass_tail = "NGINX_PROXY_PASS_TAIL";

    public static final String nginx_location_param = "NGINX_LOCATION_PARAM";

    public static final String nginx_project_name = "NGINX_PROJECT_NAME";

    public static final String iptables_dubbo_build = "IPTABLES_DUBBO_BUILD";

    public static final String getway_host_ssh_public_ip = "GETWAY_HOST_SSH_PUBLIC_IP";

    public static final String tomcat_install_version = "TOMCAT_INSTALL_VERSION";

    public static final String java_install_version = "JAVA_INSTALL_VERSION";

    public static final String zabbix_disk_sys_volume = "ZABBIX_DISK_SYS_VOLUME_NAME";

    public static final String zabbix_disk_data_volume = "ZABBIX_DISK_DATA_VOLUME_NAME";

    public static final String iptables_dubbo_gray_is_prod = "IPTABLES_DUBBO_GRAY_IS_PROD";

    public static final String nginx_locaton_indent = "    ";


    public static final String ZABBIX_TEMPLATES = "ZABBIX_TEMPLATES";

    public static final String ZABBIX_PROXY = "ZABBIX_PROXY";

    public static final String ZABBIX_HOST_MONITOR_PUBLIC_IP = "ZABBIX_HOST_MONITOR_PUBLIC_IP";

    public static final String ZABBIX_HOST_MACROS = "ZABBIX_HOST_MACROS";

    // ANSIBLE 分组配置（分组数量）
    public static final String ANSIBLE_SUBGROUP = "ANSIBLE_SUBGROUP";

    @Resource
    protected ServerDao serverDao;

    @Resource
    protected ServerGroupDao serverGroupDao;

    @Resource
    protected ConfigDao configDao;

    @Resource
    protected UserDao userDao;

    @Resource
    protected ConfigService configService;

    @Override
    public String queryProjectName(ServerGroupDO serverGroupDO) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, nginx_project_name);
        if (!StringUtils.isEmpty(result))
            return result;
        result = configService.acqConfigByServerGroupAndKey(serverGroupDO, project_name);
        if (StringUtils.isEmpty(result)) {
            return configService.acqConfigByServerGroupAndKey(serverGroupDO, tomcat_app_name);
        } else {
            return result;
        }
    }

    @Override
    public String queryNginxUpstreamName(ServerGroupDO serverGroupDO) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, nginx_upstream_name);
        if (result == null || result.isEmpty()) {
            return queryProjectName(serverGroupDO);
        } else {
            return result;
        }
    }


    @Override
    public String queryNginxUrl(ServerGroupDO serverGroupDO) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, nginx_url_alias);
        if (result == null || result.isEmpty()) {
            return queryProjectName(serverGroupDO);
        } else {
            return result;
        }
    }

    @Override
    public String getNginxLocation(ServerGroupDO serverGroupDO) {
        String nginxUrl = queryNginxUrl(serverGroupDO);
        if (nginxUrl.equals("/")) {
            return nginxUrl;
        } else {
            return "~ ^/" + nginxUrl + "/";
        }
    }

    @Override
    public String queryNginxProxyPass(ServerGroupDO serverGroupDO, int envCode) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, nginx_proxy_pass_tail);
        String nginxUpstreamName = queryNginxUpstreamName(serverGroupDO);
        if (org.springframework.util.StringUtils.isEmpty(result)) {
            return nginx_locaton_indent + "proxy_pass http://upstream." + queryEnvName(envCode) + nginxUpstreamName + ".java;\n";
        } else {
            return nginx_locaton_indent + "proxy_pass http://upstream." + queryEnvName(envCode) + nginxUpstreamName + ".java" + result + " ;\n";
        }
    }


    /**
     * 获取环境名称
     *
     * @param envCode
     * @return
     */
    @Override
    public String queryEnvName(int envCode) {
        if (ServerDO.EnvTypeEnum.prod.getCode() == envCode) return "";
        return ServerDO.EnvTypeEnum.getEnvTypeName(envCode) + ".";
    }

    @Override
    public String queryTomcatAppName(ServerGroupDO serverGroupDO) {
        return configService.acqConfigByServerGroupAndKey(serverGroupDO, tomcat_app_name);
    }

    @Override
    public  String queryUpstreamPort(ServerGroupDO serverGroupDO){
        String port = configService.acqConfigByServerGroupAndKey(serverGroupDO, NGINX_UPSTREAM_PORT);
        if(StringUtils.isEmpty(port))
            return "8080";
        return port;
    }



    @Override
    public String queryHttpCheck(ServerGroupDO serverGroupDO) {
        String httpCheck = configService.acqConfigByServerGroupAndKey(serverGroupDO, http_check_url);
        if (httpCheck.indexOf("/") == 0) {
            return httpCheck;
        } else {
            return "/" + httpCheck;
        }
    }


    @Override
    public boolean isManageBack(ServerGroupDO serverGroupDO, int envCode) {
        if (envCode != ServerDO.EnvTypeEnum.gray.getCode()) return false;
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, nginx_location_manage_back);
        if (result != null && result.equalsIgnoreCase("true"))
            return true;
        // default  false
        return false;
    }

    @Override
    public boolean isBuildNginxCheck(ServerGroupDO serverGroupDO) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, nginx_check);
        if (result != null && result.equalsIgnoreCase("true"))
            return true;
        // default  false
        return false;
    }

    @Override
    public String queryNginxLocationLimitReq(ServerGroupDO serverGroupDO) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, nginx_location_limit_req);
        if (result == null || result.isEmpty()) {
            return null;
        } else {
            return result;
        }
    }

    @Override
    public boolean isbuildLocation(ServerGroupDO serverGroupDO) {
        //String result = acqTomcatAppName(serverGroupDO);
        //if (result == null || result.isEmpty()) return false;
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, ConfigServerGroupServiceImpl.nginx_location_build);
        if (result != null && result.equalsIgnoreCase("false")) return false;
        return true;
    }

    @Override
    public boolean isBuildNginxUpstream(ServerGroupDO serverGroupDO) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, nginx_upstream_build);
        if (result != null && result.equalsIgnoreCase("false"))
            return false;
        // default  true
        return true;
    }

    @Override
    public boolean isTomcatServer(ServerGroupDO serverGroupDO) {
        if (serverGroupDO == null) return false;
        if (serverGroupDO.getUseType() != ServerGroupDO.UseTypeEnum.webservice.getCode()) return false;
        String tomcatAppName = queryTomcatAppName(serverGroupDO);
        if (StringUtils.isEmpty(tomcatAppName)) {
            return false;
        } else {
            return true;
        }
    }


    @Override
    public void invokeGetwayIp(ServerDO serverDO) {
        String getwayIp = queryGetwayIp(serverDO);
        if (!StringUtils.isEmpty(getwayIp))
            serverDO.setInsideIp(getwayIp);
    }

    @Override
    public String queryGetwayIp(ServerDO serverDO) {
        String result = configService.acqConfigByServerAndKey(serverDO, getway_host_ssh_public_ip);
        if (StringUtils.isEmpty(result)) return null;
        if (result.equalsIgnoreCase("true")) {
            return serverDO.getPublicIp();
        } else {
            return serverDO.getInsideIp();
        }
    }

    @Override
    public String queryTomcatInstallVersion(ServerGroupDO serverGroupDO) {
        return configService.acqConfigByServerGroupAndKey(serverGroupDO, tomcat_install_version);
    }

    @Override
    public boolean saveTomcatInstallVersion(ServerGroupDO serverGroupDO, String version) {
        return configService.saveConfigServerGroupValue(serverGroupDO, tomcat_install_version, version);
    }

    @Override
    public String queryJavaInstallVersion(ServerGroupDO serverGroupDO) {
        return configService.acqConfigByServerGroupAndKey(serverGroupDO, java_install_version);
    }

    @Override
    public boolean saveJavaInstallVersion(ServerGroupDO serverGroupDO, String version) {
        return configService.saveConfigServerGroupValue(serverGroupDO, java_install_version, version);
    }

    @Override
    public String queryDiskSysVolume(ServerDO serverDO) {
        return configService.acqConfigByServerAndKey(serverDO, zabbix_disk_sys_volume);
    }

    @Override
    public String queryDiskDataVolume(ServerDO serverDO) {
        return configService.acqConfigByServerAndKey(serverDO, zabbix_disk_data_volume);
    }

    @Override
    public boolean isIptablesDubboGrayEqProd(ServerGroupDO serverGroupDO) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, iptables_dubbo_gray_is_prod);
        if (result != null && result.equalsIgnoreCase("true"))
            return true;
        // default  false
        return false;
    }

    @Override
    public String queryNginxLocationParam(ServerGroupDO serverGroupDO) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, nginx_location_param);
        return result;
    }

    //public static final String nginx_upstream_server_type ="NGINX_UPSTREAM_SERVER_TYPE";
    @Override
    public String queryNginxUpstreamServerType(ServerDO serverDO) {
        String result = configService.acqConfigByServerAndKey(serverDO, nginx_upstream_server_type);
        return result;
    }

    //public static final String nginx_upstream_weight ="NGINX_UPSTREAM_WEIGHT";
    @Override
    public String queryNginxUpstreamWeight(ServerDO serverDO) {
        String result = configService.acqConfigByServerAndKey(serverDO, nginx_upstream_weight);
        return result;
    }

    // public static final String ZABBIX_HOST_MONITOR_PUBLIC_IP = "ZABBIX_HOST_MONITOR_PUBLIC_IP";
    @Override
    public String queryZabbixMonitorIp(ServerDO serverDO){
        String result = configService.acqConfigByServerAndKey(serverDO,ZABBIX_HOST_MONITOR_PUBLIC_IP);
        if(!StringUtils.isEmpty(result) && result.equalsIgnoreCase("true"))
            return serverDO.getPublicIp();
        return serverDO.getInsideIp();
    }

    @Override
    public  String queryZabbixMacros(ServerDO serverDO){
        ServerGroupDO serverGroupDO = serverGroupDao.queryServerGroupById(serverDO.getServerGroupId());
        String macros = configService.acqConfigByServerGroupAndKey(serverGroupDO, ZABBIX_HOST_MACROS);
        if(macros == null)
            return "";
        return macros;
    }

    //public static final String nginx_upstream_fail_timeout = "NGINX_UPSTREAM_FAIL_TIMEOUT";
    @Override
    public String queryNginxUpstreamFailTimeout(ServerGroupDO serverGroupDO) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, nginx_upstream_fail_timeout);
        return result;
    }

    //public static final String nginx_upstream_max_fails = "NGINX_UPSTREAM_MAX_FAILS";
    @Override
    public String queryNginxUpstreamMaxFails(ServerGroupDO serverGroupDO) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, nginx_upstream_max_fails);
        return result;
    }


    @Override
    public String[] queryZabbixTemplates(ServerGroupDO serverGroupDO) {
        String[] templates = {};
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, ZABBIX_TEMPLATES);
        if (result == null || result.isEmpty()) {
            return templates;
        } else {
            templates = result.split(",");
            return templates;
        }
    }

    @Override
    public String queryZabbixProxy(ServerGroupDO serverGroupDO) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, ZABBIX_PROXY);
        if (result == null || result.isEmpty()) {
            return "";
        } else {
            return result;
        }
    }


    @Override
    public int queryAnsibleSubgroup(ServerGroupDO serverGroupDO) {
        String result = configService.acqConfigByServerGroupAndKey(serverGroupDO, ANSIBLE_SUBGROUP);
        try {
            if (!StringUtils.isEmpty(result))
                return Integer.valueOf(result);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 2;
    }
}
