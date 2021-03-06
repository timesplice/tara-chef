/*
var firebase = require("firebase/app");
var auth  = require("firebase/auth");
var database = require("firebase/database");*/

var hotelId =  "hotel1";
var presentHotelOrder=null;
var presentUserOrder={};
var presentOrderBill=0;

var orderNames=[];
var playOrderVoiceFlag=false;

var speak = new SpeechSynthesisUtterance();

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

        //var newUserOrderKey = firebase.database().ref().child('userOrders/'+presentHotelOrder.user).push().key;
          
        firebase.database().ref('hotelOrders/'+presentHotelOrder.hotel +'/'+ presentHotelOrder.order).update(presentHotelOrder);
        firebase.database().ref('userOrders/'+presentHotelOrder.user +'/'+ presentHotelOrder.order).set(presentUserOrder);
        
        //adding progress bar to table
        //need to add progress bar, call loop, with all tables dict
        startTimerForOrder(presentHotelOrder);
        
        console.log('response sent to user');
        
    });
}

function orderCompleted(){
    console.log('order completer');

    presentHotelOrder.delivered = true;
    progress_bars_loop[presentHotelOrder.table] = false;
    firebase.database().ref('hotelOrders/'+presentHotelOrder.hotel +'/'+ presentHotelOrder.order+'/delivered').set(true);
    firebase.database().ref('userOrders/'+presentHotelOrder.user +'/'+ presentHotelOrder.order+'/delivered').set(true);
        
    //presentHotelOrder = null;

    $('#order_home').hide();
    $('#tables_home').show();
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
    firebase.auth().signOut();
    firebase.auth().signInWithEmailAndPassword('a@a.com', 'aa11aa').catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
         // [START_EXCLUDE]
          if (errorCode === 'auth/wrong-password') {
            alert('Wrong password.');
          } else {
            alert(errorMessage);
          }
          console.log(error);          
    });

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          console.log("user email:",user.email,user);
          //read_from_firebase();
          read_tables_from_firebase();
    
        }
    });
    
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
        //order.blinking=true; 
        progress_bar_blink[order.table] = true;
        blink(order.table,'green');
        $('#'+order.table).click(function(){
            progress_bar_blink[order.table] = false
            openTableOrder(order);
        });

        speechSynthesis.speak(new SpeechSynthesisUtterance("Hello, You got an order from "+order.table));

    }else{
        //existing
        startTimerForOrder(order);
    }
}

function orderStatusChanged(order){
    if(order.delivered == true && order.payment == true){
        //remove
        progress_bars[order.table].update(order.estimatedTime);
        $('#'+order.table).css("background-color", 'black');
        setTimeout(function(){
            $('#'+order.table).css("background-color", 'black');
        },1000);
        $('#'+order.table).click(function(){
            //nothing to do
        });

        speechSynthesis.speak(new SpeechSynthesisUtterance("Payment done from "+order.table)); 
        progress_bars_loop[order.table] = false;
        return;
    }else if(order.delivered == true){
        //waiting for payment
        progress_bars_loop[order.table] = false;
        progress_bars[order.table].update(order.estimatedTime);
        $('#'+order.table).css("background-color", 'orange');
        setTimeout(function(){
            $('#'+order.table).css("background-color", 'orange');
        },1000);
        return;
    }else if(payment == true){
        $('#'+order.table).css("background-color", 'black');        
        setTimeout(function(){
            $('#'+order.table).css("background-color", 'black');
        },1000);
    }

}

function orderRemovedFromHotel(order){
    progress_bars[order.table].update(order.estimatedTime);
    $('#'+order.table).css("background-color", 'black');
    setTimeout(function(){
            $('#'+order.table).css("background-color", 'black');
        },1000);
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

    presentUserOrder['hotel']=presentHotelOrder.hotel;
    presentUserOrder['table']=presentHotelOrder.table;
    presentUserOrder['user']=presentHotelOrder.user;
    presentUserOrder['order']=presentHotelOrder.order;
    presentUserOrder['payment']=presentHotelOrder.payment;
    presentUserOrder['delivered']=presentHotelOrder.delivered;
    
    orderedItems = [];
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
            orderNames.push(foodCnt+" "+foodData.name);
            
            if(order !=null && order.orderedItems!=null &&  Object.keys(order.orderedItems).length == orderNames.length){
                    speechSynthesis.speak(new SpeechSynthesisUtterance("Do you want me to read Order"));
                    playOrderVoiceFlag=true;
                    recognition.start();

            }

        }
	});
}

function playVoice(){
    if(playOrderVoiceFlag){
        for(i=0;i<orderNames.length;i++)
            speechSynthesis.speak(new SpeechSynthesisUtterance(orderNames[i]));
    }
    playOrderVoiceFlag = false;
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
    $('#'+order.table).click(function(){
            progress_bar_blink[order.table] = false
            openTableOrder(order);
    });

    if(order.delivered == true){
        $('#'+order.table).css("background-color", 'orange');
        setTimeout(function(){
            $('#'+order.table).css("background-color", 'orange');
        },1000);
        return;
    }

    //progress_bars[order.table].max = order.waitingTime;
    //progress_bars[order.table].min = 0;    
    
    console.log('updated progress bar:',order.table, progress_bars[order.table]);

    progress_bars_loop[order.table] = true;

    var givenTime = new Date(order.timeStamp);
    var now = new Date();
    var diffMs = (now - givenTime);
    var elapsedTime = parseInt(Math.round(((diffMs % 86400000) % 3600000) / 60000));

    console.log('elapsed time:'+elapsedTime);
    console.log('waiting time:'+order.waitingTime);

    var progressPercentage = (elapsedTime*1.0/order.waitingTime)*100;
    progress_bars[order.table].update(progressPercentage);            
        
    loop_progress(order.table,elapsedTime,order.waitingTime,false);    
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
            //console.log("Tables:",snapshot);
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
    console.log('table:'+tableId, table);
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
    //document.getElementById('tables_home').innerHTML=document.getElementById('tables_home').innerHTML+custom_html;
    $('#tables_home').append(custom_html);
}

