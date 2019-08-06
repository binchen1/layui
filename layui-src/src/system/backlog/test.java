package com.hitek.system.backlog.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import org.jeecgframework.core.common.entity.BaseEntity;

/**
 * 待办事项
 * 
 * 2018年12月4日
 * @author lilf
 */
@Entity
@Table(name = "t_s_backlog", schema = "")
public class BacklogEntity extends BaseEntity{

    /**序列化id*/
    private static final long serialVersionUID = -8310196193870201716L;
    
    /**模块编码:委托*/
    public static final String MODULE_SN_CONSIGN = "consign";
    /**模块编码:收费*/
    public static final String MODULE_SN_FEE = "fee";
    /**模块编码:实验检测*/
    public static final String MODULE_SN_TESTTASK = "testtask";
    /**模块编码:复核*/
    public static final String MODULE_SN_REVIEW = "review";
    /**模块编码:审核*/
    public static final String MODULE_SN_AUDIT = "audit";
    /**模块编码:批准*/
    public static final String MODULE_SN_APPROVE = "approve";
    /**模块编码:打印*/
    public static final String MODULE_SN_PRINT = "print";
    
    /**待办事项优先级:高*/
    public static final String PRIORITY_HIGH = "H";
    /**待办事项优先级:中*/
    public static final String PRIORITY_MIDDLE = "M";
    /**待办事项优先级:低*/
    public static final String PRIORITY_LOW = "L";
    
    /**模块编号*/
    private String moduleSn;
    /**事项名称*/
    private String name;
    /**说明*/
    private String explain;
    /**查询sql*/
    private String sqlStr;
    /**sql参数*/
    private String sqlParam;
    /**优先级*/
    private String priority;
    /**顺序号*/
    private String sortNum;
    /**是否标记为删除*/
    private String isDelete;
    
    @Column(name = "module_sn")
    public String getModuleSn() {
        return moduleSn;
    }
    public void setModuleSn(String moduleSn) {
        this.moduleSn = moduleSn;
    }
    
    @Column(name = "name")
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    
    @Column(name = "explain")
    public String getExplain() {
        return explain;
    }
    public void setExplain(String explain) {
        this.explain = explain;
    }
    
    @Column(name = "sql_str")
    public String getSqlStr() {
        return sqlStr;
    }
    public void setSqlStr(String sqlStr) {
        this.sqlStr = sqlStr;
    }
    
    @Column(name = "sql_param")
    public String getSqlParam() {
        return sqlParam;
    }
    public void setSqlParam(String sqlParam) {
        this.sqlParam = sqlParam;
    }
    
    @Column(name = "priority")
    public String getPriority() {
        return priority;
    }
    public void setPriority(String priority) {
        this.priority = priority;
    }
    
    @Column(name = "sort_num")
    public String getSortNum() {
        return sortNum;
    }
    public void setSortNum(String sortNum) {
        this.sortNum = sortNum;
    }
    
    @Column(name = "is_delete")
    public String getIsDelete() {
        return isDelete;
    }
    public void setIsDelete(String isDelete) {
        this.isDelete = isDelete;
    }
}
