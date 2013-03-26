
$(function(){

	/*
	var psv = new karass.PersonSummariesView({model: karass.persons});
	$('.capture').html(psv.render().el);
	*/
	
	//UI = new karass.UIView();
	//$('body').append(UI.render().el);
	
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
	
	/*
	tlv = new Time.Line();
	tlv.render();
	
	// one marker
	for(var i=0; i<tlv.options.length; i+=25){
		tlv.group.add(tlv.createMarker(i));
	}
	*/

	//tdv.scene.add(tlv.group);
	//tdv.scene.fog = new THREE.Fog(0x0099FF, 1000, 2000);
	
	
	
	/*
    jQuery.fn.center = function () {
        this.css("position","absolute");
        this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                    $(window).scrollTop()) + "px");
        this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                    $(window).scrollLeft()) + "px");
        return this;
    }

    var tdv = new karass.ThreeDeeView();
    var psv = new karass.PersonSummariesView({model: karass.persons});
    var gsv = new karass.GroupSummariesView({model: karass.groups});
    
    resize(0.0, 0.5);
    
    var display = '#display';
    var capturing = '#capturing';
    var persons = '#persons';
    var groups = '#groups';
    
    var settings = [
        {
            select: '#display',
            width: '48%'
        },
        {
            select: '#capturing',
            width: '48%'
        },
        {
            select: '#persons',
            width: '48%'
        },
        {
            select: '#groups',
            width: '48%'
        }
    ];
    
    var elements = {
        $display: display,
        $capturing: capturing,
        $persons: persons,
        $groups: groups
    };
    
    function resize(settings){
        for(var i=0; i<settings.length; i++){
            $(settings[i].select).css({
                'width': settings[i].width,
                'max-width': settings[i].width,
                'height': window.innerHeight,
                'max-height': window.innerHeight,
                //'display': 'inline-block'
            });
        }
    }

    //resize(settings);
    
    $(persons).html(psv.render().el);
    $(groups).html(gsv.render().el);

    $(display).html(tdv.render({
        graph: new karass.Graph(), 
        width: $(display).width(), 
        height: $(window).height(), 
        distance: 1000
    }).el);
    var nodeIds = [];
    for(var i=0; i<=500; i++){
        nodeIds.push(tdv.newNode());
    }
    for(var i=0; i<100; i++){
        tdv.newEdge(nodeIds[i], nodeIds[i+1]);
    }
	*/
});