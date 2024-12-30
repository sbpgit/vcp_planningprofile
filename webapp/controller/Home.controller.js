sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent"
 
], (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox,UIComponent) => {
    "use strict";
    var oGModel, that;
 
    return Controller.extend("vcpapp.vcpplanningprofile.controller.Home", {
        onInit() {
            that = this;
 
           
        },
        onAfterRendering: function () {
            // oGModel = that.getOwnerComponent().getModel("oGModel");
            // that.TplanningPro = oGModel.getProperty("/planningData");
            // if(that.TplanningPro === undefined){
                that.TplanningPro = [];
            // }
            that.getOwnerComponent().getModel("PModel").read("/getPlanningProfile", {
                success: function (oData) {
 
                // if(that.TplanningPro === undefined){
                //     that.TplanningPro = [];
                // }
                that.TplanningPro = oData.results;
                that.PlanprofileModel = new JSONModel();
                    that.PlanprofileModel.setData({
                        PlanningProfiles: that.TplanningPro
                    });
                 that.byId("idPlanProfile").setModel(that.PlanprofileModel);
                },
                error:function(){

                }
 
            });
 
        },
 
        oHomesearch:function(oEvent){
 
            var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                oFilters = [];
            // Check if search filter is to be applied
            sQuery = sQuery ? sQuery.trim() : "";
 
         
                if (sQuery !== "") {
                    oFilters.push(
                        new Filter({
                            filters: [
                                new Filter("CLUSTERING_PROFILE", FilterOperator.Contains, sQuery),
                                new Filter( "PLANNING_PROFILE", FilterOperator.Contains, sQuery
                                ),
                            ],
                            and: false,
                        })
                    );
 
                   
                }
 
                that.byId("idPlanProfile").getBinding("items").filter(oFilters);
 
        },
 
        onBack:function(){
            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
            oRouter.navTo("Home", {}, true);
 
        },
 
 
        onAddtData: function(){
 
            that.obj = {
                CLUSTERING_PROFILE:"",
                    PLANNING_PROFILE:"",
                    MIMIMUM_PRIMARY_IDS:"",
                    MINIMUM_CLUSTERS:"",
                    MAXIMUM_CLUSTERS:"",
                    PERCENTAGE:"",
                    PAST_PERIODS:"",
                    FUTURE_PERIODS:"",
                    THRESHOLD_DMD:"",
                    EDITED : "X",
                    NEW : "X"
            }
 
                 var aData = that.PlanprofileModel.getData().PlanningProfiles;
            // Add entry to the table model
            aData.push(Object.assign({}, that.obj));
            that.PlanprofileModel.setData({
                PlanningProfiles: aData
            });
 
        },
 
        onResetData:function(){
            that.onAfterRendering();
        },
 
        onInputChange:function(oEvent){
 
            var sId = oEvent.getParameter("id");
            var oIndex = parseInt(oEvent.getParameters().id.split("idPlanProfile-")[1]),
                aData = that.PlanprofileModel.getData().PlanningProfiles;
 
                if(sId.includes("idClust")){
                    aData[oIndex].CLUSTERING_PROFILE = oEvent.getParameters().newValue;
                } else if(sId.includes("idProfilePlan")){
                    aData[oIndex].PLANNING_PROFILE = oEvent.getParameters().newValue;
                } else if(sId.includes("idMPID")){
                    aData[oIndex].MIMIMUM_PRIMARY_IDS = parseInt(oEvent.getParameters().newValue);
                } else if(sId.includes("idMinClut")){
                    aData[oIndex].MINIMUM_CLUSTERS = parseInt(oEvent.getParameters().newValue);
                } else if(sId.includes("idMaxClus")){
                    aData[oIndex].MAXIMUM_CLUSTERS = parseInt(oEvent.getParameters().newValue);
                } else if(sId.includes("idPerce")){
                    aData[oIndex].PERCENTAGE = parseInt(oEvent.getParameters().newValue);
                } else if(sId.includes("idPastP")){
                    aData[oIndex].PAST_PERIODS = parseInt(oEvent.getParameters().newValue);
                } else if(sId.includes("idFutu")){
                    aData[oIndex].FUTURE_PERIODS = parseInt(oEvent.getParameters().newValue);
                } else if(sId.includes("idThres")){
                    aData[oIndex].THRESHOLD_DMD = parseInt(oEvent.getParameters().newValue);
                }
 
                aData[oIndex].EDITED = "X";
 
                that.PlanprofileModel.refresh();
 
 
 
        },
 
        deletePlanningProfiles: function (oEvent) {
 
            // Getting the index of item which need to delete
            var oIndex = oEvent.getParameter("listItem").getBindingContext().sPath.split("/")[2],
                aData = that.PlanprofileModel.getData().PlanningProfiles;
 
                if(aData[oIndex].NEW === "X"){
                        //removing record from table of index.
                        aData.splice(oIndex, 1);
                        that.PlanprofileModel.refresh();
                } else {
                        var text = "Do you want to delete ?";
                    sap.m.MessageBox.show(
                        text, {
                            title: "! Confirmation",
                            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                            onClose: function (oAction) {
                                if (oAction === sap.m.MessageBox.Action.YES) {
                                    // //removing record from table of index.
                                    // aData.splice(oIndex, 1);
                                    // that.PlanprofileModel.refresh();
 
                                    var delData = [{
                                        PLANNING_PROFILE : aData[oIndex].PLANNING_PROFILE
                                    }]
                                    sap.ui.core.BusyIndicator.show();
                                    that.getOwnerComponent().getModel("PModel").callFunction("/fhandlePlanningProfiles", {
                                        method: "GET",
                                        urlParameters: {
                                            cudType : "DELETE",
                                            profilesList: JSON.stringify(delData)
                                        },
                                        success: function (oData) {
                                            sap.ui.core.BusyIndicator.hide();                    
                                            MessageToast.show("Successfully created/updated the Planning Profiles");
                                            that.RefreshProfiles();
                                        },
                                        error: function (oData) {
                                            MessageToast.show("Failed to create /update the Planning Profiles");
                                            sap.ui.core.BusyIndicator.hide();
                                        },
                                    });
                                }
 
                            }
                        }
                    );
 
                 }
 
        },
 
        onPlanningProfileSave:function(oEvent){
 
            var aData = that.PlanprofileModel.getData().PlanningProfiles,
                table = that.byId("idPlanProfile").getItems(),
                iCount = 0;
                var changedData = [];
 
            // Validating table rows
            for (var i = 0; i < aData.length; i++) {
                if(aData[i].EDITED === "X"){
                    if(aData[i].CLUSTERING_PROFILE === "" || aData[i].PLANNING_PROFILE === "" || aData[i].MIMIMUM_PRIMARY_IDS <= 0 ||
                        aData[i].MINIMUM_CLUSTERS <= 0 || aData[i].MAXIMUM_CLUSTERS <= 0 || aData[i].PERCENTAGE <= 0 ||
                        aData[i].PAST_PERIODS <= 0 || aData[i].FUTURE_PERIODS <= 0 || aData[i].THRESHOLD_DMD <= 0 ){
                            // if any value is empty then changing the value of iCount
                            iCount = 1;
                            changedData=[];
                            break;
                    }
                    if(iCount === 0){
                        var tempObj = {
                            CLUSTERING_PROFILE:aData[i].CLUSTERING_PROFILE,
                            PLANNING_PROFILE: aData[i].PLANNING_PROFILE ,
                            MIMIMUM_PRIMARY_IDS: aData[i].MIMIMUM_PRIMARY_IDS ,
                            MINIMUM_CLUSTERS: aData[i].MINIMUM_CLUSTERS ,
                            MAXIMUM_CLUSTERS: aData[i].MAXIMUM_CLUSTERS ,
                            PERCENTAGE: aData[i].PERCENTAGE ,
                            PAST_PERIODS: aData[i].PAST_PERIODS ,
                            FUTURE_PERIODS: aData[i].FUTURE_PERIODS ,
                            THRESHOLD_DMD: aData[i].THRESHOLD_DMD
                        }
                        changedData.push(tempObj);
                    }
                }
            }
 
            if(iCount === 0){
 
                sap.ui.core.BusyIndicator.show();
            that.getOwnerComponent().getModel("PModel").callFunction("/fhandlePlanningProfiles", {
                method: "GET",
                urlParameters: {
                    cudType : "CREATE",
                    profilesList: JSON.stringify(changedData)
                },
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();                    
                    MessageToast.show("Successfully created/updated the Planning Profiles");
                    that.RefreshProfiles();
                },
                error: function (oData) {
                    MessageToast.show("Failed to create /update the Planning Profiles");
                    sap.ui.core.BusyIndicator.hide();
                },
            });
 
            }
 
 
 
        },
 
        RefreshProfiles: function(){
            that.getOwnerComponent().getModel("PModel").read("/getPlanningProfile", {
                success: function (oData) {
 
                    that.PlanningData.forEach(oItem => {
                        oItem.TYPE = "PP";
                        oItem.NEW = "";
 
                    });
                    that.PlanprofileModel = new JSONModel();
                    that.PlanprofileModel.setData({
                        PlanningProfiles: oData.results
                    });
                 that.byId("idPlanProfile").setModel(that.PlanprofileModel);
 
                },
                error: function (oData) {
                    MessageToast.show("Failed to create /update the Planning Profiles");
                    sap.ui.core.BusyIndicator.hide();
                }
            });
        },
 
       
           
 
 
 
 
 
 
 
 
 
 
 
 
 
 
    });
});