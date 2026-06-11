let app;
(function () {
    app = angular.module('billingOrderModule', ['ngMaterial', 'ngMessages', 'ngSanitize']);
})();

app.factory('authInterceptor', function () {
    const excludeHost = 'https://smp.shadow.apptium.com';

    return {
        request: function (config) {
            // Add withCredentials unless it's the excluded host
            if (config.url.startsWith(excludeHost)) {
                config.withCredentials = false;
            } else {
                config.withCredentials = true;
            }

            return config;
        },

        responseError: function (response) {
            const contentType = response.headers && response.headers('Content-Type');

            // Treat text/plain error as successful response
            if (contentType && contentType.startsWith('text/plain')) {
                return Promise.reject({
                    status: response.status,
                    statusText: response.statusText,
                    data: response.data,
                    headers: response.headers,
                    config: response.config
                });
            }

            return Promise.reject(response);
        }
    };
});


app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
}]);

/* For Localhost running Interceptor */

// app.factory('authInterceptor', function () {
//     function getCookie(name) {
//         const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//         return match ? match[2] : null;
//     }

//     return {
//         request: function (config) {
//             const token = getCookie('JwtToken');
//             if (token) {
//                 config.headers['JwtToken'] = token;
//             }
//             return config;
//         }
//     };
// });


// app.config(['$httpProvider', function ($httpProvider) {
//     $httpProvider.interceptors.push('authInterceptor');
// }]);


app.controller('billingOrderController', ['$scope', '$injector', '$mdDialog', function ($scope, $injector, $mdDialog) {
    const $http = $injector.get('$http');
    const $timeout = $injector.get('$timeout');
    const $filter = $injector.get('$filter');

    const dataState = $injector.get('dataState');
    const CBCPermissionEnum = $injector.get('CBCPermissionEnum');
    const ApplicationIdEnum = $injector.get('ApplicationIdEnum');

    var hostName = window.location.hostname;

    // Access the Angular DataState singleton exposed via downgradeInjectable
    const allowedCountries = dataState.getUserCountries(ApplicationIdEnum.CBC);
    $scope.allowedCountries = allowedCountries;
    $scope.canManageOrders = dataState.hasPermission([
        CBCPermissionEnum.ManageOrders
    ], ApplicationIdEnum.CBC);

    $scope.canViewOrders = dataState.hasPermission([
        CBCPermissionEnum.ViewOrders,
        CBCPermissionEnum.ManageOrders
    ], ApplicationIdEnum.CBC);


    $scope.canViewCollectionSKU = dataState.hasPermission([
        CBCPermissionEnum.ViewCollectionSkuMapping,
        CBCPermissionEnum.ManageCollectionSkuMapping
    ], ApplicationIdEnum.CBC);
    
    let lastPopupPosition = null;
    let apiUrl;

    if (hostName === 'int-streamone-hub.tdsynnex.org') {
        apiUrl = 'https://int-streamone-api.tdsynnex.org/core-billingconnector/api/v1';
        $scope.redirectbaseUrl = 'smp.shadow.apptium.com';
    } else if (hostName === 'uat-streamone-hub.tdsynnex.org') {
        apiUrl = 'https://uat-streamone-api.tdsynnex.org/core-billingconnector/api/v1';
        $scope.redirectbaseUrl = 'smp.shadow.apptium.com';
    } else if (hostName === 'streamone-hub.tdsynnex.org') {
        apiUrl = 'https://streamone-api.tdsynnex.org/core-billingconnector/api/v1';
        $scope.redirectbaseUrl = 'ion.tdsynnex.com';
    } else {
        apiUrl = 'http://localhost:18182/api/v1';
        $scope.redirectbaseUrl = 'smp.shadow.apptium.com';
    }

    toastr.options = {
        "tapToDismiss": false,
        "hideDuration": 0,
        "closeButton": true,
        "extendedTimeOut": 1000,
        "timeOut": 5000,
        "preventDuplicates": true,
        "preventOpenDuplicates": true
    };

    $scope.model = {
        startDate: new Date(),
        endDate: new Date(),
        countryValue: 0,
        searchText: '',
        vendorValue: 0
    };


    $scope.billingOrders = [];
    $scope.invoiceLineDetails = [];
    $scope.totalOrderCount = 0;
    $scope.totalInvoiceCount = 0;
    $scope.VendorsNamesData = [];
    $scope.selectedVendorsNames = '';
    $scope.selectedCountryNames = '';
    $scope.isDisabled = false;
    $scope.showRetriesValue = false;
    $scope.showRetriesText = 'Show';
    $scope.showLoadingDiv = false;
    $scope.showOrderIssues = false;
    $scope.showInvoiceLine = false;
    $scope.showServiceOrdernew = true;
    $scope.showServiceorder = false;
    $scope.showServiceorderEMEA = false;
    $scope.showServiceorderAPJ = false;
    $scope.orderWithIssues = null;
    $scope.sort = 2;
    $scope.progress = 'Preparing Approvals';
    $scope.progressWidth = 0;
    $scope.model.endDate = new Date();
    $scope.model.startDate = new Date();
    $scope.ordersCountLabelText = 0;
    $scope.invoiceLineLabelText = 0;
    $scope.offset = 0;
    $scope.invoiceOffset = 0;
    $scope.searchFilter = '';
    $scope.filterOrdersBy = 'NONE';
    $scope.filterIssuesOnly = false;
    $scope.serviceOrderIdOption = false;
    $scope.serviceOrderIdOptionValue = false;
    $scope.sortOrdersBy = 'OrderDate';
    $scope.sortOrder = 'DESC';
    $scope.loadingText = 'Retrieving billing order data...';
    $scope.actionableCount = 0;
    $scope.dataShowing = false;
    $scope.pendingCount = 0;
    $scope.progressCount = 0;
    $scope.maxSize = 20;
    $scope.next = 0;
    $scope.selectedOrderDetails = [];
    $scope.approvedOrderDetails = 0;
    $scope.approvedInvoiceDetails = 0;
    $scope.approvedInvoiceDetailsList = [];
    $scope.ApprovedOrderInvoiceData = [];
    $scope.showServiceorderMessage = false;
    $scope.showERPErrorMessage = false;
    $scope.orderERP;
    $scope.legacyModernFlag = 0;
    $scope.showServiceOrderId = true;
    $scope.EmeaERP;
    $scope.seriveOrderID = null;
    $scope.showModal = false;
    $scope.successimage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAAsTAAALEwEAmpwYAAABJUlEQVR4nLWUQU7DQAxFewOoVBC9AqzYsRs1dpRKXVG4COUstEk6VqXeoIepEKvAMWDRoF+lQ5JxhmxqyZKT8bzYfzwZDM5ts+VsGEn0TJYWJPSC2GzMZW9AvI2vSShn4R8WLluOd+lUpldByCSf3LHwlwIoW/6J3M5KekLKE0ytrGrnXwBZeidLxTEWWnnCdmhStiFmY24454fq+ZszvnAgnEgfSJIlY4AQu7U1zx2IhV9rG4pGovxB4MraQgWh7PoGCkA8EFl6Ur8utAtB4LHEjw6Eia2LfYJhLQlAPLGr9tJW4gdZumfL+8AhvHlzhOHCkDUSLR8Cp1iYzIxCV6QJEx0SSXSrQpxemRlhYo/9a5pYXnZWohlExLDhFwJH7Al7DvsFnuiIPpNzUuIAAAAASUVORK5CYII=";
    $scope.errorimage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAkklEQVR4nGNgoATcCPb1vxHkd+BmkP8XCPbbfz3Qzw+r4ptBfh03g/3/Y8M3gv3bMEwGS0JMPg1XDGIH+X8BsW8FB/ggNICcAVVwJzBQDMQHYRD7JsKAfcjO+Qy3HqoQpvEmwmmfKNKwnwgn7YVrAAUdIU/fDPTzRgsp/zY8wdqCNS5AQQcKDbCfIP7ai2EyqQAAMR7E1jNwf10AAAAASUVORK5CYII=";
    $scope.model.countryValue = 0;
    $scope.isNSap = false;
    $scope.model.vendorValue = 0;
    $scope.isVendorSelected = false;
    $scope.negativeChargeSuccess = false;
    $scope.clickedNav = '';
    $scope.selectedAllOrders = false;
    $scope.columnPixels =
    {
        "Checkbox": 24,
        "UpDown": 25,
        "Issues": 25,
        "Lines": 49,
        "OrderDate": 86,
        "OrderNum": 92,
        "Country": 66,
        "Currency": 66,
        "TotalVC": 87,
        "TotalRP": 87,
        "ResID": 110,
        "ResName": 225,
        "EucName": 211,
        "Approve": 39,
        "Decline": 39,
        "Reset": 39
    };



    $scope.statusCodeMap = {};

    angular.element(document).ready(function () {

        jQuery(function () {
            jQuery('.chosen-select').chosen();
            jQuery('.chosen-select-deselect').chosen({ allow_single_deselect: true });
        });

        $('input,textarea').val("");
        $('.form-group input, .form-group textarea').focusout(function () {
            var text_val = $(this).val();
            if (text_val === "") {
                $(this).removeClass('has-value');
            } else {
                $(this).addClass('has-value');
            }
        });

        $('#approveselected, #approvepage, #singleapproveselected').click(function () {
            if (document.getElementById("radio1") && document.getElementById("radio2")) {
                $('#radio1')[0].checked = false;
                $('#radio2')[0].checked = true;
            }

            $('.form-group input, .form-group textarea').removeClass('has-value');
        })

        $('#cancel').click(function () {
            if (document.getElementById("radio1") && document.getElementById("radio2")) {
                $('#radio1')[0].checked = false;
                $('#radio2')[0].checked = true;
            }

            if (document.getElementById("radio")) {
                document.getElementById("radio").value = false;
            }
            $('#batchid').modal('hide');
            $('.form-group input, .form-group textarea').removeClass('has-value');
        });


        var errorimage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAkklEQVR4nGNgoATcCPb1vxHkd+BmkP8XCPbbfz3Qzw+r4ptBfh03g/3/Y8M3gv3bMEwGS0JMPg1XDGIH+X8BsW8FB/ggNICcAVVwJzBQDMQHYRD7JsKAfcjO+Qy3HqoQpvEmwmmfKNKwnwgn7YVrAAUdIU/fDPTzRgsp/zY8wdqCNS5AQQcKDbCfIP7ai2EyqQAAMR7E1jNwf10AAAAASUVORK5CYII=";
        var imgsrc = document.getElementById("conditionmessage");
        var imgsrc2 = document.getElementById("conditionmessage2");
        if (imgsrc) imgsrc.src = errorimage;
        if (imgsrc2) imgsrc2.src = errorimage;

        $("#lnkLogout").click(function () {
            logout();
        });

        function openOption(order, index) {
            $document.on('click', closeOptionsOnClick);
        }

        function closeOptionsOnClick(event) {
            var popup = angular.element(document.getElementById('first'));
            var isClickedOutside = !popup[0].contains(event.target);

            if (isClickedOutside) {
                $scope.$apply(function () {
                    $scope.closeOptions();
                });
            }
        }

        function closeOptions() {
            $scope.order.openMoreOptions = false;

            // Remove the event listener when closing the popup
            $document.off('click', closeOptionsOnClick);
        };

        // Ensure to clean up event listeners when the scope is destroyed
        $scope.$on('$destroy', function () {
            $document.off('click', closeOptionsOnClick);
        });

        $scope.IsPartialApprovalFlag = false;
        $scope.PartialApprovalFlag = 0;

        $scope.changeStatus = function () {
            $scope.IsPartialApprovalFlag = !$scope.IsPartialApprovalFlag;
            $scope.PartialApprovalFlag = $scope.IsPartialApprovalFlag ? 1 : 0;
        };



        $scope.navFilter("Billing List", false);

        $http.get(apiUrl + '/BillingOrdersApi/GetVendorNames').then(function (VendorsNames) {
            $scope.VendorsNamesData = VendorsNames.data;
            for (let orderIndex = 0; orderIndex < $scope.VendorsNamesData.length; orderIndex++) {
                let VendorsName = $scope.VendorsNamesData[orderIndex].vendorName;
                VendorsName = jQuery.trim(VendorsName)
                jQuery('#vendorNames').append(new Option(VendorsName, VendorsName))
            }
            jQuery('#vendorNames').trigger("chosen:updated");
        });

        $http.post(apiUrl + '/BillingOrdersApi/GetCountryNames', $scope.allowedCountries)
            .then(function (CountryNames) {
                $scope.CountryNames = CountryNames.data;

                for (let orderIndex = 0; orderIndex < $scope.CountryNames.length; orderIndex++) {
                    let name = $scope.CountryNames[orderIndex].name;
                    let code = $scope.CountryNames[orderIndex].code;

                    jQuery('#countryNames').append(new Option(name, code));
                }

                jQuery('#countryNames').trigger("chosen:updated");
            })
            .catch(function (error) {
                console.error("Error fetching country names:", error);
            });


        $http.get(apiUrl + '/BillingOrdersApi/GetStatusCodes')
            .then(function (StatusCodes) {
                StatusCodes.data.forEach(function (item) {
                    $scope.statusCodeMap[item.statusCode] = item.orderStatus;
                });
            })
            .catch(function (err) {
                console.error("Failed to load status codes", err);
            });
        $scope.getOrderHeaders();
    });

    $scope.buttonFlag = true;
    $scope.buttonerrorFlag = true;
    $scope.buttoncompleteFlag = true;
    $scope.showDetails = false;
    $scope.detailFlag = false;
    $scope.errordetailFlag = false;
    $scope.completedetailFlag = false;
    $scope.showTooltipComplete = false;

    $scope.toggleDetails = function (statusCode, index, order) {

        order.statusDetail = $scope.getStatusDescription(order, 2);
        order.displayStatus = order.statusDetail + ' ' + (
            (order.jobProcessedOn && order.jobProcessedOn !== '0001-01-01T00:00:00')
                ? $filter('date')(order.jobProcessedOn, 'MM/dd/yyyy HH:mm:ss')
                : $filter('date')(order.approvalDate, 'MM/dd/yyyy HH:mm:ss')
        );
        if (statusCode === 1 || statusCode === 2 || statusCode === 5 || statusCode === 6 || statusCode === 8) {
            $scope.billingOrders[index].buttonFlag = false;
            $scope.billingOrders[index].detailFlag = true;
        }
        else if (statusCode === 3 || statusCode === 10 || statusCode === 11) {
            $scope.billingOrders[index].buttonerrorFlag = false;
            $scope.billingOrders[index].errordetailFlag = true;
        }
        else if (statusCode === 15) {
            $scope.billingOrders[index].buttoncompleteFlag = false;
            $scope.billingOrders[index].completedetailFlag = true;
        }
        else if (statusCode === 14 || statusCode === 12) {
            $scope.billingOrders[index].buttonCreatedFlag = false;
            $scope.billingOrders[index].createddetailFlag = true;
        }
        else if (statusCode === 13) {
            $scope.billingOrders[index].buttonCancelledFlag = false;
            $scope.billingOrders[index].cancelleddetailFlag = true;
        }
    };

    $scope.statusClick = function (index, flag, statusCode, order) {

        // Close all open tooltips
        $scope.billingOrders.forEach((billingOrder, i) => {
            if (i !== index) {
                billingOrder.showTooltip = false;
                billingOrder.showTooltipError = false;
                billingOrder.orderStatusTooltip = false;
                billingOrder.showTooltipCreated = false;
                billingOrder.showTooltipCancelled = false;
                billingOrder.detailFlag = false;
                billingOrder.errordetailFlag = false;
                billingOrder.completedetailFlag = false;
                billingOrder.createddetailFlag = false;
                billingOrder.cancelleddetailFlag = false;
                billingOrder.buttonFlag = true;
                billingOrder.buttonerrorFlag = true;
                billingOrder.buttoncompleteFlag = true;
                billingOrder.buttonCreatedFlag = true;
                billingOrder.buttonCancelledFlag = true;
            }
        });

        if (($scope.billingOrders[index].orderStatusTooltip === true || $scope.billingOrders[index].showTooltipError || $scope.billingOrders[index].showTooltip) && flag === true) {
            return;
        }
        else if (flag === false) {
            $scope.billingOrders[index].orderStatusTooltip = false;
            $scope.billingOrders[index].showTooltipError = false;
            $scope.billingOrders[index].showTooltip = false;
        }

        if (statusCode === 1 || statusCode === 2 || statusCode === 5 || statusCode === 6 || statusCode === 8) {
            $scope.billingOrders[index].showTooltip = !$scope.billingOrders[index].showTooltip;
            $scope.billingOrders[index].detailFlag = !$scope.billingOrders[index].detailFlag;
            $scope.billingOrders[index].buttonFlag = !$scope.billingOrders[index].buttonFlag;
            $scope.toggleDetails(statusCode, index, order);
        }
        if (statusCode === 3 || statusCode === 10 || statusCode === 11) {
            $scope.billingOrders[index].showTooltipError = !$scope.billingOrders[index].showTooltipError;
            $scope.billingOrders[index].errordetailFlag = !$scope.billingOrders[index].errordetailFlag;
            $scope.billingOrders[index].buttonerrorFlag = !$scope.billingOrders[index].buttonerrorFlag;
            $scope.toggleDetails(statusCode, index, order);
        }
        if (statusCode === 15) {
            $scope.billingOrders[index].orderStatusTooltip = !$scope.billingOrders[index].orderStatusTooltip;
            $scope.billingOrders[index].completedetailFlag = !$scope.billingOrders[index].completedetailFlag;
            $scope.billingOrders[index].buttoncompleteFlag = !$scope.billingOrders[index].buttoncompleteFlag;
            $scope.toggleDetails(statusCode, index, order);
        }
        if (statusCode === 14 || statusCode === 12) {
            $scope.billingOrders[index].showTooltipCreated = !$scope.billingOrders[index].showTooltipCreated;
            $scope.billingOrders[index].createddetailFlag = !$scope.billingOrders[index].createddetailFlag;
            $scope.billingOrders[index].buttonCreatedFlag = !$scope.billingOrders[index].buttonCreatedFlag;
            $scope.toggleDetails(statusCode, index, order);
        }
        if (statusCode === 13) {
            $scope.billingOrders[index].showTooltipCancelled = !$scope.billingOrders[index].showTooltipCancelled;
            $scope.billingOrders[index].cancelleddetailFlag = !$scope.billingOrders[index].cancelleddetailFlag;
            $scope.billingOrders[index].buttonCancelledFlag = !$scope.billingOrders[index].buttonCancelledFlag;
            $scope.toggleDetails(statusCode, index, order);
        }
    }

    $scope.openOption = function (order, index) {
        $scope.billingOrders[index].openMoreOptions = !$scope.billingOrders[index].openMoreOptions;
    }

    $scope.closeOptions = function (order) {
        order.openMoreOptions = false;
    };

    $scope.closemodalert = function () {
        $("#modalert").modal("hide");
        $scope.pendingCount = 0;
        $scope.progressCount = 0;
    }

    $scope.sortOrders = function (sortColumn) {
        if (sortColumn === $scope.sortOrdersBy) {
            if ($scope.sortOrder === 'DESC') {
                $scope.sortOrder = 'ASC';
            } else {
                $scope.sortOrder = 'DESC';
            }
        } else {
            $scope.sortOrdersBy = sortColumn;
            $scope.sortOrder = 'ASC';
        }

        $scope.getOrderHeaders();
    }

    $scope.updateHeaderColumnWidths = function () {
        let columns = document.querySelectorAll("td.bc-first-row-column");
        if (columns.length === 0) {
            return;
        }

        $scope.columnPixels.Checkbox = columns[0].clientWidth + 1;
        $scope.columnPixels.UpDown = columns[1].clientWidth + 1;
        $scope.columnPixels.UpDown = columns[2].clientWidth + 1;
        $scope.columnPixels.Lines = columns[3].clientWidth + 1;
        $scope.columnPixels.OrderDate = columns[4].clientWidth + 1;
        $scope.columnPixels.OrderNum = columns[5].clientWidth + 1;
        $scope.columnPixels.Country = columns[6].clientWidth + 1;
        $scope.columnPixels.Currency = columns[7].clientWidth + 1;
        $scope.columnPixels.TotalVC = columns[8].clientWidth + 1;
        $scope.columnPixels.TotalRP = columns[9].clientWidth + 1;
        $scope.columnPixels.ResID = columns[10].clientWidth + 1;
        $scope.columnPixels.ResName = columns[11].clientWidth + 1;
        $scope.columnPixels.EucName = columns[12].clientWidth + 1;
        $scope.columnPixels.Invoiceid = columns[13].clientWidth + 1;

        if (columns.length == 17) {
            $scope.columnPixels.Approve = columns[14].clientWidth + 1;
            $scope.columnPixels.Decline = columns[15].clientWidth + 1;
            $scope.columnPixels.Reset = columns[16].clientWidth + 1;
        }
    }

    // Instantiate these letiables outside the watch
    let tempFilterText = '', filterTextTimeout;

    $scope.$watch('model.searchText', function (val) {
        if (filterTextTimeout) $timeout.cancel(filterTextTimeout);

        tempFilterText = val;

        filterTextTimeout = $timeout(function () {
            $scope.searchFilter = tempFilterText;

            $timeout(function () {
                if ($scope.searchFilter !== undefined) {
                    //$scope.resetOffset();
                }
            })
        }, 750); // delay ms
    })

    $scope.setFilterBy = function (filterOrdersBy) {
        if (filterOrdersBy === "Clean orders") {
            $scope.IsPartialApprovalFlag = true;
            $scope.PartialApprovalFlag = $scope.IsPartialApprovalFlag ? 1 : 0;
        }
        else {
            $scope.IsPartialApprovalFlag = false;
            $scope.PartialApprovalFlag = $scope.IsPartialApprovalFlag ? 1 : 0;
        }
        if (filterOrdersBy === $scope.filterOrdersBy) {
            return;
        }

        $scope.filterOrdersBy = filterOrdersBy;
        //$scope.resetOffset();
    }

    $scope.navFilter = function (filterOrdersBy, isNavBarClicked) {

        if (filterOrdersBy) {
            if (filterOrdersBy == "Billing List") {
                filterOrdersBy = "NONE";
            }
            else if (filterOrdersBy == "Processed") {
                filterOrdersBy = "Approved";
            }
            else if (filterOrdersBy == "Denied") {
                filterOrdersBy = "Declined";
            }
            $scope.filterOrdersBy = filterOrdersBy;
            $scope.clickedNav = filterOrdersBy;
            isNavBarClicked ? $scope.getOrderHeaders(true) : '';
        }
    }

    $scope.isNavLinkActive = function (link) {
        if (!link && !$scope.filterOrdersBy) {
            // "Billing List" should be selected by default
            return true;
        }
        return link === $scope.filterOrdersBy.label;
    };

    let makeMatchingBillingOrdersInactionable = function (orderNumber) {
        if (orderNumber) {
            let orderIndex = 0;
            for (orderIndex = 0; orderIndex < $scope.billingOrders.length; orderIndex++) {
                let billingOrder = $scope.billingOrders[orderIndex];

                if (billingOrder.salesOrderNumber === orderNumber) {
                    billingOrder.actionable = false;
                    billingOrder.isSelected = false;
                    disableDeleteBtn($scope.billingOrders);
                }
            }
        }
    }

    let resetBillingOrderModelStatus = function (order) {
        order.approved = false;
        order.declined = false;

        let latestOrder = null;
        //make latest instance of this order actionable
        for (let orderIndex = 0; orderIndex < $scope.billingOrders.length; orderIndex++) {
            let billingOrder = $scope.billingOrders[orderIndex];

            if (billingOrder.salesOrderNumber === order.salesOrderNumber) {
                if (null === latestOrder || latestOrder.receiveDate < billingOrder.receiveDate) {
                    latestOrder = billingOrder;
                }
                billingOrder.actionable = false;
                billingOrder.isSelected = false;
            }
        }
        latestOrder.actionable = true;
    }

    let updateBillingOrderModelStatus = function (orders, approved) {
        if (orders.length > 0) {
            for (let orderIndex = 0; orderIndex < orders.length; orderIndex++) {
                for (let Index = 0; Index < $scope.billingOrders.length; Index++) {
                    let billingOrder = $scope.billingOrders[Index];

                    if (billingOrder.salesOrderHeaderId == orders[orderIndex]) {
                        if (approved === true) {
                            billingOrder.approved = true;
                            billingOrder.declined = false;
                            billingOrder.actionable = false;
                            billingOrder.isSelected = false;
                            billingOrder.actionableDta = false;

                            makeMatchingBillingOrdersInactionable(billingOrder.salesOrderNumber)
                        }
                        if (approved === false) {
                            billingOrder.approved = false;
                            billingOrder.declined = true;
                            billingOrder.actionable = false;
                            billingOrder.isSelected = false;
                        }
                    }
                }
            }

        }

    }
    $scope.PartialApprovalConfirm = function (InvoiceId, status) {
        $scope.InvoiceIdlist = "";
        var invoiceIds = "";
        if (InvoiceId == "" || InvoiceId == undefined) {
            invoiceIds = $scope.selectedOrderDetails
                .filter(function (item) {
                    return item.invoiceLevelIssueCount > 0;
                })
                .map(function (item) {
                    return item.invoiceId;
                })
                .join(',');
        }

        if (!$scope.IsPartialApprovalFlag && (InvoiceId && InvoiceId !== "") || (invoiceIds && invoiceIds !== "")) {
            var status = status == false ? "Declined" : "Approve";
            var invoiceIdlist = (InvoiceId && InvoiceId !== "") ? InvoiceId : invoiceIds;
            // Split and format the invoiceIdlist to 10 IDs per line
            var formattedList = "";
            if ((invoiceIds && invoiceIds !== "")) {
                formattedList = [...new Set(invoiceIdlist.split(','))]
                    .reduce((acc, curr, index) => {
                        if (index % 10 === 0 && index !== 0) {
                            acc += '\n'; // New line every 10 values
                        } else if (index !== 0) {
                            acc += ', ';
                        }
                        acc += curr;
                        return acc;
                    }, '');

            }
            else {
                formattedList = InvoiceId;
            }
            //$scope.InvoiceIdlist = "There are issues in some of the orders under the same invoiceId " + formattedList + " , Are you sure you want to do a partial " + status;
            $scope.InvoiceIdlist = "Some orders under this Invoice ID have issues. " + status + " cannot proceed until these issues are resolved. <br>" + " Invoice Id : " + formattedList;
            $("#modalert").modal("show");
            return false;
        }

        return true; // Proceed if IsPartialApprovalFlag is false
    }
    $scope.updateOrderStatus = function (orders, approved) {
        //for the scenario where we're using a db record instance of an order
        //instead of an order from the displayed table, we need to see if the
        //order is displayed and used the displayed instance.

        if (!$scope.PartialApprovalConfirm((orders.invoiceLevelIssueCount != null && orders.invoiceLevelIssueCount != 0) ? orders.invoiceId : "", approved)) {
            return; // Stop execution if user cancels
        }

        toastr.clear();
        if (orders.erpCode == 'SAP68') {
            $scope.showServiceorder = true;
            $scope.showServiceorderEMEA = true;
            $scope.showServiceorderAPJ = false;
            $scope.serviceOrderIdOptionValue = true;
            $scope.selectedOrderDetails.push(orders);
        }
        else if (orders.erpCode == 'SAP68APJ') {
            $scope.serviceOrderIdOptionValue = true;
            $scope.showServiceorder = true;
            $scope.showServiceorderEMEA = false;
            $scope.showServiceorderAPJ = true;
            $scope.selectedOrderDetails.push(orders);
        }
        else {
            orders.serviceOrderIdOptionValue = false;
            $scope.showServiceorder = false;
            $scope.showServiceorderEMEA = false;
            $scope.showServiceorderAPJ = false;
        }
        if ($scope.showServiceorder == true && approved === true) {
            $("#batchid").modal("show");
            $scope.showModal = true;
            $scope.serviceOrderIdOption = true;
            $scope.serviceOrderIdOptionValue = false;
        }
        else {
            $("#batchid").modal("hide");
            $scope.showModal = false;
            $scope.serviceOrderIdOption = false;
            $scope.serviceOrderIdOptionValue = false;
        }
        if ($scope.showServiceorder == false || approved == false) {
            let orderslen = orders.length;

            if (orderslen <= 0) {
                $scope.resetOffset();
                $scope.pendingCount = 0;
                $scope.progressCount = 0;
                toastr.warning('No action performed as the number of selected orders is less than 1.');
                return; // Stop execution if user cancels
            }

            let ordersarr = [];
            // Done following change for individual Approve and Decline          
            if (orderslen == undefined) {
                $scope.approvedOrderDetails = orders.salesOrderHeaderId.toString();
                let approvedInvoiceID = orders.invoiceId;

                if ($scope.approvedInvoiceDetailsList.indexOf(approvedInvoiceID) > -1) {
                    $scope.approvedInvoiceDetails = approvedInvoiceID;
                }
                else {
                    $scope.approvedInvoiceDetailsList.push(approvedInvoiceID);
                    $scope.approvedInvoiceDetails = approvedInvoiceID;
                }

                for (let orderIndex = 0; orderIndex < $scope.billingOrders.length; orderIndex++) {
                    let billingOrder = $scope.billingOrders[orderIndex];

                    if (billingOrder.salesOrderHeaderId === orders.salesOrderHeaderId) {
                        ordersarr.push(billingOrder.salesOrderHeaderId);
                        break;
                    }
                }
                //Assigned single order in array
                orders = ordersarr;
            }

            let approveText = 'declining';

            if (approved === true) {
                approveText = 'approving';
            }

            let approvalCode = '0';
            if (approved === true) {
                approvalCode = '1';
            }
            let updateOrderStatusURL = getUpdateOrderStatusURL(approvalCode);
            $http.post(updateOrderStatusURL, orders)
                .then(function (payload) {
                    $scope.selectedAllOrders = false;
                    updateBillingOrderModelStatus(orders, approved);
                    $scope.handleOrderViewCountChanged();
                    $scope.pendingCount++;
                    $scope.progressWidth = parseFloat(($scope.pendingCount * 100) / $scope.progressCount);
                    $scope.pendingCount = 0;
                    $scope.progressCount = 0;
                }, function (errorPayload) {
                    $scope.pendingCount++;
                    $scope.progressWidth = parseFloat(($scope.pendingCount * 100) / $scope.progressCount);
                    $scope.pendingCount = 0;
                    $scope.progressCount = 0;
                    let errorMessage = 'An error occurred ' + approveText + ' order numbers: ' + orders;
                    errorMessage = errorMessage + '\n\nReturn Status Code: ' + errorPayload.status + '\nReturn Status Text: ' + errorPayload.statusText;

                    toastr.warning(errorMessage);
                });
        }
    }

    let InvoiceId = '';
    $scope.deleteOrderStatus = function (orders) {
        InvoiceId = orders.invoiceId;
    }
    $scope.Confirmation = function (result) {
        if (result === 'Confirm') {

            let deleteOrderURL = apiUrl + '/Invoice/DeleteInvoice/' + InvoiceId;

            $http({ method: 'DELETE', url: deleteOrderURL }).then(function (res) {
                let ResponseData = res.data;
                if (ResponseData === true) {

                    $scope.resetOffset();
                    toastr.info('The selected order was deleted and removed from the list.');
                    $timeout(function () {
                        toastr.clear();
                    }, 5000)
                }
                else {
                    let errorMessage = 'An error occurred when deleting the selected order number.';
                    toastr.warning('Error: ' + errorMessage);
                }
            });
        }
        else {
            result = '';
            InvoiceId = '';
        }
    }

    $scope.setPage = function (pageNum) {
        if (pageNum < 1 || pageNum > Math.ceil($scope.totalOrderCount / 500)) {
            return;
        }
        $scope.offset = 500 * (pageNum - 1);
        $scope.selectedAllOrders = false;
        $scope.getOrderHeaders();
    }

    $scope.updateSelectedOrders = function (approved) {
        if (!$scope.PartialApprovalConfirm("", approved)) {
            return;
        }
        $scope.serviceOrderIdOption = false;
        if ($scope.selectedOrderDetails.length == 0) {
            $scope.showERPErrorMessage = false;
        }
        else {
            $scope.showServiceorder = false;
            $scope.showServiceorderEMEA = false;
            $scope.showServiceorderAPJ = false;

            angular.forEach($scope.selectedOrderDetails, function (item, i) {
                if (i == 0)
                    $scope.orderERP = item.erpCode;

                if ($scope.showServiceorderEMEA == false && $scope.showServiceorderAPJ == false && $scope.orderERP !== item.erpCode) {
                    $scope.showERPErrorMessage = true;
                }
                else {
                    $scope.showERPErrorMessage = false;
                }
            });

            if ($scope.showERPErrorMessage == false) {
                angular.forEach($scope.selectedOrderDetails, function (item, i) {
                    if (item.erpCode == 'SAP68') {
                        $scope.showServiceorder = true;
                        $scope.showServiceorderEMEA = true;
                        $scope.showServiceorderAPJ = false;
                        $scope.serviceOrderIdOptionValue = true;
                    }
                    else if (item.erpCode == 'SAP68APJ') {
                        $scope.serviceOrderIdOptionValue = true;
                        $scope.showServiceorder = true;
                        $scope.showServiceorderEMEA = false;
                        $scope.showServiceorderAPJ = true;
                    }
                    else {
                        $scope.serviceOrderIdOptionValue = false;
                        $scope.showServiceorder = false;
                        $scope.showServiceorderEMEA = false;
                        $scope.showServiceorderAPJ = false;
                    }
                });
            }
        }
        //when approve all
        if ($scope.showServiceorder == true && approved == true) {
            $("#batchid").modal("show");
            $scope.showModal = true;
            $scope.serviceOrderIdOption = true;

            //$scope.serviceOrderIdOptionValue = false;
        }
        else {
            $("#batchid").modal("hide");
            $scope.showModal = false;
            $scope.serviceOrderIdOption = false;
            $scope.serviceOrderIdOptionValue = false;
        }

        if ($scope.showERPErrorMessage == true) {
            toastr.warning('EBC is not be able to approve and process ERP from different region in a single batch. Please select country with same ERP and region.');
            $timeout(function () {
            }, 0)
        }

        let approveText = 'decline';
        if (approved === true) {
            approveText = 'approve';
        }

        if ((approved == false || ($scope.showServiceorder == false && $scope.showERPErrorMessage == false)) && confirm('Are you sure you want to ' + approveText + ' all of the selected orders?')) {
            $scope.pendingCount = 0;
            $scope.progressCount = 0;
            let orderIndex = 0;
            let selectedorders = [];

            for (orderIndex = 0; orderIndex < $scope.billingOrders.length; orderIndex++) {

                let billingOrder = $scope.billingOrders[orderIndex];

                if (billingOrder.isSelected === true && billingOrder.actionable) {
                    selectedorders.push(billingOrder.salesOrderHeaderId.toString());
                    $scope.progressCount++;

                }
            }
            $scope.updateOrderStatus(selectedorders, approved);
        };
    }

    $scope.enterServiceOrderId = function (serviceOrderIdOptionValue, serviceOrderIdOption) {
        $scope.seriveOrderID = null;
        $scope.serviceOrderIdOptionValue = serviceOrderIdOptionValue;
        if (serviceOrderIdOptionValue == false) {
            $scope.showServiceorderAPJ = false;
        }
        else {
            $scope.showServiceorderAPJ = true;
        }
    }

    $scope.approveServiceOrderId = function (approved) {
        let headerOrderIds = [];
        let IssueOrderlist = [];
        if ($scope.selectedOrderDetails.length != 0) {
            angular.forEach($scope.selectedOrderDetails, function (item, i) {
                if (item.invoiceLevelIssueCount > 0) {
                    IssueOrderlist.push(item.invoiceId.toString());
                }

                if ($scope.getActionable(item)) {
                    headerOrderIds.push(item.salesOrderHeaderId);
                }
            });
        }
        else {
            angular.forEach($scope.orderERP, function (item, i) {

                if (item.invoiceLevelIssueCount > 0) {
                    IssueOrderlist.push(item.invoiceId.toString());
                }


                if ($scope.getActionable(item)) {
                    headerOrderIds.push(item.salesOrderHeaderId);
                }
            });
        }
        let invoiceIds = Array.from(new Set(IssueOrderlist)).join(',');
        if (!$scope.PartialApprovalConfirm(invoiceIds != "" ? invoiceIds : "", true)) {
            return; // Stop execution if user cancels
        }
        let approveText = 'declining';

        if (approved === true) {
            approveText = 'approving';
        }

        let approvalCode = '0';
        if (approved === true) {
            approvalCode = '1';
        }

        let updateOrderStatusURL = '';

        if ($scope.seriveOrderID == '' || $scope.seriveOrderID == null) {
            updateOrderStatusURL = getUpdateOrderStatusURL(approvalCode);
        }
        else {
            updateOrderStatusURL = apiUrl + '/BillingOrdersApi/UpdateOrderStatus/' + approvalCode + '/' + $scope.seriveOrderID;
        }


        if (!headerOrderIds || headerOrderIds.length === 0) {
            $scope.pendingCount++;
            $scope.progressWidth = Number.parseFloat(($scope.pendingCount * 100) / $scope.progressCount);
            $("#batchid").modal("hide");
            $('#radio1')[0].checked = false;
            $('#radio2')[0].checked = true;
            $scope.showModal = false;
            $scope.seriveOrderID = null;
            toastr.warning('No orders to approve.');
            return;
        }

        $http.post(updateOrderStatusURL, headerOrderIds)
            .then(function (payload) {
                $scope.selectedOrderDetails = [];
                $scope.serviceOrderIdOptionValue = false;
                $scope.showServiceorder = false;
                $scope.showServiceorderEMEA = false;
                $scope.showServiceorderAPJ = false;
                $scope.seriveOrderID = null;
                updateBillingOrderModelStatus(headerOrderIds, approved);
                $scope.handleOrderViewCountChanged();
                $scope.pendingCount++;
                $scope.progressWidth = parseFloat(($scope.pendingCount * 100) / $scope.progressCount);
                $("#batchid").modal("hide");
                $('#radio1')[0].checked = false;
                $('#radio2')[0].checked = true;
                $scope.showModal = false;
                toastr.success('Successfully approved. Once it is processed, the file will be available in File Storage Location.');

            }, function (errorPayload) {
                $scope.pendingCount++;
                $scope.progressWidth = parseFloat(($scope.pendingCount * 100) / $scope.progressCount);
                let errorMessage = 'An error occurred ' + approveText + ' order numbers: ' + headerOrderIds;
                errorMessage = errorMessage + '\n\nReturn Status Code: ' + errorPayload.status + '\nReturn Status Text: ' + errorPayload.statusText;

                toastr.warning(errorMessage);
            });
    }


    $scope.recordDetails = function (order) {
        toastr.clear();
        if (order.isSelected == false) {
            order.isSelected = true;
        }
        else {
            order.isSelected = false;
        }

        if (order.isSelected == false) {
            const index = $scope.selectedOrderDetails.indexOf(order);
            $scope.selectedOrderDetails.splice(index, 1);
            $scope.showERPErrorMessage = false;
        }
        else {
            $scope.selectedOrderDetails.push(order);
        }
    }

    $scope.closeServiceOrder = function () {
        $scope.showServiceorder = false;
        $("#batchid").modal("hide");
        $scope.seriveOrderID = null;
        $scope.showModal = false;
        $scope.showServiceorderEMEA = false;
        $scope.showServiceorderAPJ = false;
        $scope.serviceOrderIdOptionValue = false;
        $scope.serviceOrderIdOption = false;
    }

    $scope.closeServiceOrderMessage = function () {
        $scope.showServiceorderMessage = false;
    }

    $scope.approveOrdersInFilter = function (viewOnly) {
        let count = 0;

        let IssueOrderlist = [];

        $scope.orderERP = $scope.billingOrders.filter(s => {
            return s;
        });

        angular.forEach($scope.orderERP, function (item, i) {
            if (item.invoiceLevelIssueCount > 0) {
                IssueOrderlist.push(item.invoiceId.toString());
            }
        });

        let invoiceIds = Array.from(new Set(IssueOrderlist)).join(',');


        if (!$scope.PartialApprovalConfirm(invoiceIds != "" ? invoiceIds : "", true)) {
            return; // Stop execution if user cancels
        }



        angular.forEach($scope.orderERP, function (item, i) {
            if (item.actionable) {
                if ($scope.orderERP.length > 0 && $scope.orderERP[0].erpCode !== item.erpCode) {
                    $scope.showERPErrorMessage = true;
                }
                else {
                    $scope.showERPErrorMessage = false;
                }
            }
        });

        if ($scope.showERPErrorMessage == false) {
            angular.forEach($scope.orderERP, function (item, i) {
                if (item.erpCode == 'SAP68') {
                    $scope.showServiceorder = true;
                    $scope.showServiceorderEMEA = true;
                    $scope.showServiceorderAPJ = false;
                    $scope.serviceOrderIdOptionValue = true;
                }
                else if (item.erpCode == 'SAP68APJ') {
                    $scope.serviceOrderIdOptionValue = true;
                    $scope.showServiceorder = true;
                    $scope.showServiceorderEMEA = false;
                    $scope.showServiceorderAPJ = true;
                }
                else {
                    $scope.serviceOrderIdOptionValue = false;
                    $scope.showServiceorder = false;
                    $scope.showServiceorderEMEA = false;
                    $scope.showServiceorderAPJ = false;
                }
            });
        }
        //approve page
        if ($scope.showServiceorder == true) {
            $("#batchid").modal("show");
            $scope.showModal = true;
            $scope.serviceOrderIdOption = true;
            $scope.serviceOrderIdOptionValue = false;
        }
        else {
            $("#batchid").modal("hide");
            $scope.showModal = false;
            $scope.serviceOrderIdOption = false;
            $scope.serviceOrderIdOptionValue = false;
        }

        if ($scope.showERPErrorMessage == true) {
            toastr.warning('EBC is not be able to approve and process ERP from different region in a single batch. Please select country with same ERP and region.');
            $timeout(function () {
            }, 0)
        }
        else if ($scope.showERPErrorMessage == false && viewOnly) {
            for (let i = 0; i < $scope.billingOrders.length; i++) {
                if ($scope.billingOrders[i].actionable) {
                    count++;
                }
            }
        } else {
            count = $scope.actionableCount;
        }

        if ($scope.showServiceorder == false && $scope.showERPErrorMessage == false && confirm('This action will approve ' + count + ' actionable orders.\n\nAre you sure you want to continue?')) {
            $scope.loadingText = 'Preparing Approvals...';
            $scope.progressWidth = 1;
            $scope.pendingCount = 0;
            $scope.progressCount = count;
            let approvepageorders = [];

            let approvebillingOrders = $scope.billingOrders;
            for (let i = 0; i < approvebillingOrders.length; i++) {
                let billingOrder = approvebillingOrders[i];
                $scope.loadingText = 'Preparing Approvals...\n' + i.toString() + ' / ' + count.toString();
                if ($scope.getActionable(approvebillingOrders[i])) {
                    approvepageorders.push(billingOrder.salesOrderHeaderId.toString());
                }
            }
            $scope.updateOrderStatus(approvepageorders, true);
        }
    }

    $scope.resetApprovedOrder = function (order) {
        if (confirm('Are you sure you want to reset this approval?')) {
            let updateOrderStatusURL = apiUrl + '/BillingOrdersApi/ResetApprovedOrder?salesOrderNumber=' + order.salesOrderNumber;

            $http({ method: 'POST', url: updateOrderStatusURL })
                .then(function (payload) {
                    resetBillingOrderModelStatus(order);
                    $scope.handleOrderViewCountChanged();
                    toastr.info(order.salesOrderNumber + ' successfully reset');
                }, function (errorPayload) {
                    let errorMessage = 'An error occurred when resetting order number: ' + order.salesOrderNumber + '. Database ID: ' + order.salesOrderHeaderId;
                    errorMessage = errorMessage + '\n\nReturn Status Code: ' + errorPayload.status + '\nReturn Status Text: ' + errorPayload.statusText;

                    toastr.warning('Error: ' + errorMessage);
                });
        }
    }

    function getUpdateOrderStatusURL(statusEnum) {
        let updateOrderStatusURL = '';
        let statusText = '';

        switch (statusEnum) {
            case '0':
                statusText = 'Declined';
                statusEnum = 7;
                break;

            case '1':
                statusText = 'Approved';
                break;

            default:
                statusText = '';
        }

        updateOrderStatusURL = apiUrl + '/BillingOrdersApi/UpdateOrderStatus/' + statusEnum;
        return updateOrderStatusURL;
    }

    $scope.loadOrderDetailIntoOrder = function (order) {
        order.orderDetail = null;

        $http.get(apiUrl + '/BillingOrdersApi/GetOrderDetail/' + order.salesOrderHeaderId)
            .then(function (response) {
                order.orderDetail = response.data;
                order.baseSIEURL = angular.element(document).find('meta[name=SIEBaseURL]').prop("content");
            })
            .catch(function (error) {
                alert('Async call failed to /Api/BillingOrdersApi/GetOrderDetail/' + order.salesOrderHeaderId + '\n\n' + error);
            });
    }

    $scope.showOrderDetail = function (order) {
        $scope.loadOrderDetailIntoOrder(order);

        $timeout(function () {
            order.detailIsVisible = true;
        }, 200)
    }

    $scope.hideOrderDetail = function (order) {
        order.detailIsVisible = false;
        order.orderDetail = null;
    }

    $scope.showOrderIssuesPopup = function (order) {


        $scope.showOrderIssues = false;

        $scope.orderWithIssues = null;

        $http.get(apiUrl + '/BillingOrdersApi/GetOrderIssues/' + order.salesOrderHeaderId).then(function (orderIssueData) {
            $scope.orderWithIssues = orderIssueData.data;

            $scope.orderWithIssues.SalesOrderHeaderId = order.salesOrderHeaderId;
            $scope.orderWithIssues.SalesOrderNumber = order.salesOrderNumber;
            $scope.orderWithIssues.ReceiveDate = order.receiveDate;

            $timeout(function () {
                $scope.showOrderIssues = true;
            })
        }).catch(function (data) {
            toastr.warning('Async call failed to \/Api\/BillingOrdersApi\/GetOrderIssues\/' + order.salesOrderHeaderId + '\n\n' + data);
        });
    }

    $scope.hideIssues = function () {
        $scope.showOrderIssues = false;
    };


    $scope.selectAllOrders = function () {
        toastr.clear();

        if (!$scope.selectedAllOrders) {
            $scope.selectedAllOrders = true;
        } else {
            $scope.selectedAllOrders = false;
        }

        angular.forEach($scope.billingOrders, function (order) {
            order.isSelected = $scope.selectedAllOrders && order.actionable;
        });
        let selectedRecords = $scope.billingOrders.filter(s => {
            if (s.isSelected)
                return s;
        });
        if ($scope.selectedAllOrders) {
            $scope.selectedOrderDetails = selectedRecords;
        }
        else {
            $scope.selectedOrderDetails = [];
        }
    }

    $scope.showRetries = function () {
        $scope.showRetriesValue = !$scope.showRetriesValue;

        if ($scope.showRetriesValue) {
            $scope.showRetriesText = 'Hide';
        } else {
            $scope.showRetriesText = 'Show';
        }

        $scope.resetOffset();
    }

    $scope.resetOffset = function () {
        $scope.offset = 0;
        $scope.selectedAllOrders = false;
        $scope.getOrderHeaders();
    }

    $scope.close = function () {
        $scope.showInvoiceLine = false;
        $scope.invoiceLineDetails = [];
        $scope.next = 0;
        $scope.totalInvoiceCount = 0;
        $scope.invoiceLineLabelText = 0;
        $scope.invoiceOffset = 0;
    }

    $scope.setInvoicePage = function (pageNum) {
        if (pageNum < 1 || pageNum > Math.ceil($scope.totalInvoiceCount / 20)) {
            return;
        }
        $scope.invoiceOffset = 20 * (pageNum - 1);
        $scope.next = pageNum;
        $scope.useInvoicePopup();
    }

    $scope.useInvoicePopup = function () {
        $scope.invoiceLinePopup();
    }


    function setPopupStyle() {
        if (!lastPopupPosition) return;
        $scope.popupStyle = {
            position: 'absolute',
            top: lastPopupPosition.top + 'px',
            left: lastPopupPosition.left + 'px',
            width: '1000px',
            border: 'solid',
            backgroundColor: 'lightgray',
            paddingTop: '6px',
            zIndex: 1000
        };
    }

    $scope.invoiceLinePopup = function (lineNumber, $event) {

        if ($event) {

            const popupWidth = 1000;
            const popupHeight = 400;
            const leftOffset = 50;


            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

            lastPopupPosition = {
                top: scrollTop + (window.innerHeight - popupHeight) / 2,
                left: scrollLeft + (window.innerWidth - popupWidth) / 2 - leftOffset
            };
        }



        setPopupStyle();

        $scope.showInvoiceLine = true;
        $scope.invoiceLineNumber = lineNumber ? lineNumber : $scope.invoiceLineNumber;
        let pageNo = $scope.next != 0 ? $scope.next : 1;
        $http.get(apiUrl + '/BillingOrdersApi/GetInvoiceLineDetails/' + $scope.invoiceLineNumber + '/' + pageNo + '/' + $scope.maxSize).then(function (res) {
            $scope.invoiceLineDetails = res.data;
            if (res.data.length > 0) {
                $scope.legacyModernFlag = $scope.invoiceLineDetails[0].vendorName == 'microsoft' ? 1 : 0;
                $scope.totalInvoiceCount = res.data[0].recordCount;
                $scope.handleInvoicePagination();
                $scope.setInvoiceCountLabelText();
            }
        });
    }

    $scope.setInvoiceCountLabelText = function () {
        $timeout(function () {
            if (($scope.totalInvoiceCount - $scope.invoiceOffset) < $scope.invoiceOffset) {
                $scope.invoiceLineLabelText = ($scope.invoiceOffset + 1) + ' through ' + (parseInt($scope.totalInvoiceCount)) + ' of ' + $scope.totalInvoiceCount;
            }
            else {
                $scope.invoiceLineLabelText = ($scope.invoiceOffset + 1) + ' through ' + (parseInt($scope.invoiceOffset) + parseInt($scope.invoiceLineDetails.length)) + ' of ' + $scope.totalInvoiceCount;
            }
        })
    }

    $scope.countryChange = function () {
        toastr.clear();

        $scope.isNSap = false;

        if ($scope.model.countryValue.length == 1) {
            let selectedCountry = $scope.CountryNames.find(function (country) {
                return country.code == $scope.model.countryValue[0];
            })

            if (selectedCountry.name.toLowerCase().includes("nsap")) {
                $scope.isNSap = true;
            }
        }

        let imgsrc = document.getElementById("conditionmessage");
        imgsrc.src = $scope.errorimage;
        if ($scope.isNSap) {
            imgsrc.src = $scope.successimage;
        }
        else {
            imgsrc.src = $scope.errorimage;
        }
    }

    $scope.vendorChange = function () {
        toastr.clear();
        $scope.isVendorSelected = $scope.model.vendorValue.length > 0 ? true : false;
        let imgsrc2 = document.getElementById("conditionmessage2");
        imgsrc2.src = $scope.errorimage;
        if ($scope.isVendorSelected) {
            imgsrc2.src = $scope.successimage;
        }
        else {
            imgsrc2.src = $scope.errorimage;
        }
    }

    let preparedFilterUrl = function (maxResult, offset) {
        if ($scope.searchFilter === '' || $scope.searchFilter === undefined) {
            $scope.searchFilter = '-----';
        }
        $scope.selectedVendorsNames = jQuery("#vendorNames").chosen().val();
        $scope.selectedCountryNames = jQuery("#countryNames").chosen().val();

        if ($scope.selectedVendorsNames == '' || $scope.selectedVendorsNames === undefined) {
            $scope.selectedVendorsNames = '';
        }
        else {
            $scope.selectedVendorsNames = $scope.selectedVendorsNames.join(',');
        }
        if ($scope.selectedCountryNames == '' || $scope.selectedCountryNames === undefined) {
            $scope.selectedCountryNames = '';
        }
        else {
            $scope.selectedCountryNames = $scope.selectedCountryNames.join(',');
        }
        let filterOrdersBy = $scope.filterOrdersBy.includes(" ") ? $scope.filterOrdersBy.replace(/\s/g, "") : $scope.filterOrdersBy;
        filterOrdersBy = filterOrdersBy == "Cleanorders" ? "ReadyForApproval" : filterOrdersBy;
        // Construct the payload for the POST request
        let payload = {
            startDate: $scope.model.startDate.toLocaleDateString("en-US"),
            endDate: $scope.model.endDate.toLocaleDateString("en-US"),
            includeRetries: $scope.showRetriesValue,
            offset: offset,
            maxResult: maxResult,
            filter: filterOrdersBy,
            issueOnly: $scope.filterIssuesOnly,
            sortBy: $scope.sort,
            sortOrder: $scope.sortOrder,
            searchText: $scope.searchFilter.replace("&", "zzx"),
            vendorNames: $scope.selectedVendorsNames,
            countryNames: $scope.selectedCountryNames,
            partialApprovalFlag: $scope.PartialApprovalFlag,
            AllowedCountries: ($scope.allowedCountries || []).join(',')
        };
        let endpoint = apiUrl + '/BillingOrdersApi/GetPageOfOrderHeaders';
        return { endpoint, payload };
    }

    let preparedCSVExportUrl = function () {
        if ($scope.searchFilter === '' || $scope.searchFilter === undefined) {
            $scope.searchFilter = '-----';
        }

        $scope.selectedVendorsNames = jQuery("#vendorNames").chosen().val();
        $scope.selectedCountryNames = jQuery("#countryNames").chosen().val();

        if ($scope.selectedVendorsNames == '' || $scope.selectedVendorsNames === undefined) {
            $scope.selectedVendorsNames = '0';
        } else {
            $scope.selectedVendorsNames = $scope.selectedVendorsNames.join(',');
        }

        if ($scope.selectedCountryNames == '' || $scope.selectedCountryNames === undefined) {
            $scope.selectedCountryNames = '0';
        } else {
            $scope.selectedCountryNames = $scope.selectedCountryNames.join(',');
        }
        $scope.filterOrdersBy = $scope.filterOrdersBy.toString();
        let filterOrdersBy = $scope.filterOrdersBy.includes(" ")
            ? $scope.filterOrdersBy.replace(/\s/g, "")
            : $scope.filterOrdersBy;
        filterOrdersBy = filterOrdersBy == "Cleanorders" ? "ReadyForApproval" : filterOrdersBy;

        let payload = {
            startDate: $scope.model.startDate.toLocaleDateString("en-US"),
            endDate: $scope.model.endDate.toLocaleDateString("en-US"),
            includeRetries: $scope.showRetriesValue,
            filter: filterOrdersBy,
            issueOnly: $scope.filterIssuesOnly,
            sortBy: $scope.sort,
            sortOrder: $scope.sortOrder,
            searchText: $scope.searchFilter.replace("&", "zzx"),
            recordCount: $scope.totalOrderCount,
            vendorNames: $scope.selectedVendorsNames,
            countryNames: $scope.selectedCountryNames,
            partialApprovalFlag: $scope.PartialApprovalFlag,
            AllowedCountries: ($scope.allowedCountries || []).join(',')
        };

        let endpoint = apiUrl + '/BillingOrdersApi/GetCSVExportDataByFilter';
        return { endpoint, payload };
    };


    $scope.getOrderHeaders = function (isRefresh) {
        // --- Date validation ---
        const start = new Date($scope.model.startDate);
        const end = new Date($scope.model.endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            alert('Invalid Date Range...');
            return;
        }

        // --- Reset UI flags ---
        resetletiablesForNewOrderHeadersRetrieval();

        // --- Map sort options instead of switch ---
        const sortMap = {
            LineCount: 1,
            OrderDate: 2,
            SalesOrderNumber: 3,
            CountryCode: 4,
            CurrencyCode: 5,
            ResellerId: 6,
            ResellerName: 7,
            EndUserCompanyName: 8,
            TotalVendorCost: 9,
            TotalResellerCost: 10,
            InvoiceId: 11,
            ConsolidationType: 12,
            Status: 13,
            ERPInvoiceId: 14
        };
        $scope.sort = sortMap[$scope.sortOrdersBy];

        if (isRefresh == true) {
            $scope.offset = 0;
            $scope.selectedOrderDetails = [];
            let checkBoxHeader = document.getElementById('SelectAllOrdersCheckbox').checked;
            if (checkBoxHeader) {
                document.getElementById('SelectAllOrdersCheckbox').checked = false;
            }
        }

        let getURL = preparedFilterUrl(500, $scope.offset);
        $scope.searchFilter = $scope.searchFilter.replace('-----', '');

        // Show loading spinner
        $scope.showLoadingDiv = true;

        $http({
            method: 'POST',
            url: getURL.endpoint,
            headers: {
                'Content-Type': 'application/json'
            },
            data: getURL.payload
        }).then(function (payload) {
            if (payload.data.length > 0) {
                $scope.dataShowing = true;
                $scope.billingOrders = payload.data;

                // Avoid unnecessary reflows or DOM manipulations during data processing
                let orders = $scope.billingOrders.map((order) => {
                    return {
                        ...order,
                        isSelected: false,
                        openMoreOptions: false,
                        orderStatusTooltip: false,
                        completedetailFlag: false,
                        buttoncompleteFlag: true,
                        showTooltip: false,
                        detailFlag: false,
                        buttonFlag: true,
                        showTooltipError: false,
                        errordetailFlag: false,
                        buttonerrorFlag: true,
                        showTooltipCreated: false,
                        createddetailFlag: false,
                        buttonCreatedFlag: true,
                        showTooltipCancelled: false,
                        cancelleddetailFlag: false,
                        buttonCancelledFlag: true,
                        orderStatus: $scope.getStatusDescription(order, 1),
                        actionableDta: $scope.getActionable(order),
                        actionable: $scope.getActionable(order),
                        showErrorColor: order.issueCount > 0
                    };
                });

                // Update `$scope.billingOrders` with the processed orders
                $scope.billingOrders = orders;
                // Handle pagination and other UI states
                $scope.totalOrderCount = $scope.billingOrders[0].totalCount;
                $scope.actionableCount = $scope.billingOrders[0].actionableCount;
                $scope.handleOrderViewCountChanged();
                $scope.handlePagination();

                // Load Disable Data and Disable Delete Btn in bulk
                loadDisableData($scope.billingOrders);
                disableDeleteBtn($scope.billingOrders);

                // Update column widths in bulk
                $timeout(function () {
                    $scope.updateHeaderColumnWidths();
                });
                $scope.showLoadingDiv = false; // Hide loading spinner
            } else {
                $scope.dataShowing = false;
                $scope.showLoadingDiv = false;
                $scope.loadingText = 'No Matching Data Found';
            }
        }, function (errorPayload) {
            $scope.showLoadingDiv = false;
            if (errorPayload && (errorPayload.status === 401 || errorPayload.statusCode === 401)) {
                toastr.warning('Unauthorized: You do not have permission to view the data');
            } else {
                let errorMessage = 'An error occurred retrieving the billing order headers...';
                errorMessage += '\n\nReturn Status Code: ' + errorPayload.orderStatus + '\nReturn Status Text: ' + errorPayload.statusText;

                alert(errorMessage);
            }
        });
    };


    let loadDisableData = function (billingOrders) {
        let InvoiceIndex = 0;
        $scope.dataShowing = true;
        for (InvoiceIndex = 0; InvoiceIndex < billingOrders.length; InvoiceIndex++) {
            let billingOrder = billingOrders[InvoiceIndex];
            let invoice_id = billingOrder.invoiceId;

            if (billingOrder.approved === true) {
                if (($scope.ApprovedOrderInvoiceData.indexOf(invoice_id) > -1)) {

                }
                else {
                    $scope.ApprovedOrderInvoiceData.push(invoice_id);
                }
            }
        }
    }



    let disableDeleteBtn = function (billingOrders) {
        $scope.dataShowing = true;

        let InvoiceIndex = 0;
        let orderData = [];
        let InvoiceData = [];
        for (InvoiceIndex = 0; InvoiceIndex < billingOrders.length; InvoiceIndex++) {
            let billingOrder = billingOrders[InvoiceIndex];
            let invoice_id = billingOrder.invoiceId;

            if (billingOrder.approved === true || $scope.approvedInvoiceDetailsList.indexOf(invoice_id) > -1 || $scope.ApprovedOrderInvoiceData.indexOf(billingOrder.invoiceId) > -1) {
                if (InvoiceData.indexOf(billingOrder.invoiceId) > -1) {
                }
                else {
                    InvoiceData.push(billingOrder.invoiceId);
                }
            }
        }

        const InvoiceData_Value = InvoiceData.values();
        let Single_Invoice;
        for (const value of InvoiceData_Value) {
            Single_Invoice = value;
            for (let i = 0; i < billingOrders.length; i++) {
                let billingOrder = billingOrders[i];

                if (billingOrder.invoiceId === Single_Invoice) {
                    if (orderData.indexOf(billingOrder.salesOrderHeaderId) > -1) {
                    }
                    else {
                        billingOrder.isDisabled = true;
                    }
                }
            }
        }
    }

    let resetletiablesForNewOrderHeadersRetrieval = function () {
        $scope.showOrderIssues = false;
        $scope.loadingText = 'Retrieving billing order data...';
        $scope.showLoadingDiv = true;
        $scope.billingOrders = null;
        $scope.billingOrders = [];
    }

    $scope.handleOrderViewCountChanged = function () {
        $scope.setOrdersCountLabelText();
    }

    $scope.setOrdersCountLabelText = function () {
        $timeout(function () {
            if (!$scope.searchFilter && $scope.filterOrdersBy === 'NONE' && $scope.filterIssuesOnly === false) {
                if (($scope.totalOrderCount - $scope.offset) < $scope.offset) {
                    $scope.ordersCountLabelText = ($scope.offset + 1) + ' through ' + (parseInt($scope.totalOrderCount)) + ' of ' + $scope.totalOrderCount;
                }
                else {
                    $scope.ordersCountLabelText = ($scope.offset + 1) + ' through ' + (parseInt($scope.offset) + parseInt($scope.billingOrders.length)) + ' of ' + $scope.totalOrderCount;
                }
            } else {
                if (($scope.totalOrderCount - $scope.offset) < $scope.offset) {
                    $scope.ordersCountLabelText = ($scope.offset + 1) + ' through ' + (parseInt($scope.totalOrderCount)) + ' of ' + $scope.totalOrderCount + ' (filtered)';
                }
                else {
                    $scope.ordersCountLabelText = ($scope.offset + 1) + ' through ' + (parseInt($scope.offset) + parseInt(document.querySelectorAll("tr.bc-unfiltered-header-row").length)) + ' of ' + $scope.totalOrderCount + ' (filtered)';
                }
            }
            if ($scope.showRetriesValue) {
                $scope.ordersCountLabelText += ' [Retries Displayed]';
            }
        })
    }

    $scope.negativeCharge = function () {
        toastr.clear();

        // Validate dates
        if (isNaN(Date.parse($scope.model.startDate))
            || isNaN(Date.parse($scope.model.endDate))
            || (Date.parse($scope.model.startDate) > Date.parse($scope.model.endDate)
                && !($scope.model.startDate.getYear() === $scope.model.endDate.getYear()
                    && $scope.model.startDate.getMonth() === $scope.model.endDate.getMonth()
                    && $scope.model.startDate.getDay() === $scope.model.endDate.getDay()))
        ) {
            alert('Invalid Date Range...');
            return;
        }

        // Show loading indicator
        $scope.showLoadingDiv = true;
        $scope.loadingText = 'Preparing negative charges file...';
        toastr.info('Processing your request. This may take a moment...');

        let vendorNamesToUse = [];
        let negativechargesURL = apiUrl + '/BillingOrdersApi/GetCreditRefundCharges';

        // Process vendor names
        angular.forEach($scope.model.vendorValue, function (vendor) {
            vendorNamesToUse.push(vendor.includes('Microsoft') ? 'Microsoft' : vendor);
        });
        vendorNamesToUse = [...new Set(vendorNamesToUse)];

        let obj = {
            StartDate: $scope.model.startDate.toLocaleDateString("en-US"),
            EndDate: $scope.model.endDate.toLocaleDateString("en-US"),
            VendorNames: vendorNamesToUse.toString(),
            CountryName: $scope.model.countryValue.toString(),
            InvoiceIds: $scope.model.searchText == null ? '' : $scope.model.searchText,
            ModernOrLegacy: $scope.model.vendorValue == "Microsoft Legacy" ? "Legacy" : $scope.model.vendorValue == "Microsoft NCE" ? 'Modern' : '',
            SearchText: ''
        };

        // Add timeout to prevent hanging requests
        const timeoutPromise = $timeout(function () {
            $scope.showLoadingDiv = false;
            toastr.error('Request timed out. Please try with a smaller date range or fewer filters.');
        }, 120000); // 2 minutes timeout

        $http({
            method: 'POST',
            url: negativechargesURL,
            data: obj,
            timeout: timeoutPromise
        })
            .then(function successCallback(payload) {
                $timeout.cancel(timeoutPromise);
                if (payload.data == '' || !payload.data || payload.data == 'No records found in DB for the search criteria. Please modify the search and try again') {
                    toastr.warning('No records found in DB for the search criteria. Please modify the search and try again.');
                }
                else {
                    try {
                        // Handle file download
                        let fileName = payload.data.fileName || 'NegativeCharges.csv';
                        let fileContent = payload.data.fileContent;

                        // Use blob for efficient download
                        let blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8' });

                        if (window.navigator.msSaveOrOpenBlob) {
                            window.navigator.msSaveBlob(blob, fileName);
                        } else {
                            let elem = window.document.createElement('a');
                            elem.href = window.URL.createObjectURL(blob);
                            elem.download = fileName;
                            document.body.appendChild(elem);
                            elem.click();
                            document.body.removeChild(elem);
                            window.URL.revokeObjectURL(elem.href);
                        }

                        toastr.success('Negative charges for the chosen data were downloaded successfully');
                        $scope.negativeChargeSuccess = true;
                    } catch (error) {
                        toastr.error('Error processing file download.');
                    }
                }
            }, function (errorPayload) {
                $timeout.cancel(timeoutPromise);
                $scope.showLoadingDiv = false;

                if (errorPayload.status === 404) {
                    toastr.warning('No records found. Please modify the search and try again.');
                } else if (errorPayload.status === 0) {
                    toastr.warning('Request timed out or was cancelled. Please try with a smaller date range.');
                } else if (errorPayload.data && typeof errorPayload.data === 'string' && errorPayload.data.includes('Not records')) {
                    toastr.warning(errorPayload.data);
                } else {
                    toastr.error('An unexpected error occurred while fetching negative charges.');
                }
            })
            .finally(function () {
                $scope.showLoadingDiv = false;
            });
    }

    toastr.options.onHidden = function () {
        if ($scope.negativeChargeSuccess == true) {
            jQuery("#countryNames").chosen().val(null);
            jQuery("#vendorNames").chosen().val(null);
            for (let orderIndex = 0; orderIndex < $scope.CountryNames.length; orderIndex++) {
                let name = $scope.CountryNames[orderIndex].name;
                let code = $scope.CountryNames[orderIndex].code;
                //  jQuery('#countryNames').append(new Option(name, code))
            }
            jQuery('#countryNames').trigger("chosen:updated");
            for (let orderIndex = 0; orderIndex < $scope.VendorsNamesData.length; orderIndex++) {
                let VendorsName = $scope.VendorsNamesData[orderIndex].vendorName;
                VendorsName = jQuery.trim(VendorsName)
                //  jQuery('#vendorNames').append(new Option(VendorsName, VendorsName))
            }
            jQuery('#vendorNames').trigger("chosen:updated");
            $scope.model.countryValue = 0;
            $scope.model.vendorValue = 0;
            $scope.isVendorSelected = false;
            $scope.isNSap = false;
            $scope.model.startDate = new Date();
            $scope.model.endDate = new Date();
            $scope.model.searchText = '';
            document.getElementById("conditionmessage").src = $scope.errorimage;
            document.getElementById("conditionmessage2").src = $scope.errorimage;
            $scope.offset = 0;
            $scope.selectedAllOrders = false;
            $scope.getOrderHeaders(true);
            $scope.negativeChargeSuccess = false;
        }
    };

    $scope.exportLineData = function (order) {
        let dataString = "";
        let exportBillingOrderJSON = [];
        let url = apiUrl + '/BillingOrdersApi/GetOrderDetail/' + order.salesOrderHeaderId.toString();

        $http({ method: 'GET', url: url })
            .then(function (payload) {
                let lineData = payload.data.orderLines;
                dataString = 'InvoiceID,' +
                    'LineNumber,' +
                    'ProductDescription,' +
                    'VendorProductID,' +
                    'CollectionSKU,' +
                    'VendorName,' +
                    'Cost,' +
                    'Prize,' +
                    'LegacyModernFlag,' +
                    'SkuDataSource,' +
                    'OrderNumber,' +
                    'CountryCode,' +
                    'ResellerID,' +
                    'ISVName';

                processLineData(lineData, exportBillingOrderJSON, order, function (lineDataString) {
                    dataString += lineDataString;
                    generateCSV(dataString, order);
                });
            }, function (errorPayload) {
                handleError(errorPayload);
            });
    };

    function processLineData(lineData, exportBillingOrderJSON, order, callback) {
        let lineDataString = "";
        angular.forEach(lineData, function (value) {
            let productDetails = JSON.parse(value.productDescription);

            angular.forEach(productDetails, function (val) {
                exportBillingOrderJSON[0] = '"' + value.invoiceId + '"';
                exportBillingOrderJSON[1] = '"' + value.lineNumber + '"';
                exportBillingOrderJSON[2] = '"' + val.Description + '"';
                exportBillingOrderJSON[3] = '"' + val.VendorProductId + '"';
                exportBillingOrderJSON[4] = '"' + value.techDataSKU + '"';
                exportBillingOrderJSON[5] = '"' + value.vendorName + '"';
                exportBillingOrderJSON[6] = '"' + val.Cost + '"';
                exportBillingOrderJSON[7] = '"' + val.Price + '"';
                exportBillingOrderJSON[8] = '"' + (val.ModernOrLegacy ? val.ModernOrLegacy : value.modernOrLegacy) + '"';
                exportBillingOrderJSON[9] = '"' + value.skuDataSource + '"';
                exportBillingOrderJSON[10] = '"' + order.salesOrderNumber + '"';
                exportBillingOrderJSON[11] = '"' + order.countryCode + '"';
                exportBillingOrderJSON[12] = '"' + order.resellerId + '"';
                exportBillingOrderJSON[13] = '"' + value.isvName + '"';
                lineDataString += '\n' + exportBillingOrderJSON.join(",");
            });
        });

        callback(lineDataString);
    }

    function generateCSV(dataString, order) {
        let blob = new Blob([dataString], { type: 'text/csv;charset=utf-8' });
        let filename = order.salesOrderNumber.toString() + ' ' + $filter('date')(order.orderDate, 'MM/dd/yyyy HH:mm:ss').toString() + '.csv';

        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, filename);
        } else {
            let elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
        }
    }

    function handleError(errorPayload) {
        $scope.showLoadingDiv = false;
        let errorMessage = 'An error occurred retrieving the order details...';
        errorMessage += '\n\nReturn Status Code: ' + errorPayload.status + '\nReturn Status Text: ' + errorPayload.statusText;
        alert(errorMessage);
    }

    function escapeInvoiceText(value) {
        if (!value) return '';
        // Convert to string
        value = value.toString();
        // Normalize all line breaks to \r\n (Windows-style)
        value = value.replace(/\r?\n/g, '\r\n');
        // Escape double quotes by doubling them
        value = value.replace(/"/g, '""');
        // Wrap in quotes to preserve commas, quotes, and line breaks
        return `"${value}"`;
    }

    async function postData({ endpoint, payload }) {
        const response = await $http.post(endpoint, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response;
    }




    $scope.exportCSV = async function () {
        // No need to build CSV in UI anymore
        if ($scope.billingOrders.length === 0) {
            return;
        }

        const start = new Date($scope.model.startDate);
        const end = new Date($scope.model.endDate);

        if (!start || !end) {
            toastr.warning("Please select both start and end dates.");
            return;
        }

        // Convert to UTC
        const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
        const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

        if (Number.isNaN(startUTC) || Number.isNaN(endUTC) || startUTC > endUTC) {
            toastr.warning("Please select valid start and end dates. Start date cannot be after end date.");
            return;
        }

        const diffInDays = Math.floor((endUTC - startUTC) / (1000 * 60 * 60 * 24)) + 1;
        const isFilterApplied = ($scope.model.countryValue && $scope.model.countryValue.length > 0)
            || ($scope.model.vendorValue && $scope.model.vendorValue.length > 0);

        const MAX_DAYS_NO_FILTER = 31;
        const MAX_DAYS_WITH_FILTER = 62;

        const maxDays = isFilterApplied ? MAX_DAYS_WITH_FILTER : MAX_DAYS_NO_FILTER;

        if (diffInDays > maxDays) {
            const message = 'CSV download is limited to maximum of 62 days with a country/vendor filter, or maximum of 31 days without filters.';

            $mdDialog.show(
                $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .htmlContent(`
                            <div class="modal-header download-unavailable-header">
                                Download Unavailable
                            </div>
                            <div class="modal-body download-unavailable-body">
                            <p>${message}<br></p>
                            <p style="margin-top: 30px;">Please adjust the date range to continue.</p>
                            </div>`)
                    .ok('CLOSE')
                    .ariaLabel('CSV Download Unavailable')
            );
            return;
        }     

        try {
               $scope.showLoadingDiv = true;
            const { endpoint, payload } = preparedCSVExportUrl();

            if ($scope.totalOrderCount > 5000) {
                toastr.info('Large datasets can take a few minutes to generate CSV');
            }
            $http({
                method: 'POST',
                url: endpoint,
                data: payload,
                responseType: 'blob'
            }).then(function (response) {  
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = 'BillingConsoleExport.csv';
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                $scope.showLoadingDiv = false;
            });
        } catch (error) {
            toastr.error("An error occurred while exporting the data.");
        } finally {
            $scope.showLoadingDiv = false; 
            $scope.$applyAsync();
        }
    };

    function eventFire(el, etype) {
        let event;
        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent(etype, true, true);
        } else {
            event = document.createEventObject();
            event.eventType = etype;
        }

        event.eventName = etype;

        if (el.dispatchEvent) {
            el.dispatchEvent(event);
        } else {
            el.fireEvent("on" + etype, event);
        }
    }

    $scope.handlePagination = function () {
        $scope.pager = pagerService();
    }

    function pagerService() {
        // service definition
        let service = {};
        service.props = GetPager($scope.totalOrderCount, $scope.offset / 500, 500);
        return service;

        // service implementation
        function GetPager(totalItems, currentPage, pageSize) {
            // default to first page
            currentPage = (($scope.offset / pageSize) + 1) || 1;

            // default page size is 10
            pageSize = pageSize || 500;

            let totalPages = Math.ceil($scope.totalOrderCount / pageSize);

            let startPage, endPage;
            if (totalPages <= 10) {
                // less than 10 total pages so show all
                startPage = 1;
                endPage = totalPages;
            } else {
                // more than 10 total pages so calculate start and end pages
                if (currentPage <= 6) {
                    startPage = 1;
                    endPage = 10;
                } else if (currentPage + 4 >= totalPages) {
                    startPage = totalPages - 9;
                    endPage = totalPages;
                } else {
                    startPage = currentPage - 5;
                    endPage = currentPage + 4;
                }
            }

            // calculate start and end item indexes
            let startIndex = (currentPage - 1) * pageSize;
            let endIndex = Math.min(startIndex + pageSize - 1, $scope.totalOrderCount - 1);

            // create an array of pages to ng-repeat in the pager control
            let pages = [];
            for (let i = startPage; i <= (endPage); i++) {
                pages.push(i);
            }

            // return object with all pager properties required by the view
            return {
                totalItems: totalItems,
                currentPage: currentPage,
                pageSize: pageSize,
                totalPages: totalPages,
                startPage: startPage,
                endPage: endPage,
                startIndex: startIndex,
                endIndex: endIndex,
                pages: pages
            };
        }
    }

    $scope.handleInvoicePagination = function () {
        $scope.pagerInvoice = pagerServiceInvoice();
    }

    $scope.getStatusCode = function (order) {
        if (!order.salesOrderHeaderId || order.StatusDetail == null) {
            return order.statusCode;
        } else if (order.OrderStatus < 8) {
            return order.OrderStatus;
        } else {
            return order.StatusDetail;
        }
    };

    $scope.getActionable = function (order) {
        return !(
            !order.resellerId ||
            order.issueCount > 0 ||
            (order.emptyCollectionSKULines !== null && order.emptyCollectionSKULines !== '') ||
            order.declined === true ||
            order.approved === true
        );
    };

    $scope.getStatusDescription = function (order, functionality) {
        var code = $scope.getStatusCode(order);
        if (functionality === 1) // this is for order status
            return $scope.getEBCStatusString(code) || 'Null';
        else if (functionality === 2)  // this is for status detail
            return $scope.statusCodeMap[code] || 'Null';
        else
            return 'Null';
    };

    $scope.getEBCStatusString = function (status) {
        const EBCstatusMap = {
            1: 'In Progress',
            2: 'In Progress',
            6: 'In Progress',
            8: 'In Progress',
            3: 'Error',
            5: 'Error',
            10: 'Error',
            11: 'Error',
            12: 'Order Created',
            14: 'Order Created',
            15: 'Completed',
            13: 'Cancelled'
        };

        return EBCstatusMap[status] || 'Null';
    };

    var invoiceIds = $scope.selectedOrderDetails.map(function (item) {
        return item.invoiceid;
    });


    function pagerServiceInvoice() {
        // service definition
        let service = {};
        service.props = GetPagerInvoice($scope.totalInvoiceCount, $scope.invoiceOffset / 20, 20);
        return service;

        // service implementation
        function GetPagerInvoice(totalItems, currentPage, pageSize) {
            // default to first page
            currentPage = (($scope.invoiceOffset / pageSize) + 1) || 1;

            // default page size is 10
            pageSize = pageSize || 20;

            let totalPages = Math.ceil($scope.totalInvoiceCount / pageSize);

            let startPage, endPage;
            if (totalPages <= 10) {
                // less than 10 total pages so show all
                startPage = 1;
                endPage = totalPages;
            } else {
                // more than 10 total pages so calculate start and end pages
                if (currentPage <= 6) {
                    startPage = 1;
                    endPage = 10;
                } else if (currentPage + 4 >= totalPages) {
                    startPage = totalPages - 9;
                    endPage = totalPages;
                } else {
                    startPage = currentPage - 5;
                    endPage = currentPage + 4;
                }
            }

            // calculate start and end item indexes
            let startIndex = (currentPage - 1) * pageSize;
            let endIndex = Math.min(startIndex + pageSize - 1, $scope.totalInvoiceCount - 1);

            // create an array of pages to ng-repeat in the pager control
            let pages = [];
            for (let i = startPage; i <= (endPage); i++) {
                pages.push(i);
            }

            // return object with all pager properties required by the view
            return {
                totalItems: totalItems,
                currentPage: currentPage,
                pageSize: pageSize,
                totalPages: totalPages,
                startPage: startPage,
                endPage: endPage,
                startIndex: startIndex,
                endIndex: endIndex,
                pages: pages
            };
        }
    }

}]);