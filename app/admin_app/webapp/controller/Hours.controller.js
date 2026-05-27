sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, History, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.nbx.adminapp.controller.Hours", {
        onInit: function () {
            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteHours").attachPatternMatched(this.onRouteMatched, this);

            this.preselectCurrentTime();
        },

        onRouteMatched: function () {
            this.onTimeFilterChange();
        },

        preselectCurrentTime: function () {
            let oToday = new Date(),
                sCurrentYear = oToday.getFullYear().toString(),
                sCurrentMonth = String(oToday.getMonth() + 1).padStart(2, '0');

            this.byId("selectYear").setSelectedKey(sCurrentYear);
            this.byId("sbMonth").setSelectedKey(sCurrentMonth);
        },

        onTimeFilterChange: function () {
            let sYear = this.byId("selectYear").getSelectedKey(),
                sMonth = this.byId("sbMonth").getSelectedKey(),
                oTable = this.byId("hoursAuditTable"),
                oBinding = oTable.getBinding("items");

            if (!oBinding) { return; }

            let aFilters = [];

            aFilters.push(new Filter("status_ID", FilterOperator.NE, "N"));

            if (sYear && sMonth) {
                // Year-Month-01T00:00:00Z
                let sStartDate = `${sYear}-${sMonth}-01`,
                    iNextMonth = parseInt(sMonth, 10),
                    oLastDay = new Date(parseInt(sYear, 10), iNextMonth, 0),
                    sEndDate = `${sYear}-${sMonth}-${String(oLastDay.getDate()).padStart(2, '0')}`,
                    oTimeFilter = new Filter("imputationDate", FilterOperator.BT, sStartDate, sEndDate);
                aFilters.push(oTimeFilter);
            }

            oBinding.filter(new Filter({
                filters: aFilters,
                and: true
            }), sap.ui.model.FilterType.Application);
        },

        onSaveAuditPress: function () {
            let oModel = this.getView().getModel();

            if (oModel.hasPendingChanges("auditGroup")) { 
                
                oModel.submitBatch("auditGroup").then(() => {
                    if (oModel.hasPendingChanges("auditGroup")) {
                        let oMessageManager = sap.ui.getCore().getMessageManager(),
                            aMessages = oMessageManager.getMessageModel().getData(),
                            aErrors = aMessages.filter(m => m.type === "Error"),
                            sErrorMsg = this._o18n.getText("serverDefaultError");

                        if (aErrors.length > 0) {
                            sErrorMsg = aErrors[aErrors.length - 1].message;
                        }
                        MessageBox.error(this._o18n.getText("hoursAuditUpdateConsoleError") + " " + sErrorMsg);
                    } else {
                        sap.ui.getCore().getMessageManager().removeAllMessages();
                        MessageToast.show(this._o18n.getText("hoursAuditUpdateSuccess"));
                        this.onTimeFilterChange();
                    }
                }).catch((oError) => {
                    MessageBox.error(this._o18n.getText("hoursAuditUpdateError"));
                });
            } else {
                MessageToast.show(this._o18n.getText("hoursAuditNoChanges"));
            }
        },

        onNavBack: function () {
            let oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash(),
                oModel = this.getView().getModel();

            if (oModel.hasPendingChanges("auditGroup")) {
                oModel.resetChanges("auditGroup");
            }
            sap.ui.getCore().getMessageManager().removeAllMessages();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteMain", {}, true);
            }
        }
    });
});