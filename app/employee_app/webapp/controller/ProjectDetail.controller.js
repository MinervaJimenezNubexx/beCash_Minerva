sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent"
], (Controller, History, UIComponent) => {
    "use strict";

    return Controller.extend("com.nbx.employeeapp.controller.ProjectDetail", {
        onInit() {
            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            let oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteProjectDetail").attachPatternMatched(this.onObjectMatched, this);
        },

        onNavBack: function () {
            let oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain", {}, true);
            }
        },

        onObjectMatched: function (oEvent) {
            let sProjectId = oEvent.getParameter("arguments").projectId;
            if (!sProjectId) return;
            this.sCurrentProjectId = sProjectId;

            this.getView().bindElement({
                path: "/Projects(" + sProjectId + ")",
                parameters: {
                    "$expand": "status,client,managerOnCharge"
                }
            });

            let oSummaryTable = this.byId("idHoursSummaryTable"),
                oSummaryBinding = oSummaryTable.getBinding("items");

            if (oSummaryBinding) {
                oSummaryBinding.filter(new sap.ui.model.Filter("projectID", "EQ", sProjectId));
            }

            let oMonthSelect = this.byId("idMonthSelect"),
                sCurrentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            oMonthSelect.setSelectedKey(sCurrentMonth);

            this.applyMonthFilter();
        },

        onMonthChange: function (oEvent) {
            this.applyMonthFilter();
        },

        applyMonthFilter: function () {
            let oTable = this.byId("idMonthlyTable"),
                oBinding = oTable.getBinding("items");

            if (!oBinding || !this.sCurrentProjectId) return;

            let sSelectedMonth = this.byId("idMonthSelect").getSelectedKey(),
                actualYear = new Date().getFullYear(),
                startDate = `${actualYear}-${sSelectedMonth}-01`,
                lastDay = new Date(actualYear, parseInt(sSelectedMonth), 0).getDate(),
                endDate = `${actualYear}-${sSelectedMonth}-${lastDay}`,
                aFilters = [
                    new sap.ui.model.Filter("project_ID", sap.ui.model.FilterOperator.EQ, this.sCurrentProjectId),
                    new sap.ui.model.Filter({
                        path: "imputationDate",
                        operator: sap.ui.model.FilterOperator.BT,
                        value1: startDate,
                        value2: endDate
                    })
                ];

            oBinding.filter(aFilters);
        }

    });
});