sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, History, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.nbx.adminapp.controller.ClientDetail", {
        onInit: function () {
            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteClientDetail").attachPatternMatched(this.onObjectMatched, this);
        },

        onObjectMatched: function (oEvent) {
            let sClientId = oEvent.getParameter("arguments").clientId,
                oView = this.getView();

            oView.bindElement({
                path: `/Clients(${sClientId})`
            });
        },

        onSavePress: function () {
            let oModel = this.getView().getModel();

            if (oModel.hasPendingChanges()) {
                oModel.submitBatch(oModel.getUpdateGroupId()).then(() => {
                    if (oModel.hasPendingChanges()) {
                        let oMessageManager = sap.ui.getCore().getMessageManager(),
                            aMessages = oMessageManager.getMessageModel().getData(),
                            aErrors = aMessages.filter(m => m.type === "Error"),
                            sErrorMsg = this._o18n.getText("clientInvalidDataError");
                        if (aErrors.length > 0) {
                            sErrorMsg = aErrors[aErrors.length - 1].message;
                        }
                        MessageBox.error(this._o18n.getText("clientDataUpdateConsoleError") + " " + sErrorMsg);

                    } else {
                        sap.ui.getCore().getMessageManager().removeAllMessages();
                        MessageToast.show(this._o18n.getText("clientDataUpdateSuccess"));
                        setTimeout(() => {
                            this.onNavBack();
                        }, 500);
                    }
                }).catch((oError) => {
                    MessageBox.error(this._o18n.getText("clientDataUpdateError"));
                });
            } else {
                sap.ui.getCore().getMessageManager().removeAllMessages();
                MessageToast.show(this._o18n.getText("clientDataUpdateSuccess"));
                setTimeout(() => {
                    this.onNavBack();
                }, 500);
            }
        },

        onNavBack: function () {
            let oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteClients", {}, true);
            }
        }
    });
});