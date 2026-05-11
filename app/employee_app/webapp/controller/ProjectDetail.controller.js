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

            this.getView().bindElement({
                path: "/Projects(" + sProjectId + ")",
                parameters: {
                    "$expand": "status,client,managerOnCharge"
                }
            });
        }

    });
});