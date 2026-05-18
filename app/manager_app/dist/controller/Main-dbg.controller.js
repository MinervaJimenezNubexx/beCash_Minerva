sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
], function (Controller, UIComponent, MessageToast, Fragment, MessageBox) {
    "use strict";

    return Controller.extend("com.nbx.managerapp.controller.Main", {

        onInit: function () {
            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onPressProject: function (oEvent) {
            let oItem = oEvent.getSource(),
                oContext = oItem.getBindingContext(),
                sProjectId = oContext.getProperty("ID"),
                oRouter = UIComponent.getRouterFor(this);

            oRouter.navTo("RouteProjectDetail", { projectId: sProjectId });
        },

        onCreateProject: function () {
            let oView = this.getView();

            if (!this.oCreateProjectDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.nbx.managerapp.view.fragment.CreateProjectDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.oCreateProjectDialog = oDialog;
                    oView.addDependent(this.oCreateProjectDialog);
                    this.oCreateProjectDialog.open();
                }.bind(this));
            } else {
                this.oCreateProjectDialog.open();
            }
        },

        onSaveNewProject: function () {
            let sName = this.byId("newProjName").getValue(),
                sClient = this.byId("newProjClient").getSelectedKey(),
                sBudget = this.byId("newProjBudget").getValue();

            if (!sName || !sClient || !sBudget) {
                MessageBox.warning(this._o18n.getText('fillAllRequiredToCreateProject'));
                return;
            }

            let oModel = this.getView().getModel(),
                oListBinding = oModel.bindList("/Projects");

            oListBinding.attachEventOnce("createCompleted", function (oEvent) {
                let bSuccess = oEvent.getParameter("success"),
                    oCreatedContext = oEvent.getParameter("context");

                if (bSuccess) {
                    MessageToast.show(this._o18n.getText('ProjectCreated'));
                    this.onCancelNewProject();
                    this.byId("projectsTable").getBinding("items").refresh();
                } else {
                    let aMsgs = sap.ui.getCore().getMessageManager().getMessageModel().getData(),
                        sErrorMsg = this._o18n.getText('defaulErrorOnNewProject'),
                        oLastError = aMsgs[aMsgs.length - 1];

                    if (oLastError && oLastError.message) {
                        sErrorMsg = oLastError.message;
                    }

                    sap.m.MessageBox.error(this._o18n.getText('OnCreateNewProjectError') + "\n" + sErrorMsg);
                    oCreatedContext.delete();
                }
            }, this);

            oListBinding.create({
                name: sName,
                client_ID: sClient,
                status_ID: "O",
                initialBudget: parseFloat(sBudget)
            });
        },

        onCancelNewProject: function () {
            if (this.oCreateProjectDialog) {
                this.oCreateProjectDialog.close();
            }

            this.byId("newProjName").setValue("");
            this.byId("newProjBudget").setValue("");
        }

    });
});