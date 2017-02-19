/** estimated time in minutes
 *  progress_status diff of updated time and current time 
 */
function add_progress(progress_bar_id,progress_status,estimated_time,tableName){
 var progress = new RadialProgressChart(progress_bar_id, {
   diameter: 200,   
   //max: estimated_time,
   stroke: {
            width: 6,
            gap: 1
          },   
     series: [
          { value: progress_status,  color: {
             solid: '#fff',background: '#fff'             
           }
        }
     ],
    center: {
        content: [function(value) {            
        //if(100-value > 0)
            return (100-value) + '% time left';
        //else
          //  return "";
        }, ' '+tableName]
    }
 });
 progress.update(progress_status);
 return progress;
} 

var progress_bars={};
var progress_bars_loop={};
var progress_bar_blink={};
/*
for(var i=1;i<=2;i++){
    for(var j=1;j<=4;j++){
        progress_bars.push(add_progress('#progress_bar_r'+i+'_c'+j,0,100,'table new'));        
    }
}*/

function init_progress_bar(index){
    if(index>=progress_bars.length-1)
        return;
    setTimeout(function(){
        loop(0,progress_bars[index]);        
        init_progress_bar(index+1);
    },500);
}

//init_progress_bar(0);

/**
 * to set color of progress bar radial 
 * progress_bars[0].options.series[0].color.solid = '#ff0000'
 * 
 */

function getRandom(min, max) {
   return Math.random() * (max - min) + min;
 }

 function loop_progress(tableId,elapsedTime,estimatedTime) {
     var progressPercentage = parseInt((elapsedTime*1.0/estimatedTime)*100);
     console.log('loop table:'+tableId);
     console.log('loop elapsed time:'+elapsedTime);
     console.log('loop waiting time:'+estimatedTime);
     console.log('progressPercentage:'+progressPercentage)

     if(progressPercentage<50){
        progress_bars[tableId].options.series[0].color.solid = '#ffffff';
     }else if(progressPercentage<75){
        progress_bars[tableId].options.series[0].color.solid = '#e67e22';
     }else if(progressPercentage<90){
        progress_bars[tableId].options.series[0].color.solid = '#e74c3c';
     }else if(progressPercentage>=90){
        progress_bars[tableId].options.series[0].color.solid = '#ff0000';
     }
     //console.log('before update:',progress_bars[tableId],progress_bars[tableId].options.series[0]);
     
     progress_bars[tableId].update(progressPercentage);
     $("#"+tableId).css("background-color", 'black');

   if (elapsedTime > estimatedTime) {
     if(progressPercentage >= 100)
        $("#"+tableId).css("background-color", 'red');
        
        progress_bars[tableId].update(0);
     /*setTimeout(function() {
       loop(0,progress)
     }, 3000)*/     
     return;
   }else if( progress_bars_loop[tableId] == false ){        
        return;
   } else {
     //console.log('updated bar:',progress_bars[tableId],progress_bars[tableId].options.series[0]);
     setTimeout(function() {
       loop_progress(tableId,elapsedTime+1,estimatedTime)
     }, 1000)
   }
 }


function blink(table,color){
    $("#"+table).css("background-color", 'black');
    if(progress_bar_blink[table] == false)
        return;
    $("#"+table).css("background-color", color);
    $("#"+table).fadeOut('slow', function(){
        $(this).fadeIn('slow', function(){        
            blink(table,color);
            //console.log('hello')
        });
    });
}
/*progress_bars[progress_bars.length-1].options.series[0].color.background = '#00ff00';
progress_bars[progress_bars.length-1].update(0);*/


