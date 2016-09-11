function _clear(e){if(e) while(e.firstChild) e.removeChild(e.firstChild);}
function _id(id){ return document.getElementById(id); }
function _selector(s){ return document.querySelectorAll(s); }
function _each(nodelist,callback){ Array.prototype.forEach.call(nodelist,callback); }
function _apply(selector,callback){ _each(_selector(selector),callback); }
function _create(e,id){var T=document.createElement(e); if(typeof id==='string') T.id=id; return T;}
function _load(name){var T=_create('script');T.type='text/javascript';T.src='res/'+name+'.db.json';document.head.appendChild(T);return name+'DB';}
// значит, classList у нас поддерживает неопределенное количество аргументов, а appendChild, видите ли, нет, ага, ну это ненадолго
HTMLElement.prototype.appendChilds=function(){ for(var e in arguments) if(arguments[e].nodeName) this.appendChild(arguments[e]); };
HTMLElement.prototype.cloak=function(){ this.style.display="none"; }
HTMLElement.prototype.reveal=function(){ this.style.display="block"; }
Array.prototype.remove=function(index){ if(index>=0 && index<this.length) this.splice(index,1); }
/*
	НАПИСАЛ КУЧУ ГОВНОКОДА
	@
	ЗАТО НИКУДА НЕ ШЛЁТ ЗАПРОСЫ
	@
	HIRE ME TODAY!
*/
var reset={total:0,shown:0,current:[],tag:'',searching:false};
var options={
	limit:12,
	index:Object.keys(database),
	total:0,
	shown:0,
	current:[],
	tag:'',
	ellipsis:{F:22,S:33},
	searching:false,
	tags:{
		horror:{title:'Крипота',count:0,tagname:'ужастик'},
		thriller:{title:'Напрячь нервы',count:0,tagname:'триллер'},
		mystic:{title:'Рептилоиды',count:0,tagname:'мистика'},
		fantasy:{title:'Гномы и эльфы',count:0,tagname:'фентези'},
		scifi:{title:'Научно-популярное',count:0,tagname:'научпоп'},
		adventure:{title:'Приключения',count:0,tagname:'приключения'},
		detective:{title:'Острый сюжет',count:0,tagname:'детектив'},
		good:{title:'Доброта',count:0,tagname:'повседневность'},
		drama:{title:'Трагедия',count:0,tagname:'драма'},
		comedy:{title:'Комедия',count:0,tagname:'комедия'},
		anime:{title:'Мультфильмы',count:0,tagname:'анимационный'},
		soviet:{title:'Советское',count:0,tagname:'СССР'},
		wtf:{title:'Арт-хаус',count:0,tagname:'арт-хаус'},
		documentary:{title:'Документальное',count:0,tagname:'документальный'},
		action:{title:'Экшон',count:0,tagname:'боевик'},
		series:{title:'Сериалы',count:0,tagname:'сериал'},
		criminal:{title:'Улицы разбитых блинов',count:0,tagname:'криминал'},
		coolstory:{title:'Охуительные истории',count:0,tagname:'охуительные истории'}
	}
};
var DOM={
	list:'list',
	counter:'counter',
	feedback:'feedback',
	random:'random',
	tags:'taglist',
	loading:'loader',
	error:'error',
	moar:'moar',
	reset:'reset',
	quote:'quote',
	search:'search',ksearch:'keywords'
};
document.addEventListener('mouseout',function(event){ event.preventDefault(); });
document.addEventListener('DOMContentLoaded',function(){
	options.total=options.index.length;
	for(var element in DOM){ DOM[element]=_id(DOM[element]); }
	for(var E in database){ database[E].genre.forEach(function(element,index){ options.tags[element].count++; }); }
	for(var T in options.tags){
		var li=_create('li');
			li.classList.add('tag');
			li.dataset.tag=T;
			li.title=options.tags[T].tagname;
			li.innerHTML='<span>'+options.tags[T].count+'</span> '+options.tags[T].title;
		DOM.tags.appendChild(li);
	}

	DOM.feedback.onclick=function(){ window.open("https://anon.fm/feedback/","win1feedback","top=400,left=250,width=560,height=235,toolbar=no"); };
	DOM.random.onclick=function(){ _reset(); _show(_random()); options.shown=1; _interact(); _count(1,options.total); };
	DOM.moar.onclick=function(){ _load(); };
	DOM.reset.onclick=function(){ _reset(); _load(); };
	DOM.quote.onclick=function(){ _quote(); };
	DOM.search.onkeydown=function(event){ if(event.keyCode==13) _search(ksearch.value); };

	_load();
	_quote();
},false);
function _loading(is){ if(is) DOM.loading.reveal(); else DOM.loading.cloak(); return true; }
function _error(){
	console.log('\t[RAMP] /!\\ '+arguments[0]+(arguments[1]?' <'+arguments[1]+'>':''));
	DOM.error.innerHTML=/*DOM.error.innerHTML+*/arguments[0]+(arguments[1]?' &lt;'+arguments[1]+'&gt;<br/>':'<br/>');
	DOM.error.reveal();
}
function _random(list){ return Object.keys(database)[(Math.random()*options.total)<<0]; }
function _interact(){
	_apply('.full',function(element){
		element.onclick=function(event){ if(event.target.nodeName=="A") return true; if(event.target!=this) return false; this.dataset.toggle="true"; };
		element.querySelector('div').onclick=function(event){ if(event.target.nodeName=="A") return true; if(event.target.parentNode!=element) return false; element.dataset.toggle="false"; };
	});
	_apply('.tag',function(element){ element.onclick=function(){ _load(this.dataset.tag); }; });
}
function _log(){ for(var A in arguments) console.log(arguments[A]); } // для краткости
function _reset(){
	for(var o in reset){ options[o]=reset[o]; }
	options.total=options.index.length;
	options.current=options.index.slice(0);
	options.tag='';
	_clear(DOM.list);
}
function _load(tag){
	_loading(1);
	DOM.error.cloak();
	if(options.index.length==0){ _error('Ошибка при подзагрузке: индекс пуст, показывать нечего.','Zero index @ _load()'); return false; }
	if(options.shown==0 && !options.searching){ options.current=options.index.slice(0); }
	if(tag!==undefined){
		_reset();
		options.tag=tag;
		options.current=[];
		options.index.forEach(function(element,index){ if(database[element].genre.indexOf(tag)>=0){ options.current.push(element); } });
	}
	var go=new Promise(function(resolve,reject){ // здесь мы только выводим кусок options.current (считая с начала и с лимитом options.limit)
		if(options.current.length==0){ reject(); return false; }
		var entry='';
		var j=options.limit; if(j>=options.current.length) j=options.current.length;
		for(var i=0; i<j; i++){
			entry=(Math.random()*options.current.length)<<0;
			if(!_show(options.current[entry])){ reject(); return false; }
			options.current.remove(entry);
		}
		options.shown+=j;
		_count(options.shown,options.shown+options.current.length);
		resolve();
	});
	go.then(
		function(){ _interact(); setTimeout(function(){ _loading(0); if(options.current.length>0) DOM.moar.reveal(); else DOM.moar.cloak(); },500); },
		function(){ _error('Ошибка при инициализации.','Catchable promise exception @ _load()'); }
	);
	return true;
}
function _search(keywords){
	var list=keywords.split(' ');
	if(list.length==0) return false;
	_reset();
	options.searching=true;
	list.forEach(function(keyword){
		options.index.forEach(function(element,index){
			if(!(database[element].genre.indexOf(keyword)>=0 ||
				 database[element].description.indexOf(keyword)>=0 ||
				 database[element].title.indexOf(keyword)>=0 ||
				 database[element].subtitle.indexOf(keyword)>=0 ||
				 database[element].country.name.indexOf(keyword)>=0
			)){ options.current.remove(options.current.indexOf(element)); }
		});
	});
	if(options.current.length==0) _error('Ничего не найдено.');
	else _load();
}
function _count(i,total){ var C=_id('counter'),o=(i<total?i:total); C.innerHTML="Показано "+o+" "+_ending(o)+" из "+total; }
function _ellipsis(text){ // ВСЁ ОЧЕНЬ ХУЁВО
	var subtext=text.substring(0,170),cut=0,firstline=true,length=170,lines=0,iterator=0;
	for(var position=0; position<length; position++){
		iterator++;
		if(lines>3) break;
		if(iterator>=(firstline&&options.ellipsis.F||options.ellipsis.S)){
			subtext=subtext.substring(0,cut)+'\n'+subtext.substring(cut,length);
			position=cut;
			firstline=false;
			lines++;
			iterator=0;
		}
		else if(subtext[position]===' ') cut=position+1;
	}
	return subtext;
}
function _ending(num){ // А ЗДЕСЬ ЕЩЁ ХУЁВЕЙ
	switch(num%10){
		case 0:
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
			return 'фильмов';
		case 1:
			return 'фильм';
		case 2:
		case 3:
		case 4:
			return 'фильма';
		default:return 'кино';
	}
	return true;
}
function _show(id){
	if(!database[id]){
		_error('Не найден ключ в базе данных.',id);
		return false;
	}
	var data=database[id];

	var article=_create('article');
		article.id=id;
		article.classList.add('smooth');
		article.style.backgroundImage="url('res/poster/"+data.poster+"')";
	var title=_create('div');
		title.classList.add('title');
		var orgtitle=_create('h3');
			orgtitle.innerHTML='«'+data.title+'»';
			orgtitle.classList.add('orgtitle');
		var subtitle=_create('h4');
			subtitle.innerHTML=data.subtitle;
			subtitle.classList.add('subtitle');
		title.appendChilds(orgtitle,subtitle);
	var description=_create('div');
		description.innerHTML=_ellipsis(data.description);
		description.classList.add('description');
	var moar=_create('div');
		moar.innerHTML="Подробнее";
		moar.classList.add('full');
		moar.dataset.toggle=false;
		var expandT=_create('div');
			expandT.classList.add('smooth');
			var expand=_create('div');
				var F_poster=_create('a');
					F_poster.href="res/poster/"+data.poster;
					F_poster.target="_blank";
					F_poster.classList.add('full-poster');
					F_poster.style.backgroundImage="url('res/poster/"+data.poster+"')";
				var F_about=_create('div');
					F_about.classList.add('full-about');
					var F_title=_create('div');
						F_title.innerHTML='«'+data.title+'»';
						F_title.classList.add('full-title');
					var F_subtitle=_create('div');
						F_subtitle.innerHTML=data.subtitle;
						F_subtitle.classList.add('full-subtitle');
						var F_labels=_create('div');
							if(data.budget.spent <= 100000) F_labels.innerHTML+='<div class="full-elite">Элитное кинцо</div><br/>';
							if(data.budget.spent >= 10000000) F_labels.innerHTML+='<div class="full-yoba">Йоба</div><br/>';
							if(data.status){ F_labels.innerHTML+='<div class="full-done">Отсмотрено</div><br/>'; article.classList.add('done'); }
							if(data.out!==true) F_labels.innerHTML+='<div class="full-cs">Coming soon</div><br/>';
							else if(data.budget.gross*5<=data.budget.spent) F_labels.innerHTML+='<div class="full-fail">Не мейнстрим</div><br/>';
						F_subtitle.appendChild(F_labels);
					var F_year=_create('div');
						F_year.innerHTML=data.year;
						F_year.classList.add('full-year');
					var F_duration=_create('div');
						F_duration.innerHTML=data.duration;
						F_duration.classList.add('full-duration');
					var F_genre=_create('div');
						data.genre.forEach(function(element,index){ F_genre.innerHTML+='<kbd class="tag" data-tag="'+element+'">'+(options.tags[element]?options.tags[element].tagname:'?')+'</kbd>&nbsp;'; });
						F_genre.classList.add('full-genre');
					var F_country=_create('div');
						F_country.innerHTML="<span class='flag flag-"+data.country.flag+"'>"+data.country.name+"</span>";
						F_country.classList.add('full-country');
					var F_budget=_create('div');
						F_budget.innerHTML=(data.out===true?( (data.budget.spent?'$'+data.budget.spent:'Бутылка 777')+' / '+(data.budget.gross?'$'+data.budget.gross:(data.budget.spent?'дырка от бублика':'(опустевшая)'))+((data.budget.spent<=data.budget.gross)?' (взлетел)':' (провалился)') ):'(ещё не вышел)');
						F_budget.classList.add('full-budget');
					var F_rating=_create('div');
						F_rating.classList.add('full-rating');
						var F_rating_imdb=_create('cite');
							F_rating_imdb.innerHTML="<span style='color:rgb("+parseInt(250-data.rating.imdb*25+40)+","+parseInt(data.rating.imdb*25-40)+",0)'>"+data.rating.imdb+"</span>";
							F_rating_imdb.classList.add('rating','imdb');
						var F_rating_kp=_create('cite');
							F_rating_kp.innerHTML="<span style='color:rgb("+parseInt(250-data.rating.kp*25+40)+","+parseInt(data.rating.kp*25-40)+",0)'>"+data.rating.kp+"</span>";
							F_rating_kp.classList.add('rating','kinopoisk');
						F_rating.appendChilds(F_rating_imdb,F_rating_kp);
					var F_desc=_create('div');
						F_desc.innerHTML=data.description;
						F_desc.classList.add('full-desc');
					F_about.appendChilds(F_title,F_subtitle,F_year,F_duration,F_genre,F_country,F_budget,F_rating,F_desc); // закурил
				expand.appendChilds(F_poster,F_about);
			expandT.appendChild(expand);
		moar.appendChild(expandT);
	article.appendChilds(title,description,moar);
	DOM.list.appendChild(article);
	return true;
}
var quotes=[
	'Мы доставляем',
	'Жарко, как на Масленице!',
	'Нам нужен микрокислород',
	'Настало время переплыть Ла-Манш',
	'А вас любят в ресторанах?',
	'Лучшие переводы от Маэстро',
	'Русек акживиряваъ',
	'Соблюдайте продовольственную безопасность!',
	'Комнатные диджейские войска',
	'Прокрастинация однажды проиграет',
	'Не болтай!',
	'H - Субботняя конференция',
	'I - Игроблядск',
	'P - Правда',
	'P - Правда',
	'Ra - Радио',
	'S - Сеновал',
	'St - Стартап',
	'Z - Жроч',
	'Zh - Жеканы',
	'Zr - Завтра',
	'Сейчас я досмотрю вот эту хуйню. Досмотрю свой любимый сериал. А вот за-а-автра...',
	'С новым годом!',
	'Охуительные ночные истории',
	'Котлета, трекбол и велосипед. Вы знаете, о чём это',
	'Пожалуйста, не умирай, или мне придётся тоже',
	'В0ШЕДШNХ БYDЕТ ТАIМЛАПS',
	'Just do it later',
	'SAIRA',
	'Бесконечные фильмы',
	'БРБРАР ДРДРАР',
	'Спейс эмбиент под водочку',
	'Чёткий синтипоп в машину',
	'Не забудьте включить свои охранные нейроамулеты',
	'Вкусно? Чувствуешь? Это RA!',
	'And the dreams come true',
	'OM(K',
	'ПОП∀ВШNХ В YЛЬRНО .SК Б?DЕТ Е<∀Т РУМbIНSК0I VАМПNР',
	'Вы должны быть спокойны, ведь кот всегда на месте.',
	'Опасайтесь ехидных газет!',
	'Per aspera ad astra',
	'Нарезки-нарезочки',
	'Премьер-министр, НЕ-Е-Е-ЕЕТ!',
	'>поесть кровать',
	'ЭЛNТА',
	'Загрузить ассеты!',
	'Ошибка: нет ошибки.',
	'A wild black square invaded! &lt;Stochastica sound explored&gt;',
	'А может, мы забудем всё и сбежим? Навсегда.',
	'Цифра любимая моя, зелёная.',
	'Ромио! Ромио! Ромио!',
	'ПРОГОНДОНЕНО! СЕКАТОРОМ',
	'Yeah, it is the right position!',
];
function _quote(){ DOM.quote.innerHTML=quotes[(Math.random()*quotes.length)<<0]; }

/*
- Planning API by path/location
- Planning increasing db
- Planning settings module
- Planning adding process automatization
- Planning associative keyword mechanism realisation
- Planning interface improvements
- Planning radio support
- Planning visualizing
- Planning magnetlinks realization
- Planning counter improvement
*/