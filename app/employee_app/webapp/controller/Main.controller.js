sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, UIComponent, MessageBox, MessageToast) => {
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

        onSendMonthlyHours: function () {
            MessageBox.confirm(this._o18n.getText("ConfirmSendHoursMsg"), {
                title: this._o18n.getText("ConfirmSendHoursTitle"),
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        this.executeSendHoursAction();
                    }
                }
            });
        },

        executeSendHoursAction: function () {
            let oModel = this.getView().getModel(),
                oActionContext = oModel.bindContext("/sendThisMonthHours(...)");


            this.getView().setBusy(true);
            oActionContext.execute().then(() => {
                this.getView().setBusy(false);
                MessageToast.show(this._o18n.getText("HoursSentSuccess"));
                oModel.refresh();

            }).catch((oError) => {
                this.getView().setBusy(false);
                MessageBox.error(oError.message || this._o18n.getText("ErrorSendingHours"));
            });
        }
    });
});