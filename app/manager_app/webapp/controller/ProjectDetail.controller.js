sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, History, UIComponent, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.nbx.managerapp.controller.ProjectDetail", {

        onInit: function () {
            let oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteProjectDetail").attachPatternMatched(this._onObjectMatched, this);

            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        _onObjectMatched: function (oEvent) {
            let sProjectId = oEvent.getParameter("arguments").projectId;

            this.getView().bindElement({
                path: "/Projects(" + sProjectId + ")"
            });

            let oObjHeader = this.byId("objHeader");
            oObjHeader.bindElement({
                path: "/ManagerProjectFinancesView(" + sProjectId + ")"
            });

            let oIconTabFilterINFO = this.byId("idInfoContainer");
            oIconTabFilterINFO.bindElement({
                path: "/ProjectDetailsView(" + sProjectId + ")"
            });

            let oIconTabFilterTEAM = this.byId("idTeamTable");
            oIconTabFilterTEAM.bindElement({
                path: "/ProjectTeamView(" + sProjectId + ")",
                parameters: {
                    "$select": "projectStatus,projectManager_ID",
                    "$expand": "employeesAssigned($filter=isActiveOnThisProject eq true)"
                }
            });

            this.applyLogsFilters();

            let oHoursContainer = this.byId("idHoursContainer");
            oHoursContainer.bindElement({
                path: "/ProjectDetailsView(" + sProjectId + ")",
                parameters: {
                    "$expand": "logs"
                },
                events: {
                    change: function () {
                        this.applyLogsFilters();
                    }.bind(this)
                }
            });
            
            /* //no van
            this.byId("idSpentPositionTable").bindItems({
                path: "/SpentPerPositionView",
                filters: [new sap.ui.model.Filter("projectID", "EQ", sProjectId)]
            });
             
            this.byId("idBudgetProjectionForm").bindElement({
                path: "/ProjectBudgetProjectionView(projectID='" + sProjectId + "')"
            }); */
        },

        applyLogsFilters: function () {
            this.byId("idPendingLogsTable").getBinding("items").filter([
                new sap.ui.model.Filter("status", "EQ", "P")
            ]);

            this.byId("idResolvedLogsTable").getBinding("items").filter([
                new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("status", "NE", "P"),
                        new sap.ui.model.Filter("status", "NE", "N")
                    ],
                    and: true
                })
            ]);
        },

        onNavBack: function () {
            let oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                let oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteMain");
            }
        },

        onChangeStatus: function () {
            let oView = this.getView(),
                oContext = oView.getBindingContext();

            if (!oContext) return;

            oView.setBusy(true);
            let oOperation = oView.getModel().bindContext("ManagersService.advanceStatus(...)", oContext);

            oOperation.execute().then(() => {
                oView.setBusy(false);

                sap.m.MessageToast.show(this._o18n.getText("StatusUpdatedSuccess"));

                oContext.refresh();
                this.byId("objHeader").getBindingContext().refresh();
                oView.getModel().refresh();
            }).catch((oError) => {
                oView.setBusy(false);

                let sErrorMsg = this._o18n.getText("StatusUpdateError"),
                    aMsgs = sap.ui.getCore().getMessageManager().getMessageModel().getData(),
                    oLastError = aMsgs[aMsgs.length - 1];

                if (oLastError && oLastError.message) {
                    sErrorMsg = oLastError.message;
                }

                sap.m.MessageBox.error(sErrorMsg);
            });
        },

        onRemoveEmployee: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext(),
                sEmployeeId = oContext.getProperty("employee_ID"),
                oTable = this.byId("idTeamTable"),
                oProjectContext = oTable.getBindingContext();

            if (!oProjectContext) return;

            const oModel = oProjectContext.getModel(),
                oActionOData = oModel.bindContext("ManagersService.managerRemoveEmployeeFromProject(...)", oProjectContext);
            oActionOData.setParameter("employee_ID", sEmployeeId);

            oActionOData.execute().then(() => {
                sap.m.MessageToast.show(this._o18n.getText("EmployeeRemovedSuccess"));
                oProjectContext.refresh();

            }).catch((oError) => {
                sap.m.MessageBox.error(oError.message);
            });
        },

        onAddEmployee: function () {
            if (!this._oAddEmployeeDialog) {
                this._oAddEmployeeDialog = sap.ui.xmlfragment(
                    this.getView().getId(),
                    "com.nbx.managerapp.view.fragment.AddEmployeeDialog",
                    this
                );
                this.getView().addDependent(this._oAddEmployeeDialog);
            }

            const oTable = this.byId("idTeamTable"),
                oItemsBinding = oTable.getBinding("items");
            let aCurrentEmployeeIds = [];

            if (oItemsBinding) {
                const aContexts = oItemsBinding.getContexts();
                aCurrentEmployeeIds = aContexts.map(function (oContext) {
                    return oContext.getProperty("employee_ID");
                });
            }

            const aFilters = [
                new sap.ui.model.Filter("isActive", sap.ui.model.FilterOperator.EQ, true)
            ];

            aCurrentEmployeeIds.forEach(sId => {
                if (sId) {
                    aFilters.push(new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.NE, sId));
                }
            });

            const oList = this.byId("idAddEmployeeList"),
                oListBinding = oList.getBinding("items");

            if (oListBinding) {
                oList.removeSelections(true);
                oListBinding.filter(new sap.ui.model.Filter({
                    filters: aFilters,
                    and: true
                }));
            }

            this._oAddEmployeeDialog.open();
        },

        onConfirmAddEmployee: function (oEvent) {
            let oSelectedItem = oEvent.getParameter("listItem");
            if (!oSelectedItem) return;

            let sEmployeeId = oSelectedItem.getBindingContext().getProperty("ID"),
                oTable = this.byId("idTeamTable"),
                oProjectContext = oTable.getBindingContext();

            if (!oProjectContext) return;

            let oAction = oProjectContext.getModel().bindContext(
                "ManagersService.managerAddEmployeeToProject(...)",
                oProjectContext
            );

            oAction.setParameter("employee_ID", sEmployeeId);
            oTable.setBusy(true);
            oAction.execute().then(() => {
                oTable.setBusy(false);
                this._oAddEmployeeDialog.close();
                sap.m.MessageToast.show(this._o18n.getText("EmployeeAddedSuccess"));
                oProjectContext.refresh();
            }).catch((oError) => {
                oTable.setBusy(false);
                sap.m.MessageBox.error(oError.message);
            });
        },

        onCancelDialog: function () {
            this._oAddEmployeeDialog.close();
        },

        onApprove: function (oEvent) {
            const oContext = oEvent.getSource().getBindingContext(),
                oAction = oContext.getModel().bindContext("ManagersService.resolveEmployeeHoursOneByOne(...)", oContext);

            oAction.setParameter("status_ID", "A");
            oAction.setParameter("rejectionReason_ID", "NR");

            oAction.execute().then(function () {
                sap.m.MessageToast.show(this._o18n.getText("HoursApprovedSuccess"));
                oContext.getModel().refresh();
            }.bind(this));
        },

        onReject: function (oEvent) {
            this.oPendingLogContext = oEvent.getSource().getBindingContext();

            if (!this.RejectDialogFragment) {
                this.RejectDialogFragment = sap.ui.core.Fragment.load({
                    id: this.getView().getId(),
                    name: "com.nbx.managerapp.view.fragment.RejectDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            this.RejectDialogFragment.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCloseRejectDialog: function () {
            this.byId("rejectDialog").close();
        },

        onConfirmReject: function () {
            const sReason = this.byId("rejectionReasonSelect").getSelectedKey(),
                oContext = this.oPendingLogContext,
                oModel = oContext.getModel(),
                oAction = oModel.bindContext("ManagersService.resolveEmployeeHoursOneByOne(...)", oContext);

            oAction.setParameter("status_ID", "R");
            oAction.setParameter("rejectionReason_ID", sReason);

            this.byId("rejectDialog").setBusy(true);

            oAction.execute().then(function () {
                this.byId("rejectDialog").setBusy(false);
                this.onCloseRejectDialog();
                sap.m.MessageToast.show(this._o18n.getText("HoursRejectedSuccess"));
                oModel.refresh();
            }.bind(this)).catch(function (oError) {
                this.byId("rejectDialog").setBusy(false);
                sap.m.MessageBox.error(oError.message);
            }.bind(this));
        },

        onApproveRange: function () {
            if (!this.RangeDialogFragment) {
                this.RangeDialogFragment = sap.ui.core.Fragment.load({
                    id: this.getView().getId(),
                    name: "com.nbx.managerapp.view.fragment.DateRangeDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            this.RangeDialogFragment.then(function (oDialog) {
                oDialog.open();
            });
        },

        onStatusChangeRange: function (oEvent) {
            const sKey = oEvent.getParameter("selectedItem").getKey();
            this.byId("idRejectionReasonBox").setVisible(sKey === "R");
        },

        onCloseRangeDialog: function () {
            this.byId("idDateRangeDialog").close();
        },

        onConfirmRange: function () {
            const oDRS = this.byId("idDRS"),
                sStatus = this.byId("idStatusSelect").getSelectedKey(),
                sReason = this.byId("idRangeRejectionSelect").getSelectedKey(),
                oDateStart = oDRS.getDateValue(),
                oDateEnd = oDRS.getSecondDateValue();

            if (!oDateStart || !oDateEnd) {
                sap.m.MessageToast.show(this._o18n.getText("selectDatesError"));
                return;
            }

            const oContext = this.byId("idHoursContainer").getBindingContext(),
                oModel = oContext.getModel(),
                oAction = oModel.bindContext("ManagersService.resolveEmployeeHoursByDateRange(...)", oContext),
                formatDate = (oDate) => oDate.toISOString().split('T')[0];

            oAction.setParameter("startDate", formatDate(oDateStart));
            oAction.setParameter("endDate", formatDate(oDateEnd));
            oAction.setParameter("status_ID", sStatus);
            oAction.setParameter("rejectionReason_ID", sStatus === "R" ? sReason : "NR");

            this.byId("idDateRangeDialog").setBusy(true);

            oAction.execute().then(function () {
                this.byId("idDateRangeDialog").setBusy(false);
                this.onCloseRangeDialog();
                const oResults = oAction.getBoundContext().getObject();
                let numLogs = oResults.updatedCount;
                //console.log(numLogs)
                if (numLogs == "0"){
                    sap.m.MessageToast.show(this._o18n.getText("NotLogsToResolveOnSelectedRange"));
                }else{
                    sap.m.MessageBox.success(this._o18n.getText("RangeResolvedSuccessfully", [numLogs]));
                }
                oModel.refresh();
            }.bind(this)).catch(function (oError) {
                this.byId("idDateRangeDialog").setBusy(false);
                sap.m.MessageBox.error(oError.message);
            }.bind(this));
        }

    });
});