/*
	Joshua Marshall Moore
	2013-03-26
	karass.js
*/

$(function(){

    tdv = new karass.ThreeDeeView();
	
	var renderContainer = 'body';
	$(renderContainer).append(tdv.render({
        graph: new karass.Graph(), 
        width: $(window).width(), 
        height: $(window).height(), 
        distance: 1000
    }).el);
	
	for(var i=0; i<=500; i++){
        tdv.newNode();
    }
});