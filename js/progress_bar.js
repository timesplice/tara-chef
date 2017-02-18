/** estimated time in minutes
 *  progress_status diff of updated time and current time 
 */
function add_progress(progress_bar_id,progress_status,estimated_time,tableName){
 var progress = new RadialProgressChart(progress_bar_id, {
   diameter: 200,
   min: 0,
    max: estimated_time,
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
        if(estimated_time-value > 0)
            return (estimated_time-value) + ' mins left'
        else
            return "";
        }, ' '+tableName]
    }
 });
 progress.update(progress_status);
 return progress;
} 

var progress_bars={};
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

 function loop(p,estimated_time,progress) {
   if (p > estimated_time) {
     setTimeout(function() {
       loop(0,progress)
     }, 3000)
   } else {
     if(progress.options.series[0].value<50){
        progress.options.series[0].color.solid = '#ffffff';
     }else if(progress.options.series[0].value<75){
        progress.options.series[0].color.solid = '#ffff00';
     }else if(progress.options.series[0].value<90){
        progress.options.series[0].color.solid = '#ff0000';
     }
     progress.update(p);
     setTimeout(function() {
       loop(p + 1,progress)
     }, 1000*60)
   }
 }


function blink(table,color){
    $("#"+table.table).css("background-color", 'black');
    if(table.blinking == false)
        return;
    $("#"+table.table).css("background-color", color);
    $("#"+table.table).fadeOut('slow', function(){
        $(this).fadeIn('slow', function(){        
            blink(table,color);
            //console.log('hello')
        });
    });
}
/*progress_bars[progress_bars.length-1].options.series[0].color.background = '#00ff00';
progress_bars[progress_bars.length-1].update(0);*/


