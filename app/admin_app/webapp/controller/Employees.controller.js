sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, History, MessageBox, MessageToast, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.nbx.adminapp.controller.Employees", {
        onInit: function () {
            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onNavBack: function () {
            let oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteMain", {}, true);
            }
        },

        onEmployeePress: function (oEvent) {
            let oItem = oEvent.getSource(),
                oContext = oItem.getBindingContext(),
                sEmployeeId = oContext.getProperty("ID");

            this.getOwnerComponent().getRouter().navTo("RouteEmployeeDetail", {
                employeeId: sEmployeeId
            });
        },

        onDeactivatePress: function () {
            let oTable = this.byId("employeesTable"),
                oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning(this._o18n.getText("selectEmployeeWarning"));
                return;
            }

            let oContext = oSelectedItem.getBindingContext(),
                oModel = this.getView().getModel(),
                oAction = oModel.bindContext("AdminsService.deactivateEmployees(...)", oContext);

            oAction.execute().then(() => {
                MessageToast.show(this._o18n.getText("employeeDeactivatedSuccess"));
                oContext.requestSideEffects([
                    { $PropertyPath: "isActive" }
                ]);
                oTable.removeSelections(true);
            }).catch((oError) => {
                MessageBox.error(this._o18n.getText("employeeDeactivatedError"));
                console.error(oError);
            });
        },

        onActivatePress: function () {
            let oTable = this.byId("employeesTable"),
                oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning(this._o18n.getText("selectEmployeeWarning"));
                return;
            }

            let oContext = oSelectedItem.getBindingContext(),
                oModel = this.getView().getModel(),
                oAction = oModel.bindContext("AdminsService.activateEmployees(...)", oContext);

            oAction.execute().then(() => {
                MessageToast.show(this._o18n.getText("employeeActivatedSuccess"));
                oContext.requestSideEffects([
                    { $PropertyPath: "isActive" }
                ]);
                oTable.removeSelections(true);
            }).catch((oError) => {
                MessageBox.error(this._o18n.getText("employeeActivatedError"));
                console.error(oError);
            });
        },

        onSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue"),
                aFilters = [];

            if (sQuery && sQuery.length > 0) {
                const oFilterName = new Filter("employeeName", FilterOperator.Contains, sQuery),
                    oFilterEmail = new Filter("email", FilterOperator.Contains, sQuery),
                    oCombinedFilter = new Filter({
                        filters: [oFilterName, oFilterEmail],
                        and: false
                    });

                aFilters.push(oCombinedFilter);
            }

            const oTable = this.byId("employeesTable"),
                oBinding = oTable.getBinding("items");

            oBinding.filter(aFilters, sap.ui.model.FilterType.Application);
        },

        onCreatePress: function (oEvent) {
            
        }

    });
});