sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], (Controller, UIComponent) => {
    "use strict";

    return Controller.extend("com.nbx.employeeapp.controller.Main", {
        onInit() {
            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onPressProject: function (oEvent) {
            let oItem = oEvent.getSource(),
                oContext = oItem.getBindingContext(),
                sProjectId = oContext.getProperty("ID"),
                oRouter = UIComponent.getRouterFor(this);

            oRouter.navTo("RouteProjectDetail", { projectId: sProjectId });
        },


    });
});