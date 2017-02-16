function add_progress(progress_bar_id){
 var progress = new RadialProgressChart(progress_bar_id, {
   diameter: 200,
   stroke: {
            width: 6,
            gap: 1
          },   
     series: [
          { value: 0,  color: {
             solid: '#fff',background: '#fff'             
           }
        }
     ],
    center: {
        content: [function(value) {
        return (100-value) + ' mins left'
        }, ' Family Table']
    }
 });
 progress.update(0);
 return progress;
} 

var progress_bars=[]
for(var i=1;i<=2;i++){
    for(var j=1;j<=4;j++){
        progress_bars.push(add_progress('#progress_bar_r'+i+'_c'+j));        
    }
}

function init_progress_bar(index){
    if(index>=progress_bars.length-1)
        return;
    setTimeout(function(){
        loop(0,progress_bars[index]);
        init_progress_bar(index+1);
    },500);
}

init_progress_bar(0);

/**
 * to set color of progress bar radial 
 * progress_bars[0].options.series[0].color.solid = '#ff0000'
 * 
 */

function getRandom(min, max) {
   return Math.random() * (max - min) + min;
 }

 function loop(p,progress) {
   if (p > 100) {
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
     }, 100)
   }
 }


function blink(selector,color){
    $(selector).css("background-color", color);
$(selector).fadeOut('slow', function(){
    $(this).fadeIn('slow', function(){        
        blink(this);
        //console.log('hello')
    });
});
}
/*progress_bars[progress_bars.length-1].options.series[0].color.background = '#00ff00';
progress_bars[progress_bars.length-1].update(0);*/

blink('#progress_bar_r2_c4','green');
