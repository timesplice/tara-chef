/*
var firebase = require("firebase/app");
var auth  = require("firebase/auth");
var database = require("firebase/database");*/

var hotelId =  "-KdHPI3vTwaVTsq4DeQK";
var presentHotelOrder=null;
var presentUserOrder={};
var presentOrderBill=0;

$(document).ready(function(){
	$('#order_home').hide();
    init_firebase();
    changeChefResponseFormSubmit();
});

function changeChefResponseFormSubmit(){
    $('#response_form').submit(function(event){
        event.preventDefault();
        if(presentHotelOrder == null){
            return;
        }   
        //presentOrder
        var msg = $('#chefResponseMsg  option:selected').val();
        var hours = parseInt($('#chefEstimatedHours  option:selected').val());
        var mins = parseInt($('#chefEstimatedMins  option:selected').val());
        var estimatedTime = hours*60+mins;
        document.getElementById('popup-timer-chooser').style.display='none';
        console.log('Message:',msg);
        console.log("Estimated Time:",estimatedTime);
        
        presentUserOrder['timeStamp']=presentHotelOrder.timeStamp=new Date().getTime();
        presentUserOrder['waitingTime']=presentHotelOrder.waitingTime=estimatedTime;
        presentUserOrder['chefReply'] = msg; 
        presentUserOrder['bill']=presentOrderBill;

        var newUserOrderKey = firebase.database().ref().child('userOrders/'+presentHotelOrder.user).push().key;
          
        firebase.database().ref('hotelOrders/'+presentHotelOrder.hotel +'/'+ newUserOrderKey).set(presentHotelOrder);
        firebase.database().ref('userOrders/'+presentHotelOrder.user +'/'+ newUserOrderKey).set(presentUserOrder);
        
        //adding progress bar to table
        //need to add progress bar, call loop, with all tables dict

        console.log('response sent to user');
    });
}

function init_firebase(){
    var config = {
        apiKey: "AIzaSyCFjW6xEudW7EpMRQk6IjMymfNLCfgo-Vw",
        authDomain: "tara-66080.firebaseapp.com",
        databaseURL: "https://tara-66080.firebaseio.com",
        storageBucket: "tara-66080.appspot.com",
        messagingSenderId: "711981923636"
    };
    firebase.initializeApp(config);
    //read_from_firebase();
    read_tables_from_firebase();
    
}

function addFireBaseEventListeners(){
    console.log('firebase event listeners addeding');
    var ordersRef = firebase.database().ref('hotelOrders/' + hotelId);
    ordersRef.on('child_added', function(data) {
        //console.log('order new:',data.key,data.val());
        if(data!=null && data.key!=null&&(data.val().delivered==false||data.val().payment==false)){
            orderAddedToHotel(data.val());
        }
    });

    ordersRef.on('child_changed', function(data) {
        //setCommentValues(postElement, data.key, data.val().text, data.val().author);
        console.log('order modified:',data.key,data.val());
        if(data!=null && data.key!=null){//&&data.val().payment==true){
            orderStatusChanged(data.val());
        }
    });

    ordersRef.on('child_removed', function(data) {
        console.log('order removed:',data.key,data.val());
        orderRemovedFromHotel(data.val());
    });    
}

function orderAddedToHotel(order){
    console.log('added order:',order);
    //show notification based on table id
    if(order.timeStamp == null || order.timeStamp == -1){
        //new order
        //setEstimated time     
        progress_bars[order.table].update(0);  
        order.blinking=true; 
        blink(order,'green');
        $('#'+order.table).click(function(){
            order.blinking = false
            openTableOrder(order);
        });
    }else{
        //existing
        progress_bars[order.table].max = order.waitingTime;
        var givenTime = new Date(order.timeStamp);
        var now = new Date();
        var diffMs = (now - givenTime);
        var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
        progress_bars[order.table].update(diffMins);
    }
}

function orderStatusChanged(order){
    if(order.delivered == true && order.payment == true){
        //remove
        progress_bars[order.table].update(order.estimatedTime);
        $('#'+order.table).css("background-color", 'black');
        $('#'+order.table).click(function(){
            //nothing to do
        });
        return;
    }else if(order.delivered == true){
        //waiting for payment
        progress_bars[order.table].update(order.estimatedTime);
        $('#'+order.table).css("background-color", 'orange');
        return;
    }else{
        //nothing to do
        //simply adding this lines, i dnt know if this lines make any sense at any time
        progress_bars[order.table].update(order.estimatedTime);
        $('#'+order.table).css("background-color", 'black');
        $('#'+order.table).click(function(){
            //nothing to do
        });
    }

}

function orderRemovedFromHotel(order){
    progress_bars[order.table].update(order.estimatedTime);
    $('#'+order.table).css("background-color", 'black');
    $('#'+order.table).click(function(){
       //nothing to do
    });
}

function openTableOrder(order){
    //hide tables and show single table order
    console.log('clicked order:',order);
    $('#tables_home').hide();
    document.getElementById('order_items').innerHTML ="";    
    $('#order_home').show();
    presentHotelOrder = order;
    presentUserOrder = {};
    presentOrderBill=0;

    presentUserOrder['hotel']=order.hotel;
    presentUserOrder['table']=order.table;
    presentUserOrder['user']=order.user;
    presentUserOrder['order']=order.order;
    presentUserOrder['payment']=order.payment;
    presentUserOrder['delivered']=order.delivered;
    
    //hide tables
    //get all food item details
    for(foodId in order.orderedItems){
        getFoodDetails(order,foodId,order.orderedItems[foodId]);
    }

}

function getFoodDetails(order,foodId,foodCnt){
    var path=('menus/' + order.hotel+'/'+foodId);
    //var path=('users');
	firebase.database().ref(path).once('value').then(function(snapshot) {
		if(snapshot!=null){
			//update_template_from_firebase( snapshot.val().data );
            var foodKey = snapshot.key;
            var foodData = snapshot.val();
            console.log('FOOD',foodData);
            addFoodToUI(order,foodCnt,foodKey,foodData);  
        }
	});
}

function addFoodToUI(order,foodCnt,foodKey,food){
    var foodHtml = '<div class="w3-quarter custom-quarter">'+
                        '<div class="w3-card-4 custom-card-4" >'+
                            '<div class="w3-center card-image" id="'+foodKey+'">'+
                                '<img class="green-tick" src="images/tick.svg" hidden/>'+
                            '</div>'+  
                            '<div class="w3-container w3-center card-content">'+                                    
                            '<div class="card-title-count">'+
                                '<h3 class="card-title">'+food.name+'</h3>'+
                                '<span class="w3-badge card-count">'+foodCnt+'</span>'+
                            '</div>'+
                            '</br>'+
                            '<h5 class="card-text">'+food.shortDesc+'</h5>'+ //need to change
                            '</div>'+
                        '</div>'+
                    '</div>';
    presentOrderBill = presentOrderBill +(food.price*foodCnt);
    document.getElementById('order_items').innerHTML = document.getElementById('order_items').innerHTML +foodHtml;
    
    //firebase.storage().ref(order.hotel+'/foods/'+food.imageUrl).getDownloadURL().then(function(url) {
    firebase.storage().ref(food.imageUrl).getDownloadURL().then(function(url) {
        $('#'+foodKey).css('background-image','linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0)), url('+url+')'); 
        $('#'+foodKey).click(function(){
            toggleFoodSelection(foodKey,url);
        });
    });   
}

function toggleFoodSelection(elementId,url){
    if($('#'+elementId+' img').is(':visible')){
        $('#'+elementId).css('background-image','linear-gradient(rgba(255,255,255,0),rgba(255,255,255,0)), url('+url+')'); 
        $('#'+elementId+' img').hide();
    }else{
        $('#'+elementId).css('background-image','linear-gradient(rgba(255,255,255,0.5),rgba(255,255,255,0.5)), url('+url+')'); 
        $('#'+elementId+' img').show();
    }
}

function startTimerForOrder(order){
    progress_bars[order.table].max = order.estimatedTime;
    progress_bars[order.table].min = 0;
    order.table

}

function send_response_to_user(userId,messageToUser,estimatedTime,callback){
	var path='/users/'+name;
	var data=$('#template').html();
	firebase.database().ref(path).once('value').then(function(snapshot) {
		console.log(snapshot.val());
	});
	firebase.database().ref(path).set({
		data: data,
	},callback);
}

function read_tables_from_firebase(){
    //get list of tables from db for this hotel
	console.log("reading tables from firebase");
    var path=('tables/' + hotelId);
    //var path=('users');
	firebase.database().ref(path).once('value').then(function(snapshot) {
		if(snapshot!=null){
			//update_template_from_firebase( snapshot.val().data );
            console.log("Tables:",snapshot);
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                add_table_to_hotel(childKey,childData);
            });
        }
	});

    addFireBaseEventListeners();    
}

function add_table_to_hotel(tableId,table){
    create_progress_bar(tableId);
    progress_bars[tableId]=(add_progress('#'+tableId,0,0,table.tableName));
}
function create_progress_bar(tableId){
    var custom_html='<div class="w3-quarter w3-border w3-border-white w3-text-white">'+
                        '<div class="w3-center">'+   
                            '<div id="'+tableId+'"></div>'+
                        '</div>'+
                    '</div>';
    //$('.custom-home-container').append(custom_html);
    document.getElementById('tables_home').innerHTML=document.getElementById('tables_home').innerHTML+custom_html;
}

