sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, History, UIComponent, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("com.nbx.employeeapp.controller.ProjectDetail", {
        onInit() {
            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            let oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteProjectDetail").attachPatternMatched(this.onObjectMatched, this);
        },

        onNavBack: function () {
            let oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain", {}, true);
            }
        },

        onObjectMatched: function (oEvent) {
            let sProjectId = oEvent.getParameter("arguments").projectId;
            if (!sProjectId) return;
            this.sCurrentProjectId = sProjectId;

            this.getView().bindElement({
                path: "/Projects(" + sProjectId + ")",
                parameters: {
                    "$expand": "status,client,managerOnCharge"
                }
            });

            let oSummaryTable = this.byId("idHoursSummaryTable"),
                oSummaryBinding = oSummaryTable.getBinding("items");

            if (oSummaryBinding) {
                oSummaryBinding.filter(new sap.ui.model.Filter("projectID", "EQ", sProjectId));
            }

            let oMonthSelect = this.byId("idMonthSelect"),
                sCurrentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
            oMonthSelect.setSelectedKey(sCurrentMonth);

            this.applyMonthFilter();

            let oDraftsTable = this.byId("idDraftsTable"),
                oDraftsBinding = oDraftsTable ? oDraftsTable.getBinding("items") : null;

            if (oDraftsBinding) {
                oDraftsBinding.filter([
                    new sap.ui.model.Filter("project_ID", sap.ui.model.FilterOperator.EQ, sProjectId),
                    new sap.ui.model.Filter("status_ID", sap.ui.model.FilterOperator.EQ, "N")
                ]);
            }
        },

        onMonthChange: function (oEvent) {
            this.applyMonthFilter();
        },

        applyMonthFilter: function () {
            let oTable = this.byId("idMonthlyTable"),
                oBinding = oTable.getBinding("items");

            if (!oBinding || !this.sCurrentProjectId) return;

            let sSelectedMonth = this.byId("idMonthSelect").getSelectedKey(),
                actualYear = new Date().getFullYear(),
                startDate = `${actualYear}-${sSelectedMonth}-01`,
                lastDay = new Date(actualYear, parseInt(sSelectedMonth), 0).getDate(),
                endDate = `${actualYear}-${sSelectedMonth}-${lastDay}`,
                aFilters = [
                    new sap.ui.model.Filter("project_ID", sap.ui.model.FilterOperator.EQ, this.sCurrentProjectId),
                    new sap.ui.model.Filter({
                        path: "imputationDate",
                        operator: sap.ui.model.FilterOperator.BT,
                        value1: startDate,
                        value2: endDate
                    })
                ];

            oBinding.filter(aFilters);
        },

        onOpenLogDialog: function () {
            this.bIsEdit = false;

            if (!this.pDialog) {
                this.pDialog = this.loadFragment({
                    name: "com.nbx.employeeapp.view.fragment.LogHoursDialog"
                });
            }

            this.pDialog.then((oDialog) => {
                this.byId("idLogDate").setValue("");
                this.byId("idLogHours").setValue(8);
                oDialog.open();
            });
        },

        onEditDraft: function (oEvent) {
            this.bIsEdit = true;
            this.oEditContext = oEvent.getSource().getBindingContext();

            if (!this.pDialog) {
                this.pDialog = this.loadFragment({
                    name: "com.nbx.employeeapp.view.fragment.LogHoursDialog"
                });
            }

            this.pDialog.then((oDialog) => {
                this.byId("idLogDate").setValue(this.oEditContext.getProperty("imputationDate"));
                this.byId("idLogHours").setValue(this.oEditContext.getProperty("quantity"));
                oDialog.open();
            });
        },

        onDeleteDraft: function (oEvent) {
            let oContext = oEvent.getSource().getBindingContext();

            MessageBox.confirm(this._o18n.getText("ConfirmDeleteDraft"), {
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        oContext.delete().then(() => {
                            MessageToast.show(this._o18n.getText("DraftDeletedSucess"));
                            this.getView().getModel().refresh();
                        }).catch((oError) => {
                            let sErrorMsg = oError.message;
                            if (oError.error && oError.error.message) {
                                sErrorMsg = oError.error.message;
                            }
                            MessageBox.error(sErrorMsg);
                        });
                    }
                }
            });
        },

        onCloseLogDialog: function () {
            this.byId("idLogHoursDialog").close();
        },

        onSaveHours: function () {
            sap.ui.getCore().getMessageManager().removeAllMessages();

            let sDate = this.byId("idLogDate").getValue(),
                fHours = this.byId("idLogHours").getValue();

            if (!sDate) {
                MessageBox.error(this._o18n.getText("SelectDateError"));
                return;
            }

            this.getView().setBusy(true);
            let oModel = this.getView().getModel(),
                sGroupId = oModel.getUpdateGroupId();

            if (this.bIsEdit) {
                this.oEditContext.setProperty("imputationDate", sDate);
                this.oEditContext.setProperty("quantity", parseFloat(fHours));

                oModel.submitBatch(sGroupId).then(() => {
                    let aMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData(),
                        bHasErrors = aMessages.some(m => m.type === "Error");

                    if (bHasErrors || this.oEditContext.hasPendingChanges()) {
                        this.handleBackendError(this.oEditContext, false, "");
                    } else {
                        this.getView().setBusy(false);
                        MessageToast.show(this._o18n.getText("DraftUpdated"));
                        this.byId("idLogHoursDialog").close();
                        setTimeout(() => { oModel.refresh(); }, 500);
                    }
                }).catch(() => {
                    this.handleBackendError(this.oEditContext, false, "");
                });

            } else {
                let oListBinding = this.byId("idDraftsTable").getBinding("items"),
                    oContext = oListBinding.create({
                        imputationDate: sDate,
                        quantity: parseFloat(fHours),
                        project_ID: this.sCurrentProjectId
                    });

                oModel.submitBatch(sGroupId).then(() => {
                    let aMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData(),
                        bHasErrors = aMessages.some(m => m.type === "Error");

                    if (oContext.isTransient() || bHasErrors) {
                        this.handleBackendError(oContext, true, this._o18n.getText("HoursLoggedSuccess"));
                    } else {
                        this.getView().setBusy(false);
                        MessageToast.show(this._o18n.getText("HoursLoggedSuccess"));
                        this.byId("idLogHoursDialog").close();
                        setTimeout(() => { oModel.refresh(); }, 500);
                    }
                }).catch(() => {
                    this.handleBackendError(oContext, true, this._o18n.getText("HoursLoggedSuccess"));
                });
            }
        },

        handleBackendError: function (oContext, bIsCreate, sSuccessMsg) {
            setTimeout(() => {
                let aMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData(),
                    aErrors = aMessages.filter(m => m.type === "Error");

                if (bIsCreate && aErrors.length === 0) {
                    this.getView().setBusy(false);
                    MessageToast.show(sSuccessMsg);
                    this.byId("idLogHoursDialog").close();
                    setTimeout(() => {
                        this.getView().getModel().refresh();
                    }, 500);
                    return;
                }

                this.getView().setBusy(false);
                let sErrorMsg = this._o18n.getText("ValidationServerError"),
                    oRealMessage = aErrors.find(m =>
                        !m.message.includes("múltiples errores") &&
                        !m.message.includes("multiple errors")
                    );

                if (oRealMessage) {
                    sErrorMsg = oRealMessage.message;
                } else if (aErrors.length > 0) {
                    sErrorMsg = aErrors[aErrors.length - 1].message;
                } else if (aMessages.length > 0) {
                    sErrorMsg = aMessages[aMessages.length - 1].message;
                }

                MessageBox.error(sErrorMsg);

                if (oContext && typeof oContext.isTransient === 'function' && oContext.isTransient()) {
                    oContext.delete().catch(() => { });
                } else if (oContext && typeof oContext.hasPendingChanges === 'function' && oContext.hasPendingChanges()) {
                    oContext.resetChanges();
                }

            }, 200);
        }

    });
});