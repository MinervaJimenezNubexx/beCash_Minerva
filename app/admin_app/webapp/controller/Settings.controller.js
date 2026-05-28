sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, History, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.nbx.adminapp.controller.Settings", {
        onInit: function () {
            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            
            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteSettings").attachPatternMatched(this.onRouteMatched, this);
        },

        onRouteMatched: function () {
            this.byId("tableLogStatus").getBinding("items").refresh();
            this.byId("tableLogRejReason").getBinding("items").refresh();
            this.byId("tablePjStatus").getBinding("items").refresh();
            this.byId("tablePositions").getBinding("items").refresh();
        },

        onSaveSettingsPress: function () {
            let oModel = this.getView().getModel();

            if (oModel.hasPendingChanges("settingsGroup")) {
                oModel.submitBatch("settingsGroup").then(() => {
                    if (oModel.hasPendingChanges("settingsGroup")) {
                        let oMessageManager = sap.ui.getCore().getMessageManager(),
                            aMessages = oMessageManager.getMessageModel().getData(),
                            aErrors = aMessages.filter(m => m.type === "Error"),
                            sErrorMsg = this._o18n.getText("serverDefaultError");

                        if (aErrors.length > 0) {
                            sErrorMsg = aErrors[aErrors.length - 1].message;
                        }
                        MessageBox.error(this._o18n.getText("settingsUpdateConsoleError") + " " + sErrorMsg);
                    } else {
                        sap.ui.getCore().getMessageManager().removeAllMessages();
                        MessageToast.show(this._o18n.getText("settingsUpdateSuccess"));
                    }
                }).catch((oError) => {
                    MessageBox.error(this._o18n.getText("settingsUpdateError"));
                });
            } else {
                MessageToast.show(this._o18n.getText("settingsNoChanges"));
            }
        },

        onNavBack: function () {
            let oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash(),
                oModel = this.getView().getModel();

            if (oModel.hasPendingChanges("settingsGroup")) {
                oModel.resetChanges("settingsGroup");
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