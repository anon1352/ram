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
	debug:1,
	theme:0,
	limit:12,
	index:Object.keys(database),
	total:0,
	shown:0,
	current:[],
	tag:'',
	ellipsis:{F:22,S:33},
	random:1,
	searching:false,
	searchmode:0,
	radio:0,
	customize:{ /* defaults */
		optLimit:16,
		optTheme:0,
		optSearch:0,
		optRandom:12,
		optRadio:0,
		optDebug:1
	},
	tags:{
		horror:{count:0,title:'Крипота',tagname:'ужастик'},
		thriller:{count:0,title:'Напрячь нервы',tagname:'триллер'},
		mystic:{count:0,title:'Рептилоиды',tagname:'мистика'},
		fantasy:{count:0,title:'Гномы и эльфы',tagname:'фентези'},
		scifi:{count:0,title:'Научно-популярное',tagname:'научпоп'},
		adventure:{count:0,title:'Приключения',tagname:'приключения'},
		detective:{count:0,title:'Острый сюжет',tagname:'детектив'},
		good:{count:0,title:'Доброта',tagname:'повседневность'},
		drama:{count:0,title:'Трагедия',tagname:'драма'},
		comedy:{count:0,title:'Комедия',tagname:'комедия'},
		animated:{count:0,title:'Мультфильмы',tagname:'анимационный'},
		soviet:{count:0,title:'Советское',tagname:'СССР'},
		arthouse:{count:0,title:'Арт-хаус',tagname:'арт-хаус'},
		documentary:{count:0,title:'Документальное',tagname:'документальный'},
		action:{count:0,title:'Экшон',tagname:'боевик'},
		series:{count:0,title:'Сериалы',tagname:'сериал'},
		criminal:{count:0,title:'Улицы разбитых блинов',tagname:'криминал'},
		coolstory:{count:0,title:'Охуительные истории',tagname:'охуительные истории'},
		short:{count:0,title:'Короткометражное',tagname:'короткометражка'},
		erotic:{count:0,title:'Эротика',tagname:'эротика'}
	},
	countries:{
		'ru':'Россия',
		'jp':'Япония',
		'be':'Бельгия',
		'by':'Беларусь',
		'es':'Испания',
		'it':'Италия',
		'de':'Германия',
		'fr':'Франция',
		'nl':'Нидерланды',
		'us':'США',
		'ua':'Украина',
		'gb':'Великая Британия',
		'se':'Швеция',
		'tw':'Тайвань',
		'ca':'Канада',
		'kr':'Южная Корея',
		'kp':'КНДР',
		'cn':'Китай',
		'pl':'Польша',
		'au':'Австралия',
		'ch':'Швейцария',
		'ro':'Румыния',
		'fi':'Финляндия',
		'lv':'Латвия',
		'cz':'Чехия',
		'kz':'Казахстан',
		'ussr':'СССР'
	}
};
var DOM={
	logo:'logo',
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
	search:'search',ksearch:'keywords',
	api:{},
	options:'options',/*optsave:'optSave',*/optsaved:'optSaved',opterror:'optError'
};
document.addEventListener('mouseout',function(event){ event.preventDefault(); });
document.addEventListener('DOMContentLoaded',function(){
	options.total=options.index.length;
	options.api=location.hash.substring(1).split('&');
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

	DOM.logo.onclick=function(){ _reset(); _load(); };
	DOM.feedback.onclick=function(){ window.open("https://anon.fm/feedback/","win1feedback","top=400,left=250,width=560,height=235,toolbar=no"); };
	DOM.random.onclick=function(){
		_reset();
		for(var i=0;i<options.random;i++){ _show(_random()); }
		options.shown=options.random;
		_interact();
		_count(options.random,options.total);
	};
	DOM.moar.onclick=function(){ _load(); };
	DOM.reset.onclick=function(){ _reset(); _load(); };
	DOM.quote.onclick=function(){ _quote(); };
	DOM.search.onkeydown=function(event){ if(event.keyCode==13) _search(ksearch.value); };
	//DOM.optsave.onclick=function(){ _opt_save(); _opt_apply(); DOM.optsaved.reveal(); setTimeout(function(){ DOM.optsaved.cloak(); },2000); };

	_apply('#optionlist input',function(element){
		element.onkeydown=function(event){
			if(event.keyCode==13){
				if(!/\d+/.test(element.value) || parseInt(element.value)<0){
					DOM.opterror.reveal();
					setTimeout(function(){ DOM.opterror.cloak(); },2000);
					return false;
				}
				if(options.customize.hasOwnProperty(element.name)) options.customize[element.name]=JSON.parse(element.value);
				_opt_save(); _opt_apply();
				DOM.optsaved.reveal();
				setTimeout(function(){ DOM.optsaved.cloak(); },2000);
			}
		};
	});
	_apply('#optionlist select',function(element){
		element.onchange=function(event){
			if(options.customize.hasOwnProperty(element.name)) options.customize[element.name]=element.selectedIndex;
			_opt_save(); _opt_apply();
			DOM.optsaved.reveal(); setTimeout(function(){ DOM.optsaved.cloak(); },2000);
		};
	});
	_apply('.dynamic-link',function(element){
		element.onclick=function(event){
			event.preventDefault();
			ajax(element.href,'get',null,null,
				function(success){ DOM.list.innerHTML=success; },
				function(error){ console.log(error); }
			);
		};
	});

	_opt_load();
	_opt_show();
	if(options.dsearch){ _search(decodeURIComponent(options.dsearch)); options.dsearch=''; } else _load();
	_quote();
},false);
function createXMLHTTPObject() {
	var XMLHttpFactories=[
		function(){return new XMLHttpRequest();},
		function(){return new ActiveXObject("Msxml2.XMLHTTP");},
		function(){return new ActiveXObject("Msxml3.XMLHTTP");},
		function(){return new ActiveXObject("Microsoft.XMLHTTP");}
	];
	var xmlhttp=false;
	for(var i=0;i<XMLHttpFactories.length;i++) { try { xmlhttp = XMLHttpFactories[i](); } catch (e) { continue; } break; }
	return xmlhttp;
}
function ajax_success(data){ console.log(data); }
function ajax_error(xhr,status){ console.log('HTTP '+xhr+' '+status); }
function ajax_pending(state){ if(state) console.log('ajax state opened'); else console.log('ajax state closed'); }
function ajax(url,method,data,headers,success,error) {
	if(!data && method=='POST') return false;
	if(!(req=createXMLHTTPObject())) return false;
	if(typeof success!='function') success=ajax_success;
	if(typeof error!='function') error=ajax_success;
	req.open(method,url,true); // true for async
	if(!!headers) for(var i in headers) req.setRequestHeader(i, headers[i]);
	req.send(data);
	req.onreadystatechange=function(){
		if(req.readyState==4){
			if(req.status==200 || req.status==304) success(req.responseText,req.getResponseHeader('X-AJAX-Response'));
			else error(req.status,req.statusText);
		}
	};
	return req.responseText;
}
function _opt_load(){
	var S=localStorage.getItem('customize');
	if(!S) _opt_save();
	else {
		var O=JSON.parse(S); if(!O){ _error('Ошибка при загрузке настроек.','Unable to load options @ _opt_load()'); return false; }
		for(var o in O) if(options.customize.hasOwnProperty(o) && O[o]!==undefined){ options.customize[o]=O[o]; }
		_opt_apply();
	}
}
function _opt_save(){ localStorage.setItem('customize',JSON.stringify(options.customize)); }
function _opt_apply(){
	options.limit=options.customize.optLimit;
	if(options.theme!=options.customize.optTheme){
		options.theme=options.customize.optTheme;
		var th=_create('link');
			th.rel="stylesheet";
			th.type="text/css";
			th.media="screen";
			th.href=options.theme?"res/dark.css":"res/light.css";
		document.head.appendChild(th);
		var exist=document.head.querySelector('link[href="res/'+options.theme?"light.css":"dark.css"+'"]');
		if(exist) document.head.removeChild(exist);
	}
	options.searchmode=options.customize.optSearch;
	options.random=options.customize.optRandom;
	options.radio=options.customize.optRadio;
	options.debug=options.customize.optDebug;
	_opt_show();
}
function _opt_show(){
	var D;
	for(var o in options.customize){
		D=DOM.options.querySelector('[name="'+o+'"]');
		if(D){
			if(D.nodeName=='SELECT') D.selectedIndex=options.customize[o];
			else D.value=options.customize[o];
		}
	}
}
function _loading(is){ if(is) DOM.loading.reveal(); else DOM.loading.cloak(); return true; }
function _error(){
	console.log('\t[RAMP] /!\\ '+arguments[0]+(options.debug&&arguments[1]?' <'+arguments[1]+'>':''));
	DOM.error.innerHTML=/*DOM.error.innerHTML+*/arguments[0]+(options.debug&&arguments[1]?' &lt;'+arguments[1]+'&gt;<br/>':'<br/>');
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
		var j=options.limit;
			if(j==0) j=options.index.length;
			if(j>=options.current.length) j=options.current.length;
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
	if(options.searchmode){ // conjunctive: one is enough
		options.current=[];
		list.forEach(function(keyword){
			options.index.forEach(function(element,index){
				if(database[element].genre.indexOf(keyword)>=0
				|| database[element].description.indexOf(keyword)>=0
				|| database[element].title.indexOf(keyword)>=0
				|| !!(function(){ var f=false; database[element].country.split('|').forEach(function(element){ if(options.countries[element]!==undefined && options.countries[element].indexOf(keyword)>=0) f=true; }); return f; })()
				|| database[element].subtitle.indexOf(keyword)>=0
				){ if(options.current.indexOf(element)<0) options.current.push(element); }
			});
		});
	} else { // disjunctive: reducing results step by step
		list.forEach(function(keyword){
			options.index.forEach(function(element,index){
				if(!(database[element].genre.indexOf(keyword)>=0 ||
					 database[element].description.indexOf(keyword)>=0 ||
					 database[element].title.indexOf(keyword)>=0 ||
					 database[element].subtitle.indexOf(keyword)>=0
				)){ options.current.remove(options.current.indexOf(element)); }
			});
		});
	}
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
	switch(num%100){
		case 11:
		case 12:
		case 13:
		case 14:
			return ' фильмов';
		default:break;
	}
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
					var F_country=_create('div'), F_country_fl=data.country.split('|');
						F_country.innerHTML='';
						if(F_country_fl) for(var f=0; f<F_country_fl.length; ++f)
							F_country.innerHTML+="<span class='flag flag-"+F_country_fl[f]+"'>"+options.countries[F_country_fl[f]]+"</span>";
						F_country.classList.add('full-country');
					var F_budget=_create('div');
						F_budget.innerHTML=(data.out===true?( (data.budget.spent?'$'+data.budget.spent:'Бутылка 777')+' / '+(data.budget.gross?'$'+data.budget.gross:(data.budget.spent?'дырка от бублика':'(опустевшая)'))+((data.budget.spent<=data.budget.gross)?' (взлетел)':' (провалился)') ):'(ещё не вышел)');
						F_budget.classList.add('full-budget');
					var F_rating=_create('div');
						F_rating.classList.add('full-rating');
						if(data.rating.mal===undefined){
							var F_rating_imdb=_create('cite');
								if((data.rating.imdb|0)==0) F_rating_imdb.innerHTML='<span>(?)</span>';
								else F_rating_imdb.innerHTML="<span style='color:rgb("+parseInt(250-data.rating.imdb*25+40)+","+parseInt(data.rating.imdb*25-40)+",0)'>"+data.rating.imdb.toFixed(2)+"</span>";
								F_rating_imdb.classList.add('rating','imdb');
							var F_rating_kp=_create('cite');
								if((data.rating.kp|0)==0) F_rating_kp.innerHTML='<span>(?)</span>';
								else F_rating_kp.innerHTML="<span style='color:rgb("+parseInt(250-data.rating.kp*25+40)+","+parseInt(data.rating.kp*25-40)+",0)'>"+data.rating.kp.toFixed(2)+"</span>";
								F_rating_kp.classList.add('rating','kinopoisk');
							F_rating.appendChilds(F_rating_imdb,F_rating_kp);
						}
						else {
							var F_rating_mal=_create('cite');
								if((data.rating.mal|0)==0) F_rating_mal.innerHTML='<span>(?)</span>';
								else F_rating_mal.innerHTML="<span style='color:rgb("+parseInt(250-data.rating.mal*25+40)+","+parseInt(data.rating.mal*25-40)+",0)'>"+data.rating.mal.toFixed(2)+"</span>";
								F_rating_mal.classList.add('rating','mal');
							F_rating.appendChilds(F_rating_mal);
						}
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
	'Мы доставляем!',
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
	'Сейчас я доем вот эту хуйню. Досмотрю свой любимый сериал. А вот за-а-автра...',
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
	'Не забывайте закрывать портал в ад!',
	'Пятилетку - за 4 года, таймгет - за марафон!',
	'FINAL VITYAN',
	'Куклоедам - колбасы iз Шинкою',
	'Эй, Кагами, кверху ногами!',
	'Ваш личный Шизариум',
	'ИНЖАЛИД ЕГГОГ',
	'А вы и не против',
	'Тут-то жопа ваша жирная и зачесалась',
	'[autism intensifies]',
	'101010',
	'ОO0 Bekтоp',
	'Как долететь до Нептуна за один марафон',
	'Хуяк, хуяк. Хуяк, хуяк. Сука блять',
	'Эй, парень, не хочешь обратно попрограммировать?',
	'Очень весело общаться в ассоциации молодых христиан! Иди, общайся с парнями!',
	'Мы стоим вдвоём под золотым дождём!',
	'Bitte schnelle zu Regata nach Duisburg.',
	'Прогондоненный вибротон',
	'Диплодоки в Белграде',
	'Хариус Судзумия из Воронежа',
	'НИ ЕДИНОГО РАЗРЫВА!',
	'Кодолион: Вы (не) пьяны',
	'Называюсь я... Вибро...',
	'Добавьте соль. Разденьте рыбу.',
	'Малинки, такие вечеринки',
	'Всё будет хорошо.',
	'А у меня есть паааааааасека...',
	'Ну, а вообще, как дела?',
	'RAMP этого не умеет, напиши скрипт сделаю.',
	'Хеймен!',
	'Это как магазин телевизоров, ну вы поняли.'
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
- Planning `done` section
- Planning videostream
*/