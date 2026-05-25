sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.nbx.adminapp.controller.Main", {
        onInit() {
        },

        onNavToEmployees: function () {
            this.getOwnerComponent().getRouter().navTo("RouteEmployees");
        },

        onNavToClients: function () {
            this.getOwnerComponent().getRouter().navTo("RouteClients");
        },

        onNavToHours: function () {
            this.getOwnerComponent().getRouter().navTo("RouteHours");
        },

        onNavToSettings: function () {
            this.getOwnerComponent().getRouter().navTo("RouteSettings");
        }
    });
});