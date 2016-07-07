// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});



$(document).ready(function () {
    // Listen For Device
    document.addEventListener('deviceready', onDeviceReady, false);
});

function ScrollToScreen() {
    $('input').on('blur', function () {
        $$('.hiddendiv').addClass('spacing');
        $$('.page-content').scrollTop(100, 600);
    }).on('focus', function () {
        $$('.hiddendiv').removeClass('spacing');
    });

}

function onDeviceReady() {
    document.addEventListener("backbutton", function (e) {
        if (window.location.hash == '#index') {
            navigator.app.exitApp();
        }
        else {
            navigator.app.backHistory();
        }
    }, false);


    ScrollToScreen();

    //Just to stop having to proceed through login every time
    if (localStorage.UserID == "13") {
        mainView.router.loadPage('account.html')
    }
    //To be removed once finished

    mainView.hideNavbar();

    myApp.onPageInit('index', function (page) {
        //console.log("here");
    });

    myApp.onPageInit('debtdetails', function (page) {
        console.log(localStorage.DebtID);

        //Retrieve Case Details
        
        var user_url = 'http://beta8.rubixitsolutions.com/DesktopModules/DebtDetails/API/Debt/RetrieveDebtDetails?DebtID=' + localStorage.DebtID + '&UserID=' + localStorage.UserID + '&Stopped=false';
        console.log(user_url);
        $.ajax({
            url: user_url,
            dataType: 'json',
            success: function (response) {
                var posts = JSON.parse(response);
                console.log(posts)
                if (posts.status == "1") {
                    console.log(posts.DebtID);

                    var ClientDetails = "<strong>Name:</strong> " + posts.Title + " " + posts.FirstName + " " + posts.Surname + "<br><strong>Address:</strong> ";
                    ClientDetails += GenerateLineBreak(posts.Address1);
                    ClientDetails += GenerateLineBreak(posts.Address2);
                    ClientDetails += GenerateLineBreak(posts.Address3);
                    ClientDetails += GenerateLineBreak(posts.Address4);
                    ClientDetails += GenerateLineBreak(posts.Address5);
                    ClientDetails += GenerateLineBreak(posts.PostCode);
                    ClientDetails += "<strong>Telephone:</strong> " + posts.Telephone;

                    $('#lbClientDetails').html(ClientDetails);

                    var DebtorDetails = "";
                    if (posts.Debtor_CompanyName == "0")
                        DebtorDetails += "<strong>Name:</strong> " + posts.Debtor_Title + " " + posts.Debtor_FirstName + " " + posts.Debtor_LastName;
                    else
                        DebtorDetails += "<strong>Company Name:</strong> " + posts.Debtor_CompanyName;

                    DebtorDetails += "<br><strong>Address:</strong> ";
                    DebtorDetails += GenerateLineBreak(posts.Debtor_Address1);
                    DebtorDetails += GenerateLineBreak(posts.Debtor_Address2);
                    DebtorDetails += GenerateLineBreak(posts.Debtor_Address3);
                    DebtorDetails += GenerateLineBreak(posts.Debtor_Address4);
                    DebtorDetails += GenerateLineBreak(posts.Debtor_Address5);
                    DebtorDetails += GenerateLineBreak(posts.Debtor_PostCode);
                    DebtorDetails += "<strong>Telephone:</strong> " + posts.Debtor_Telephone;

                    $('#lbDebtorDetails').html(DebtorDetails);
                }
            }
        });

    });
    




    myApp.onPageInit('account', function (page) {
        mainView.showNavbar();
        localStorage.removeItem('DebtID');
        RetrieveAllDebtsByUserID(localStorage.UserID);
    });
    
    myApp.onPageInit('Register', function (page) {
        ScrollToScreen();
        var autocompleteStandalonePopup = myApp.autocomplete({
            openIn: 'popup', //open in popup
            opener: $$('#autocomplete-standalone-popup'), //link that opens autocomplete
            backOnSelect: true, //go back after we select something
            source: function (autocomplete, query, render) {
                var results = [];
                if (query.length === 0) {
                    render(results);
                    return;
                }
                // Show Preloader
                autocomplete.showPreloader();
                // Do Ajax request to Autocomplete data
                $$.ajax({
                    url: 'https://api.postcodes.io/postcodes/' + query + '/autocomplete',
                    method: 'GET',
                    dataType: 'json',
                    success: function (data) {
                        // Find matched items
                        for (var i = 0; i < data.result.length; i++) {
                            //console.log(data.result.length + " - " + data.result[i]);
                            results.push(data.result[i]);
                            //if (data[i].name.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(data[i]);
                        }
                        // Hide Preoloader
                        autocomplete.hidePreloader();
                        // Render items by passing array with result items
                        render(results);
                    }
                });
            },
            onChange: function (autocomplete, value) {
                // Add item text value to item-after
                $$('#autocomplete-standalone-popup').find('.item-after').text(value[0]);
                // Add item value to input value
                $$('#autocomplete-standalone-popup').find('input').val(value[0]);
                RetrievePostCodeLookup();
            }
        });

    });
}

function GenerateLineBreak(strValue)
{
    if (strValue != "")
        strValue = strValue + ",<br>";
    else
        strValue = "";

    return strValue;
}


function LinkToViewDebtDetails(DebtID) {
    localStorage.DebtID = DebtID;
    mainView.router.loadPage('debt-details.html');
}


function RetrieveAllDebtsByUserID(UserID){

    var strDebt = "";

    var user_url = 'http://beta8.rubixitsolutions.com/DesktopModules/DebtDetails/API/Debt/RetrieveDebtDetailsByUserID?UserID=' + UserID + '&Stopped=false';
    console.log(user_url);
    $.ajax({
        url: user_url,
        dataType: 'json',
        success: function (data) {
            var debts = JSON.parse(data);
            console.log(data);

            strDebt += "<div class='list-block media-list'>";
            strDebt += "            <ul>";

            $.each(debts, function (i) {
                console.log(debts[i].DebtID);

                var Company = debts[i].Debtor_CompanyName
                if (debts[i].Debtor_CompanyName == "0")
                {
                    Company = debts[i].Debtor_Contact;
                }
                var d = new Date(debts[i].DateToBePaid);
                var curr_day = d.getDate();
                var curr_month = d.getMonth();
                var curr_year = d.getFullYear();
                curr_month++;

                strDebt += "<li>";
                strDebt += "    <a href='#' class='otem-link item-content' style='color:#ff9500' onclick='LinkToViewDebtDetails(" + debts[i].DebtID + ");'>";
                strDebt += "        <div class='item-inner'>";
                strDebt += "            <div class='item-title-row'>";
                strDebt += "                <div class='item-title'><strong>" + debts[i].DebtID + "</strong> - " + Company + "</div>";
                strDebt += "                <div class='item-after'>&pound;" + debts[i].Amount + "</div>";
                strDebt += "            </div>";
                strDebt += "            <div class='item-subtitle'>" + curr_day + "/" + curr_month + "/" + curr_year + "</div>";
                strDebt += "            <div class='item-text'>" + debts[i].StatusTitle + "</div>";
                strDebt += "        </div>";
                strDebt += "    </a>";
                strDebt += "</li>";
            });
            strDebt += "    </ul>";
            strDebt += "</div>";
            $('#listDebts').html(strDebt);

        }
        
        
    });
}




function RetrievePostCodeLookup() {
    var PostCode = $('#txtPostCode').val();

    var data = {
        "Latitude": "51.4016924",
        "Longitude": "0.0175727",
        "Addresses": [
          "Legal Investigations UK Ltd, 1 Elmfield Park, , , , Bromley, Kent",
          "M T A Solicitors LLP, 1 Elmfield Park, , , , Bromley, Kent",
          "Metropolitan Police Federation, 2 Elmfield Park, , , , Bromley, Kent",
          "Solex Legal Services Ltd, 1 Elmfield Park, , , , Bromley, Kent"
        ]
    };

    //var user_url = 'https://api.getAddress.io/v2/uk/' + PostCode + '?api-key=Cr3AOF2q7UGZsKAFVZuRGw4193';
    ////console.log(user_url);
    //$.ajax({
    //    url: user_url,
    //    dataType: 'json',
    //    success: function (data) {

        var popupHTML = '<div class="popup"><div class="content-block"><div class="list-block"><ul>';

        var i;
        for (i = 0; i < data.Addresses.length; ++i) {
            var substr = data.Addresses[i].split(',');
            for (var j = 0; j < substr.length; j++) {

                if (j == 0) {
                    popupHTML += "<li class='close-popup' onclick=\"PopulateAddress('" + $.trim(substr[0]) + "','" + $.trim(substr[1]) + "','" + $.trim(substr[2]) + "','" + $.trim(substr[5]) + "','" + $.trim(substr[6]) + "','" + $.trim(PostCode).toUpperCase() + "')\"><label class='label-radio item-content'><input type='radio' name='location' value='" + substr[0] + "' ><div class='item-media'><i class='icon icon-form-radio'></i></div><div class='item-inner'><div class='item-title'>" + substr[0] + ",<br>" + substr[1] + "</div></div></label></li>";
                }
            }
        }
        popupHTML += ' </ul></div><div style="margin-top:20px;"><a href="#" class="button button-big button-fill color-black close-popup">Cancel</a></div></div></div>';
        myApp.popup(popupHTML);
    
    //    }
    //});
}

function PopulateAddress(Address1, Address2, Address3, Address4, Address5, PostCode){
    //console.log(Address1 + "," + Address2 + "," + Address3 + "," + Address4 + "," + Address5 + "," + PostCode);
    $('#plAddress1').show();
    $('#txtAddress1').val(Address1);
    $('#plAddress2').show();
    $('#txtAddress2').val(Address2);
    $('#plAddress3').show();
    $('#txtAddress3').val(Address3);
    $('#plAddress4').show();
    $('#txtAddress4').val(Address4);
    $('#plAddress5').show();
    $('#txtAddress5').val(Address5);
    $('#txtPostCode').val(PostCode);
    $('#ItemTitle').hide();
}


function ShowAccount(){
    mainView.router.reloadPage('account.html');
}

function ShowMyDetails() {
    mainView.router.loadPage('details.html');
}

function Logout() {
    myApp.showPreloader();
    setTimeout(function () {
        localStorage.removeItem('UserID');
        mainView.router.reloadPage('index.html');
    }, 2000);
    myApp.hidePreloader();
}

function UpdateUser() {

}

function UpdatePassword() {
    if ($('#txtNewPassword').val() == $('#txtNewPassword2').val()) {
        myApp.showPreloader();
        var UserID = localStorage.UserID;
        var Email = localStorage.EmailAddress;
        var Oldpassword = $('#txtOldPassword').val();
        var Newpassword = $('#txtNewPassword').val();
        var errormsg = "";
        var user_url = 'http://beta8.rubixitsolutions.com/DesktopModules/AccountDetails/API/User/UpdateUserPassword?UserID=' + UserID + '&Email=' + Email + '&OldPassword=' + Oldpassword + '&NewPassword=' + Newpassword;
        console.log(user_url);
        $.ajax({
            url: user_url,
            dataType: 'json',
            success: function (response) {
                var posts = JSON.parse(response);
                console.log(posts);
                if (posts.status == "1") {
                    myApp.alert(posts.ErrorMsg, 'Password Changed');
                    mainView.router.reloadPage('account.html');
                    myApp.hidePreloader();
                }
                else {
                    $('#Error_Password').show();
                    errormsg = posts.ErrorMsg;
                    $('#PasswordError').html(errormsg);
                    myApp.hidePreloader();
                }
            }
        });
    }
    else
    {
        $('#Error_Password').show();
        errormsg = "The new passwords do not match";
        $('#PasswordError').html(errormsg);
    }
}



function UpdateEmail() {

    myApp.showPreloader();
    var UserID = localStorage.UserID;
    
    var password = $('#password').val();
    var errormsg = "";
    var user_url = 'http://beta8.rubixitsolutions.com/DesktopModules/AccountDetails/API/User/UpdateUserEmail?OldUsername=' + UserID + '&Username=' + password;
    console.log(user_url);
    $.ajax({
        url: user_url,
        dataType: 'json',
        success: function (response) {
            var posts = JSON.parse(response);
            if (posts.status == "1") {
                localStorage.UserID = posts.UserID;
                mainView.router.reloadPage('account.html');
                myApp.hidePreloader();
            }
            else {
                //$('#Error').show();
                //errormsg = posts.ErrorMsg;
                //$('#errormsg').html(errormsg);
                myApp.hidePreloader();
            }
        }
    });
}


function UserLogin() {
    myApp.showPreloader();
    var username = $('#email').val();
    var password = $('#password').val();
    var errormsg = "";
    var user_url = 'http://beta8.rubixitsolutions.com/DesktopModules/AccountDetails/API/User/ValidateUser?UserName=' + username + '&Password=' + password;
    console.log(user_url);
    $.ajax({
        url: user_url,
        dataType: 'json',
        success: function (response) {
            var posts = JSON.parse(response);
            if (posts.status == "1") {
                localStorage.UserID = posts.UserID;
                localStorage.EmailAddress = posts.EmailAddress;
                mainView.router.loadPage('account.html');
                myApp.hidePreloader();
            }
            else {
                $('#Error').show();
                errormsg = posts.ErrorMsg;
                $('#errormsg').html(errormsg);
                myApp.hidePreloader();
            }
        }
    });
}


function ShowRegisterUser() {
    mainView.router.loadPage('register.html')
}


function Register1() {
    $('#plName').hide();
    $('#plAddress').show();
    $$('.page-content').scrollTop(0, 0);
    $$('.hiddendiv').removeClass('spacing');

    localStorage.Title = $('#sltTitle').val();
    localStorage.Firstname = $('#txtFirstName').val();
    localStorage.Lastname = $('#txtSurname').val();
    localStorage.Telephone = $('#txtTelephone').val();
    localStorage.Mobile = $('#txtMobile').val();
}

function Register2() {
    $('#plAddress').hide();
    $('#plLogin').show();
    $$('.page-content').scrollTop(0, 0);
    $$('.hiddendiv').removeClass('spacing');
        
    localStorage.Address1 = $('#txtAddress1').val();
    localStorage.Address2 = $('#txtAddress2').val();
    localStorage.Address3 = $('#txtAddress3').val();
    localStorage.Address4 = $('#txtAddress4').val();
    localStorage.Address5 = $('#txtAddress5').val();
    localStorage.PostCode = $('#txtPostCode').val();
}


function RegisterUser() {
    myApp.showPreloader();

    var EmailAddress = $('#txtRegEmail').val();
    var Password = $('#txtRegPassword').val();

    var Title = localStorage.Title;
    var Firstname = localStorage.Firstname;
    var Lastname = localStorage.Lastname;
    var Telephone = localStorage.Telephone;
    var Mobile = localStorage.Mobile;

    var Address1 = localStorage.Address1;
    var Address2 = localStorage.Address2;
    var Address3 = localStorage.Address3;
    var Address4 = localStorage.Address4;
    var Address5 = localStorage.Address5;
    var PostCode = localStorage.PostCode;
    var errormsg = "";

    var user_url = "http://beta8.rubixitsolutions.com/DesktopModules/AccountDetails/API/User/RegisterUser?PortalID=0&EmailAddress=" + EmailAddress + "&Password=" + Password +
        "&Title=" + Title + "&Firstname=" + Firstname + "&Lastname=" + Lastname +
        "&Address1=" + Address1 + "&Address2=" + Address2 + "&Address3=" + Address3 + "&Address4=" + Address4 + "&Address5=" + Address5 + "&PostCode=" + PostCode + "&Telephone=" + Telephone + "&Mobile=" + Mobile;

    //console.log(user_url);
    $.ajax({
        url: user_url,
        dataType: 'json',
        success: function (response) {
            var posts = JSON.parse(response);
            if (posts.status == "1") {
                localStorage.UserID = posts.UserID;
                mainView.router.loadPage('account.html')
                myApp.hidePreloader();
            }
            else {
                $('#Error2').Show();
                errormsg = posts.ErrorMsg;
                $('#RegisterError').html(errormsg);
                myApp.hidePreloader();
            }
        }
    });
}