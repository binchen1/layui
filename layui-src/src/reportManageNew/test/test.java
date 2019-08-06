package com.hitek.equipmentNew.equipment.entity;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.jeecgframework.core.common.entity.BaseEntity;

import com.hitek.equipmentNew.buy.entity.TEqBuyEntity;
import com.hitek.equipmentNew.buy.entity.TEqSupplierEntity;

/**
 * 设备管理功能 - 设备实体
 *   TODO 因为旧版把t_equipment表名和对应实体名占用了,现在先暂时用t_s_equipment代替,功能开发完成后替换回来即可
 * @date 2019年5月18日 上午10:41:51
 * @author lilf
 */
@Entity
@Table(name="t_s_equipment")
public class TSEquipmentEntity extends BaseEntity{
    
    /**  */
    private static final long serialVersionUID = -6025156980360771316L;
    
    /** 设备名称 */
    private String name;
    /** 设备编号 */
    private String equipmentSn;
    /** 档案编号 */
    private String archiveSn;
    /** 资产编号 */
    private String assetSn;
    /** 检测管理编号 */
    private String testManageSn;
    /** 规格型号 */
    private String standard;
    /** 量程 */
    private String eqRange;
    /** 精度 */
    private String accuracy;
    /** 外形尺寸 */
    private String size;
    /** 保管人id */
    private String keeperId;
    /** 保管人姓名 */
    private String keeperName;
    /** 使用人id */
    private String userId;
    /** 使用人姓名 */
    private String userName;
    /** 所属单位id */
    private String unitName;
    /** 所属部门id */
    private String departId;
    /** 存放地点 */
    private String storageSite;
    /** 设备状态 1:正常,2:已停用,3:报废留用,4:已报废,5:正在维修 详见字典:设备状态 */
    private String status;
    /** 设备出借状态 0:未租借,1.借出,2.租出,3.内部借用  详见字典:设备租借状态*/
    private String rentStatus;
    /** 设备类别 */
    private String type;
    /** 管理类别 详见字典:设备管理类别*/
    private String manageType;
    /** 检校类别: 详见字典:设备检校类别
     *  说明: 设备对象上的检校用于各类查询,它能解决绝大部分单位的需求, 检校参数对象上的类别仅用于对参数的检校类别进行描述 */
    private String checkType;
    /** 检校周期 */
    private Integer checkPeriod;
    /** 检校周期单位: Y:年,M:月,D:日 */
    private String checkPeriodUnit;
    /** 上次检校时间 */
    private Date preCheckDate;
    /** 下次检校时间 */
    private Date nextCheckDate;
    /** 数量 */
    private String quantity;
    /** 净值 */
    private String netValue;
    /** 功率 */
    private String power;
    /** 复杂系数(机) */
    private String coefficientMachine;
    /** 复杂系数(电) */
    private String coefficientElectronic;
    /** 复杂系数(热) */
    private String coefficientHot;
    

    /** 供应商名称 */
    private String supplierName;
    /** 供应商电话 */
    private String supplierTel;
    /** 购置时间 */
    private Date buyDate;
    /** 保修期至 */
    private Date repairServiceEndTime;
    
    
    /** 生产厂家 */
    private String factory;
    /** 出厂编号 */
    private String factorySn;
    /** 出厂价 */
    private BigDecimal factoryPrice;
    /** 出厂日期 */
    private Date productionDate;
    
    
    /** 运杂费 */
    private BigDecimal transportFee;
    /** 安装费 */
    private BigDecimal installFee;
    /** 折旧费 */
    private BigDecimal depreciationFee;

    /** 是否已删除 */
    private String isDeleted;
    
    /** 设备购置信息 */
    private TEqBuyEntity eqBuy;
    /** 供应商信息 */
    private TEqSupplierEntity supplier;
    /** 设备检校参数(项目) */
    private List<TEqCheckItemEntity> TEqCheckItems;
    


    @Column(name = "name", nullable = false, length = 200)
    public String getName() {
        return this.name;
    }
    public void setName(String name) {
        this.name = name;
    }

    @Column(name = "equipment_sn", length = 200)
    public String getEquipmentSn() {
        return this.equipmentSn;
    }
    public void setEquipmentSn(String equipmentSn) {
        this.equipmentSn = equipmentSn;
    }

    @Column(name = "archive_sn", length = 200)
    public String getArchiveSn() {
        return this.archiveSn;
    }
    public void setArchiveSn(String archiveSn) {
        this.archiveSn = archiveSn;
    }

    @Column(name = "asset_sn", length = 200)
    public String getAssetSn() {
        return this.assetSn;
    }
    public void setAssetSn(String assetSn) {
        this.assetSn = assetSn;
    }

    @Column(name = "test_manage_sn", length = 200)
    public String getTestManageSn() {
        return this.testManageSn;
    }
    public void setTestManageSn(String testManageSn) {
        this.testManageSn = testManageSn;
    }

    @Column(name = "standard", length = 200)
    public String getStandard() {
        return this.standard;
    }
    public void setStandard(String standard) {
        this.standard = standard;
    }

    @Column(name = "eq_range", length = 500)
    public String getEqRange() {
        return this.eqRange;
    }
    public void setEqRange(String eqRange) {
        this.eqRange = eqRange;
    }

    @Column(name = "accuracy", length = 200)
    public String getAccuracy() {
        return this.accuracy;
    }
    public void setAccuracy(String accuracy) {
        this.accuracy = accuracy;
    }

    @Column(name = "size", length = 200)
    public String getSize() {
        return this.size;
    }
    public void setSize(String size) {
        this.size = size;
    }

    @Column(name = "keeper_id", length = 36)
    public String getKeeperId() {
        return this.keeperId;
    }
    public void setKeeperId(String keeperId) {
        this.keeperId = keeperId;
    }

    @Column(name = "keeper_name")
    public String getKeeperName() {
        return keeperName;
    }
    public void setKeeperName(String keeperName) {
        this.keeperName = keeperName;
    }

    @Column(name = "user_id", length = 36)
    public String getUserId() {
        return this.userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }

    @Column(name = "user_name")
    public String getUserName() {
        return userName;
    }
    public void setUserName(String userName) {
        this.userName = userName;
    }

    @Column(name = "unit_name", length = 200)
    public String getUnitName() {
        return this.unitName;
    }
    public void setUnitName(String unitName) {
        this.unitName = unitName;
    }

    @Column(name = "depart_id", nullable = false, length = 36)
    public String getDepartId() {
        return this.departId;
    }
    public void setDepartId(String departId) {
        this.departId = departId;
    }

    @Column(name = "storage_site", length = 200)
    public String getStorageSite() {
        return this.storageSite;
    }
    public void setStorageSite(String storageSite) {
        this.storageSite = storageSite;
    }

    @Column(name = "status", nullable = false, length = 10)
    public String getStatus() {
        return this.status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    @Column(name = "rent_status")
    public String getRentStatus() {
        return rentStatus;
    }
    public void setRentStatus(String rentStatus) {
        this.rentStatus = rentStatus;
    }

    @Column(name = "type", nullable = false, length = 10)
    public String getType() {
        return this.type;
    }
    public void setType(String type) {
        this.type = type;
    }

    @Column(name = "manage_type")
    public String getManageType() {
        return manageType;
    }
    public void setManageType(String manageType) {
        this.manageType = manageType;
    }
    
    @Column(name = "check_type", length = 10)
    public String getCheckType() {
        return this.checkType;
    }
    public void setCheckType(String checkType) {
        this.checkType = checkType;
    }

    @Column(name = "check_period")
    public Integer getCheckPeriod() {
        return this.checkPeriod;
    }
    public void setCheckPeriod(Integer checkPeriod) {
        this.checkPeriod = checkPeriod;
    }

    @Column(name = "check_period_unit", length = 10)
    public String getCheckPeriodUnit() {
        return this.checkPeriodUnit;
    }
    public void setCheckPeriodUnit(String checkPeriodUnit) {
        this.checkPeriodUnit = checkPeriodUnit;
    }

    @Column(name = "pre_check_date", length = 19)
    public Date getPreCheckDate() {
        return this.preCheckDate;
    }
    public void setPreCheckDate(Date preCheckDate) {
        this.preCheckDate = preCheckDate;
    }

    @Column(name = "next_check_date", length = 19)
    public Date getNextCheckDate() {
        return this.nextCheckDate;
    }
    public void setNextCheckDate(Date nextCheckDate) {
        this.nextCheckDate = nextCheckDate;
    }

    @Column(name = "quantity", length = 200)
    public String getQuantity() {
        return this.quantity;
    }
    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }

    @Column(name = "net_value", length = 200)
    public String getNetValue() {
        return this.netValue;
    }
    public void setNetValue(String netValue) {
        this.netValue = netValue;
    }

    @Column(name = "power", length = 200)
    public String getPower() {
        return this.power;
    }
    public void setPower(String power) {
        this.power = power;
    }

    @Column(name = "coefficient_machine", length = 1000)
    public String getCoefficientMachine() {
        return this.coefficientMachine;
    }
    public void setCoefficientMachine(String coefficientMachine) {
        this.coefficientMachine = coefficientMachine;
    }

    @Column(name = "coefficient_electronic", length = 1000)
    public String getCoefficientElectronic() {
        return this.coefficientElectronic;
    }
    public void setCoefficientElectronic(String coefficientElectronic) {
        this.coefficientElectronic = coefficientElectronic;
    }

    @Column(name = "coefficient_hot", length = 1000)
    public String getCoefficientHot() {
        return this.coefficientHot;
    }
    public void setCoefficientHot(String coefficientHot) {
        this.coefficientHot = coefficientHot;
    }

    @Column(name = "supplier_name", length = 200)
    public String getSupplierName() {
        return this.supplierName;
    }
    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    @Column(name = "supplier_tel", length = 20)
    public String getSupplierTel() {
        return this.supplierTel;
    }
    public void setSupplierTel(String supplierTel) {
        this.supplierTel = supplierTel;
    }

    @Column(name = "buy_date", length = 19)
    public Date getBuyDate() {
        return this.buyDate;
    }
    public void setBuyDate(Date buyDate) {
        this.buyDate = buyDate;
    }

    @Column(name = "repair_service_end_time", length = 19)
    public Date getRepairServiceEndTime() {
        return this.repairServiceEndTime;
    }
    public void setRepairServiceEndTime(Date repairServiceEndTime) {
        this.repairServiceEndTime = repairServiceEndTime;
    }

    @Column(name = "factory", length = 200)
    public String getFactory() {
        return this.factory;
    }
    public void setFactory(String factory) {
        this.factory = factory;
    }

    @Column(name = "factory_sn", length = 200)
    public String getFactorySn() {
        return this.factorySn;
    }
    public void setFactorySn(String factorySn) {
        this.factorySn = factorySn;
    }

    @Column(name = "factory_price", precision = 22, scale = 0)
    public BigDecimal getFactoryPrice() {
        return this.factoryPrice;
    }
    public void setFactoryPrice(BigDecimal factoryPrice) {
        this.factoryPrice = factoryPrice;
    }

    @Column(name = "production_date", length = 19)
    public Date getProductionDate() {
        return this.productionDate;
    }
    public void setProductionDate(Date productionDate) {
        this.productionDate = productionDate;
    }

    @Column(name = "transport_fee", precision = 22, scale = 0)
    public BigDecimal getTransportFee() {
        return this.transportFee;
    }
    public void setTransportFee(BigDecimal transportFee) {
        this.transportFee = transportFee;
    }

    @Column(name = "install_fee", precision = 22, scale = 0)
    public BigDecimal getInstallFee() {
        return this.installFee;
    }
    public void setInstallFee(BigDecimal installFee) {
        this.installFee = installFee;
    }

    @Column(name = "depreciation_fee", precision = 22, scale = 0)
    public BigDecimal getDepreciationFee() {
        return this.depreciationFee;
    }
    public void setDepreciationFee(BigDecimal depreciationFee) {
        this.depreciationFee = depreciationFee;
    }

    @Column(name = "is_deleted")
    public String getIsDeleted() {
        return isDeleted;
    }
    public void setIsDeleted(String isDeleted) {
        this.isDeleted = isDeleted;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buy_id")
    public TEqBuyEntity getTEqBuy() {
        return this.eqBuy;
    }
    public void setTEqBuy(TEqBuyEntity TEqBuy) {
        this.eqBuy = TEqBuy;
    }
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    public TEqSupplierEntity getTEqSupplier() {
        return this.supplier;
    }
    public void setTEqSupplier(TEqSupplierEntity TEqSupplier) {
        this.supplier = TEqSupplier;
    }

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "TSEquipment")
    public List<TEqCheckItemEntity> getTEqCheckItems() {
        return this.TEqCheckItems;
    }
    public void setTEqCheckItems(List<TEqCheckItemEntity> TEqCheckItems) {
        this.TEqCheckItems = TEqCheckItems;
    }
}
