sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, History, MessageBox, MessageToast, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.nbx.adminapp.controller.Employees", {
        onInit: function () {
            this._o18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteEmployees").attachPatternMatched(this.onRouteMatched, this);
        },

        onRouteMatched: function () {
            const oTable = this.byId("employeesTable");
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

        onEmployeePress: function (oEvent) {
            let oItem = oEvent.getSource(),
                oContext = oItem.getBindingContext(),
                sEmployeeId = oContext.getProperty("ID");

            this.getOwnerComponent().getRouter().navTo("RouteEmployeeDetail", {
                employeeId: sEmployeeId
            });
        },

        onDeactivatePress: function () {
            let oTable = this.byId("employeesTable"),
                oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning(this._o18n.getText("selectEmployeeWarning"));
                return;
            }

            let oContext = oSelectedItem.getBindingContext(),
                oModel = this.getView().getModel(),
                oAction = oModel.bindContext("AdminsService.deactivateEmployees(...)", oContext);

            oAction.execute().then(() => {
                MessageToast.show(this._o18n.getText("employeeDeactivatedSuccess"));
                oContext.requestSideEffects([
                    { $PropertyPath: "isActive" }
                ]);
                oTable.removeSelections(true);
            }).catch((oError) => {
                MessageBox.error(this._o18n.getText("employeeDeactivatedError"));
                console.error(oError);
            });
        },

        onActivatePress: function () {
            let oTable = this.byId("employeesTable"),
                oSelectedItem = oTable.getSelectedItem();

            if (!oSelectedItem) {
                MessageBox.warning(this._o18n.getText("selectEmployeeWarning"));
                return;
            }

            let oContext = oSelectedItem.getBindingContext(),
                oModel = this.getView().getModel(),
                oAction = oModel.bindContext("AdminsService.activateEmployees(...)", oContext);

            oAction.execute().then(() => {
                MessageToast.show(this._o18n.getText("employeeActivatedSuccess"));
                oContext.requestSideEffects([
                    { $PropertyPath: "isActive" }
                ]);
                oTable.removeSelections(true);
            }).catch((oError) => {
                MessageBox.error(this._o18n.getText("employeeActivatedError"));
                console.error(oError);
            });
        },

        onSearch: function (oEvent) {
            const sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue"),
                aFilters = [];

            if (sQuery && sQuery.length > 0) {
                const oFilterName = new Filter("employeeName", FilterOperator.Contains, sQuery),
                    oFilterEmail = new Filter("email", FilterOperator.Contains, sQuery),
                    oCombinedFilter = new Filter({
                        filters: [oFilterName, oFilterEmail],
                        and: false
                    });

                aFilters.push(oCombinedFilter);
            }

            const oTable = this.byId("employeesTable"),
                oBinding = oTable.getBinding("items");

            oBinding.filter(aFilters, sap.ui.model.FilterType.Application);
        },

        onCreatePress: function (oEvent) {
            let oView = this.getView();

            if (!this.oCreateDialog) {
                sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "com.nbx.adminapp.view.fragment.CreateEmployeeDialog", 
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
            this.byId("inputFirstNameID").setValue("");
            this.byId("inputLastNameID").setValue("");
            this.byId("inputEmailID").setValue("");
            this.byId("inputLoginNameID").setValue("");
            this.byId("inputWeeklyHoursID").setValue("");
            this.byId("selectPositionID").setSelectedKey("");
        },

        onCancelCreateEmployee: function () {
            this.closeAndClearDialog();
        },

        onSaveNewEmployee: function () {
            let sFirstName = this.byId("inputFirstNameID").getValue(),
                sLastName = this.byId("inputLastNameID").getValue(),
                sEmail = this.byId("inputEmailID").getValue(),
                sLoginName = this.byId("inputLoginNameID").getValue(),
                sWeeklyHours = this.byId("inputWeeklyHoursID").getValue(),
                sPositionId = this.byId("selectPositionID").getSelectedKey();
                
            if (!sFirstName || !sLastName || !sEmail || !sLoginName || !sPositionId) {
                MessageBox.warning(this._o18n.getText("fillRequiredFieldsWarning"));
                return;
            }

            

            let oTable = this.byId("employeesTable"),
                  oBinding = oTable.getBinding("items"),
                  oModel = this.getView().getModel(),
                  oNewEmployeeData = {
                      firstName: sFirstName,
                      lastName: sLastName,
                      email: sEmail,
                      loginName: sLoginName,
                      isActive: true,
                      position_ID: sPositionId 
                  };

            if (oModel.hasPendingChanges()) {
                oModel.resetChanges();
            }

            if (sWeeklyHours) {
                oNewEmployeeData.weeklyTargetHours = parseFloat(sWeeklyHours);
            }

            oBinding.attachEventOnce("createCompleted", (oEvent) => {
                let bSuccess = oEvent.getParameter("success");
                if (bSuccess) {
                    MessageToast.show(this._o18n.getText("employeeCreatedSuccess"));
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
                        MessageBox.error(this._o18n.getText("employeeCreateConsoleError") + " " + sBackendError);
                    }, 0);
                }
            });

            oBinding.create(oNewEmployeeData);
        }

    });
});