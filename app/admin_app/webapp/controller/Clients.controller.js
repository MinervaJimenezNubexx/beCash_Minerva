sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, History, MessageBox, MessageToast, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.nbx.adminapp.controller.Clients", {
        onInit: function () {
            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteClients").attachPatternMatched(this.onRouteMatched, this);
        },

        onRouteMatched: function () {
            const oTable = this.byId("clientsTable");
            if (oTable) {
                const oBinding = oTable.getBinding("items");
                if (oBinding) {
                    oBinding.refresh();
                }
            }
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

        onClientPress: function (oEvent) {
            let oItem = oEvent.getSource(),
                oContext = oItem.getBindingContext(),
                sClientId = oContext.getProperty("ID");

            this.getOwnerComponent().getRouter().navTo("RouteClientDetail", {
                clientId: sClientId
            });
        },

        onDeactivatePress: function () {
            let oTable = this.byId("clientsTable"),
                oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning(this._o18n.getText("selectClientWarning"));
                return;
            }

            let oContext = oSelectedItem.getBindingContext(),
                oModel = this.getView().getModel(),
                oAction = oModel.bindContext("AdminsService.deactivateClients(...)", oContext);

            oAction.execute().then(() => {
                MessageToast.show(this._o18n.getText("clientDeactivatedSuccess"));
                oContext.requestSideEffects([
                    { $PropertyPath: "isActive" }
                ]);
                oTable.removeSelections(true);
            }).catch((oError) => {
                MessageBox.error(this._o18n.getText("clientDeactivatedError"));
                console.error(oError);
            });
        },

        onActivatePress: function () {
            let oTable = this.byId("clientsTable"),
                oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning(this._o18n.getText("selectClientWarning"));
                return;
            }

            let oContext = oSelectedItem.getBindingContext(),
                oModel = this.getView().getModel(),
                oAction = oModel.bindContext("AdminsService.activateClients(...)", oContext);

            oAction.execute().then(() => {
                MessageToast.show(this._o18n.getText("clientActivatedSuccess"));
                oContext.requestSideEffects([
                    { $PropertyPath: "isActive" }
                ]);
                oTable.removeSelections(true);
            }).catch((oError) => {
                MessageBox.error(this._o18n.getText("clientActivatedError"));
                console.error(oError);
            });
        },

        onSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue"),
                aFilters = [];

            if (sQuery && sQuery.length > 0) {
                const oFilterName = new Filter("name", FilterOperator.Contains, sQuery),
                      oFilterEmail = new Filter("email", FilterOperator.Contains, sQuery),
                      oFilterNif = new Filter("nif", FilterOperator.Contains, sQuery),
                      oCombinedFilter = new Filter({
                          filters: [oFilterName, oFilterEmail, oFilterNif],
                          and: false
                      });

                aFilters.push(oCombinedFilter);
            }

            const oTable = this.byId("clientsTable"),
                oBinding = oTable.getBinding("items");

            oBinding.filter(aFilters, sap.ui.model.FilterType.Application);
        },

        onCreatePress: function (oEvent) {
            let oView = this.getView();

            if (!this.oCreateDialog) {
                sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "com.nbx.adminapp.view.fragment.CreateClientDialog", 
                    controller: this
                }).then((oDialog) => {
                    this.oCreateDialog = oDialog;
                    oView.addDependent(this.oCreateDialog);
                    this.oCreateDialog.open();
                });
            } else {
                this.oCreateDialog.open();
            }
        },

        closeAndClearDialog: function () {
            this.oCreateDialog.close();
            this.byId("inputClientNameID").setValue("");
            this.byId("inputClientEmailID").setValue("");
            this.byId("inputClientNifID").setValue(""); 
        },

        onCancelCreateClient: function () {
            this.closeAndClearDialog();
        },

        onSaveNewClient: function () {
            let sName = this.byId("inputClientNameID").getValue(),
                sEmail = this.byId("inputClientEmailID").getValue(),
                sNif = this.byId("inputClientNifID").getValue();
                
            if (!sName || !sEmail || !sNif) {
                MessageBox.warning(this._o18n.getText("fillRequiredFieldsWarning"));
                return;
            }

            let oTable = this.byId("clientsTable"),
                  oBinding = oTable.getBinding("items"),
                  oModel = this.getView().getModel(),
                  oNewClientData = {
                      name: sName,
                      email: sEmail,
                      nif: sNif,
                      isActive: true
                  };

            if (oModel.hasPendingChanges()) {
                oModel.resetChanges();
            }

            oBinding.attachEventOnce("createCompleted", (oEvent) => {
                let bSuccess = oEvent.getParameter("success");
                if (bSuccess) {
                    MessageToast.show(this._o18n.getText("clientCreatedSuccess"));
                    this.closeAndClearDialog();
                } else {
                    setTimeout(() => {
                        let oMessageManager = sap.ui.getCore().getMessageManager(),
                            aMessages = oMessageManager.getMessageModel().getData(),
                            sBackendError = this._o18n.getText("serverDefaultError");
                        
                        if (aMessages && aMessages.length > 0) {
                            sBackendError = aMessages[aMessages.length - 1].message;
                            oMessageManager.removeAllMessages();
                        }
                        if (oModel.hasPendingChanges()) {
                            oModel.resetChanges();
                        }
                        MessageBox.error(this._o18n.getText("clientCreateConsoleError") + " " + sBackendError);
                    }, 0);
                }
            });

            oBinding.create(oNewClientData);
        }
    });
});