sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent"
], function (Controller, History, UIComponent) {
    "use strict";

    return Controller.extend("com.nbx.managerapp.controller.ProjectDetail", {

        onInit: function () {
            let oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteProjectDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            let sProjectId = oEvent.getParameter("arguments").projectId;
            
            this.getView().bindElement({
                path: "/Projects(" + sProjectId + ")"
            });

            let oObjHeader = this.byId("objHeader");
            oObjHeader.bindElement({
                path: "/ManagerProjectFinancesView(" + sProjectId + ")"
            });
        },

        onNavBack: function () {
            let oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                let oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain");
            }
        }

    });
});