sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast"
], function (Controller, UIComponent, MessageToast) {
    "use strict";

    return Controller.extend("com.nbx.managerapp.controller.Main", {

        onInit: function () {
        },

        onPressProject: function (oEvent) {
            let oItem = oEvent.getSource(),
                oContext = oItem.getBindingContext(),
                sProjectId = oContext.getProperty("ID"),
                oRouter = UIComponent.getRouterFor(this);

            oRouter.navTo("RouteProjectDetail", { projectId: sProjectId });
        },

        onCreateProject: function () {
            MessageToast.show("PENDING");
        }

    });
});