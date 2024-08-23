const TRANSLATIONS = {
	QUARTERS: {
		1: "un",
		2: "dos",
		3: "tres",
		4: "quatre",
		quarter: "quart",
		quarters: "quarts"
	},
	HOURS: {
		1: "una",
		2: "dues",
		3: "tres",
		4: "quatre",
		5: "cinc",
		6: "sis",
		7: "set",
		8: "vuit",
		9: "nou",
		10: "deu",
		11: "onze",
		12: "dotze",
	},
	MINUTE: {
		1: "un",
		2: "dos",
		3: "tres",
		4: "quatre",
		5: "cinc",
		6: "sis",
		7: "set",
		8: "vuit",
		9: "nou",
		10: "deu",
		minute: "minut",
		minutes: "minuts"
	}
	
}

const MARGIN = {
	top: 40,
	right: 40,
	bottom: 40,
	left: 40
}

const radians = 0.0174532925; // 1 deg
const timeControl = document.getElementById('time-control');
const timeOutput = document.getElementById('time-output');

const r = (d3.select('figure').node().clientWidth - (MARGIN.top + MARGIN.bottom)) / 2;

const secR = r - 32;
const hourR = r + 28;

const hourHandLength = 1.5 * r/3;
const minuteHandLength = 1.5 * r/2;
const secondHandLength = r - 12;

const radOffset = 1.5708;

let _draggedElement;

let w = d3.select('figure').node().clientWidth - MARGIN.left - MARGIN.right;
let h = d3.select('figure').node().clientHeight - MARGIN.top - MARGIN.bottom;

let minuteScale = secondScale = d3.scale.linear()
	.range([0,354])
	.domain([0,59]);

let hourScale = d3.scale.linear()
	.range([0,330])
	.domain([0,11]);

var drag = d3.behavior.drag()
	.on('dragstart', dragstart)
	.on('drag', drag)
	.on('dragend', dragend);

let handData = [
	{
		type:'hour',
		value:0,
		length:-hourHandLength,
		scale:hourScale,
        steps: 12,
	},
	{
		type:'minute',
		value:0,
		length:-minuteHandLength,
		scale:minuteScale,
        steps: 60,
	},
	{
		type:'second',
		value:0,
		length:-secondHandLength, 
		scale:secondScale,
        steps: 60
	}
];
setHandDataFromDate(new Date());

function updateData(){	
	updateTimeInput();
	updateTimeOutput();		
}

function setHandDataFromDate(date){
	handData[0].value = Math.ceil((date.getHours() % 12));
	handData[1].value = Math.ceil(date.getMinutes());
	handData[2].value = date.getSeconds();
}

function updateTimeInput(){
	timeControl.value=`${handData[0].value.toString().padStart(2,"0")}:${handData[1].value.toString().padStart(2,"0")}`
}

updateData();

let svg = d3.select('svg')
	.attr('width', w + MARGIN.left + MARGIN.right)
	.attr('height', h + MARGIN.top + MARGIN.bottom);

let g = svg.append('g')
	.attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')');

let face = g.append('g')
	.attr('transform', 'translate(' + r + ',' + r + ')');

face.append('circle')
	.attr({
		class: 'outline',
		r: r,
		cx: 0,
		cy: 0,
		fill: '#dd88c6'
	});

face.selectAll('.second')
	.data(d3.range(0, 60))
.enter().append('line')
	.attr({
		class: 'second',
		x1: 0,
		x2: 0,
		y1: r,
		y2: r - 10,
		transform: function(d) {
			return 'rotate(' + minuteScale(d) + ')';
		}
	});

face.selectAll('.second-label')
	.data(d3.range(5,61,5))
.enter().append('text')
	.classed('.second-label', true)
	.text(function(d) { return d; })
	.attr({
		'text-anchor': 'middle',
		x: function(d) {
			return secR * Math.sin(secondScale(d) * radians);
		},
		y: function(d) {
			return -secR * Math.cos(secondScale(d) * radians) + 6;
		},
		fill: 'white',
        'font-size': 16,
        
    
	});

face.selectAll('.hour')
	.data(d3.range(0, 12))
    .enter().append('line')
	.attr({
		class: 'hour',
		x1: 0,
		x2: 0,
		y1: r,
		y2: r - 20,
		transform: function(d) {
			return 'rotate(' + hourScale(d) + ')';
		}
	});

face.selectAll('.hour-label')
	.data(d3.range(1, 13, 1))
.enter().append('text')
	.text(function(d) { return d; })
	.attr({
		class: 'hour-label',
		'text-anchor': 'middle',
		x: function(d) {
			return hourR * Math.sin(hourScale(d) * radians);
		},
		y: function(d) {
			return -hourR * Math.cos(hourScale(d) * radians) + 10;
		},
		fill: 'white',
		'font-size': 28
	});
    

let hands = face.append('g');

hands.selectAll('line')
	.data(handData)
.enter().append('line')
	.attr({
		id: function(d) { return d.type + '-hand'; },
		x1: 0,
		y1: 0,
		x2: function(d) {
            
            var val = degToRad(((360 / d.steps) * d.value ));


			return d.length * Math.cos( 
                val + radOffset
            );
            //return d.length * Math.cos( d.value );
		},
		y2: function(d) {
            var val = degToRad(((360 / d.steps) * d.value ));
			return d.length * Math.sin(
                val + radOffset
            );
            //return d.length * Math.sin(d.value);
		},
		'aria-length': function(d){
			return Math.abs(d.length)
		},
        'aria-steps': function(d){
			return d.steps
		},
        'aria-index': function(d,i,n){
            return i;
        }
	})
	.call(drag);

face.append('circle')
	.attr({
		cx: 0,
		cy: 0,
		r: 12,
		fill: 'white',
		'stroke': '#CCCCCC',
		'stroke-width': 0
	});

function dragstart() {
	_draggedElement = d3.event.sourceEvent.target;
}

function drag() {
	let rad = Math.atan2(d3.event.y, d3.event.x);
    let deg = radToDeg(rad)
    let stepAngle = 360 / _draggedElement.getAttribute('aria-steps');
    deg = Math.round(deg / stepAngle) * stepAngle;
    rad = degToRad(deg);
    
	d3.select(this)
		.attr({
		
			x2: function(d) {
				return _draggedElement.getAttribute('aria-length') *  Math.cos(rad);
			},
			
			y2: function(d) {
				return  _draggedElement.getAttribute('aria-length') * Math.sin(rad);
			}
		});

    let offset = radOffset /(degToRad(stepAngle)) -1;
    let value = Math.ceil((deg/stepAngle) + offset) % _draggedElement.getAttribute('aria-steps');
	
    handData[_draggedElement.getAttribute('aria-index')].value = value >= 0 
        ? value 
        : parseInt(_draggedElement.getAttribute('aria-steps')) + value	
	updateTimeInput();		
	updateTimeOutput();		
}

function dragend() {
	_draggedElement = null;
}

function degToRad(x){ return x * (Math.PI / 180);}
function radToDeg(x){ return x * (180 / Math.PI);}

timeControl.addEventListener("input", function(e){
	let newDate = new Date();
	newDate.setHours(timeControl.value.split(":")[0]);
	newDate.setMinutes(timeControl.value.split(":")[1]);
	setHandDataFromDate(newDate);
	updateData();
	
})



function updateTimeOutput(){
	const HOUR_MINUTES = 60;

	let hour = handData[0].value || 12;
	let minute = handData[1].value;

	let quarter = minute / (HOUR_MINUTES / 4);
	let quarterInt = Math.ceil(quarter);
	let nearestQuarter = nearestQuarterRound(quarter ) * 1;
	let minuteFromQuarterDiff = Math.abs(minute -((HOUR_MINUTES / 4)* nearestQuarter))
	let nextHour = ((hour + 1) % 12) || 12;
	let out = "";

	if(minute == 0){
		out += `${hour == 1 ? 'és la' : 'son les'} ${TRANSLATIONS.HOURS[hour]} en punt`;
	}else if(nearestQuarter == 4 && minuteFromQuarterDiff != 0 && nearestQuarter >= quarterInt){
		out += `${minuteFromQuarterDiff == 1 ? 'manca' : 'manquen'} ${TRANSLATIONS.MINUTE[minuteFromQuarterDiff]} (${minuteFromQuarterDiff == 1 ? TRANSLATIONS.MINUTE.minute : TRANSLATIONS.MINUTE.minutes}) per ${nextHour == 1 ? 'la' : 'les'} ${TRANSLATIONS.HOURS[nextHour]} `;
	}else if(nearestQuarter == 0 && minuteFromQuarterDiff != 0 ){
		out += `${hour == 1 ? 'és la' : 'son les'} ${TRANSLATIONS.HOURS[hour]} i ${TRANSLATIONS.MINUTE[minuteFromQuarterDiff]} (${minuteFromQuarterDiff == 1 ? TRANSLATIONS.MINUTE.minute : TRANSLATIONS.MINUTE.minutes})`;
	}else{
		let quartersOut = "";
		if(nearestQuarter > 0 && nearestQuarter < 4){
			quartersOut += `${nearestQuarter == 1 ? 'és' : 'son'} ${TRANSLATIONS.QUARTERS[nearestQuarter]} ${nearestQuarter == 1 ? TRANSLATIONS.QUARTERS.quarter : TRANSLATIONS.QUARTERS.quarters}`;
		}
	
	
		let minutesOut = "";
	
		if(minuteFromQuarterDiff != 0){
			if(nearestQuarter >= quarterInt ){
				minutesOut += `menys ${TRANSLATIONS.MINUTE[minuteFromQuarterDiff]}`
			}else{
				minutesOut += `i ${TRANSLATIONS.MINUTE[minuteFromQuarterDiff]}`
			}
	
			minutesOut += ` (${minuteFromQuarterDiff == 1 ? TRANSLATIONS.MINUTE.minute : TRANSLATIONS.MINUTE.minutes})`
		}

		out+= `${quartersOut} ${minutesOut} ${(nextHour == 1 || nextHour == 11) ? "d'" : "de "}${TRANSLATIONS.HOURS[nextHour]}`
	}

	timeOutput.innerHTML = out;
}

function nearestQuarterRound(num) {
	const decimalPart = num % 1; // Obtiene la parte decimal
	let threshold = 1.9 / 3;     // Define el umbral de 1/3
	
	if (decimalPart <= threshold) {
	  return Math.floor(num); // Redondea hacia abajo si la porción decimal es menor o igual a 1/3
	} else {
	  return Math.ceil(num);  // Redondea hacia arriba en los otros casos
	}
  }

