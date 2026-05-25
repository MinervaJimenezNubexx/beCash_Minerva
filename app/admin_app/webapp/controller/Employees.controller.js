sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, History, MessageBox, MessageToast) {
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
        }

    });
});