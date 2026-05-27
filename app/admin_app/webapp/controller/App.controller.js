sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox"
], (BaseController, MessageBox) => {
  "use strict";

  return BaseController.extend("com.nbx.adminapp.controller.App", {
      onInit: function () {
            let oApp = this.byId("app"),
                oComponent = this.getOwnerComponent(),
                oModel = this.getOwnerComponent().getModel();
            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            oModel.getMetaModel().requestObject("/").then(() => {
                oApp.setBusy(false);
                oComponent.getRouter().initialize();
                
            }).catch((oError) => {
                MessageBox.error(this._o18n.getText("accessDeniedOrConnectionError") + " " + oError);
                console.error(this._o18n.getText("accessDeniedOrConnectionError"), oError);
            });
        }
  });
});